import { NextResponse } from "next/server";
import { atelierVehicles } from "../../../../lib/atelier/knowledge-registry";

export async function GET() {
  return NextResponse.json({
    data: atelierVehicles,
    meta: {
      fullPilotCount: atelierVehicles.filter((v) => v.coverage === "full_pilot").length,
      catalogOnlyCount: atelierVehicles.filter((v) => v.coverage === "catalog_only").length,
      policy:
        "Une machine catalog_only reste visible mais n’active pas de simulation détaillée tant que ses données ne sont pas consolidées.",
    },
  });
}
