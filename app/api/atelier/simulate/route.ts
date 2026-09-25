import { NextResponse } from "next/server";
import { runYz125Simulation } from "../../../../lib/atelier/simulation-engine";
import { yz125Pilot } from "../../../../lib/atelier/pilot-data";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    vehicleId?: string;
    frontTeeth?: number;
    rearTeeth?: number;
    engineRpm?: number;
    rollingCircumferenceM?: number;
  };

  if (body.vehicleId !== yz125Pilot.id) {
    return NextResponse.json(
      {
        error:
          "Le modèle de simulation détaillé n’est pas encore validé pour cette machine.",
      },
      { status: 422 },
    );
  }

  const values = [
    body.frontTeeth,
    body.rearTeeth,
    body.engineRpm,
    body.rollingCircumferenceM,
  ];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return NextResponse.json(
      { error: "Entrées numériques invalides." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    data: runYz125Simulation({
      frontTeeth: body.frontTeeth!,
      rearTeeth: body.rearTeeth!,
      engineRpm: body.engineRpm!,
      rollingCircumferenceM: body.rollingCircumferenceM!,
    }),
  });
}
