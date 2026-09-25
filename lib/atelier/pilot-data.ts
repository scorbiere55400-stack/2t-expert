export type EvidenceLevel =
  | "manufacturer_verified"
  | "manufacturer_platform_reference"
  | "vendor_verified"
  | "candidate_to_verify";

export type CompatibilityStatus =
  | "direct_fit_validated"
  | "adaptation_documented"
  | "candidate_to_verify"
  | "incompatible";

export type PilotPart = {
  id: string;
  manufacturer: string;
  reference: string;
  name: string;
  category:
    | "Haut moteur"
    | "Admission"
    | "Carburation"
    | "Échappement"
    | "Transmission"
    | "Refroidissement"
    | "Filtration"
    | "Châssis";
  compatibility: CompatibilityStatus;
  evidenceLevel: EvidenceLevel;
  yearScope: string;
  sourceLabel: string;
  sourceUrl: string;
  note: string;
  selectable: boolean;
  effect?: {
    type: "documented_tendency" | "geometric_input";
    summary: string;
  };
};

export const yz125Pilot = {
  id: "yamaha-yz125-2026",
  brand: "Yamaha",
  model: "YZ125",
  year: 2026,
  market: "Europe / France",
  family: "Motocross compétition",
  engine: {
    architecture: "Monocylindre 2T, refroidissement liquide",
    displacementCcPublished: 125,
    boreMm: 54,
    strokeMm: 54.5,
    compressionRatio: "8,2–10,1 : 1",
    carburetor: "Keihin PWK38S",
    ignition: "CDI",
    lubrication: "Prémélange",
    starter: "Kick",
    gearbox: "6 rapports, prise constante",
    finalDrive: "Chaîne",
  },
  chassis: {
    frame: "Semi double berceau",
    frontTravelMm: 300,
    rearTravelMm: 315,
    frontBrakeMm: 270,
    rearBrakeMm: 240,
    frontTire: "80/100-21 51M",
    rearTire: "100/90-19 57M",
    rake: "26°",
    trailMm: 109,
    wheelbaseMm: 1445,
    seatHeightMm: 980,
    groundClearanceMm: 365,
    wetWeightKg: 96,
    fuelCapacityL: 7,
  },
  provenance: [
    {
      label: "Yamaha Motor Europe — YZ125 2026",
      url: "https://www.yamaha-motor.eu/fr/fr/motorcycles/competition/pdp/yz125-70th-anniversary-edition/",
      evidenceLevel: "manufacturer_verified" as EvidenceLevel,
      scope: "Spécifications 2026 moteur, châssis et dimensions.",
    },
    {
      label: "Yamaha Motor Japan — YZ125 2022 platform data",
      url: "https://global.yamaha-motor.com/jp/news/2021/0730/yz125.html",
      evidenceLevel: "manufacturer_platform_reference" as EvidenceLevel,
      scope:
        "Rapports de boîte et démultiplication documentés pour la plateforme 2022 ; réutilisation 2026 à confirmer avant toute conclusion mécanique.",
    },
  ],
};

