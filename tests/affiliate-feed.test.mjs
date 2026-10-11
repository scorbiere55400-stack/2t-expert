import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFeed,normalizeProduct,affiliateLink,merchantUrl,demoProducts} from '../lib/affiliate-feed.ts';
const row={merchant_id:'63576',merchant_product_id:'vendor-1',product_name:'Piston exemple',merchant_deep_link:'https://www.maxiscoot.com/fr/test.html',mpn:'MFG-42',search_price:'12.50',currency:'EUR',in_stock:'1'};
const stream=s=>{const b=new TextEncoder().encode(s);let i=0;return new ReadableStream({pull(c){if(i<b.length)c.enqueue(b.slice(i,i+=3));else c.close()}})};
test('CSV UTF-8 : guillemets, virgules et retours à la ligne survivent aux blocs',async()=>{
 const input='merchant_id,merchant_product_id,product_name,merchant_deep_link,mpn,search_price,currency,in_stock\r\n63576,sku-1,"Pièce ""2T"",\nréglage",https://www.maxiscoot.com/fr/test.html,MFG-42,12.50,EUR,1\r\n';
 const result=await parseFeed(stream(input),'csv');
 assert.equal(result.products[0].name,'Pièce "2T",\nréglage');assert.equal(result.products[0].price,12.5);assert.equal(result.limited,false);
});
test('la référence vendeur et la référence fabricant restent distinctes',()=>{
 const p=normalizeProduct(row);assert.equal(p.id,'vendor-1');assert.equal(p.reference,'MFG-42');
 assert.equal(normalizeProduct({...row,mpn:''}).reference,'');
 assert.equal(normalizeProduct({...row,currency:'GBP'}).price,null);
 assert.equal(normalizeProduct({...row,search_price:'-12'}).price,null);
 const grouped=normalizeProduct({meta:{advertiser_id:63576},product_basic:{id:'v1',title:'Piston'},product_links:{link:row.merchant_deep_link},product_identifiers:{mpn:'MFG-42'},product_prices:{price:'12.50 EUR'}});
 assert.equal(grouped.reference,'MFG-42');assert.equal(grouped.price,12.5);
});
test('refuse autres annonceurs, destinations externes et URLs avec secrets',()=>{
 assert.equal(normalizeProduct({...row,merchant_id:'1'}),null);
 for(const u of ['javascript:alert(1)','https://maxiscoot.com.evil.test/a','https://evil.test/a','https://user:secret@www.maxiscoot.com/a'])assert.equal(merchantUrl(u),null);
});
test('lien Awin exact, consentement désactivé par défaut et aucun faux éditeur',()=>{
 const u=new URL(affiliateLink(row.merchant_deep_link,'1234',false));
 assert.equal(u.hostname,'www.awin1.com');assert.equal(u.searchParams.get('awinmid'),'63576');assert.equal(u.searchParams.get('cons'),'0');assert.equal(u.searchParams.get('ued'),row.merchant_deep_link);
 assert.equal(new URL(affiliateLink(row.merchant_deep_link,'1234',true)).searchParams.get('cons'),'1');
 assert.equal(affiliateLink(row.merchant_deep_link,'',false),row.merchant_deep_link);
});
test('ne publie pas un flux tronqué ou une erreur JSONL finale',async()=>{
 await assert.rejects(parseFeed(stream('merchant_product_id,product_name,merchant_deep_link\n1,"incomplet'),'csv'));
 await assert.rejects(parseFeed(stream(JSON.stringify(row)+'\n{"error":500}\n'),'jsonl'));
});
test('limite pilote, dédoublonnage et absence de prix ou achat dans les exemples',async()=>{
 const s=Array.from({length:502},(_,i)=>JSON.stringify({...row,merchant_product_id:String(i)})).join('\n');
 const result=await parseFeed(stream(s),'jsonl');assert.equal(result.products.length,500);assert.equal(result.limited,true);
 assert.ok(demoProducts.every(p=>p.demo&&p.price===null&&p.url===''));
 const dedup=await parseFeed(stream(JSON.stringify(row)+'\n'+JSON.stringify(row)),'jsonl');assert.equal(dedup.products.length,1);
});
