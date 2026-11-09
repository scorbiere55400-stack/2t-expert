import {geometricSpeed,positive,type Settings} from './workshop-calculations.ts';
import type {Transmission} from './workshop-data';
export type Measurement={value:string;source:string};
export function atelierGauges(settings:Settings,transmission:Transmission,measurements:{acceleration:Measurement;power:Measurement}){
 const speed=geometricSpeed(settings,transmission);
 const rpm=positive(settings.rpm);
 const measured=(m:Measurement,max:number)=>{const value=positive(m.value);return value!==null&&value<=max&&m.source.trim().length>=3?value:null};
 return {speed:speed?.kmh??null,rpm:rpm!==null&&rpm<=25000?rpm:null,acceleration:measured(measurements.acceleration,120),power:measured(measurements.power,300)};
}
