"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Box, BrainCircuit, Car, ChevronRight, CircleGauge, Database, Gauge, Home,
  Layers3, Search, Settings2, ShieldCheck, ShoppingCart, SlidersHorizontal,
  Sparkles, Users, Wrench,
} from "lucide-react";
import Atelier3DViewer from "./atelier-3d-viewer";
import {
  dt50x2011,
  evaluateWorkshopBuild,
  stage6MeasuredReference,
  workshopParts,
  type WorkshopPart,
} from "../../lib/atelier/dt50-am6-data";
import type { PilotPart } from "../../lib/atelier/pilot-data";
import styles from "./atelier-console.module.css";

type Props = { onNavigate?: (target: string) => void };

const categoryToPilot: Record<WorkshopPart["category"], PilotPart["category"]> = {
  Cylindre: "Haut moteur",
  Carburateur: "Carburation",
  Admission: "Admission",
  Échappement: "Échappement",
  Allumage: "Transmission",
  Transmission: "Transmission",
};

const pilotToCategory: Partial<Record<PilotPart["category"], WorkshopPart["category"]>> = {
  "Haut moteur": "Cylindre",
  Carburation: "Carburateur",
  Admission: "Admission",
  Échappement: "Échappement",
  Transmission: "Transmission",
};

const sideCategories: Array<{ label: string; category?: WorkshopPart["category"] }> = [
  { label: "Vue 3D" }, { label: "Vue éclatée 3D" }, { label: "Moteur" },
  { label: "Cylindre", category: "Cylindre" }, { label: "Vilebrequin" },
  { label: "Carburateur", category: "Carburateur" },
  { label: "Admission", category: "Admission" },
  { label: "Échappement", category: "Échappement" },
  { label: "Allumage", category: "Allumage" },
  { label: "Transmission", category: "Transmission" },
  { label: "Freinage" }, { label: "Partie cycle" }, { label: "Esthétique" },
  { label: "Accessoires" }, { label: "Comparateur" },
];

const presets = {
  Origine: ["stock-cylinder"],
  Daily: ["stock-cylinder", "stage6-intake"],
  Sport: ["airsal-80", "stage6-pwk28", "stage6-intake", "most-70-80", "mvt-dd21", "transmission-13-53"],
  Compétition: ["airsal-80", "stage6-pwk28", "stage6-intake", "most-70-80", "mvt-dd21", "transmission-13-53"],
} as const;

function score(value: number) { return Math.max(0, Math.min(10, Math.round(value / 10))); }

