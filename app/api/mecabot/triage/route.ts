import { NextResponse } from "next/server";
import { z } from "zod";
import { diagnose, intents } from "../../../../lib/diagnostic/mecabot";

const shortText = z.string().trim().max(300).optional();
const input = z.object({ text: z.string().trim().min(1).max(3000), focus: z.string().refine((id) => intents.some((i) => i.id === id)).optional(), machine: z.object({ model: shortText, application: shortText, fuelSystem: shortText, lubrication: shortText, circumstances: shortText }).strict().optional() }).strict();
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > 12000) return NextResponse.json({ error: "Demande trop longue." }, { status: 413 });
  let body: unknown;
  try { const raw = await request.text(); if (raw.length > 12000) return NextResponse.json({ error: "Demande trop longue." }, { status: 413 }); body = JSON.parse(raw); }
  catch { return NextResponse.json({ error: "JSON invalide." }, { status: 400 }); }
  const result = input.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Décris le symptôme et renseigne des champs valides." }, { status: 400 });
  return NextResponse.json({ data: diagnose(result.data.text, result.data.machine, result.data.focus) });
}
