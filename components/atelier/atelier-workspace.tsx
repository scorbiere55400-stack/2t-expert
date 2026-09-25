"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  Gauge,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Undo2,
  Redo2,
  Wrench,
} from "lucide-react";
import {
  partCategories,
  pilotParts,
  yz125Pilot,
  type PilotPart,
} from "../../lib/atelier/pilot-data";
import { atelierVehicles } from "../../lib/atelier/knowledge-registry";
import { evaluateCompatibility } from "../../lib/atelier/compatibility-engine";
import { runYz125Simulation } from "../../lib/atelier/simulation-engine";
import Atelier3DViewer from "./atelier-3d-viewer";
import styles from "./atelier-workspace.module.css";

type SnapshotName = "Origine" | "Actuelle" | "Projet A" | "Projet B";

const baseline = {
  frontTeeth: 13,
  rearTeeth: 49,
  engineRpm: 11500,
  rollingCircumferenceM: 2.08,
  primaryRatio: 3.368,
  sixthGearRatio: 1.055,
};

const initialBuild = {
  exhaust: "",
  filtration: "",
  topEnd: "",
  intake: "",
  cooling: "",
  frontTeeth: baseline.frontTeeth,
  rearTeeth: baseline.rearTeeth,
  engineRpm: baseline.engineRpm,
  rollingCircumferenceM: baseline.rollingCircumferenceM,
};

type BuildState = typeof initialBuild;
type BuildSnapshots = Record<SnapshotName, BuildState>;

const initialSnapshots: BuildSnapshots = {
  Origine: { ...initialBuild },
  Actuelle: { ...initialBuild },
  "Projet A": { ...initialBuild },
  "Projet B": { ...initialBuild },
};

const STORAGE_KEY = "2t-expert:atelier:yamaha-yz125-2026:v1";

function statusLabel(part: PilotPart) {
  if (part.compatibility === "direct_fit_validated") return "Montage direct validé";
  if (part.compatibility === "adaptation_documented") return "Adaptation documentée";
  if (part.compatibility === "incompatible") return "Incompatible";
  return "À qualifier";
}

function evidenceLabel(part: PilotPart) {
  if (part.evidenceLevel === "manufacturer_verified") return "Constructeur";
  if (part.evidenceLevel === "vendor_verified") return "Fabricant pièce";
  if (part.evidenceLevel === "manufacturer_platform_reference")
    return "Plateforme constructeur";
  return "Vérification requise";
}

function GaugeCard({
  label,
  value,
  detail,
  tone,
  note,
  proof,
  progress,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "red" | "orange" | "green" | "blue";
  note: string;
  proof: string;
  progress: number;
}) {
  return (
    <article className={styles.gaugeCard}>
      <div className={styles.gaugeLabel}>{label}</div>
      <div className={`${styles.gaugeArc} ${styles[tone]}`}>
        <div className={styles.gaugeInner}>
          <strong>{value}</strong>
          <span>{detail}</span>
        </div>
      </div>
      <div className={styles.segmentBar}>
        {Array.from({ length: 8 }).map((_, index) => (
          <i
            key={index}
            className={
              index < Math.max(0, Math.min(8, Math.round(progress / 12.5)))
                ? styles.segmentOn
                : ""
            }
          />
        ))}
      </div>
      <p>{note}</p>
      <small>
        <ShieldCheck /> {proof}
      </small>
    </article>
  );
}



