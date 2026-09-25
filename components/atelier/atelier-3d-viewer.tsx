"use client";

import { createElement, useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { Box, FileUp, Pause, Play, RotateCcw, ScanSearch, ZoomIn } from "lucide-react";
import type { PilotPart } from "../../lib/atelier/pilot-data";
import { findThreeDComponent, yz125ThreeDComponents } from "../../lib/atelier/three-d-registry";
import { inspectGlb, matchAliases, type GlbInspection } from "../../lib/atelier/glb-inspector";
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
  selectedPartId,
  onCategoryFocus,
}: {
  selectedCategory: PilotPart["category"] | null;
  selectedPartId?: string | null;
  onCategoryFocus?: (category: PilotPart["category"]) => void;
}) {
  const [bikeAutoRotate, setBikeAutoRotate] = useState(false);
  const [engineAutoRotate, setEngineAutoRotate] = useState(false);
  const [explodedFocus, setExplodedFocus] = useState(42);
  const [explodeAmount, setExplodeAmount] = useState(0);
  const [customEngineUrl, setCustomEngineUrl] = useState<string | null>(null);
  const [customEngineName, setCustomEngineName] = useState<string | null>(null);
  const [inspection, setInspection] = useState<GlbInspection | null>(null);
  const bikeRef = useRef<ViewerElement | null>(null);
  const engineRef = useRef<ViewerElement | null>(null);

  useEffect(() => {
    ensureModelViewer();
    return () => {
      if (customEngineUrl) URL.revokeObjectURL(customEngineUrl);
    };
  }, [customEngineUrl]);

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

  const focusEngine = (category = selectedCategory) => {
    const viewer = engineRef.current;
    if (!viewer) return;
    const component = findThreeDComponent(category);
    viewer.cameraOrbit = component?.cameraOrbit || "30deg 66deg 115%";
    viewer.fieldOfView = component ? "26deg" : "32deg";
    viewer.jumpCameraToGoal?.();
  };

  const selectComponent = (category: PilotPart["category"]) => {
    onCategoryFocus?.(category);
    focusEngine(category);
  };

  const activeComponent = findThreeDComponent(selectedCategory);

  const meshNames = inspection ? [...inspection.nodes, ...inspection.meshes] : [];
  const componentCoverage = yz125ThreeDComponents.map((component) => ({
    component,
    matches: inspection ? matchAliases(meshNames, component.meshAliases) : [],
  }));
  const coveredCount = componentCoverage.filter((item) => item.matches.length > 0).length;

  const loadCustomEngine = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const result = inspectGlb(buffer);
    setInspection(result);
    setCustomEngineName(file.name);
    if (!result.valid) return;
    if (customEngineUrl) URL.revokeObjectURL(customEngineUrl);
    setCustomEngineUrl(URL.createObjectURL(new Blob([buffer], { type: "model/gltf-binary" })));
  };

  const resetCustomEngine = () => {
    if (customEngineUrl) URL.revokeObjectURL(customEngineUrl);
    setCustomEngineUrl(null);
    setCustomEngineName(null);
    setInspection(null);
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
            model={customEngineUrl || ENGINE_MODEL}
            alt="Assemblage mécanique 3D interactif utilisé comme prototype de vue moteur éclatée"
            autoRotate={engineAutoRotate}
            viewerRef={engineRef}
            cameraOrbit="30deg 66deg 115%"
          />
          <div className={styles.componentHotspots} aria-label="Composants 3D sélectionnables">
            {yz125ThreeDComponents.map((component) => (
              <button
                key={component.id}
                type="button"
                className={
                  selectedCategory === component.category
                    ? styles.componentHotspotActive
                    : styles.componentHotspot
                }
                style={{ left: `${component.screen.x}%`, top: `${component.screen.y}%` }}
                onClick={() => selectComponent(component.category)}
                title={component.label}
              >
                <span />
                <b>{component.shortLabel}</b>
              </button>
            ))}
          </div>
          <div className={styles.scanOverlay} aria-hidden="true">
            <span
              className={selectedCategory ? styles.scanPulse : ""}
              style={{ inset: `${Math.max(12, 38 - explodedFocus / 4)}% ${Math.max(10, 34 - explodedFocus / 5)}%` }}
            />
          </div>
          <div className={styles.modelImportPanel}>
            <label>
              <FileUp />
              <span>
                <b>Importer un GLB moteur</b>
                <small>Analyse automatique des noms de meshes pour préparer la vraie vue éclatée.</small>
              </span>
              <input type="file" accept=".glb,model/gltf-binary" onChange={loadCustomEngine} />
            </label>
            {customEngineName && (
              <div className={styles.modelImportStatus}>
                <span>{customEngineName}</span>
                <b className={inspection?.valid ? styles.modelValid : styles.modelInvalid}>
                  {inspection?.valid
                    ? `${coveredCount}/${yz125ThreeDComponents.length} zones reconnues`
                    : inspection?.error || "GLB invalide"}
                </b>
                <button type="button" onClick={resetCustomEngine}>Retirer</button>
              </div>
            )}
          </div>
          <div className={styles.real3dToolbar}>
            <button type="button" onClick={() => setEngineAutoRotate((value) => !value)}>
              {engineAutoRotate ? <Pause /> : <Play />}
              {engineAutoRotate ? "Stop rotation" : "Rotation auto"}
            </button>
            <button type="button" onClick={() => focusEngine()} disabled={!selectedCategory}>
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
            <label>
              <Box />
              Vue éclatée
              <input
                type="range"
                min={0}
                max={100}
                value={explodeAmount}
                onChange={(event) => setExplodeAmount(Number(event.target.value))}
              />
            </label>
          </div>
          <div className={styles.explodedComponentRail} aria-label="Sous-ensembles moteur">
            {yz125ThreeDComponents.map((component, index) => {
              const direction = index % 2 === 0 ? -1 : 1;
              const offset = direction * explodeAmount * (0.22 + index * 0.025);
              return (
                <button
                  key={component.id}
                  type="button"
                  className={selectedCategory === component.category ? styles.explodedComponentActive : ""}
                  style={{ transform: `translateX(${offset}px)` }}
                  onClick={() => selectComponent(component.category)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b>{component.shortLabel}</b>
                </button>
              );
            })}
          </div>
          {inspection?.valid && (
            <div className={styles.meshCoveragePanel}>
              <b>Correspondance des sous-meshes</b>
              {componentCoverage.map(({ component, matches }) => (
                <div key={component.id}>
                  <span>{component.shortLabel}</span>
                  <em className={matches.length ? styles.meshMatched : styles.meshMissing}>
                    {matches.length ? matches.slice(0, 2).join(", ") : "nom de mesh non reconnu"}
                  </em>
                </div>
              ))}
            </div>
          )}
          <div className={styles.focusLabel}>
            {activeComponent
              ? `${activeComponent.label} · ${selectedPartId ? `pièce ${selectedPartId}` : "zone catalogue"} · surveillance 3D active`
              : "Cliquez un repère 3D ou sélectionnez une pièce du catalogue"}
          </div>
        </div>
      </section>
    </div>
  );
}
