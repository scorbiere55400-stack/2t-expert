import {metadata,searchSheets,sheetDetail} from '@/lib/technical-catalog';
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const id=params.get('id');
 if(id){const detail=sheetDetail(id);return detail?Response.json(detail,{headers:{'Cache-Control':'public, max-age=300'}}):Response.json({error:'Fiche introuvable.'},{status:404})}
 return Response.json(searchSheets(params),{headers:{'Cache-Control':'public, max-age=300'}});
}
