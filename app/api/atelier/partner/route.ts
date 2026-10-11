import {NextRequest,NextResponse} from 'next/server';

// Only the destination is controlled by visitors. The tracking template is supplied
// by the approved publisher account through server configuration.
const merchant='https://www.la-becanerie.com';
const sections:Record<string,string>={
  cylinder:'/moto-50cc/moteur/cylindre/sherco-sm-50/',
  head:'/moto-50cc/moteur/culasse/sherco-sm-50/',
  piston:'/moto-50cc/moteur/piston/sherco-sm-50/',
  crank:'/moto-50cc/moteur/sherco-sm-50/',
  exhaust:'/moto-50cc/echappement/sherco-sm-50/',
  carb:'/moto-50cc/carburation/sherco-sm-50/',
  engine:'/moto-50cc/moteur/sherco-sm-50/',
  all:'/sherco-sm-50.html',
};
export function GET(request:NextRequest){
 const template=process.env.AFFILIATE_LABECANERIE_TEMPLATE;
 if(request.nextUrl.searchParams.get('status')==='1')return NextResponse.json({affiliateActive:Boolean(template?.includes('{url}'))});
 const section=request.nextUrl.searchParams.get('section')||'all';
 const destination=merchant+(sections[section]||sections.all);
 let target=destination;
 if(template?.includes('{url}')){
  try{const candidate=new URL(template.replace('{url}',encodeURIComponent(destination)));if(candidate.protocol==='https:')target=candidate.toString()}catch{}
 }
 return NextResponse.redirect(target,302);
}
