import Link from 'next/link';
import {requireChatGPTUser} from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
async function Account(){const user=await requireChatGPTUser('/espace');return <main className="page-wrap"><Link href="/">← Retour à 2T Expert</Link><h1>Mon espace</h1><p><Link href="/admin">Administration privée et laboratoire MécaBot →</Link></p><p>Connecté en tant que {user.displayName}.</p><p>Vos favoris sont liés à votre compte. Retrouvez-les dans le catalogue avec le filtre « Mes favoris ».</p><Link className="primary" href="/?view=catalog">Ouvrir le catalogue</Link><p><a href="/signout-with-chatgpt?return_to=%2F" target="_top">Se déconnecter</a></p></main>;}export default function Page(){return <Account/>;}
