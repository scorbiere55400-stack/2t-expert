export type TransmissionInput = {
  frontTeeth: number;
  rearTeeth: number;
  engineRpm: number;
  rollingCircumferenceM: number;
  primaryRatio: number;
  sixthGearRatio: number;
};

export function geometricDisplacementCc(
  boreMm: number,
  strokeMm: number,
  cylinders = 1,
) {
  return (
    (Math.PI * boreMm * boreMm * strokeMm * cylinders) /
    4000
  );
}

export function totalRatio(input: TransmissionInput) {
  return (
    input.primaryRatio *
    input.sixthGearRatio *
    (input.rearTeeth / input.frontTeeth)
  );
}

export function geometricSpeedKmh(input: TransmissionInput) {
  const ratio = totalRatio(input);
  if (
    !Number.isFinite(ratio) ||
    ratio <= 0 ||
    !Number.isFinite(input.rollingCircumferenceM) ||
    input.rollingCircumferenceM <= 0
  ) {
    return null;
  }

  return (
    (input.engineRpm * input.rollingCircumferenceM * 60) /
    (1000 * ratio)
  );
}

export function ratioDeltaPercent(
  baselineFront: number,
  baselineRear: number,
  projectFront: number,
  projectRear: number,
) {
  const baseline = baselineRear / baselineFront;
  const project = projectRear / projectFront;
  return ((project - baseline) / baseline) * 100;
}

export function theoreticalWheelTorqueDeltaPercent(
  baselineFront: number,
  baselineRear: number,
  projectFront: number,
  projectRear: number,
) {
  return ratioDeltaPercent(
    baselineFront,
    baselineRear,
    projectFront,
    projectRear,
  );
}

export function theoreticalSpeedDeltaPercent(
  baselineFront: number,
  baselineRear: number,
  projectFront: number,
  projectRear: number,
) {
  const torqueDelta = theoreticalWheelTorqueDeltaPercent(
    baselineFront,
    baselineRear,
    projectFront,
    projectRear,
  );
  return (1 / (1 + torqueDelta / 100) - 1) * 100;
}
