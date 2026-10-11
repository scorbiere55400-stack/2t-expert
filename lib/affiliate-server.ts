import {getRawDb} from '@/db';
import {SNAPSHOT_ID,type PartnerProduct} from './affiliate-feed';
export type Snapshot={payload:string;synced_at:number;limited:number};
export async function readPartnerSnapshot(){const row=await getRawDb().prepare('SELECT payload,synced_at,limited FROM affiliate_snapshots WHERE id=?').bind(SNAPSHOT_ID).first<Snapshot>();return row?.synced_at?{products:JSON.parse(row.payload) as PartnerProduct[],syncedAt:row.synced_at,limited:Boolean(row.limited)}:null}
export function configured(){return Boolean(process.env.AWIN_PRODUCT_FEED_URL||(process.env.AWIN_API_TOKEN&&/^[1-9][0-9]{0,14}$/.test(process.env.AWIN_PUBLISHER_ID||'')))}
export function affiliateActive(){return process.env.AWIN_MAXISCOOT_APPROVED==='true'&&/^[1-9][0-9]{0,14}$/.test(process.env.AWIN_PUBLISHER_ID||'')}
