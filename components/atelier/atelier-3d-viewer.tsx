"use client";

import { createElement, useEffect, useRef, useState, type RefObject } from "react";
import { Box, Pause, Play, RotateCcw, ScanSearch, ZoomIn } from "lucide-react";
import type { PilotPart } from "../../lib/atelier/pilot-data";
import styles from "./atelier-workspace.module.css";

const MODEL_VIEWER_SRC =
  "https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js";
const BIKE_MODEL = "https://cdn.3dassets.dev/assets/15424/v1/model.glb";
const ENGINE_MODEL = "https://cdn.3dassets.dev/assets/26684/v1/model.glb";

type ViewerElement = HTMLElement & {
  cameraOrbit?: string;
  fieldOfView?: string;
  jumpCameraToGoal?: () => void;
};

function ensureModelViewer() {
  if (typeof window === "undefined" || customElements.get("model-viewer")) return;
  if (document.querySelector('script[data-2t-model-viewer="true"]')) return;
  const script = document.createElement("script");
  script.type = "module";
  script.src = MODEL_VIEWER_SRC;
  script.setAttribute("data-2t-model-viewer", "true");
  document.head.appendChild(script);
}

function ModelViewer({
  model,
  alt,
  autoRotate,
  viewerRef,
  cameraOrbit = "35deg 72deg 105%",
}: {
  model: string;
  alt: string;
  autoRotate: boolean;
  viewerRef: RefObject<ViewerElement | null>;
  cameraOrbit?: string;
}) {
  return createElement("model-viewer", {
    ref: viewerRef,
    src: model,
    alt,
    "camera-controls": "",
    "touch-action": "pan-y",
    "shadow-intensity": "1.4",
    "shadow-softness": "0.75",
    "environment-image": "neutral",
    exposure: "1.15",
    "camera-orbit": cameraOrbit,
    "min-camera-orbit": "auto 20deg 45%",
    "max-camera-orbit": "auto 115deg 230%",
    "min-field-of-view": "18deg",
    "max-field-of-view": "55deg",
    "interaction-prompt": "auto",
    "auto-rotate": autoRotate ? "" : undefined,
    "rotation-per-second": "22deg",
    className: styles.real3dModel,
    loading: "eager",
    reveal: "auto",
  });
}

