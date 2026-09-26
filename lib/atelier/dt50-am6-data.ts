export type WorkshopEvidence = "measured" | "calculated" | "estimated" | "qualitative";

export type WorkshopPart = {
  id: string;
  label: string;
  category:
    | "Cylindre"
    | "Carburateur"
    | "Admission"
    | "Échappement"
    | "Allumage"
    | "Transmission";
  brand: string;
  reference: string;
  priceEur?: number;
  compatibility: "validated" | "documented" | "candidate";
  sourceUrl: string;
  sourceLabel: string;
  notes: string;
  geometry?: { boreMm?: number; strokeMm?: number };
  effects: {
    powerIndex?: number;
    accelerationIndex?: number;
    lowTorqueIndex?: number;
    highTorqueIndex?: number;
    responseIndex?: number;
    reliabilityIndex?: number;
    consumptionIndex?: number;
    noiseIndex?: number;
    tuningEaseIndex?: number;
    maxRpm?: number;
  };
};

export const dt50x2011 = {
  id: "yamaha-dt50x-2011",
  brand: "Yamaha",
  model: "DT 50 X",
  year: 2011,
  engine: "Minarelli AM6",
  family: "Supermotard",
  stock: {
    displacementCc: 49.7,
    boreMm: 40.3,
    strokeMm: 39,
    compression: 12,
    carburetor: "Dell'Orto 16 mm",
    cooling: "Liquide",
    gearbox: "6 rapports",
    powerHp: 2.8,
    powerRpm: 6750,
    torqueNm: 3.3,
    torqueRpm: 5250,
    wetWeightKg: 104,
    fuelTankL: 6,
    frontTire: "100/80-17",
    rearTire: "130/70-17",
  },
  source: {
    label: "Yamaha DT50X 2011 technical data",
    url: "https://bikez.com/motorcycles/yamaha_dt50x_2011.php",
  },
};

export const workshopParts: WorkshopPart[] = [
  {
    id: "stock-cylinder",
    label: "Cylindre origine 49,7",
    category: "Cylindre",
    brand: "Yamaha / Minarelli",
    reference: "Origine",
    compatibility: "validated",
    sourceUrl: "https://bikez.com/motorcycles/yamaha_dt50x_2011.php",
    sourceLabel: "Données DT50X 2011",
    notes: "Alésage 40,3 mm, course 39 mm.",
    geometry: { boreMm: 40.3, strokeMm: 39 },
    effects: { reliabilityIndex: 10, tuningEaseIndex: 10, consumptionIndex: 10 },
  },
  {
    id: "airsal-80",
    label: "Airsal 80 Alu Ø50",
    category: "Cylindre",
    brand: "Airsal",
    reference: "AIR005174HAM",
    priceEur: 166.96,
    compatibility: "documented",
    sourceUrl: "https://airsal.com/en/producte/kit-airsal-80cc-d50mm-minarelli-am6/",
    sourceLabel: "Airsal + ScootFast",
    notes: "Ø50 mm, course origine, kit aluminium. Cylindrée géométrique calculée ~76,6 cm³.",
    geometry: { boreMm: 50, strokeMm: 39 },
    effects: { powerIndex: 18, accelerationIndex: 12, highTorqueIndex: 13, reliabilityIndex: -7, consumptionIndex: -5, maxRpm: 11200 },
  },
  {
    id: "stage6-pwk28",
    label: "Stage6 R/T PWK 28",
    category: "Carburateur",
    brand: "Stage6",
    reference: "S6-31RT-PWK28",
    compatibility: "documented",
    sourceUrl: "https://stage6-racing.com/fr/produit/pack-admission-stage6-r-t-28mm-minarelli-am6/",
    sourceLabel: "Stage6 R/T intake kit",
    notes: "Carburateur PWK 28 mm destiné aux préparations AM6.",
    effects: { powerIndex: 7, responseIndex: 8, highTorqueIndex: 6, consumptionIndex: -8, tuningEaseIndex: -4 },
  },
  {
    id: "stage6-intake",
    label: "Stage6 R/T admission",
    category: "Admission",
    brand: "Stage6 / Moto Tassinari",
    reference: "S6-3318802/BK + V-Force",
    compatibility: "documented",
    sourceUrl: "https://stage6-racing.com/fr/produit/pack-admission-stage6-r-t-28mm-minarelli-am6/",
    sourceLabel: "Stage6 R/T intake kit",
    notes: "Pipe haut débit + clapets V-Force.",
    effects: { responseIndex: 8, highTorqueIndex: 5, accelerationIndex: 4 },
  },
  {
    id: "most-70-80",
    label: "MOST Racing 70–80",
    category: "Échappement",
    brand: "MOST Racing",
    reference: "70-80 AM6",
    compatibility: "validated",
    sourceUrl: "https://www.scootfast.net/fr/pot-d-echappement-most-70-80cc-minarelli-am6.html",
    sourceLabel: "ScootFast fitment Yamaha DT 2003–2013",
    notes: "Pot passage bas pour AM6 70–80 cc, Yamaha DT 2003–2013 listée compatible.",
    effects: { powerIndex: 12, highTorqueIndex: 12, lowTorqueIndex: -4, noiseIndex: -7, maxRpm: 11800 },
  },
  {
    id: "mvt-dd21",
    label: "MVT Digital Direct DD21",
    category: "Allumage",
    brand: "MVT",
    reference: "MVT-DD21",
    priceEur: 247,
    compatibility: "validated",
    sourceUrl: "https://www.maxiscoot.com/fr/produit/allumage-mvt-dd-yamaha-dt-et-x-limit-apres-2003-27927",
    sourceLabel: "Maxiscoot / MVT",
    notes: "Version dédiée Yamaha DT/TZR 50 après 2003, rotor interne, avance variable, éclairage conservé.",
    effects: { responseIndex: 12, accelerationIndex: 6, highTorqueIndex: 4, reliabilityIndex: -2, tuningEaseIndex: -3, maxRpm: 12000 },
  },
  {
    id: "transmission-13-53",
    label: "Transmission 13/53",
    category: "Transmission",
    brand: "Configuration",
    reference: "13/53",
    compatibility: "documented",
    sourceUrl: "https://bikez.com/motorcycles/yamaha_dt50x_2011.php",
    sourceLabel: "Calcul géométrique interne",
    notes: "Réglage configurable ; effet calculé sur vitesse théorique et couple à la roue.",
    effects: { accelerationIndex: 7, lowTorqueIndex: 7 },
  },
];

