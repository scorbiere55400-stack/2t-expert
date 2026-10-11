'use client';
import PartsDirectory from '@/components/parts-directory';

const machineMap:Record<string,string>={
 'sherco-sm50-2024':'2TE-M-0143',
 'sherco-end50-2024':'2TE-M-0141',
 'yam-yz125':'2TE-M-0052',
 'ktm-exc300':'2TE-M-0010',
 'rieju-mrt50':'2TE-M-0146',
 'yam-aerox':'2TE-M-0434',
 'apr-rs125':'2TE-M-0753',
 'hon-cr250':'2TE-M-0915',
 'yam-rd350':'2TE-M-0646',
};

export default function AtelierCatalogue({machineId,onClose}:{machineId:string;onClose:()=>void}){
 return <PartsDirectory compact initialMachineId={machineMap[machineId]??''} onClose={onClose}/>;
}