export default function AtelierWorkspace() {
  const [snapshot, setSnapshot] = useState<SnapshotName>("Projet A");
  const [selectedVehicleId, setSelectedVehicleId] = useState(yz125Pilot.id);
  const [diagnosticStatus, setDiagnosticStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [diagnosticMessage, setDiagnosticMessage] = useState("");
  const [builds, setBuilds] = useState<BuildSnapshots>(initialSnapshots);
  const build = builds[snapshot];
  const [history, setHistory] = useState<BuildState[]>([initialSnapshots["Projet A"]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [category, setCategory] = useState<(typeof partCategories)[number]>("Toutes");
  const [query, setQuery] = useState("");
  const [showWhy, setShowWhy] = useState<string | null>(null);
  const [focusedCategory, setFocusedCategory] =
    useState<PilotPart["category"] | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        builds?: Partial<BuildSnapshots>;
        snapshot?: SnapshotName;
        savedAt?: string;
      };
      const restored: BuildSnapshots = {
        Origine: { ...initialBuild },
        Actuelle: { ...initialBuild, ...(parsed.builds?.Actuelle || {}) },
        "Projet A": { ...initialBuild, ...(parsed.builds?.["Projet A"] || {}) },
        "Projet B": { ...initialBuild, ...(parsed.builds?.["Projet B"] || {}) },
      };
      const restoredSnapshot =
        parsed.snapshot && parsed.snapshot in restored
          ? parsed.snapshot
          : "Projet A";
      setBuilds(restored);
      setSnapshot(restoredSnapshot);
      setHistory([restored[restoredSnapshot]]);
      setHistoryIndex(0);
      setSavedAt(parsed.savedAt || null);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const verifiedParts = useMemo(
    () =>
      pilotParts.filter((part) => {
        const categoryOk = category === "Toutes" || part.category === category;
        const q = query.trim().toLowerCase();
        const searchOk =
          !q ||
          [part.name, part.reference, part.manufacturer, part.category]
            .join(" ")
            .toLowerCase()
            .includes(q);
        return categoryOk && searchOk;
      }),
    [category, query],
  );

  const selectedIds = [
    build.exhaust,
    build.filtration,
    build.topEnd,
    build.intake,
    build.cooling,
  ].filter(Boolean);
  const selectedParts = pilotParts.filter((part) => selectedIds.includes(part.id));

  const simulation = useMemo(
    () =>
      runYz125Simulation({
        frontTeeth: build.frontTeeth,
        rearTeeth: build.rearTeeth,
        engineRpm: build.engineRpm,
        rollingCircumferenceM: build.rollingCircumferenceM,
      }),
    [build],
  );

  const geometry = {
    displacement: simulation.outputs.displacementCc,
    speed: simulation.outputs.geometricSpeedKmh,
    speedDelta: simulation.outputs.geometricSpeedDeltaPercent,
    wheelTorqueDelta:
      simulation.outputs.wheelTorqueDeltaPercentAtEqualEngineTorque,
  };

  const setBuildWithHistory = (patch: Partial<BuildState>) => {
    if (snapshot === "Origine") return;
    const next = { ...build, ...patch };
    const trimmed = history.slice(0, historyIndex + 1);
    setBuilds((current) => ({ ...current, [snapshot]: next }));
    setHistory([...trimmed, next]);
    setHistoryIndex(trimmed.length);
  };

  const switchSnapshot = (name: SnapshotName) => {
    setSnapshot(name);
    setHistory([builds[name]]);
    setHistoryIndex(0);
  };

  const saveWorkspace = () => {
    const at = new Date().toISOString();
    const payload = {
      version: 1,
      vehicleId: yz125Pilot.id,
      snapshot,
      builds,
      savedAt: at,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSavedAt(at);
  };

  const duplicateProject = () => {
    if (snapshot !== "Projet A" && snapshot !== "Projet B") return;
    const target: SnapshotName = snapshot === "Projet A" ? "Projet B" : "Projet A";
    const clone = { ...build };
    setBuilds((current) => ({ ...current, [target]: clone }));
    setSnapshot(target);
    setHistory([clone]);
    setHistoryIndex(0);
  };

  const resetSnapshot = () => {
    if (snapshot === "Origine") return;
    const reset = { ...initialBuild };
    setBuilds((current) => ({ ...current, [snapshot]: reset }));
    setHistory([reset]);
    setHistoryIndex(0);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setBuilds((current) => ({ ...current, [snapshot]: history[nextIndex] }));
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setBuilds((current) => ({ ...current, [snapshot]: history[nextIndex] }));
  };

  const exportProject = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      vehicle: yz125Pilot,
      snapshot,
      build,
      selectedParts,
      calculations: geometry,
      disclaimer:
        "Les résultats géométriques ne sont pas des mesures de puissance ni de vitesse réelle sous charge.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2t-expert-yz125-2026-projet-a.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectPart = (part: PilotPart) => {
    setFocusedCategory(part.category);
    const decision = evaluateCompatibility(yz125Pilot.id, part.id);
    if (!decision.allowed || !part.selectable) {
      setShowWhy(part.id);
      return;
    }
    if (part.category === "Échappement") {
      setBuildWithHistory({ exhaust: part.id });
    } else if (part.category === "Filtration") {
      setBuildWithHistory({ filtration: part.id });
    } else if (part.category === "Haut moteur") {
      setBuildWithHistory({ topEnd: part.id });
    } else if (part.category === "Admission") {
      setBuildWithHistory({ intake: part.id });
    } else if (part.category === "Refroidissement") {
      setBuildWithHistory({ cooling: part.id });
    }
  };

  const focusCategoryFrom3D = (nextCategory: PilotPart["category"]) => {
    setFocusedCategory(nextCategory);
    setCategory(nextCategory);
  };

  const sendToDiagnostic = async () => {
    if (snapshot !== "Actuelle") {
      setDiagnosticStatus("error");
      setDiagnosticMessage(
        "Le diagnostic utilise uniquement la Machine actuelle confirmée, jamais un projet virtuel.",
      );
      return;
    }

    setDiagnosticStatus("loading");
    setDiagnosticMessage("Préparation du contexte Diagnostic…");

    try {
      const response = await fetch("/api/diagnostic/from-atelier", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          vehicleId: yz125Pilot.id,
          snapshot,
          partIds: selectedIds,
          settings: {
            frontTeeth: build.frontTeeth,
            rearTeeth: build.rearTeeth,
            engineRpm: build.engineRpm,
            rollingCircumferenceM: build.rollingCircumferenceM,
          },
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        data?: {
          selectedParts?: unknown[];
          compatibility?: { valid?: boolean };
        };
      };
      if (!response.ok) throw new Error(payload.error || "Diagnostic indisponible");

      const selectedCount = payload.data?.selectedParts?.length ?? 0;
      const compatibilityValid = payload.data?.compatibility?.valid === true;
      setDiagnosticStatus("ready");
      setDiagnosticMessage(
        `Contexte prêt : ${selectedCount} pièce(s), compatibilité ${compatibilityValid ? "validée" : "à contrôler"}.`,
      );
    } catch (error) {
      setDiagnosticStatus("error");
      setDiagnosticMessage(
        error instanceof Error ? error.message : "Diagnostic indisponible",
      );
    }
  };

  const projectTendencies = selectedParts
    .map((part) => part.effect?.summary)
    .filter(Boolean) as string[];

  const selectedCategory =
    focusedCategory ??
    (selectedParts.length > 0
      ? selectedParts[selectedParts.length - 1].category
      : null);

  const selectedPartId =
    selectedParts.length > 0 ? selectedParts[selectedParts.length - 1].id : null;

  const gaugeModel = useMemo(() => {
    const ratioImpact = Math.min(35, Math.abs(geometry.speedDelta));
    const selectedCount = selectedParts.length;
    const hasExhaust = selectedParts.some((part) => part.category === "Échappement");
    const hasFilter = selectedParts.some((part) => part.category === "Filtration");
    const hasTopEnd = selectedParts.some((part) => part.category === "Haut moteur");

    return {
      displacement: 72,
      speed: Math.max(18, Math.min(94, 52 + geometry.speedDelta * 1.8)),
      speedDelta: Math.max(10, Math.min(95, 50 + geometry.speedDelta * 2.5)),
      wheelTorque: Math.max(10, Math.min(95, 50 + geometry.wheelTorqueDelta * 2.5)),
      power: hasExhaust || hasTopEnd ? 58 + selectedCount * 5 : 34,
      acceleration: Math.max(
        24,
        Math.min(
          92,
          48 +
            geometry.wheelTorqueDelta * 2 +
            (hasExhaust ? 8 : 0) +
            (hasFilter ? 4 : 0),
        ),
      ),
      usefulBand: Math.min(94, 42 + selectedCount * 9 + (hasExhaust ? 12 : 0)),
      reliability: Math.max(25, 78 - selectedCount * 7 - ratioImpact * 0.6),
    };
  }, [geometry.speedDelta, geometry.wheelTorqueDelta, selectedParts]);

  return (
    <div className={styles.workspace}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>ATELIER CONFIGURATION · PILOTE SOURCÉ</span>
          <h1>
            Atelier <b>Configuration</b>
          </h1>
          <p>Composez. Ajustez. Mesurez. Comparez sans inventer.</p>
        </div>
        <div className={styles.heroMachine}>
          <span>Machine pilote</span>
          <strong>Yamaha YZ125 · 2026</strong>
          <small>Marché Europe / France · données sourcées</small>
        </div>
      </section>

      <section className={styles.machineSelectorBar}>
        <label>
          <span>Machine de l’atelier</span>
          <select
            value={selectedVehicleId}
            onChange={(event) => setSelectedVehicleId(event.target.value)}
          >
            {atelierVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} · {vehicle.yearLabel}
                {vehicle.coverage === "full_pilot" ? " · pilote complet" : " · indexée"}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.coveragePill}>
          {selectedVehicleId === yz125Pilot.id
            ? "Données + pièces + simulation"
            : "Référentiel indexé · configuration à consolider"}
        </div>
      </section>

      {selectedVehicleId !== yz125Pilot.id ? (
        <section className={styles.unavailableMachine}>
          <div>
            <span className={styles.eyebrow}>COUVERTURE EN COURS</span>
            <h2>Cette machine est déjà connue du référentiel 2T Expert.</h2>
            <p>
              La sélection globale fonctionne, mais son modèle de simulation et ses
              compatibilités détaillées ne sont pas encore suffisamment consolidés
              pour afficher des gains ou autoriser un montage virtuel fiable.
            </p>
          </div>
          <button onClick={() => setSelectedVehicleId(yz125Pilot.id)}>
            Revenir au pilote YZ125
          </button>
        </section>
      ) : (
      <>
      <section className={styles.topbar}>
        <div className={styles.snapshots}>
          <span>Ma machine</span>
          {(["Origine", "Actuelle", "Projet A", "Projet B"] as SnapshotName[]).map(
            (name) => (
              <button
                key={name}
                onClick={() => switchSnapshot(name)}
                className={snapshot === name ? styles.activeSnapshot : ""}
              >
                {name}
              </button>
            ),
          )}
        </div>
        <div className={styles.actions}>
          <button onClick={undo} disabled={historyIndex <= 0} title="Annuler">
            <Undo2 />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Rétablir"
          >
            <Redo2 />
          </button>
          <button
            onClick={resetSnapshot}
            disabled={snapshot === "Origine"}
            title="Réinitialiser cet état"
          >
            <RotateCcw />
          </button>
          <button
            onClick={duplicateProject}
            disabled={snapshot !== "Projet A" && snapshot !== "Projet B"}
            title="Dupliquer vers l’autre projet"
          >
            <Copy />
          </button>
          <button onClick={exportProject} title="Télécharger le projet">
            <Download />
          </button>
          <button className={styles.saveButton} onClick={saveWorkspace}>
            <Save /> Enregistrer
          </button>
          {savedAt && (
            <span className={styles.savedState}>
              Enregistré {new Date(savedAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </section>

      <div className={styles.mainGrid}>
        <section className={styles.editorColumn}>
          <article className={styles.machineCard}>
            <div className={styles.cardTitle}>
              <div>
                <Wrench />
                <span>
                  <small>BASE DOCUMENTÉE</small>
                  <b>{yz125Pilot.brand} {yz125Pilot.model} {yz125Pilot.year}</b>
                </span>
              </div>
              <span className={styles.verifiedBadge}>
                <BadgeCheck /> Constructeur
              </span>
            </div>
            <div className={styles.machineSpecs}>
              <div><span>Moteur</span><b>{yz125Pilot.engine.architecture}</b></div>
              <div><span>Admission</span><b>{yz125Pilot.engine.carburetor}</b></div>
              <div><span>Boîte</span><b>{yz125Pilot.engine.gearbox}</b></div>
              <div><span>Poids</span><b>{yz125Pilot.chassis.wetWeightKg} kg tous pleins faits</b></div>
              <div><span>Pneu arrière</span><b>{yz125Pilot.chassis.rearTire}</b></div>
              <div><span>Réservoir</span><b>{yz125Pilot.chassis.fuelCapacityL} L</b></div>
            </div>
          </article>

          <Atelier3DViewer
            selectedCategory={selectedCategory}
            selectedPartId={selectedPartId}
            onCategoryFocus={focusCategoryFrom3D}
          />

          <article className={styles.setupCard}>
            <div className={styles.cardHeading}>
              <div>
                <SlidersHorizontal />
                <span>
                  <small>RÉGLAGES DOCUMENTÉS / CALCULABLES</small>
                  <b>Transmission et hypothèses géométriques</b>
                </span>
              </div>
            </div>
            <div className={styles.inputGrid}>
              <label>
                Pignon avant
                <input
                  type="number"
                  min={11}
                  max={16}
                  value={build.frontTeeth}
                  disabled={snapshot === "Origine"}
                  onChange={(e) =>
                    setBuildWithHistory({ frontTeeth: Number(e.target.value) })
                  }
                />
                <small>dents</small>
              </label>
              <label>
                Couronne arrière
                <input
                  type="number"
                  min={45}
                  max={55}
                  value={build.rearTeeth}
                  disabled={snapshot === "Origine"}
                  onChange={(e) =>
                    setBuildWithHistory({ rearTeeth: Number(e.target.value) })
                  }
                />
                <small>dents</small>
              </label>
              <label>
                Régime de calcul
                <input
                  type="number"
                  min={6000}
                  max={14000}
                  step={100}
                  value={build.engineRpm}
                  disabled={snapshot === "Origine"}
                  onChange={(e) =>
                    setBuildWithHistory({ engineRpm: Number(e.target.value) })
                  }
                />
                <small>tr/min · hypothèse utilisateur</small>
              </label>
              <label>
                Circonférence roulante
                <input
                  type="number"
                  min={1.7}
                  max={2.3}
                  step={0.01}
                  value={build.rollingCircumferenceM}
                  disabled={snapshot === "Origine"}
                  onChange={(e) =>
                    setBuildWithHistory({
                      rollingCircumferenceM: Number(e.target.value),
                    })
                  }
                />
                <small>m · à mesurer pour précision</small>
              </label>
            </div>
            <div className={styles.truthNote}>
              <ShieldCheck />
              <p>
                <b>Principe de vérité</b>
                Les rapports primaire/6e utilisés pour le calcul viennent de la
                plateforme YZ125 2022 Yamaha. Ils sont visibles comme hypothèse de
                plateforme et doivent être revalidés pour 2026 avant publication
                définitive.
              </p>
            </div>
          </article>

          <article className={styles.partsCard}>
            <div className={styles.cardHeading}>
              <div>
                <Search />
                <span>
                  <small>CATALOGUE PILOTE</small>
                  <b>Pièces compatibles ou candidates sourcées</b>
                </span>
              </div>
              <span className={styles.catalogCount}>{pilotParts.length} références</span>
            </div>
            <div className={styles.filters}>
              <div className={styles.searchBox}>
                <Search />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nom, référence, fabricant…"
                />
              </div>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as (typeof partCategories)[number])
                }
              >
                {partCategories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className={styles.partList}>
              {verifiedParts.map((part) => {
                const selected = selectedIds.includes(part.id);
                return (
                  <article
                    key={part.id}
                    className={`${styles.partRow} ${selected ? styles.partSelected : ""}`}
                  >
                    <div>
                      <small>{part.category} · {part.manufacturer}</small>
                      <b>{part.name}</b>
                      <code>{part.reference}</code>
                    </div>
                    <div className={styles.partMeta}>
                      <span>{statusLabel(part)}</span>
                      <small>{part.yearScope}</small>
                    </div>
                    <div className={styles.partEvidence}>
                      <span>{evidenceLabel(part)}</span>
                      <button
                        onClick={() => {
                          setFocusedCategory(part.category);
                          setShowWhy(part.id);
                        }}
                      >
                        Pourquoi ? <CircleHelp />
                      </button>
                    </div>
                    <button
                      className={part.selectable ? styles.addPart : styles.lockedPart}
                      onClick={() => selectPart(part)}
                      disabled={snapshot === "Origine"}
                    >
                      {selected ? "Sélectionnée" : part.selectable ? "Ajouter" : "À vérifier"}
                      <ChevronRight />
                    </button>
                  </article>
                );
              })}
            </div>
            <div className={styles.coverageNotice}>
              <AlertTriangle />
              <p>
                <b>Couverture du premier test :</b> ce corpus contient uniquement les
                références que nous avons pu sourcer proprement maintenant. Il ne
                prétend pas encore recenser toutes les pièces YZ125 disponibles dans
                le monde. Les références non prouvées restent volontairement
                désactivées.
              </p>
            </div>
          </article>
        </section>

        <aside className={styles.gaugeColumn}>
          <div className={styles.stickyGaugePanel}>
            <div className={styles.panelHeader}>
              <div>
                <Gauge />
                <span>
                  <small>JAUGES D’ÉVOLUTION</small>
                  <b>{snapshot}</b>
                </span>
              </div>
              <span className={styles.livePill}>Calcul instantané</span>
            </div>

            <div className={styles.gaugeGrid}>
              <GaugeCard
                label="Cylindrée géométrique"
                value={geometry.displacement.toFixed(1)}
                detail="cm³"
                tone="green"
                note="Calcul à partir de 54,0 × 54,5 mm."
                proof="Calcul géométrique"
                progress={gaugeModel.displacement}
              />
              <GaugeCard
                label="Vitesse géométrique"
                value={geometry.speed ? geometry.speed.toFixed(1) : "N/D"}
                detail="km/h en 6e"
                tone="blue"
                note="À régime et circonférence imposés."
                proof="Calcul conditionnel"
                progress={gaugeModel.speed}
              />
              <GaugeCard
                label="Variation vitesse"
                value={`${geometry.speedDelta >= 0 ? "+" : ""}${geometry.speedDelta.toFixed(1)}%`}
                detail="vs 13/49"
                tone={geometry.speedDelta >= 0 ? "blue" : "orange"}
                note="Effet théorique de la démultiplication uniquement."
                proof="Calcul géométrique"
                progress={gaugeModel.speedDelta}
              />
              <GaugeCard
                label="Couple à la roue"
                value={`${geometry.wheelTorqueDelta >= 0 ? "+" : ""}${geometry.wheelTorqueDelta.toFixed(1)}%`}
                detail="à couple moteur égal"
                tone={geometry.wheelTorqueDelta >= 0 ? "green" : "orange"}
                note="Ne modifie pas la puissance moteur."
                proof="Calcul géométrique"
                progress={gaugeModel.wheelTorque}
              />
              <GaugeCard
                label="Potentiel puissance"
                value={selectedParts.length ? "Tendance" : "Référence"}
                detail="qualitatif uniquement"
                tone="red"
                note="Position visuelle issue des pièces sélectionnées, sans valeur de puissance inventée."
                proof="Tendance non mesurée"
                progress={gaugeModel.power}
              />
              <GaugeCard
                label="Réactivité estimée"
                value={selectedParts.length ? "Tendance" : "Référence"}
                detail="qualitatif uniquement"
                tone="orange"
                note="Croise démultiplication et pièces sélectionnées ; pas une mesure d’accélération."
                proof="Tendance explicable"
                progress={gaugeModel.acceleration}
              />
              <GaugeCard
                label="Plage utile"
                value={projectTendencies.length ? "Tendance" : "Origine"}
                detail={projectTendencies.length ? "documentée" : "référence"}
                tone="green"
                note={
                  projectTendencies[0] ||
                  "Aucune tendance aftermarket sélectionnée."
                }
                proof="Qualitatif sourcé"
                progress={gaugeModel.usefulBand}
              />
              <GaugeCard
                label="Fiabilité"
                value="N/D"
                detail="pas de score universel"
                tone="blue"
                note="Les risques sont affichés comme contrôles, pas comme pourcentage."
                proof="Directive atelier v2"
                progress={gaugeModel.reliability}
              />
            </div>

            <section className={styles.summaryCard}>
              <div className={styles.summaryTitle}>
                <Sparkles />
                <span>
                  <small>RÉSUMÉ DU PROJET</small>
                  <b>{selectedParts.length} pièce(s) sélectionnée(s)</b>
                </span>
              </div>
              {selectedParts.length ? (
                <ul>
                  {selectedParts.map((part) => (
                    <li key={part.id}>
                      <BadgeCheck />
                      <span>
                        <b>{part.name}</b>
                        <small>{part.reference} · {statusLabel(part)}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyState}>
                  Ajoutez une pièce validée pour construire le projet sans modifier
                  l’état « Machine actuelle ».
                </p>
              )}
            </section>

            <section className={styles.diagnosticCard}>
              <div className={styles.summaryTitle}>
                <Wrench />
                <span>
                  <small>DIAGNOSTIC IA</small>
                  <b>Utiliser la machine réellement montée</b>
                </span>
              </div>
              <p>
                Le diagnostic reçoit uniquement l’état « Actuelle » et conserve
                les projets A/B comme hypothèses séparées.
              </p>
              <button
                onClick={sendToDiagnostic}
                disabled={snapshot !== "Actuelle" || diagnosticStatus === "loading"}
              >
                {diagnosticStatus === "loading"
                  ? "Préparation…"
                  : "Diagnostiquer la machine actuelle"}
                <ChevronRight />
              </button>
              {diagnosticStatus !== "idle" && (
                <small
                  className={
                    diagnosticStatus === "ready"
                      ? styles.diagnosticReady
                      : diagnosticStatus === "error"
                        ? styles.diagnosticError
                        : ""
                  }
                >
                  {diagnosticMessage}
                </small>
              )}
            </section>

            <section className={styles.limitCard}>
              <div className={styles.summaryTitle}>
                <AlertTriangle />
                <span>
                  <small>POINTS LIMITANTS</small>
                  <b>Ce qui empêche un chiffre fiable</b>
                </span>
              </div>
              <ul>
                <li>Courbe couple/puissance au même point de mesure absente.</li>
                <li>Circonférence réelle du pneu non mesurée.</li>
                <li>Rapports 2026 détaillés à confirmer avant validation finale.</li>
                <li>Conditions piste, masse pilote et pertes non renseignées.</li>
              </ul>
            </section>
          </div>
        </aside>
      </div>

      </> )}

      {showWhy && (
        <div className={styles.modalBackdrop} onMouseDown={() => setShowWhy(null)}>
          <section className={styles.whyModal} onMouseDown={(e) => e.stopPropagation()}>
            {(() => {
              const part = pilotParts.find((item) => item.id === showWhy);
              if (!part) return null;
              return (
                <>
                  <button className={styles.modalClose} onClick={() => setShowWhy(null)}>
                    ×
                  </button>
                  <span className={styles.eyebrow}>POURQUOI CE STATUT ?</span>
                  <h2>{part.name}</h2>
                  <p>{part.note}</p>
                  <dl>
                    <div><dt>Référence</dt><dd>{part.reference}</dd></div>
                    <div><dt>Compatibilité</dt><dd>{statusLabel(part)}</dd></div>
                    <div><dt>Preuve</dt><dd>{evidenceLabel(part)}</dd></div>
                    <div><dt>Plage</dt><dd>{part.yearScope}</dd></div>
                  </dl>
                  <a href={part.sourceUrl} target="_blank" rel="noreferrer">
                    Ouvrir la source fabricant <ChevronRight />
                  </a>
                </>
              );
            })()}
          </section>
        </div>
      )}
    </div>
  );
}
