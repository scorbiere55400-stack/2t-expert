import type { PilotPart } from "./pilot-data";

export type ThreeDComponent = {
  id: string;
  label: string;
  shortLabel: string;
  category: PilotPart["category"];
  screen: { x: number; y: number };
  cameraOrbit: string;
  meshAliases: string[];
  description: string;
};

export const yz125ThreeDComponents: ThreeDComponent[] = [
  {
    id: "top-end",
    label: "Cylindre / piston / culasse",
    shortLabel: "Haut moteur",
    category: "Haut moteur",
    screen: { x: 52, y: 28 },
    cameraOrbit: "18deg 54deg 70%",
    meshAliases: ["cylinder", "head", "piston", "top_end"],
    description: "Zone thermique principale : cylindre, piston, segments et culasse.",
  },
  {
    id: "intake",
    label: "Admission / clapets",
    shortLabel: "Admission",
    category: "Admission",
    screen: { x: 36, y: 42 },
    cameraOrbit: "-34deg 62deg 80%",
    meshAliases: ["reed", "intake", "manifold", "reed_valve"],
    description: "Boîte à clapets, pipe et chemin d’admission.",
  },
  {
    id: "carb",
    label: "Carburateur",
    shortLabel: "Carburation",
    category: "Carburation",
    screen: { x: 24, y: 46 },
    cameraOrbit: "-52deg 66deg 76%",
    meshAliases: ["carburetor", "carb", "pwk"],
    description: "Corps de carburateur et réglages d’alimentation.",
  },
  {
    id: "exhaust",
    label: "Échappement",
    shortLabel: "Échappement",
    category: "Échappement",
    screen: { x: 72, y: 42 },
    cameraOrbit: "54deg 69deg 82%",
    meshAliases: ["exhaust", "pipe", "header"],
    description: "Sortie cylindre, détente et liaison échappement.",
  },
  {
    id: "transmission",
    label: "Embrayage / transmission",
    shortLabel: "Transmission",
    category: "Transmission",
    screen: { x: 58, y: 68 },
    cameraOrbit: "112deg 68deg 80%",
    meshAliases: ["clutch", "gearbox", "transmission", "gear"],
    description: "Embrayage, trains de pignons et transmission primaire.",
  },
  {
    id: "cooling",
    label: "Refroidissement",
    shortLabel: "Refroidissement",
    category: "Refroidissement",
    screen: { x: 78, y: 28 },
    cameraOrbit: "152deg 62deg 88%",
    meshAliases: ["cooling", "water", "pump", "radiator"],
    description: "Pompe à eau, passages et périphériques de refroidissement.",
  },
  {
    id: "filtration",
    label: "Filtration",
    shortLabel: "Filtration",
    category: "Filtration",
    screen: { x: 18, y: 30 },
    cameraOrbit: "-82deg 70deg 92%",
    meshAliases: ["air_filter", "filter", "airbox"],
    description: "Filtre à air et boîte à air.",
  },
];

export function findThreeDComponent(category: PilotPart["category"] | null) {
  if (!category) return null;
  return yz125ThreeDComponents.find((component) => component.category === category) ?? null;
}
