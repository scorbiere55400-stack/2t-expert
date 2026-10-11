import test from 'node:test';
import assert from 'node:assert/strict';
import {atelierGauges} from '../lib/atelier-gauges.ts';
import {emptySettings} from '../lib/workshop-calculations.ts';
const missing={acceleration:{value:'',source:''},power:{value:'',source:''}};
test('quatre jauges restent indisponibles sans mesures et rapports',()=>{
 assert.deepEqual(atelierGauges(emptySettings,'gearbox',missing),{speed:null,rpm:null,acceleration:null,power:null});
});
test('la vitesse et le régime viennent des réglages; la puissance n’est pas déduite',()=>{
 const settings={...emptySettings,rpm:'8000',circumference:'1.8',primary:'3',gear:'1',front:'12',rear:'52'};
 const result=atelierGauges(settings,'gearbox',missing);
 assert.equal(result.speed?.toFixed(1),'66.5');assert.equal(result.rpm,8000);
 assert.equal(result.power,null);assert.equal(result.acceleration,null);
});
test('mesures sourcées uniquement, valeurs et limites contrôlées',()=>{
 const m={acceleration:{value:'8.2',source:'Chronométrage 26/09'},power:{value:'20.5',source:'Banc atelier'}};
 assert.equal(atelierGauges(emptySettings,'gearbox',m).acceleration,8.2);
 assert.equal(atelierGauges(emptySettings,'gearbox',m).power,20.5);
 assert.equal(atelierGauges(emptySettings,'gearbox',{...m,power:{...m.power,source:''}}).power,null);
 assert.equal(atelierGauges(emptySettings,'gearbox',{...m,acceleration:{value:'900',source:'Essai'}}).acceleration,null);
});
