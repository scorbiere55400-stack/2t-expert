import { NextResponse } from "next/server";
import { pilotParts, yz125Pilot } from "../../../../lib/atelier/pilot-data";

export async function GET() {
  return NextResponse.json({
    data: {
      vehicle: yz125Pilot,
      parts: pilotParts,
    },
    meta: {
      pilot: true,
      generatedAt: "2026-09-25",
      truthPolicy:
        "Aucune donnée inconnue n’est remplacée par une estimation arbitraire. Les performances chiffrées exigent un modèle ou des mesures validées.",
      coverage:
        "Corpus pilote non exhaustif. Uniquement références sourcées ou candidates explicitement marquées.",
    },
  });
}