export const pilotParts: PilotPart[] = [
  {
    id: "yam-piston-rebuild-a",
    manufacturer: "Yamaha",
    reference: "B4X-WB033-00-A0",
    name: "Piston Rebuild Kit — cote A",
    category: "Haut moteur",
    compatibility: "direct_fit_validated",
    evidenceLevel: "manufacturer_verified",
    yearScope: "YZ125 70th Anniversary 2026",
    sourceLabel: "Yamaha OEM Parts — Piston Rebuilt Kit",
    sourceUrl: "https://yamaha-motor.com/parts/diagram/13979618/320555367",
    note: "Référence OEM publiée sur le diagramme Yamaha 2026. La cote doit correspondre au cylindre mesuré.",
    selectable: true,
  },
  {
    id: "yam-piston-rebuild-b",
    manufacturer: "Yamaha",
    reference: "B4X-WB033-00-B0",
    name: "Piston Rebuild Kit — cote B",
    category: "Haut moteur",
    compatibility: "direct_fit_validated",
    evidenceLevel: "manufacturer_verified",
    yearScope: "YZ125 70th Anniversary 2026",
    sourceLabel: "Yamaha OEM Parts — Piston Rebuilt Kit",
    sourceUrl: "https://yamaha-motor.com/parts/diagram/13979618/320555367",
    note: "Référence OEM publiée sur le diagramme Yamaha 2026. La cote doit correspondre au cylindre mesuré.",
    selectable: true,
  },
  {
    id: "yam-piston-rebuild-c",
    manufacturer: "Yamaha",
    reference: "B4X-WB033-00-C0",
    name: "Piston Rebuild Kit — cote C",
    category: "Haut moteur",
    compatibility: "direct_fit_validated",
    evidenceLevel: "manufacturer_verified",
    yearScope: "YZ125 70th Anniversary 2026",
    sourceLabel: "Yamaha OEM Parts — Piston Rebuilt Kit",
    sourceUrl: "https://yamaha-motor.com/parts/diagram/13979618/320555367",
    note: "Référence OEM publiée sur le diagramme Yamaha 2026. La cote doit correspondre au cylindre mesuré.",
    selectable: true,
  },
  {
    id: "yam-piston-rebuild-d",
    manufacturer: "Yamaha",
    reference: "B4X-WB033-00-D0",
    name: "Piston Rebuild Kit — cote D",
    category: "Haut moteur",
    compatibility: "direct_fit_validated",
    evidenceLevel: "manufacturer_verified",
    yearScope: "YZ125 70th Anniversary 2026",
    sourceLabel: "Yamaha OEM Parts — Piston Rebuilt Kit",
    sourceUrl: "https://yamaha-motor.com/parts/diagram/13979618/320555367",
    note: "Référence OEM publiée sur le diagramme Yamaha 2026. La cote doit correspondre au cylindre mesuré.",
    selectable: true,
  },
  {
    id: "gytr-air-filter",
    manufacturer: "GYTR / Yamaha",
    reference: "BCR-E41C0-V0-00",
    name: "Filtre à air performance",
    category: "Filtration",
    compatibility: "direct_fit_validated",
    evidenceLevel: "manufacturer_verified",
    yearScope: "YZ125 2002–2027",
    sourceLabel: "Yamaha Motor — GYTR Performance Air Filter",
    sourceUrl: "https://yamaha-motor.com/p/yz125-x-yz250-x-air-filter",
    note: "Compatibilité YZ125 2002–2027 publiée par Yamaha.",
    selectable: true,
    effect: {
      type: "documented_tendency",
      summary: "Filtration double densité ; aucun gain moteur chiffré n’est attribué sans essai comparable.",
    },
  },
  {
    id: "fmf-fatty-024076",
    manufacturer: "FMF Racing",
    reference: "024076",
    name: "Fatty Pipe",
    category: "Échappement",
    compatibility: "direct_fit_validated",
    evidenceLevel: "vendor_verified",
    yearScope: "YZ125 2022–2026",
    sourceLabel: "FMF Racing — Fatty 024076",
    sourceUrl: "https://www.fmfracing.com/products/fatty-024076",
    note: "FMF liste explicitement YZ125 2022–2026.",
    selectable: true,
    effect: {
      type: "documented_tendency",
      summary: "FMF décrit une courbe élargie et plus linéaire ; aucun pourcentage de puissance n’est inventé.",
    },
  },
  {
    id: "fmf-factory-fatty-024077",
    manufacturer: "FMF Racing",
    reference: "024077",
    name: "Factory Fatty",
    category: "Échappement",
    compatibility: "direct_fit_validated",
    evidenceLevel: "vendor_verified",
    yearScope: "YZ125 2022–2026",
    sourceLabel: "FMF Racing — Factory Fatty 024077",
    sourceUrl: "https://www.fmfracing.com/products/factory-fatty-024077",
    note: "FMF liste explicitement YZ125 2022–2026.",
    selectable: true,
    effect: {
      type: "documented_tendency",
      summary: "Tendance constructeur : bas/milieu plus présents et allonge accrue ; amplitude non chiffrée ici.",
    },
  },
  {
    id: "fmf-rev-024078",
    manufacturer: "FMF Racing",
    reference: "024078",
    name: "Factory Fatty Rev",
    category: "Échappement",
    compatibility: "direct_fit_validated",
    evidenceLevel: "vendor_verified",
    yearScope: "YZ125 2022–2026",
    sourceLabel: "FMF Racing — Factory Fatty Rev 024078",
    sourceUrl: "https://www.fmfracing.com/products/factory-fatty-rev-pipe-024078",
    note: "FMF liste explicitement YZ125 2022–2026.",
    selectable: true,
    effect: {
      type: "documented_tendency",
      summary: "FMF positionne ce pot sur le milieu/haut régime et l’allonge.",
    },
  },
  {
    id: "fmf-spring-kit-011311",
    manufacturer: "FMF Racing",
    reference: "011311",
    name: "Kit ressorts + joints toriques d’échappement",
    category: "Échappement",
    compatibility: "direct_fit_validated",
    evidenceLevel: "vendor_verified",
    yearScope: "YZ125 2022–2026",
    sourceLabel: "FMF Racing — 011311",
    sourceUrl: "https://www.fmfracing.com/products/acc-exhaust-011311",
    note: "Accessoire déclaré compatible stock ou FMF ; YZ125 2022–2026.",
    selectable: true,
  },
  {
    id: "vforce4r-v4r04",
    manufacturer: "Moto Tassinari",
    reference: "V4R04",
    name: "VForce4R Reed Valve System",
    category: "Admission",
    compatibility: "candidate_to_verify",
    evidenceLevel: "candidate_to_verify",
    yearScope: "YZ125 — année exacte à confirmer pour 2026",
    sourceLabel: "Moto Tassinari — V4R04",
    sourceUrl: "https://mototassinari.com/v4r04.html",
    note:
      "La page constructeur cible la Yamaha YZ125 mais ne fournit pas dans la source consultée une plage d’années explicite. Non sélectionnable tant que le millésime 2026 n’est pas confirmé.",
    selectable: false,
  },
  {
    id: "wiseco-899m05400",
    manufacturer: "Wiseco",
    reference: "899M05400",
    name: "ProLite Forged Piston Kit 54,00 mm",
    category: "Haut moteur",
    compatibility: "candidate_to_verify",
    evidenceLevel: "candidate_to_verify",
    yearScope: "Source validée pour YZ125 2022 seulement",
    sourceLabel: "Wiseco — 2022 YZ125 piston release",
    sourceUrl: "https://www.wiseco.com/wp-content/uploads/2023/04/Wiseco22_2022_YZ125_Pistons_Rtl_MAP.pdf",
    note:
      "La géométrie est cohérente avec la plateforme mais la source consultée ne suffit pas à valider 2026. La pièce reste candidate, non activée dans le projet.",
    selectable: false,
  },
  {
    id: "works-radiator-brace",
    manufacturer: "Works Connection",
    reference: "À déterminer dans le sélecteur fabricant",
    name: "Radiator Braces",
    category: "Refroidissement",
    compatibility: "candidate_to_verify",
    evidenceLevel: "candidate_to_verify",
    yearScope: "Le sélecteur fabricant expose YZ125 et année 2026",
    sourceLabel: "Works Connection — Radiator Braces",
    sourceUrl: "https://www.worksconnection.com/2020-yamaha-yz125/p18130-radiator-braces",
    note:
      "Le sélecteur permet 2026/YZ125 mais la référence exacte n’est pas isolée de façon suffisamment fiable dans la source consultée. À qualifier avant activation.",
    selectable: false,
  },
];

export const partCategories = [
  "Toutes",
  "Haut moteur",
  "Admission",
  "Carburation",
  "Échappement",
  "Transmission",
  "Refroidissement",
  "Filtration",
  "Châssis",
] as const;
