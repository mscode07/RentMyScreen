import Link from "next/link";
import { SponsorForm } from "@/components/sponsor-form";
import { SPONSOR_PRICE_LABEL } from "@/lib/config";

export default async function SponsorPage({ searchParams }: { searchParams: Promise<{ slot?: string }> }) {
  const { slot } = await searchParams;
  const selected = Number(slot) || 1;
  return <main className="form-page"><nav className="nav wrap"><Link className="wordmark" href="/">SPONSOR<br/>MY SCREENS<span>.</span></Link><Link className="text-link" href="/">← Back to the desk</Link></nav><section className="form-wrap wrap"><aside><p className="eyebrow">RESERVE A PLACEMENT</p><h1>Make yourself<br/><em>at home.</em></h1><p>Spot {selected} on my everyday setup is waiting for your product.</p><div className="price-card"><span>YOUR SPOT</span><strong>{SPONSOR_PRICE_LABEL} <small>/ month</small></strong><p>One of only twelve physical placements.</p></div></aside><SponsorForm slot={selected}/></section></main>;
}