export const stage6MeasuredReference = {
  label: "Stage6 R/T 70 AM6 — banc Dynojet",
  maxPowerPs: 23.69,
  maxPowerRpm: 14360,
  maxTorqueNm: 11.92,
  maxTorqueRpm: 13610,
  sourceUrl: "https://www.maxiscoot.com/fr/medien/s6-7518801_dyno_sheet.pdf-317966/vw_name.download/",
  note: "Mesure d'une configuration Stage6 complète ; référence de calibration, pas résultat automatique d'une autre configuration.",
};

export function displacementCc(boreMm: number, strokeMm: number) {
  return (Math.PI / 4) * boreMm * boreMm * strokeMm / 1000;
}

export function evaluateWorkshopBuild(selectedIds: string[], finalDrive = { front: 13, rear: 53 }) {
  const selected = workshopParts.filter((part) => selectedIds.includes(part.id));
  const cylinder = selected.find((part) => part.category === "Cylindre") ?? workshopParts[0];
  const bore = cylinder.geometry?.boreMm ?? dt50x2011.stock.boreMm;
  const stroke = cylinder.geometry?.strokeMm ?? dt50x2011.stock.strokeMm;
  const displacement = displacementCc(bore, stroke);

  const sum = (key: keyof WorkshopPart["effects"]) =>
    selected.reduce((acc, part) => acc + Number(part.effects[key] ?? 0), 0);

  const ratio = finalDrive.rear / finalDrive.front;
  const baseRatio = 53 / 13;
  const wheelTorqueDelta = (ratio / baseRatio - 1) * 100;
  const speedDelta = (baseRatio / ratio - 1) * 100;

  const powerIndex = Math.max(0, Math.min(100, 28 + sum("powerIndex")));
  const acceleration = Math.max(0, Math.min(100, 52 + sum("accelerationIndex") + wheelTorqueDelta * 1.1));
  const lowTorque = Math.max(0, Math.min(100, 55 + sum("lowTorqueIndex") + wheelTorqueDelta));
  const highTorque = Math.max(0, Math.min(100, 42 + sum("highTorqueIndex")));
  const response = Math.max(0, Math.min(100, 50 + sum("responseIndex")));
  const reliability = Math.max(0, Math.min(100, 82 + sum("reliabilityIndex")));
  const consumption = Math.max(0, Math.min(100, 78 + sum("consumptionIndex")));
  const noise = Math.max(0, Math.min(100, 78 + sum("noiseIndex")));
  const tuningEase = Math.max(0, Math.min(100, 82 + sum("tuningEaseIndex")));

  const maxRpm = Math.max(dt50x2011.stock.powerRpm, ...selected.map((part) => part.effects.maxRpm ?? 0));
  const hasCylinder = cylinder.id !== "stock-cylinder";
  const hasCarb = selected.some((part) => part.category === "Carburateur");
  const hasExhaust = selected.some((part) => part.category === "Échappement");
  const hasIgnition = selected.some((part) => part.category === "Allumage");

  const estimatedPowerRange = hasCylinder
    ? hasCarb && hasExhaust
      ? hasIgnition ? [17, 22] : [15, 20]
      : [11, 16]
    : [dt50x2011.stock.powerHp, dt50x2011.stock.powerHp];

  const estimatedSpeedRange = hasCylinder
    ? [88 + speedDelta * 0.4, 108 + speedDelta * 0.6]
    : [45 + speedDelta * 0.25, 52 + speedDelta * 0.3];

  return {
    selected,
    displacement,
    maxRpm,
    speedDelta,
    wheelTorqueDelta,
    gauges: { powerIndex, acceleration, lowTorque, highTorque, response, reliability, consumption, noise, tuningEase },
    estimatedPowerRange,
    estimatedSpeedRange,
    evidence: {
      displacement: "calculated" as WorkshopEvidence,
      gearing: "calculated" as WorkshopEvidence,
      power: "estimated" as WorkshopEvidence,
      speed: "estimated" as WorkshopEvidence,
      qualitative: "qualitative" as WorkshopEvidence,
    },
  };
}
