export type GlbInspection = {
  valid: boolean;
  version: number | null;
  nodes: string[];
  meshes: string[];
  materials: string[];
  animations: string[];
  error?: string;
};

function decodeJsonChunk(bytes: Uint8Array) {
  const text = new TextDecoder("utf-8").decode(bytes).replace(/\u0000+$/g, "").trim();
  return JSON.parse(text) as {
    nodes?: Array<{ name?: string; mesh?: number }>;
    meshes?: Array<{ name?: string }>;
    materials?: Array<{ name?: string }>;
    animations?: Array<{ name?: string }>;
  };
}

export function inspectGlb(buffer: ArrayBuffer): GlbInspection {
  try {
    const view = new DataView(buffer);
    if (buffer.byteLength < 20) throw new Error("Fichier GLB trop court.");

    const magic = view.getUint32(0, true);
    if (magic !== 0x46546c67) throw new Error("Signature GLB invalide.");

    const version = view.getUint32(4, true);
    const declaredLength = view.getUint32(8, true);
    if (declaredLength > buffer.byteLength) {
      throw new Error("Fichier GLB tronqué.");
    }

    let offset = 12;
    let jsonChunk: Uint8Array | null = null;

    while (offset + 8 <= declaredLength) {
      const chunkLength = view.getUint32(offset, true);
      const chunkType = view.getUint32(offset + 4, true);
      const chunkStart = offset + 8;
      const chunkEnd = chunkStart + chunkLength;
      if (chunkEnd > declaredLength) throw new Error("Chunk GLB invalide.");
      if (chunkType === 0x4e4f534a) {
        jsonChunk = new Uint8Array(buffer, chunkStart, chunkLength);
        break;
      }
      offset = chunkEnd;
    }

    if (!jsonChunk) throw new Error("Chunk JSON GLB introuvable.");
    const json = decodeJsonChunk(jsonChunk);

    const unique = (values: Array<string | undefined>) =>
      Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));

    return {
      valid: true,
      version,
      nodes: unique((json.nodes ?? []).map((node) => node.name)),
      meshes: unique((json.meshes ?? []).map((mesh) => mesh.name)),
      materials: unique((json.materials ?? []).map((material) => material.name)),
      animations: unique((json.animations ?? []).map((animation) => animation.name)),
    };
  } catch (error) {
    return {
      valid: false,
      version: null,
      nodes: [],
      meshes: [],
      materials: [],
      animations: [],
      error: error instanceof Error ? error.message : "GLB invalide.",
    };
  }
}

export function matchAliases(names: string[], aliases: string[]) {
  const normalized = names.map((name) => ({ original: name, normalized: name.toLowerCase() }));
  return aliases.flatMap((alias) => {
    const token = alias.toLowerCase();
    return normalized
      .filter((entry) => entry.normalized.includes(token))
      .map((entry) => entry.original);
  });
}
