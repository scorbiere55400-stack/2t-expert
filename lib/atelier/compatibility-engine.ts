import { getAtelierVehicle, getVehicleParts } from "./knowledge-registry";
import type { PilotPart } from "./pilot-data";

export type CompatibilityDecision = {
  allowed: boolean;
  status: PilotPart["compatibility"] | "unknown_vehicle" | "unknown_part";
  confidence:
    | "manufacturer_verified"
    | "vendor_verified"
    | "candidate_to_verify"
    | "unknown";
  reason: string;
  proofUrl?: string;
};

export function evaluateCompatibility(
  vehicleId: string,
  partId: string,
): CompatibilityDecision {
  const vehicle = getAtelierVehicle(vehicleId);
  if (!vehicle) {
    return {
      allowed: false,
      status: "unknown_vehicle",
      confidence: "unknown",
      reason: "Machine inconnue du registre Atelier.",
    };
  }

  const part = getVehicleParts(vehicleId).find((item) => item.id === partId);
  if (!part) {
    return {
      allowed: false,
      status: "unknown_part",
      confidence: "unknown",
      reason:
        "La pièce n’est pas reliée à cette machine dans le corpus de compatibilité courant.",
    };
  }

  return {
    allowed:
      part.compatibility === "direct_fit_validated" ||
      part.compatibility === "adaptation_documented",
    status: part.compatibility,
    confidence:
      part.evidenceLevel === "manufacturer_verified"
        ? "manufacturer_verified"
        : part.evidenceLevel === "vendor_verified"
          ? "vendor_verified"
          : "candidate_to_verify",
    reason: part.note,
    proofUrl: part.sourceUrl,
  };
}

export function evaluateBuild(vehicleId: string, partIds: string[]) {
  const decisions = partIds.map((partId) => ({
    partId,
    decision: evaluateCompatibility(vehicleId, partId),
  }));

  return {
    vehicleId,
    valid: decisions.every((item) => item.decision.allowed),
    decisions,
  };
}
