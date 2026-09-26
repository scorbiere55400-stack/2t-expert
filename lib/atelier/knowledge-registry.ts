import { pilotParts, yz125Pilot } from "./pilot-data";
import { dt50x2011, workshopParts } from "./dt50-am6-data";

export type AtelierVehicleCoverage = "full_pilot" | "catalog_only";

export type AtelierVehicle = {
  id: string;
  brand: string;
  model: string;
  yearLabel: string;
  family: string;
  engineLabel: string;
  displacementLabel: string;
  coverage: AtelierVehicleCoverage;
  note: string;
};

export const atelierVehicles: AtelierVehicle[] = [
  {
    id: dt50x2011.id,
    brand: dt50x2011.brand,
    model: dt50x2011.model,
    yearLabel: String(dt50x2011.year),
    family: dt50x2011.family,
    engineLabel: dt50x2011.engine,
    displacementLabel: `${dt50x2011.stock.displacementCc} cm³`,
    coverage: "full_pilot",
    note: "Pilote AM6 complet pour le nouvel Atelier visuel, pièces sourcées et jauges réactives.",
  },
  {
    id: yz125Pilot.id,
    brand: yz125Pilot.brand,
    model: yz125Pilot.model,
    yearLabel: String(yz125Pilot.year),
    family: yz125Pilot.family,
    engineLabel: yz125Pilot.engine.architecture,
    displacementLabel: `${yz125Pilot.engine.displacementCcPublished} cm³`,
    coverage: "full_pilot",
    note: "Pilote complet Atelier Configuration, données et pièces sourcées.",
  },
  {
    id: "rieju-mrt50-am6",
    brand: "Rieju",
    model: "MRT 50",
    yearLabel: "2009–2026",
    family: "Enduro 50",
    engineLabel: "Minarelli AM6",
    displacementLabel: "49,7 cm³",
    coverage: "catalog_only",
    note: "Machine indexée dans le Knowledge Engine ; configuration détaillée à consolider.",
  },
  {
    id: "aprilia-rs125-rotax122",
    brand: "Aprilia",
    model: "RS 125",
    yearLabel: "1999–2012",
    family: "Route",
    engineLabel: "Rotax 122",
    displacementLabel: "124,8 cm³",
    coverage: "catalog_only",
    note: "Machine indexée ; compatibilités atelier à valider par millésime et marché.",
  },
  {
    id: "yamaha-aerox-minarelli",
    brand: "Yamaha",
    model: "Aerox 50 2T",
    yearLabel: "1997–2016",
    family: "Scooter",
    engineLabel: "Minarelli horizontal",
    displacementLabel: "49 cm³",
    coverage: "catalog_only",
    note: "Machine indexée ; logique CVT dédiée prévue dans le moteur de simulation.",
  },
  {
    id: "ktm-300-exc",
    brand: "KTM",
    model: "300 EXC",
    yearLabel: "2024–2026",
    family: "Enduro",
    engineLabel: "Monocylindre 2T injection",
    displacementLabel: "293,2 cm³",
    coverage: "catalog_only",
    note: "Machine indexée ; moteur d’injection et cartographies à traiter séparément.",
  },
];

export function getAtelierVehicle(id: string) {
  return atelierVehicles.find((vehicle) => vehicle.id === id) ?? null;
}

export function getVehicleParts(id: string) {
  return id === yz125Pilot.id ? pilotParts : [];
}

export function getWorkshopVehicleParts(id: string) {
  return id === dt50x2011.id ? workshopParts : [];
}

export function getFullVehiclePayload(id: string) {
  const vehicle = getAtelierVehicle(id);
  if (!vehicle) return null;

  if (id === dt50x2011.id) {
    return {
      vehicle,
      technical: dt50x2011,
      parts: workshopParts,
      simulationModel: "dt50-am6-workshop-v1",
    };
  }

  if (id === yz125Pilot.id) {
    return {
      vehicle,
      technical: yz125Pilot,
      parts: pilotParts,
      simulationModel: "yz125-geometric-v1",
    };
  }

  return {
    vehicle,
    technical: null,
    parts: [],
    simulationModel: null,
  };
}
