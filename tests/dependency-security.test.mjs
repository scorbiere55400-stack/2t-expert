import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const braces=require('../node_modules/.pnpm/node_modules/braces');

test('brace patch preserves ordinary expansion and compilation',()=>{
 assert.deepEqual(braces.expand('src/{app,lib}/{1..3}.ts'),['src/app/1.ts','src/app/2.ts','src/app/3.ts','src/lib/1.ts','src/lib/2.ts','src/lib/3.ts']);
 assert.equal(braces.compile('a/{b,c}/d'),'a/(b|c)/d');
 assert.equal(braces.stringify('a/{b,c}/d'),'a/{b,c}/d');
});
test('deep user patterns fail before recursive walkers exhaust the stack',()=>{
 const pattern='{'.repeat(4000)+'a,b'+'}'.repeat(4000);
 for(const method of ['parse','compile','expand','stringify']) assert.throws(()=>braces[method](pattern),{name:'SyntaxError',message:/nesting exceeds 128/});
});
test('direct AST input cannot bypass nesting or cycle guards',()=>{
 let ast={type:'text',value:'a'};
 for(let i=0;i<200;i++)ast={type:'root',nodes:[ast]};
 for(const method of ['compile','expand','stringify'])assert.throws(()=>braces[method](ast),/nesting exceeds 128/);
 const cycle={type:'root',nodes:[]};cycle.nodes.push(cycle);
 for(const method of ['compile','expand','stringify'])assert.throws(()=>braces[method](cycle),/Cyclic brace AST/);
});
