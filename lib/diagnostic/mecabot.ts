import cards from "../../data/mecabot/pannes.json";
import sources from "../../data/mecabot/sources.json";

export const curriculumVersion = "2026.10.11";
export type Machine = { model?: string; application?: string; fuelSystem?: string; lubrication?: string; circumstances?: string };
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, " ");
export { intents } from "./mecabot-intents";
import { intents } from "./mecabot-intents";

// A lexicon routes requests; it neither proves a fault nor measures search demand.
export function classifyRequest(text: string) {
  const normalized = normalize(text);
  return intents.map((intent) => ({ id: intent.id, label: intent.label, score: intent.patterns.filter((p) => new RegExp("(?:^|[^a-z0-9])" + p).test(normalized)).length }))
    .filter((intent) => intent.score > 0).sort((a, b) => b.score - a.score);
}

export function needsStop(text: string) {
  // Remove explicit negative observations before looking for reported hazards.
  const observed = normalize(text).replace(/(?:pas de|aucune?|sans|no|kein\w*)\s+(?:fuite(?: de carburant)?|surchauffe|serrage|bruit metallique|fuel leak|overheating)/g, "")
    .replace(/ne (?:se )?(?:bloque|surchauffe) pas/g, "")
    .replace(/n est pas bloque/g, "");
  return /fuite (?:d essence|de carburant)|essence coule|bloque|serrage|surchauff|bruit metallique|immerg|submerge|fuel leak|seizure|overheat|metallic noise|kolbenfresser|uberhitzt|gripaje|grippaggio|superaquec|travou|mesin.*macet/.test(observed);
}

export function diagnose(text: string, machine: Machine = {}, focus?: string) {
  const candidates = classifyRequest(text);
  const selected = intents.find((i) => i.id === focus) ?? intents.find((i) => i.id === candidates[0]?.id);
  const stop = needsStop([text, machine.circumstances ?? ""].join(". "));
  const fuel = normalize(machine.fuelSystem ?? "");
  const injection = /inject|tpi|tbi/.test(fuel);
  const model = normalize(machine.model ?? "");
  const missing = [!machine.model?.trim() && "Marque, modèle, année et modifications réellement montées ?", !machine.fuelSystem?.trim() && "Carburateur à cuve, à membranes ou injection (TPI/TBI/autre) ?", !machine.circumstances?.trim() && "À froid, à chaud, au ralenti ou sous charge ? Après quelle intervention ?"].filter((q): q is string => !!q);
  const references = cards.filter((card) => (selected?.cards as readonly string[] | undefined)?.includes(card.id))
    .filter((card) => !card.source_ids.includes("S28"))
    .filter((card) => {
      if (card.source_ids.includes("S27") && !/rotax.*max|max.*rotax/.test(model)) return false;
      if (card.source_ids.includes("S26") && !/tohatsu/.test(model)) return false;
      if (card.source_ids.includes("S15") && !/stihl/.test(model)) return false;
      if (card.source_ids.includes("S16") && !/husqvarna/.test(model)) return false;
      if (card.source_ids.some((s) => ["S09", "S10", "S11", "S12", "S13", "S14"].includes(s))) return /membrane/.test(fuel);
      if (card.source_ids.includes("S25")) return !injection && /cuve/.test(fuel) && /mikuni.*vm|vm.*mikuni/.test(model);
      if (card.source_ids.some((s) => ["S18", "S19", "S20", "S21", "S22", "S23", "S24"].includes(s))) return /moto|kart|quad/.test(normalize(machine.application ?? ""));
      return true;
    }).map((card) => ({ id: card.id, title: card.titre, hypotheses: card.causes_possibles, checks: card.controles, validation: card.validation, scope: card.applications, sources: sources.filter((s) => card.source_ids.includes(s.id)).map((s) => ({ id: s.id, title: s.titre, url: s.url, scope: s.portee })) }));
  return { version: curriculumVersion, mode: "guided-triage", intent: selected?.id ?? "unknown", label: selected?.label ?? "Précisons le problème", candidates, stop, questions: missing.slice(0, 3),
    nextStep: stop ? "Arrête les essais moteur. Identifie le modèle et le signe de danger avant tout redémarrage ; fais contrôler la cause selon son manuel." : selected?.id === "docs" ? "Identifie le code moteur, l’année et le marché pour choisir le manuel et le schéma applicables." : missing.length ? "Complète ces informations avant de choisir un contrôle : un symptôme peut avoir plusieurs causes." : "Commence par l’observation et le contrôle indiqué dans le manuel applicable. Note le résultat avant de remplacer une pièce ou de modifier un réglage.",
    references: stop ? [] : references, limitations: ["Orientation par règles ; aucune panne confirmée et aucune valeur de réglage universelle.", ...(injection ? ["TPI/TBI : documentation constructeur spécifique requise ; les procédures de carburateur sont exclues."] : []), "Fiches documentaires non validées en atelier. Une conversation exportée reste une proposition hors apprentissage jusqu’à validation."] };
}
