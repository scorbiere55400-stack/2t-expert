import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
async function load(kind){const b=readFileSync(new URL('../public/models/'+kind+'-studio.glb',import.meta.url));return (await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'' )).scene}
for(const kind of ['bike','engine'])test(kind+' : GLB complet, dimensions finies, organes sélectionnables et matériaux physiques',async()=>{
 const scene=await load(kind),ids=new Set();let meshes=0;scene.traverse(o=>{if(o.userData.partId){ids.add(o.userData.partId);assert.ok(o.userData.explode.every(Number.isFinite))}if(o.isMesh){meshes++;assert.ok(o.geometry.attributes.position.count>0);assert.ok(o.material.isMeshStandardMaterial);assert.ok(o.geometry.index,'maillage indexé pour limiter le transfert')}});
 for(const id of ['cylinder','head','piston','crankshaft','carb','reed','ignition','gearbox','exhaust'])assert.ok(ids.has(id),id);
 const size=new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());assert.ok(size.toArray().every(v=>Number.isFinite(v)&&v>0));assert.ok(meshes<100);
 if(kind==='bike'){assert.ok(size.x>1.7&&size.x<2.5);assert.ok(size.y>.8&&size.y<1.4);assert.ok(size.z>.6&&size.z<1);let pipes=0;scene.traverse(o=>{if(o.userData.partId==='exhaust')pipes++});assert.equal(pipes,1,'un seul échappement complet sur la moto')}
 else{assert.ok(size.x>.4&&size.x<.9);assert.ok(size.y>.3&&size.y<.5);const box=new THREE.Box3().setFromObject(scene);scene.traverse(o=>{if(o.userData.partId)o.position.add(new THREE.Vector3(...o.userData.explode))});const exploded=new THREE.Box3().setFromObject(scene);assert.ok(exploded.max.y>box.max.y+.2);assert.ok(exploded.getSize(new THREE.Vector3()).z>size.z+.2)}
});
