import { NextResponse } from "next/server";
import {
  createDiagnosticContext,
  type DiagnosticAtelierSnapshot,
} from "../../../../lib/diagnostic/atelier-context";

export async function POST(request: Request) {
  const body = (await request.json()) as DiagnosticAtelierSnapshot;
  if (!body.vehicleId || !body.snapshot || !Array.isArray(body.partIds)) {
    return NextResponse.json(
      { error: "Snapshot Atelier invalide." },
      { status: 400 },
    );
  }

  const context = createDiagnosticContext({
    ...body,
    settings: body.settings || {},
  });

  if (!context.ok) {
    return NextResponse.json({ error: context.reason }, { status: 404 });
  }

  return NextResponse.json({
    data: context,
    meta: {
      nextStep:
        "Ce contexte est prêt pour le moteur de diagnostic adaptatif. Aucun projet virtuel n’est considéré comme pièce montée.",
    },
  });
}
