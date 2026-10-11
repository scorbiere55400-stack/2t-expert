import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const scratch = mkdtempSync(join(tmpdir(), "mecabot-test-"));
let passed = 0;
function check(name, fn) { fn(); passed++; console.log(`OK ${name}`); }
try {
  mkdirSync(join(scratch, "lib/diagnostic"), { recursive: true });
  mkdirSync(join(scratch, "data/mecabot"), { recursive: true });
  writeFileSync(join(scratch, "package.json"), '{"type":"commonjs"}');
  for (const file of ["mecabot", "mecabot-intents"]) {
    const content = readFileSync(new URL(`lib/diagnostic/${file}.ts`, root), "utf8");
    writeFileSync(join(scratch, `lib/diagnostic/${file}.js`), ts.transpileModule(content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText);
  }
  for (const name of ["pannes.json", "sources.json"]) copyFileSync(new URL(`data/mecabot/${name}`, root), join(scratch, `data/mecabot/${name}`));
  const { diagnose, classifyRequest, needsStop } = createRequire(import.meta.url)(join(scratch, "lib/diagnostic/mecabot.js"));
  const cases = [
    ["Mon moteur ne démarre pas", "no_start"], ["2 stroke won't start", "no_start"], ["motor 2 tak susah hidup", "no_start"], ["motor 2 tempos não pega", "no_start"], ["motor no arranca", "no_start"], ["motore non parte", "no_start"], ["Motor springt nicht an", "no_start"],
    ["Démarre puis cale", "stall"], ["starts then dies", "stall"], ["Quelle taille de gicleur ?", "carb"], ["Vergaser einstellen", "carb"], ["Oil mix ratio", "oil"], ["Comment mesurer la compression ?", "wear"], ["Pas d’étincelle", "ignition"], ["Prise d’air au carter", "air_leak"], ["Il surchauffe", "overheat"], ["Manuel et schéma électrique", "docs"], ["Perte de puissance", "power"],
  ];
  for (const [text, expected] of cases) check(`route ${text}`, () => assert.equal(classifyRequest(text)[0]?.id, expected));
  check("demande inconnue", () => assert.equal(diagnose("Bonjour !").intent, "unknown"));
  check("pas de sous-chaîne huile dans police", () => assert.equal(classifyRequest("police").length, 0));
  check("trois questions maximum", () => assert.equal(diagnose("Ne démarre pas").questions.length, 3));
  check("fuite impose arrêt", () => assert.equal(diagnose("L’essence coule mais je veux accélérer").stop, true));
  check("négation surchauffe", () => assert.equal(needsStop("Pas de surchauffe et aucun bruit métallique"), false));
  check("négation serrage", () => assert.equal(needsStop("Pas de serrage, le moteur n’est pas bloqué"), false));
  check("danger dans circonstances", () => assert.equal(diagnose("Ne démarre plus", { circumstances: "Après un serrage" }).stop, true));
  check("pas de procédure active après danger", () => assert.equal(diagnose("Bruit métallique nouveau", {}, "wear").references.length, 0));
  check("carburation exclue pour injection", () => assert.equal(diagnose("Quel gicleur ?", { model: "KTM 300", application: "Moto", fuelSystem: "Injection TBI" }).references.some((r) => r.sources.some((s) => s.id === "S25")), false));
  check("membranes pas proposées à cuve", () => assert.equal(diagnose("Cale au ralenti", { model: "Mikuni VM", fuelSystem: "Carburateur à cuve" }).references.some((r) => r.sources.some((s) => s.id === "S09")), false));
  check("référence générale bougie conservée", () => assert.ok(diagnose("Pas d’étincelle").references.some((r) => r.sources.some((s) => s.id === "S03"))));
  check("Rotax hors contexte exclu", () => assert.equal(diagnose("Quel mélange huile ?", { model: "Autre moteur" }).references.some((r) => r.sources.some((s) => s.id === "S27")), false));
  check("choix de thème explicite", () => assert.equal(diagnose("Le moteur démarre, je cherche un manuel", {}, "docs").intent, "docs"));
  const training = readFileSync(new URL("data/mecabot/training_curated.jsonl", root), "utf8").trim().split("\n").map(JSON.parse);
  const evaluation = readFileSync(new URL("data/mecabot/evaluation_rubrics.jsonl", root), "utf8").trim().split("\n").map(JSON.parse);
  check("58 exemples synthétiques valides", () => { assert.equal(training.length, 58); assert.ok(training.every((r) => r.synthetic && r.messages.length === 3)); });
  check("15 scénarios d’évaluation séparés", () => { assert.equal(evaluation.length, 15); assert.ok(evaluation.every((r) => !training.some((t) => t.scenario_group === r.scenario_group))); });
  console.log(`${passed} checks passed. Routage et corpus uniquement ; aucune validation mécanique ni évaluation de modèle.`);
} finally { rmSync(scratch, { recursive: true, force: true }); }
