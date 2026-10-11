import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const command=process.platform==='win32'?'pnpm.cmd':'pnpm';
const audit=spawnSync(command,['audit','--json'],{encoding:'utf8',maxBuffer:8*1024*1024});
if(audit.error)throw audit.error;
const result=JSON.parse(audit.stdout);
assert.ok(result.metadata?.vulnerabilities,'Audit response unavailable');
const advisories=Object.values(result.advisories??{});
// Version-based registry audit still flags the locally patched development dependency.
const patchHash=createHash('sha256').update(readFileSync(new URL('../patches/braces@3.0.3.patch',import.meta.url))).digest('hex');
assert.equal(patchHash,'3753b58e1e89cf30cbf6e9275fa85c3a4a91df8fbca5f5acc580dcb4c3d62376');
const unexpected=advisories.filter(a=>!(a.github_advisory_id==='GHSA-vfj7-8cjw-p6xm' && a.module_name==='braces' && a.findings.every(f=>f.dev===true && f.version==='3.0.3')));
assert.equal(unexpected.length,0,JSON.stringify(unexpected));
const tests=spawnSync(process.execPath,['--test','tests/dependency-security.test.mjs'],{stdio:'inherit'});
assert.equal(tests.status,0,'Installed dependency patch verification failed');
console.log(JSON.stringify({registry:result.metadata.vulnerabilities,locallyPatchedDevelopmentAdvisory:advisories.length?'GHSA-vfj7-8cjw-p6xm':null}));
