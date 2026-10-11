import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const manifest=JSON.parse(readFileSync(new URL('../lib/engine-cad-parts.json',import.meta.url)));
test('CAD GLB corresponds to the STEP parts manifest and preserves individual selection',async()=>{
 const b=readFileSync(new URL('../public/models/engine-cad.glb',import.meta.url));
 const scene=(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;
 const nodes=[];scene.traverse(o=>{if(o.userData.partId)nodes.push(o)});
 assert.equal(nodes.length,manifest.parts.length);
 assert.equal(new Set(nodes.map(o=>o.userData.partId)).size,nodes.length);
 for(const p of manifest.parts){
  const o=nodes.find(o=>o.userData.partId===p.id);assert.ok(o,p.id);
  assert.equal(o.userData.family,p.family);assert.equal(o.userData.cadSource,true);
  assert.ok(p.volumeMm3>0&&p.boundsMm.every(x=>Number.isFinite(x)&&x>0));
  const mesh=o.children[0];assert.ok(mesh.isMesh&&mesh.geometry.index);
  const size=new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());
  // CAD Z is browser Y; CAD Y is browser -Z. Tolerance is tessellation error.
  for(const [i,j] of [[0,0],[1,2],[2,1]])assert.ok(Math.abs(size.getComponent(i)*1000-p.boundsMm[j])<.45,p.id+' bounds');
  assert.ok(o.userData.explode.every(Number.isFinite));
 }
 for(const id of ['cylinder-liner','piston-ring-1','piston-ring-2','wrist-pin','connecting-rod','exhaust-diffuser','silencer-baffle'])assert.ok(nodes.some(o=>o.userData.partId===id));
 const assembled=new THREE.Box3().setFromObject(scene);nodes.forEach(o=>o.position.add(new THREE.Vector3(...o.userData.explode)));
 const exploded=new THREE.Box3().setFromObject(scene);assert.ok(exploded.max.y>assembled.max.y+.3);assert.ok(exploded.getSize(new THREE.Vector3()).x>assembled.getSize(new THREE.Vector3()).x+.4);
});
