import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesPartsMode} from '../lib/parts-search.ts';
const part={ref:'AM6-42',sellerRefs:['SKU 9/81'],machines:['sherco-sm50']};
const text='am6 42 piston echappement sherco';
test('référence : ignore séparateurs, cherche aussi le numéro vendeur, pas le nom',()=>{
 assert.equal(matchesPartsMode(part,'reference','AM6 42','',text),true);
 assert.equal(matchesPartsMode(part,'reference','sku-981','',text),true);
 assert.equal(matchesPartsMode(part,'reference','piston','',text),false);
 assert.equal(matchesPartsMode(part,'reference','a','',text),false);
});
test('machine : exige une sélection et un rattachement documentaire',()=>{
 assert.equal(matchesPartsMode(part,'machine','','',text),false);
 assert.equal(matchesPartsMode(part,'machine','','yamaha-dt50',text),false);
 assert.equal(matchesPartsMode(part,'machine','piston','sherco-sm50',text),true);
 assert.equal(matchesPartsMode(part,'machine','carburateur','sherco-sm50',text),false);
});
test('catalogue : combine les mots et neutralise les accents',()=>{
 assert.equal(matchesPartsMode(part,'catalogue','Échappement piston','',text),true);
 assert.equal(matchesPartsMode(part,'catalogue','piston carburateur','',text),false);
 assert.equal(matchesPartsMode(part,'catalogue','','',text),true);
});
test('les références documentaires ne deviennent pas des offres marchandes',()=>{
 assert.equal(matchesPartsMode(part,'offers','','',text),false);
});
