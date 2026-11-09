import {searchParts} from '@/lib/catalog';
export async function GET(request:Request){const q=new URL(request.url).searchParams;const all=searchParts(q.get('q')||'',q.get('vehicle')||'',q.get('category')||'');const page=Math.max(1,Number(q.get('page'))||1);return Response.json({total:all.length,page,pageSize:25,items:all.slice((page-1)*25,page*25)});}
