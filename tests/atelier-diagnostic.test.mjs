import test from 'node:test';
import assert from 'node:assert/strict';
import {decide} from '../lib/diagnostic-engine.ts';
import {diagnosticSnapshot} from '../lib/diagnostic-snapshot.ts';
import {emptySettings,ratioComparison} from '../lib/workshop-calculations.ts';
const input=(observations=[],other={})=>({symptoms:['demarrage'],context:'',recentChange:'',severe:false,observations,...other});
test('A2 transmission 12 à 13 : géométrie, sans simulation de puissance',()=>{
 const base={...emptySettings,rpm:'8000',circumference:'1.8',primary:'3',gear:'1',front:'12',rear:'52'};
 const change={...base,front:'13'};
 const r=ratioComparison(base,change,'gearbox');
 assert.ok(r);
 assert.equal(r.speedDelta.toFixed(1),'8.3');
 assert.equal(r.tractionDelta.toFixed(1),'-7.7');
 assert.equal('power' in r,false);
});
test('D1 une variante virtuelle ne traverse pas vers le diagnostic',()=>{
 const draft={machine:{id:'m1'},variants:{A:{parts:[{ref:'pot-virtuel'}]}},actual:{parts:[{ref:'pot-reel'}]},actualConfirmed:true};
 const snapshot=diagnosticSnapshot(draft);
 assert.deepEqual(snapshot?.mounted,draft.actual);
 assert.equal(JSON.stringify(snapshot).includes('pot-virtuel'),false);
 assert.equal(diagnosticSnapshot({...draft,actualConfirmed:false})?.mounted,null);
});
test('D2 résultats différents changent la suite proposée',()=>{
 const observed=r=>[{controlId:'visual',result:'normal',note:'externe',date:'2026-09-25'},{controlId:'fuel',result:r,note:'atelier',date:'2026-09-25'}];
 assert.equal(decide(input(observed('normal'))).next?.id,'ignition');
 assert.equal(decide(input(observed('anormal'))).next,null);
 assert.equal(decide(input(observed('impossible'))).next?.id,'ignition');
});
test('D4 un signal grave suspend les contrôles',()=>{
 const severe=decide(input([], {severe:true}));
 assert.equal(severe.stop,true);assert.equal(severe.next,null);
 const heat=decide(input([], {symptoms:['surchauffe']}));
 assert.equal(heat.stop,true);assert.equal(heat.next,null);
});
test('un résultat incertain ne devient pas une preuve positive',()=>{
 const r=decide(input([{controlId:'visual',result:'incertain',note:'photo floue',date:'2026-09-25'}]));
 assert.equal(r.hypotheses.some(h=>h.level==='Prioritaire à vérifier'),false);
 assert.notEqual(r.next?.id,'visual');
});
