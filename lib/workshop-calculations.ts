import type {Transmission} from './workshop-data';
export type SettingKey='rpm'|'circumference'|'primary'|'gear'|'front'|'rear'|'finalReduction'|'variatorRatio'|'bore'|'stroke'|'cylinders'|'rollerMass'|'beltWidth'|'mainJet'|'idleJet'|'airScrew'|'machineMass'|'riderMass';
export type Settings=Record<SettingKey,string>;
export const emptySettings:Settings={rpm:'',circumference:'',primary:'',gear:'',front:'',rear:'',finalReduction:'',variatorRatio:'',bore:'',stroke:'',cylinders:'',rollerMass:'',beltWidth:'',mainJet:'',idleJet:'',airScrew:'',machineMass:'',riderMass:''};
export function positive(value:string){if(value.trim()==='')return null;const n=Number(value.replace(',','.'));return Number.isFinite(n)&&n>0?n:null;}
export function geometricSpeed(s:Settings,type:Transmission){
 const rpm=positive(s.rpm),circ=positive(s.circumference);if(!rpm||!circ||rpm>25000||circ>4)return null;
 let ratio:number|null=null;
 if(type==='gearbox'){
  const primary=positive(s.primary),gear=positive(s.gear),front=positive(s.front),rear=positive(s.rear);
  if(primary&&gear&&front&&rear&&front<=100&&rear<=150)ratio=primary*gear*rear/front;
 }else if(type==='cvt'||type==='moped'){
  const variator=positive(s.variatorRatio),final=positive(s.finalReduction);
  if(variator&&final)ratio=variator*final;
 }
 if(!ratio||ratio<1||ratio>300)return null;
 return {kmh:rpm*circ*60/(1000*ratio),ratio};
}
export function displacement(s:Settings){const bore=positive(s.bore),stroke=positive(s.stroke),cylinders=positive(s.cylinders);if(!bore||!stroke||!cylinders||bore>150||stroke>150||!Number.isInteger(cylinders)||cylinders>6)return null;return Math.PI/4*bore*bore*stroke*cylinders/1000;}
export function ratioComparison(base:Settings,project:Settings,type:Transmission){const b=geometricSpeed(base,type),p=geometricSpeed(project,type);if(!b||!p)return null;return {base:b,project:p,speedDelta:(p.kmh/b.kmh-1)*100,tractionDelta:(p.ratio/b.ratio-1)*100};}
