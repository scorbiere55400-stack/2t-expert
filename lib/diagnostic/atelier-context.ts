import { evaluateBuild } from "../atelier/compatibility-engine";
import { getFullVehiclePayload } from "../atelier/knowledge-registry";

export type DiagnosticAtelierSnapshot = {
  vehicleId: string;
  snapshot: "Origine" | "Actuelle" | "Projet A" | "Projet B";
  partIds: string[];
  settings: Record<string, number | string | boolean | null>;
};

export function createDiagnosticContext(input: DiagnosticAtelierSnapshot) {
  const vehicle = getFullVehiclePayload(input.vehicleId);
  if (!vehicle) {
    return {
      ok: false,
      reason: "Machine inconnue.",
    } as const;
  }

  const compatibility = evaluateBuild(input.vehicleId, input.partIds);

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    source: "atelier-confirmed-snapshot",
    vehicle,
    snapshot: input.snapshot,
    selectedParts: input.partIds,
    settings: input.settings,
    compatibility,
    diagnosticRules: {
      projectIsNotInstalled:
        input.snapshot === "Projet A" || input.snapshot === "Projet B",
      instruction:
        input.snapshot === "Actuelle"
          ? "Utiliser cette configuration comme état réellement monté confirmé."
          : "Traiter ce snapshot comme hypothèse de projet ; ne pas le considérer monté.",
    },
  } as const;
}
