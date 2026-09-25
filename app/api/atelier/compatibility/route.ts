import { NextResponse } from "next/server";
import { evaluateBuild } from "../../../../lib/atelier/compatibility-engine";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    vehicleId?: string;
    partIds?: string[];
  };

  if (!body.vehicleId || !Array.isArray(body.partIds)) {
    return NextResponse.json(
      { error: "vehicleId et partIds sont requis." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    data: evaluateBuild(body.vehicleId, body.partIds),
  });
}
