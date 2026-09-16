import Link from "next/link";
import { getMongoClient } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function SponsorsPage() {
  let sponsors: Array<{ companyName: string; description?: string; slotId: number; logoDataUrl?: string; websiteUrl?: string }> = [];
  try { const client = await getMongoClient(); sponsors = await client.db(process.env.MONGODB_DB).collection<typeof sponsors[number]>("sponsors").find({ status: "ACTIVE" }).sort({ slotId: 1 }).toArray(); } catch { /* Keep directory available. */ }
  return <main><nav className="nav wrap"><Link className="wordmark" href="/">SPONSOR<br/>MY SCREENS<span>.</span></Link><Link className="button small" href="/sponsor">Claim a spot ↗</Link></nav><section className="sponsors-head wrap"><p className="eyebrow">CURRENTLY ON THE DESK</p><h1>Who’s on<br/><em>my screens?</em></h1><p>These companies are currently sponsoring my workspace.</p></section><section className="sponsor-list wrap">{sponsors.map(s => <article className="sponsor-card" key={s.slotId}><div className="logo-block">{s.logoDataUrl ? <img src={s.logoDataUrl} alt={`${s.companyName} logo`}/> : s.companyName.slice(0,1)}</div><div><span>SPONSORED SPOT #{s.slotId}</span><h2>{s.companyName}</h2><p>{s.description || "Now showing on my desk."}</p></div>{s.websiteUrl && <a href={s.websiteUrl} target="_blank" rel="noreferrer" className="text-link">Visit site ↗</a>}</article>)}<Link href="/sponsor" className="empty-card"><b>+</b><span>{sponsors.length ? "Another spot is waiting for you." : "Be the first SaaS on my screen."}</span><em>Claim this spot →</em></Link></section></main>;
}
