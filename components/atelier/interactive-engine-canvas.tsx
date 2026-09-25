"use client";

import { useEffect, useRef } from "react";
import type { PilotPart } from "../../lib/atelier/pilot-data";
import { yz125ThreeDComponents } from "../../lib/atelier/three-d-registry";
import styles from "./atelier-workspace.module.css";

type Props = {
  src: string;
  explodeAmount: number;
  selectedCategory: PilotPart["category"] | null;
  onCategoryFocus?: (category: PilotPart["category"]) => void;
};

type MeshBinding = {
  object: any;
  base: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  category: PilotPart["category"];
};

type EngineRuntime = {
  THREE: any;
  GLTFLoader: any;
  OrbitControls: any;
};

function getRuntime() {
  return (window as typeof window & { __TWO_T_ENGINE_3D__?: EngineRuntime })
    .__TWO_T_ENGINE_3D__;
}

function ensureEngineRuntime() {
  const existing = getRuntime();
  if (existing) return Promise.resolve(existing);

  return new Promise<EngineRuntime>((resolve, reject) => {
    const ready = () => {
      const runtime = getRuntime();
      if (!runtime) return;
      window.removeEventListener("2t-engine-3d-ready", ready);
      resolve(runtime);
    };

    window.addEventListener("2t-engine-3d-ready", ready);

    const current = document.querySelector<HTMLScriptElement>(
      'script[data-2t-engine-runtime="true"]',
    );
    if (current) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "/3d-engine-runtime.js";
    script.dataset["2tEngineRuntime"] = "true";
    script.onerror = () => {
      window.removeEventListener("2t-engine-3d-ready", ready);
      reject(new Error("Chargement du moteur 3D avancé impossible."));
    };
    document.head.appendChild(script);
  });
}

function componentForName(name: string) {
  const normalized = name.toLowerCase();
  return (
    yz125ThreeDComponents.find((component) =>
      component.meshAliases.some((alias) =>
        normalized.includes(alias.toLowerCase()),
      ),
    ) ?? null
  );
}

function directionForIndex(index: number) {
  const vectors = [
    { x: 0, y: 1, z: 0 },
    { x: -1, y: 0.25, z: 0.15 },
    { x: -1, y: 0, z: -0.2 },
    { x: 1, y: 0.15, z: 0.2 },
    { x: 0.55, y: -0.35, z: 0.8 },
    { x: 0.65, y: 0.55, z: -0.6 },
    { x: -0.7, y: 0.5, z: 0.5 },
  ];
  return vectors[index % vectors.length];
}

export default function InteractiveEngineCanvas({
  src,
  explodeAmount,
  selectedCategory,
  onCategoryFocus,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const explodeRef = useRef(explodeAmount);
  const selectedRef = useRef(selectedCategory);
  const focusRef = useRef(onCategoryFocus);

  useEffect(() => {
    explodeRef.current = explodeAmount;
  }, [explodeAmount]);

  useEffect(() => {
    selectedRef.current = selectedCategory;
  }, [selectedCategory]);

  useEffect(() => {
    focusRef.current = onCategoryFocus;
  }, [onCategoryFocus]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let animationFrame = 0;
    let cleanup = () => {};

    (async () => {
      const { THREE, GLTFLoader, OrbitControls } = await ensureEngineRuntime();

      if (disposed || !hostRef.current) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x080d10);

      const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
      camera.position.set(2.5, 1.8, 3.2);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      host.replaceChildren(renderer.domElement);

      const hemi = new THREE.HemisphereLight(0xeaf5ff, 0x1a2026, 2.2);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xffffff, 3.2);
      key.position.set(3, 5, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x72c8ff, 1.8);
      rim.position.set(-4, 2, -3);
      scene.add(rim);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 0.45;
      controls.maxDistance = 10;

      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(src);
      if (disposed) return;

      const root = gltf.scene;
      scene.add(root);

      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      root.position.sub(center);
      const scale = 2.1 / maxDim;
      root.scale.setScalar(scale);

      camera.position.set(maxDim * 1.4, maxDim * 0.9, maxDim * 1.7);
      controls.target.set(0, 0, 0);
      controls.update();

      const bindings: MeshBinding[] = [];
      root.traverse((object: any) => {
        if (!object.isMesh) return;
        const component = componentForName(object.name || object.parent?.name || "");
        if (!component) return;
        const index = yz125ThreeDComponents.findIndex(
          (item) => item.category === component.category,
        );
        const dir = directionForIndex(Math.max(0, index));
        bindings.push({
          object,
          base: {
            x: object.position.x,
            y: object.position.y,
            z: object.position.z,
          },
          direction: dir,
          category: component.category,
        });
      });

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const resize = () => {
        const width = host.clientWidth || 640;
        const height = host.clientHeight || 390;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const onPointerDown = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(
          bindings.map((binding) => binding.object),
          false,
        );
        const hit = hits[0]?.object;
        if (!hit) return;
        const binding = bindings.find((item) => item.object === hit);
        if (binding) focusRef.current?.(binding.category);
      };

      renderer.domElement.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("resize", resize);
      resize();

      const render = () => {
        const distance = (explodeRef.current / 100) * 0.65;
        for (const binding of bindings) {
          const active = !selectedRef.current || selectedRef.current === binding.category;
          const emphasis = active ? 1 : 0.55;
          binding.object.position.set(
            binding.base.x + binding.direction.x * distance,
            binding.base.y + binding.direction.y * distance,
            binding.base.z + binding.direction.z * distance,
          );
          if (binding.object.material) {
            const materials = Array.isArray(binding.object.material)
              ? binding.object.material
              : [binding.object.material];
            for (const material of materials) {
              if ("opacity" in material) {
                material.transparent = !active;
                material.opacity = emphasis;
              }
            }
          }
        }

        controls.update();
        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(render);
      };
      render();

      cleanup = () => {
        cancelAnimationFrame(animationFrame);
        renderer.domElement.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("resize", resize);
        controls.dispose();
        root.traverse((object: any) => {
          object.geometry?.dispose?.();
          const mats = object.material
            ? Array.isArray(object.material)
              ? object.material
              : [object.material]
            : [];
          mats.forEach((material: any) => material.dispose?.());
        });
        renderer.dispose();
        host.replaceChildren();
      };
    })().catch((error) => {
      if (!disposed && hostRef.current) {
        hostRef.current.textContent =
          error instanceof Error
            ? `Impossible d'initialiser le moteur 3D avancé : ${error.message}`
            : "Impossible d'initialiser le moteur 3D avancé.";
      }
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      cleanup();
    };
  }, [src]);

  return (
    <div className={styles.advancedEngineCanvas}>
      <div ref={hostRef} className={styles.advancedEngineHost} />
      <div className={styles.advancedEngineLegend}>
        <b>Mode sous-meshes réel</b>
        <span>Glisser = orbite · molette = zoom · clic mesh = sélectionner</span>
      </div>
    </div>
  );
}
