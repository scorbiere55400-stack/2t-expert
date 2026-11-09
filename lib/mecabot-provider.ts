// Server-only configuration. No key value is returned to the browser.
type Environment = Record<string, string | undefined>;
export function mecabotProvider(env: Environment = process.env) {
  if (env.OPENAI_API_KEY?.trim()) return {kind:'openai' as const,model:env.MECABOT_OPENAI_MODEL || 'gpt-5.4-mini'};
  if (env.MECABOT_INFERENCE_URL && env.MECABOT_INFERENCE_TOKEN) return {kind:'gpu' as const,model:env.MECABOT_MODEL || 'Qwen/Qwen3-4B'};
  return {kind:'guided' as const,model:null};
}

export function providerFailure(status:number, code?:string) {
  if (code === 'credit_balance_exhausted' || code === 'insufficient_quota')
    return 'Crédit API OpenAI indisponible. L’analyse guidée et les dossiers restent disponibles.';
  if (status === 401 || status === 403)
    return 'Connexion au modèle refusée. L’analyse guidée reste disponible.';
  if (status === 429)
    return 'Modèle temporairement limité. L’analyse guidée reste disponible.';
  return 'Modèle temporairement indisponible. L’analyse guidée reste disponible.';
}

export function openaiText(data:unknown):string | undefined {
  if (!data || typeof data !== 'object') return;
  const response=data as {status?:string;output?:{type?:string;content?:{type?:string;text?:string}[]}[]};
  if (response.status !== 'completed' || !Array.isArray(response.output)) return;
  const texts=response.output.filter(item=>item.type==='message').flatMap(item=>
    Array.isArray(item.content)?item.content.filter(part=>part.type==='output_text'&&typeof part.text==='string').map(part=>part.text!):[]);
  return texts.join('\n').trim() || undefined;
}
