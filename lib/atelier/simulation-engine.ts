import {
  geometricDisplacementCc,
  geometricSpeedKmh,
  theoreticalSpeedDeltaPercent,
  theoreticalWheelTorqueDeltaPercent,
} from "./simulation";
import { yz125Pilot } from "./pilot-data";

export const YZ125_SIMULATION_MODEL = {
  id: "yz125-geometric-v1",
  version: 1,
  domain: "Yamaha YZ125 2026 pilot",
  evidence: "geometric_calculation",
  assumptions: {
    primaryRatio: 3.368,
    sixthGearRatio: 1.055,
    baselineFrontTeeth: 13,
    baselineRearTeeth: 49,
  },
} as const;

export type Yz125SimulationInput = {
  frontTeeth: number;
  rearTeeth: number;
  engineRpm: number;
  rollingCircumferenceM: number;
};

export function runYz125Simulation(input: Yz125SimulationInput) {
  const model = YZ125_SIMULATION_MODEL;
  const displacementCc = geometricDisplacementCc(
    yz125Pilot.engine.boreMm,
    yz125Pilot.engine.strokeMm,
  );

  const speedKmh = geometricSpeedKmh({
    ...input,
    primaryRatio: model.assumptions.primaryRatio,
    sixthGearRatio: model.assumptions.sixthGearRatio,
  });

  const speedDeltaPercent = theoreticalSpeedDeltaPercent(
    model.assumptions.baselineFrontTeeth,
    model.assumptions.baselineRearTeeth,
    input.frontTeeth,
    input.rearTeeth,
  );

  const wheelTorqueDeltaPercent = theoreticalWheelTorqueDeltaPercent(
    model.assumptions.baselineFrontTeeth,
    model.assumptions.baselineRearTeeth,
    input.frontTeeth,
    input.rearTeeth,
  );

  return {
    model: {
      id: model.id,
      version: model.version,
      evidence: model.evidence,
    },
    inputs: input,
    outputs: {
      displacementCc,
      geometricSpeedKmh: speedKmh,
      geometricSpeedDeltaPercent: speedDeltaPercent,
      wheelTorqueDeltaPercentAtEqualEngineTorque: wheelTorqueDeltaPercent,
      power: null,
      acceleration: null,
      realTopSpeed: null,
    },
    suspendedIndicators: [
      {
        key: "power",
        reason: "Courbe couple/puissance validée absente.",
      },
      {
        key: "acceleration",
        reason:
          "Courbe de couple, masse avec pilote, pertes et conditions de piste requises.",
      },
      {
        key: "realTopSpeed",
        reason:
          "La vitesse géométrique ne prouve pas le plafond réel sous charge.",
      },
    ],
  };
}