export default function Atelier3DViewer({
  selectedCategory,
}: {
  selectedCategory: PilotPart["category"] | null;
}) {
  const [bikeAutoRotate, setBikeAutoRotate] = useState(false);
  const [engineAutoRotate, setEngineAutoRotate] = useState(false);
  const [explodedFocus, setExplodedFocus] = useState(42);
  const bikeRef = useRef<ViewerElement | null>(null);
  const engineRef = useRef<ViewerElement | null>(null);

  useEffect(() => {
    ensureModelViewer();
  }, []);

  const resetBike = () => {
    const viewer = bikeRef.current;
    if (!viewer) return;
    viewer.cameraOrbit = "35deg 72deg 105%";
    viewer.fieldOfView = "34deg";
    viewer.jumpCameraToGoal?.();
  };

  const resetEngine = () => {
    const viewer = engineRef.current;
    if (!viewer) return;
    viewer.cameraOrbit = "30deg 66deg 115%";
    viewer.fieldOfView = "32deg";
    viewer.jumpCameraToGoal?.();
  };

  const focusEngine = () => {
    const viewer = engineRef.current;
    if (!viewer) return;
    const orbitByCategory: Partial<Record<PilotPart["category"], string>> = {
      "Haut moteur": "20deg 55deg 72%",
      Admission: "-35deg 62deg 82%",
      Carburation: "-52deg 66deg 78%",
      Échappement: "52deg 70deg 86%",
      Transmission: "115deg 68deg 82%",
      Refroidissement: "155deg 63deg 90%",
      Filtration: "-80deg 72deg 95%",
    };
    viewer.cameraOrbit =
      (selectedCategory && orbitByCategory[selectedCategory]) ||
      "30deg 66deg 115%";
    viewer.fieldOfView = "26deg";
    viewer.jumpCameraToGoal?.();
  };

  return (
    <div className={styles.visualStage}>
      <section className={styles.machineVisualPanel}>
        <div className={styles.visualHeader}>
          <span>
            <small>VUE 3D PBR TEMPS RÉEL · PROTOTYPE ATELIER</small>
            <b>Moto interactive 360°</b>
          </span>
          <em>GLB · WebGL</em>
        </div>
        <div className={styles.real3dViewport}>
          <ModelViewer
            model={BIKE_MODEL}
            alt="Moto sportive 3D interactive utilisée pour valider les fonctions 360 degrés"
            autoRotate={bikeAutoRotate}
            viewerRef={bikeRef}
          />
          <div className={styles.real3dBadge}>
            <Box />
            <span>
              <b>Modèle 3D réel</b>
              <small>Prototype générique CC0 — géométrie non-OEM YZ125</small>
            </span>
          </div>
          <div className={styles.real3dToolbar}>
            <button type="button" onClick={() => setBikeAutoRotate((value) => !value)}>
              {bikeAutoRotate ? <Pause /> : <Play />}
              {bikeAutoRotate ? "Stop rotation" : "Rotation auto"}
            </button>
            <button type="button" onClick={resetBike}>
              <RotateCcw /> Réinitialiser
            </button>
          </div>
          <div className={styles.visualLegend}>
            <span><i /> interaction 3D active</span>
            <span>Glisser = pivoter · molette/pincement = zoom · double clic = recentrer</span>
          </div>
        </div>
      </section>

      <section className={styles.engineVisualPanel}>
        <div className={styles.visualHeader}>
          <span>
            <small>ASSEMBLAGE MÉCANIQUE 3D PBR · MODE ÉCLATÉ PILOTE</small>
            <b>Inspection et surveillance</b>
          </span>
          <em>{selectedCategory ? `Zone : ${selectedCategory}` : "Vue libre"}</em>
        </div>
        <div className={styles.real3dViewport}>
          <ModelViewer
            model={ENGINE_MODEL}
            alt="Assemblage mécanique 3D interactif utilisé comme prototype de vue moteur éclatée"
            autoRotate={engineAutoRotate}
            viewerRef={engineRef}
            cameraOrbit="30deg 66deg 115%"
          />
          <div className={styles.scanOverlay} aria-hidden="true">
            <span
              className={selectedCategory ? styles.scanPulse : ""}
              style={{ inset: `${Math.max(12, 38 - explodedFocus / 4)}% ${Math.max(10, 34 - explodedFocus / 5)}%` }}
            />
          </div>
          <div className={styles.real3dToolbar}>
            <button type="button" onClick={() => setEngineAutoRotate((value) => !value)}>
              {engineAutoRotate ? <Pause /> : <Play />}
              {engineAutoRotate ? "Stop rotation" : "Rotation auto"}
            </button>
            <button type="button" onClick={focusEngine} disabled={!selectedCategory}>
              <ScanSearch /> Surveiller la pièce
            </button>
            <button type="button" onClick={resetEngine}>
              <RotateCcw /> Réinitialiser
            </button>
          </div>
          <div className={styles.explodeControl}>
            <label>
              <ZoomIn />
              Intensité de focalisation
              <input
                type="range"
                min={0}
                max={100}
                value={explodedFocus}
                onChange={(event) => setExplodedFocus(Number(event.target.value))}
              />
            </label>
          </div>
          <div className={styles.focusLabel}>
            {selectedCategory
              ? `Surveillance 3D active : ${selectedCategory} — caméra et scanner synchronisés`
              : "Sélectionnez une pièce du catalogue pour activer la surveillance 3D"}
          </div>
        </div>
      </section>
    </div>
  );
}
