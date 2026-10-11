#!/usr/bin/env node
// Re-import a documentary edition without changing the presentation layer.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const input=process.argv[2];
if(!input){console.error('Usage: node scripts/import-technical-catalog.mjs <livraison.zip|Base_catalogue_2T_Expert.json>');process.exit(2)}
const bytes=input.endsWith('.zip')?execFileSync('unzip',['-p',resolve(input),'Base_catalogue_2T_Expert.json'],{maxBuffer:32*1024*1024}):readFileSync(resolve(input));
const data=JSON.parse(bytes.toString('utf8'));
if(!Array.isArray(data.machines)||!Array.isArray(data.sources)||!data.field_labels||!data.stats)throw Error('Édition de catalogue invalide.');
const ids=new Set(data.machines.map(m=>m.id));const sources=new Set(data.sources.map(s=>s.id));
if(ids.size!==data.machines.length||data.machines.some(m=>!/^2TE-M-\d{4}$/.test(m.id)||!m.brand||typeof m.model!=='string'||!Array.isArray(m.versions)))throw Error('Identifiants ou fiches invalides.');
for(const m of data.machines)for(const v of m.versions){if(!Array.isArray(v.source_ids)||!v.source_ids.every(id=>sources.has(id)))throw Error(`Source manquante : ${v.id}`)}
const count=data.machines.reduce((n,m)=>n+m.versions.length,0);
if(data.stats.inventory_entries!==data.machines.length||data.stats.documented_versions!==count)throw Error('Statistiques incohérentes.');
writeFileSync(new URL('../data/technical-catalog.json',import.meta.url),JSON.stringify(data,null,2)+'\n');
console.log(`${data.machines.length} fiches, ${count} versions, ${data.sources.length} sources importées.`);
