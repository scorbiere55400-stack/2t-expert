/** Seul le montage explicitement confirmé traverse la frontière atelier → diagnostic. */
export function diagnosticSnapshot(draft:unknown){
 if(!draft||typeof draft!=='object')return null;
 const value=draft as Record<string,unknown>;
 const machine=value.machine;
 if(!machine||typeof machine!=='object'||typeof (machine as Record<string,unknown>).id!=='string')return null;
 const confirmed=value.actualConfirmed===true&&!!value.actual&&typeof value.actual==='object';
 return {machine,mounted:confirmed?value.actual:null,confirmed};
}
