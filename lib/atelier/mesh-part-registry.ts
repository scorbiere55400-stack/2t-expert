import type { PilotPart } from "./pilot-data";

export type MeshPartSelection = {
  meshName: string;
  category: PilotPart["category"];
};

export type MeshPartLink = {
  category: PilotPart["category"];
  preferredPartIds: string[];
  relationship: "replacement" | "upgrade" | "service" | "inspection";
  note: string;
};

export const meshPartLinks: MeshPartLink[] = [
  {
    category: "Haut moteur",
    preferredPartIds: [
      "yam-piston-rebuild-a",
      "yam-piston-rebuild-b",
      "yam-piston-rebuild-c",
      "yam-piston-rebuild-d",
      "wiseco-899m05400",
    ],
    relationship: "replacement",
    note: "Le sous-ensemble 3D ouvre les kits piston sourcés ; la cote doit être confirmée avant montage.",
  },
  {
    category: "Admission",
    preferredPartIds: ["vforce4r-v4r04"],
    relationship: "upgrade",
    note: "La pièce disponible reste candidate tant que le millésime 2026 n'est pas confirmé.",
  },
  {
    category: "Échappement",
    preferredPartIds: [
      "fmf-fatty-024076",
      "fmf-factory-fatty-024077",
      "fmf-rev-024078",
      "fmf-spring-kit-011311",
    ],
    relationship: "upgrade",
    note: "Le mesh échappement donne accès aux références FMF déjà qualifiées pour YZ125 2022–2026.",
  },
  {
    category: "Refroidissement",
    preferredPartIds: ["works-radiator-brace"],
    relationship: "inspection",
    note: "La référence exacte du renfort radiateur reste à qualifier avant activation.",
  },
  {
    category: "Filtration",
    preferredPartIds: ["gytr-air-filter"],
    relationship: "service",
    note: "La référence GYTR est publiée compatible YZ125 2002–2027.",
  },
  {
    category: "Carburation",
    preferredPartIds: [],
    relationship: "inspection",
    note: "Aucune référence de remplacement n'est encore suffisamment qualifiée dans le corpus pilote.",
  },
  {
    category: "Transmission",
    preferredPartIds: [],
    relationship: "inspection",
    note: "Le sous-ensemble est interactif mais les références de remplacement restent à documenter.",
  },
];

export function getMeshPartLink(category: PilotPart["category"]) {
  return meshPartLinks.find((link) => link.category === category) ?? null;
}
