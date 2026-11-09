import fs from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';

// The exported triangles come only from the OpenCascade STEP source solids.
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.()})}readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result=`data:${blob.type};base64,${Buffer.from(b).toString('base64')}`;this.onloadend?.()})}};
const data=JSON.parse(await fs.readFile('/tmp/2t-e50-meshes.json','utf8'));
const materials={
 cast:new THREE.MeshPhysicalMaterial({name:'cast-alloy',color:'#92979a',metalness:.86,roughness:.48}),
 aluminium:new THREE.MeshPhysicalMaterial({name:'brushed-aluminium',color:'#c2c7c9',metalness:.94,roughness:.29}),
 steel:new THREE.MeshPhysicalMaterial({name:'machined-steel',color:'#717984',metalness:.96,roughness:.24}),
 dark:new THREE.MeshStandardMaterial({name:'dark-metal',color:'#242a2f',metalness:.75,roughness:.43}),
 rubber:new THREE.MeshStandardMaterial({name:'tyre-rubber',color:'#101214',metalness:0,roughness:.93}),
 brass:new THREE.MeshStandardMaterial({name:'brass',color:'#af8035',metalness:.9,roughness:.3}),
 ceramic:new THREE.MeshPhysicalMaterial({name:'ceramic',color:'#eeece3',metalness:0,roughness:.2}),
 copper:new THREE.MeshStandardMaterial({name:'copper',color:'#a34a1d',metalness:.9,roughness:.3}),
 gasket:new THREE.MeshStandardMaterial({name:'gasket',color:'#424c44',metalness:0,roughness:.9})
};
const scene=new THREE.Group();scene.name='E50-original-CAD-study';
let triangles=0;
for(const p of data){
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p.positions.flat(),3));g.setIndex(p.triangles.flat());g.computeVertexNormals();
 const normals=g.getAttribute('normal'),uv=[];for(let i=0;i<p.positions.length;i++){const [x,y,z]=p.positions[i],nx=Math.abs(normals.getX(i)),ny=Math.abs(normals.getY(i)),nz=Math.abs(normals.getZ(i));uv.push(...(nx>ny&&nx>nz?[z*8,y*8]:ny>nz?[x*8,z*8]:[x*8,y*8]));}g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 const obj=new THREE.Group();obj.name=p.id;obj.userData={partId:p.id,family:p.family,explode:p.explode,cadSource:true};
 const mesh=new THREE.Mesh(g,materials[p.material]);mesh.name=p.id+'-surface';obj.add(mesh);scene.add(obj);triangles+=p.triangles.length;
}
const glb=await new GLTFExporter().parseAsync(scene,{binary:true});
await fs.writeFile(new URL('../public/models/engine-cad.glb',import.meta.url),Buffer.from(glb));
console.log(JSON.stringify({components:data.length,triangles,bytes:glb.byteLength}));