function RingGauge({ label, value, detail, percent }: { label: string; value: string; detail: string; percent: number }) {
  return (
    <div className={styles.ringGauge}>
      <div className={styles.ring} style={{ "--p": String(percent * 3.6) + "deg" } as CSSProperties}>
        <div><b>{value}</b><small>{detail}</small></div>
      </div>
      <span>{label}</span>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return <div className={styles.metricBar}><span>{label}</span><i><b style={{ width: String(value) + "%" }} /></i><em>{score(value)}/10</em></div>;
}

export default function AtelierConsole({ onNavigate }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([...presets.Sport]);
  const [activePartId, setActivePartId] = useState("airsal-80");
  const [activeCategory, setActiveCategory] = useState<WorkshopPart["category"]>("Cylindre");
  const [frontTeeth, setFrontTeeth] = useState(13);
  const [rearTeeth, setRearTeeth] = useState(53);
  const [preset, setPreset] = useState<keyof typeof presets>("Sport");
  const [search, setSearch] = useState("");

  const build = useMemo(
    () => evaluateWorkshopBuild(selectedIds, { front: frontTeeth, rear: rearTeeth }),
    [selectedIds, frontTeeth, rearTeeth],
  );

  const activePart = workshopParts.find((part) => part.id === activePartId) ?? workshopParts[0];
  const visibleParts = workshopParts.filter((part) =>
    !search.trim() ||
    [part.label, part.brand, part.reference, part.category].join(" ").toLowerCase().includes(search.toLowerCase()),
  );
  const budget = build.selected.reduce((sum, part) => sum + (part.priceEur ?? 0), 0);

  const choosePart = (part: WorkshopPart) => {
    setActivePartId(part.id);
    setActiveCategory(part.category);
  };

  const togglePart = (part: WorkshopPart) => {
    choosePart(part);
    setSelectedIds((current) => {
      const withoutSameCategory = current.filter((id) => {
        const item = workshopParts.find((candidate) => candidate.id === id);
        return item?.category !== part.category;
      });
      return [...withoutSameCategory, part.id];
    });
    setPreset("Sport");
  };

  const applyPreset = (name: keyof typeof presets) => {
    setPreset(name);
    setSelectedIds([...presets[name]]);
  };

  const speedLo = Math.round(build.estimatedSpeedRange[0]);
  const speedHi = Math.round(build.estimatedSpeedRange[1]);
  const powerLo = build.estimatedPowerRange[0].toFixed(0);
  const powerHi = build.estimatedPowerRange[1].toFixed(0);

  return (
    <div className={styles.console}>
      <header className={styles.topHeader}>
        <div className={styles.logo}><strong>2T</strong><b>EXPERT</b><small>DIAGNOSEZ. CONFIGUREZ. OPTIMISEZ. ROULEZ.</small></div>
        <nav>
          <button onClick={() => onNavigate?.("home")}><Home />Accueil</button>
          <button><Car />Mon Garage</button>
          <button className={styles.activeNav}><Settings2 />Configurer</button>
          <button><BrainCircuit />Diagnostic</button>
          <button onClick={() => onNavigate?.("specs")}><Database />Base technique</button>
          <button onClick={() => onNavigate?.("catalog")}><Wrench />Pièces</button>
          <button onClick={() => onNavigate?.("community")}><Users />Communauté</button>
          <button><ShoppingCart />PRO</button>
        </nav>
        <div className={styles.headerSearch}><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une pièce, un modèle…" /></div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.leftRail}>
          <section className={styles.machineCard}>
            <h3>VOTRE MACHINE</h3>
            <div className={styles.machineIdentity}>
              <div className={styles.machineThumb}><Car /></div>
              <div><b>Yamaha DT 50</b><span>Année : {dt50x2011.year}</span><span>Moteur : {dt50x2011.engine}</span><span>Type : {dt50x2011.family}</span></div>
            </div>
            <button>Changer de machine</button>
          </section>
          <nav className={styles.sideNav}>
            {sideCategories.map((item, index) => (
              <button key={item.label} className={(item.category === activeCategory || (!item.category && index === 1)) ? styles.sideActive : ""} onClick={() => item.category && setActiveCategory(item.category)}>
                {index === 1 ? <Layers3 /> : <Box />}<span>{item.label}</span>{item.category === activeCategory ? <ChevronRight /> : null}
              </button>
            ))}
          </nav>
          <div className={styles.motto}><Sparkles /><b>MÊME ADN,<br/>PLUS LOIN.</b></div>
        </aside>

        <main className={styles.center}>
          <section className={styles.visualDeck}>
            <Atelier3DViewer
              selectedCategory={categoryToPilot[activeCategory]}
              selectedPartId={activePartId}
              onCategoryFocus={(category) => {
                const mapped = pilotToCategory[category];
                if (mapped) setActiveCategory(mapped);
              }}
            />
          </section>

          <div className={styles.partStrip}>
            {visibleParts.map((part) => (
              <button key={part.id} className={part.id === activePartId ? styles.partStripActive : ""} onClick={() => choosePart(part)}>
                <Box /><span>{part.category}</span><small>{part.brand}</small>
              </button>
            ))}
          </div>

          <section className={styles.lowerGrid}>
            <div className={styles.currentConfig}>
              <div className={styles.sectionTitle}><b>CONFIGURATION ACTUELLE</b><SlidersHorizontal /></div>
              <div className={styles.configTiles}>
                {build.selected.map((part) => (
                  <button key={part.id} onClick={() => choosePart(part)}><Box /><b>{part.label}</b><small>{part.category}</small></button>
                ))}
                <div className={styles.gearingTile}>
                  <label>Pignon<input type="number" min={11} max={16} value={frontTeeth} onChange={(e) => setFrontTeeth(Number(e.target.value))} /></label>
                  <label>Couronne<input type="number" min={45} max={60} value={rearTeeth} onChange={(e) => setRearTeeth(Number(e.target.value))} /></label>
                </div>
              </div>
            </div>

            <div className={styles.performance}>
              <div className={styles.sectionTitle}><b>PERFORMANCES ESTIMÉES</b><small>Route · calcul / estimation</small></div>
              <div className={styles.performanceBody}>
                <div className={styles.rings}>
                  <RingGauge label="Vitesse max" value={String(speedLo) + "–" + String(speedHi)} detail="km/h · estimation" percent={build.gauges.powerIndex} />
                  <RingGauge label="0–100 m" value={build.selected.length > 2 ? "7,8–9,4" : "N/D"} detail="s · estimation" percent={build.gauges.acceleration} />
                  <RingGauge label="Puissance" value={powerLo + "–" + powerHi} detail="ch · estimation" percent={build.gauges.powerIndex} />
                  <RingGauge label="Régime max" value={String(Math.round(build.maxRpm / 100) * 100)} detail="tr/min · cible" percent={Math.min(100, build.maxRpm / 140)} />
                </div>
                <div className={styles.bars}>
                  <Bar label="Accélération" value={build.gauges.acceleration} />
                  <Bar label="Nervosité" value={build.gauges.response} />
                  <Bar label="Couple bas" value={build.gauges.lowTorque} />
                  <Bar label="Couple haut" value={build.gauges.highTorque} />
                  <Bar label="Reprise" value={(build.gauges.response + build.gauges.lowTorque) / 2} />
                  <Bar label="Fiabilité" value={build.gauges.reliability} />
                  <Bar label="Consommation" value={build.gauges.consumption} />
                  <Bar label="Bruit" value={build.gauges.noise} />
                </div>
              </div>
              <div className={styles.method}><span>● Mesure</span><span>● Calcul</span><span>● Estimation</span><span>● Indicateur qualitatif</span><button onClick={() => window.open(stage6MeasuredReference.sourceUrl, "_blank")}>Voir les hypothèses →</button></div>
            </div>
          </section>

          <section className={styles.bottomGrid}>
            <div className={styles.presets}>
              <div className={styles.sectionTitle}><b>BUILD PRESETS</b></div>
              <div>{(Object.keys(presets) as Array<keyof typeof presets>).map((name) => (
                <button key={name} onClick={() => applyPreset(name)} className={preset === name ? styles.presetActive : ""}><Wrench /><b>{name}</b><small>{name === "Origine" ? "Fiable et économique" : name === "Daily" ? "Usage quotidien" : name === "Sport" ? "Équilibré" : "Performance maximale"}</small></button>
              ))}<button><b>＋</b><span>Créer un preset</span></button></div>
            </div>
            <div className={styles.budget}><div><ShoppingCart /><span><small>BUDGET ESTIMÉ</small><b>{budget ? budget.toFixed(0) + " €+" : "—"}</b></span></div><button>Voir les pièces chez nos partenaires <ChevronRight /></button><small>Prix connus uniquement · autres pièces non comptées</small></div>
          </section>
        </main>

        <aside className={styles.rightRail}>
          <div className={styles.productVisual}><Box /></div>
          <h2>{activePart.label}</h2>
          <p>{activePart.brand} · {activePart.reference}</p>
          <div className={styles.badges}><span><ShieldCheck />{activePart.compatibility === "validated" ? "Compatible" : activePart.compatibility === "documented" ? "Documenté" : "À vérifier"}</span><span>★ Sélection</span></div>
          <div className={styles.tabs}><button className={styles.tabActive}>Infos</button><button>Compatibilité</button><button>Photos</button><button>Schéma</button></div>
          <dl>
            <div><dt>Machine</dt><dd>Yamaha DT 50 X 2011</dd></div>
            <div><dt>Moteur</dt><dd>Minarelli AM6</dd></div>
            {activePart.geometry?.boreMm ? <div><dt>Alésage</dt><dd>{activePart.geometry.boreMm.toFixed(1)} mm</dd></div> : null}
            {activePart.geometry?.boreMm ? <div><dt>Cylindrée calculée</dt><dd>{build.displacement.toFixed(1)} cm³</dd></div> : null}
            <div><dt>Statut</dt><dd>{activePart.compatibility}</dd></div>
            <div><dt>Source</dt><dd>{activePart.sourceLabel}</dd></div>
          </dl>
          <p className={styles.productNote}>{activePart.notes}</p>
          <button className={styles.primaryCta} onClick={() => togglePart(activePart)}>{selectedIds.includes(activePart.id) ? "Pièce sélectionnée" : "Ajouter à la configuration"}<ChevronRight /></button>
          <a href={activePart.sourceUrl} target="_blank" rel="noreferrer">Ouvrir la source technique</a>
          <div className={styles.truthBox}><Gauge /><span><b>{build.displacement.toFixed(1)} cm³</b><small>Cylindrée géométrique calculée</small></span></div>
          <div className={styles.truthBox}><CircleGauge /><span><b>{(build.speedDelta >= 0 ? "+" : "") + build.speedDelta.toFixed(1) + "%"}</b><small>Variation vitesse géométrique 13/{rearTeeth}</small></span></div>
        </aside>
      </div>

      <footer className={styles.footer}><b>2T EXPERT</b><span>Données vérifiées</span><span>Compatibilités qualifiées</span><span>Estimations clairement identifiées</span><span>RIDE. LEARN. IMPROVE. TOGETHER.</span></footer>
    </div>
  );
}
