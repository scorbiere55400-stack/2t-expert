"use client";
import { useState } from "react";
import type { Machine, diagnose } from "../../lib/diagnostic/mecabot";
import { intents } from "../../lib/diagnostic/mecabot-intents";
import styles from "./mecabot-panel.module.css";
type Result = ReturnType<typeof diagnose>;

export default function MecaBotPanel() {
  const [text, setText] = useState("");
  const [machine, setMachine] = useState<Machine>({});
  const [focus, setFocus] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reviewConsent, setReviewConsent] = useState(false);
  const [observedResult, setObservedResult] = useState("");
  function update(field: keyof Machine, value: string) { setMachine((m) => ({ ...m, [field]: value })); setResult(null); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/mecabot/triage", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, machine, ...(focus ? { focus } : {}) }) });
      const payload = await response.json() as { data?: Result; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error || "Diagnostic indisponible.");
      setResult(payload.data);
    } catch (err) { setError(err instanceof Error ? err.message : "Diagnostic indisponible."); }
    finally { setBusy(false); }
  }
  function exportCase() {
    if (!result || !reviewConsent) return;
    const file = new Blob([JSON.stringify({ version: result.version, status: "proposed", indexed: false, training_eligible: false, consent_to_review: true, machine, request: text, triage: result, observed_result: observedResult, reviewed_by: null, technical_source: null }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file); const link = document.createElement("a"); link.href = url; link.download = "mecabot-cas-a-valider.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className={styles.panel}>
    <header><p>MÉCABOT · DIAGNOSTIC 2 TEMPS</p><h1>Quel problème rencontres-tu ?</h1><p>Identifie le moteur, décris le symptôme et avance contrôle par contrôle.</p></header>
    <form onSubmit={submit}>
      <label>Symptôme<textarea required maxLength={3000} value={text} onChange={(e) => { setText(e.target.value); setResult(null); }} placeholder="Ex. : ma moto 2T démarre à froid puis cale dès que j’accélère." /></label>
      <div className={styles.fields}>
        <label>Marque, modèle, année et modifications<input maxLength={300} value={machine.model ?? ""} onChange={(e) => update("model", e.target.value)} placeholder="Ex. : modèle exact, année, carburateur monté" /></label>
        <label>Type de machine<select value={machine.application ?? ""} onChange={(e) => update("application", e.target.value)}><option value="">À préciser</option>{["Moto / scooter", "Kart / quad", "Motoculture", "Hors-bord / jet-ski", "Motoneige", "Autre 2T essence"].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Alimentation<select value={machine.fuelSystem ?? ""} onChange={(e) => update("fuelSystem", e.target.value)}><option value="">Je ne sais pas</option>{["Carburateur à cuve", "Carburateur à membranes", "Injection TPI", "Injection TBI", "Autre injection"].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Lubrification<select value={machine.lubrication ?? ""} onChange={(e) => update("lubrication", e.target.value)}><option value="">Je ne sais pas</option><option>Prémélange</option><option>Graissage séparé</option></select></label>
        <label>Circonstances<input maxLength={300} value={machine.circumstances ?? ""} onChange={(e) => update("circumstances", e.target.value)} placeholder="À chaud, sous charge, après un remontage…" /></label>
        <label>Besoin à traiter<select value={focus} onChange={(e) => { setFocus(e.target.value); setResult(null); }}><option value="">Reconnaître ma demande</option>{intents.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}</select></label>
      </div>
      <button disabled={busy}>{busy ? "Analyse en cours…" : "Commencer le diagnostic"}</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {result && <div aria-live="polite" className={styles.result}>
      <h2>{result.stop ? "Suspendre les essais moteur" : result.label}</h2><p>{result.nextStep}</p>
      {result.questions.length > 0 && <ul>{result.questions.map((q) => <li key={q}>{q}</li>)}</ul>}
      {result.candidates.length > 1 && <p>Plusieurs besoins sont possibles. Choisis le besoin à traiter puis relance l’analyse.</p>}
      {result.references.length > 0 && <><h3>Pistes documentaires à vérifier</h3>{result.references.map((card) => <article key={card.id}><h4>{card.title}</h4><p>{card.hypotheses.join(" ")}</p><p>{card.checks.join(" ")}</p><small>{card.id} · {card.validation}</small><ul>{card.sources.map((s) => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> — {s.scope}</li>)}</ul></article>)}</>}
      <ul>{result.limitations.map((x) => <li key={x}>{x}</li>)}</ul>
      <h3>Contribuer à l’amélioration de MécaBot</h3><label>Contrôles effectués et résultat constaté<textarea maxLength={3000} value={observedResult} onChange={(e) => setObservedResult(e.target.value)} placeholder="Décris les mesures et la réparation ; évite les données personnelles." /></label>
      <label className={styles.consent}><input type="checkbox" checked={reviewConsent} onChange={(e) => setReviewConsent(e.target.checked)} />Je souhaite proposer ce cas à une revue technique.</label>
      <button type="button" disabled={!reviewConsent} onClick={exportCase}>Exporter le cas à valider</button><p>Le fichier est téléchargé sur ton appareil. Il devra être relu et sourcé avant toute utilisation pour l’apprentissage.</p>
    </div>}
  </section>;
}
