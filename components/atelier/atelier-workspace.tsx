"use client";

import { useMemo, useState } from "react";
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
import {
  geometricDisplacementCc,
  geometricSpeedKmh,
  theoreticalSpeedDeltaPercent,
  theoreticalWheelTorqueDeltaPercent,
} from "../../lib/atelier/simulation";
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
  frontTeeth: baseline.frontTeeth,
  rearTeeth: baseline.rearTeeth,
  engineRpm: baseline.engineRpm,
  rollingCircumferenceM: baseline.rollingCircumferenceM,
};

type BuildState = typeof initialBuild;

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
}: {
  label: string;
  value: string;
  detail: string;
  tone: "red" | "orange" | "green" | "blue";
  note: string;
  proof: string;
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
          <i key={index} className={index < 5 ? styles.segmentOn : ""} />
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
  const [build, setBuild] = useState<BuildState>(initialBuild);
  const [history, setHistory] = useState<BuildState[]>([initialBuild]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [category, setCategory] = useState<(typeof partCategories)[number]>("Toutes");
  const [query, setQuery] = useState("");
  const [showWhy, setShowWhy] = useState<string | null>(null);

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

  const selectedIds = [build.exhaust, build.filtration, build.topEnd].filter(Boolean);
  const selectedParts = pilotParts.filter((part) => selectedIds.includes(part.id));

  const geometry = useMemo(() => {
    const displacement = geometricDisplacementCc(
      yz125Pilot.engine.boreMm,
      yz125Pilot.engine.strokeMm,
    );
    const speed = geometricSpeedKmh({
      frontTeeth: build.frontTeeth,
      rearTeeth: build.rearTeeth,
      engineRpm: build.engineRpm,
      rollingCircumferenceM: build.rollingCircumferenceM,
      primaryRatio: baseline.primaryRatio,
      sixthGearRatio: baseline.sixthGearRatio,
    });
    const speedDelta = theoreticalSpeedDeltaPercent(
      baseline.frontTeeth,
      baseline.rearTeeth,
      build.frontTeeth,
      build.rearTeeth,
    );
    const wheelTorqueDelta = theoreticalWheelTorqueDeltaPercent(
      baseline.frontTeeth,
      baseline.rearTeeth,
      build.frontTeeth,
      build.rearTeeth,
    );
    return { displacement, speed, speedDelta, wheelTorqueDelta };
  }, [build]);

  const setBuildWithHistory = (patch: Partial<BuildState>) => {
    const next = { ...build, ...patch };
    const trimmed = history.slice(0, historyIndex + 1);
    setBuild(next);
    setHistory([...trimmed, next]);
    setHistoryIndex(trimmed.length);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setBuild(history[nextIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setBuild(history[nextIndex]);
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
    if (!part.selectable) {
      setShowWhy(part.id);
      return;
    }
    if (part.category === "Échappement") {
      setBuildWithHistory({ exhaust: part.id });
    } else if (part.category === "Filtration") {
      setBuildWithHistory({ filtration: part.id });
    } else if (part.category === "Haut moteur") {
      setBuildWithHistory({ topEnd: part.id });
    }
  };

  const projectTendencies = selectedParts
    .map((part) => part.effect?.summary)
    .filter(Boolean) as string[];

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

      <section className={styles.topbar}>
        <div className={styles.snapshots}>
          <span>Ma machine</span>
          {(["Origine", "Actuelle", "Projet A", "Projet B"] as SnapshotName[]).map(
            (name) => (
              <button
                key={name}
                onClick={() => setSnapshot(name)}
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
            onClick={() => {
              setBuild(initialBuild);
              setHistory([initialBuild]);
              setHistoryIndex(0);
            }}
            title="Réinitialiser"
          >
            <RotateCcw />
          </button>
          <button
            onClick={() => setSnapshot(snapshot === "Projet A" ? "Projet B" : "Projet A")}
            title="Dupliquer le projet"
          >
            <Copy />
          </button>
          <button onClick={exportProject} title="Télécharger le projet">
            <Download />
          </button>
          <button className={styles.saveButton}>
            <Save /> Enregistrer
          </button>
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
                      <button onClick={() => setShowWhy(part.id)}>
                        Pourquoi ? <CircleHelp />
                      </button>
                    </div>
                    <button
                      className={part.selectable ? styles.addPart : styles.lockedPart}
                      onClick={() => selectPart(part)}
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
              />
              <GaugeCard
                label="Vitesse géométrique"
                value={geometry.speed ? geometry.speed.toFixed(1) : "N/D"}
                detail="km/h en 6e"
                tone="blue"
                note="À régime et circonférence imposés."
                proof="Calcul conditionnel"
              />
              <GaugeCard
                label="Variation vitesse"
                value={`${geometry.speedDelta >= 0 ? "+" : ""}${geometry.speedDelta.toFixed(1)}%`}
                detail="vs 13/49"
                tone={geometry.speedDelta >= 0 ? "blue" : "orange"}
                note="Effet théorique de la démultiplication uniquement."
                proof="Calcul géométrique"
              />
              <GaugeCard
                label="Couple à la roue"
                value={`${geometry.wheelTorqueDelta >= 0 ? "+" : ""}${geometry.wheelTorqueDelta.toFixed(1)}%`}
                detail="à couple moteur égal"
                tone={geometry.wheelTorqueDelta >= 0 ? "green" : "orange"}
                note="Ne modifie pas la puissance moteur."
                proof="Calcul géométrique"
              />
              <GaugeCard
                label="Puissance"
                value="N/D"
                detail="donnée manquante"
                tone="red"
                note="Aucune courbe de banc validée n’est chargée."
                proof="Indicateur suspendu"
              />
              <GaugeCard
                label="Accélération"
                value="N/D"
                detail="sous charge"
                tone="orange"
                note="Masse pilote, courbe de couple et pertes requises."
                proof="Indicateur suspendu"
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
              />
              <GaugeCard
                label="Fiabilité"
                value="N/D"
                detail="pas de score universel"
                tone="blue"
                note="Les risques sont affichés comme contrôles, pas comme pourcentage."
                proof="Directive atelier v2"
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
