import Link from "next/link";
import { getMongoClient } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type Slot = { id: number; name: string; accent: string; taken: boolean; note?: string; logo?: string; website?: string };
const colors = ["#ff5633", "#9ef01a", "#6277ff", "#ffd452", "#e990ff", "#38d6ca"];
const slots: Slot[] = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, name: "YOUR LOGO", accent: "#e9e6de", taken: false }));

function Arrow() { return <span aria-hidden="true">↗</span>; }

export default async function Home() {
  let liveSlots = slots;
  try {
    const client = await getMongoClient();
    const activeSponsors = await client.db(process.env.MONGODB_DB).collection("sponsors").find({ status: "ACTIVE" }).toArray();
    liveSlots = slots.map((slot) => {
      const sponsor = activeSponsors.find((entry) => entry.slotId === slot.id);
      return sponsor ? { id: slot.id, name: String(sponsor.companyName), accent: colors[(slot.id - 1) % colors.length], taken: true, note: String(sponsor.description || "Now on my screens."), logo: String(sponsor.logoDataUrl || ""), website: String(sponsor.websiteUrl || "") } : slot;
    });
  } catch { /* The public page remains usable if MongoDB is temporarily unavailable. */ }
  return <main>
    <nav className="nav wrap"><Link className="wordmark" href="/">SPONSOR<br/>MY SCREENS<span>.</span></Link><div className="navlinks"><Link href="/sponsors">Sponsors</Link><a href="#how">How it works</a><Link className="button small" href="/sponsor">Claim a spot <Arrow /></Link></div></nav>

    <section className="hero wrap">
      <div className="hero-copy"><p className="eyebrow">YOUR LOGO, OUT IN THE WORLD</p><h1>Every photo<br/>can market <em>your SaaS.</em></h1><p className="lede">I share my workspace while I build, record and post on X. Put your logo on these screens, and it can become part of the real moments I share.</p><div className="hero-actions"><Link className="button" href="/sponsor">Claim your spot <Arrow /></Link><a className="text-link" href="#proof">See it in action ↓</a></div><p className="availability"><b>{liveSlots.filter((slot) => !slot.taken).length} spots open</b> <span/> 12 total</p></div>
      <div className="hero-proof"><img src="/workspace-underdog.png" alt="Mscode07 sharing his workspace on X"/><a href="https://x.com/mscode07/status/2099518282869166207?s=20" target="_blank" rel="noreferrer">Seen on <b>𝕏 @mscode07</b> ↗</a></div>
    </section>

    <section className="setup" id="screens"><div className="wrap"><div className="setup-top"><p className="eyebrow">THE DESK, AS IT IS</p><p>Hover a screen sticker to peek inside.</p></div><div className="monitor-stage">
      <div className="lamp"/><div className="plant"><i/><i/><i/><i/></div>
      <div className="monitors">{[0, 1].map((screen) => <div className="monitor" key={screen}><div className="screen-bar"><span>{screen ? "PLAYGROUND / 02" : "WORKSPACE / 01"}</span><b>● ● ●</b></div><div className="screen-content"><div className="screen-lines"><i/><i/><i/><i/><i/></div><div className="sticker-grid">{liveSlots.slice(screen * 6, screen * 6 + 6).map((slot) => <Link className={`sticker ${slot.taken ? "filled" : ""}`} style={{ "--sticker": slot.accent } as React.CSSProperties} href={slot.taken ? (slot.website || "/sponsors") : `/sponsor?slot=${slot.id}`} target={slot.taken && slot.website ? "_blank" : undefined} key={slot.id}><div className="sticker-top">{slot.taken && slot.logo ? <img src={slot.logo} alt=""/> : <b>+</b>}<i>{slot.taken ? "LIVE" : `0${slot.id}`}</i></div><b>{slot.taken ? slot.name : "Your SaaS"}</b><span>{slot.taken ? slot.note : "This screen is waiting for you."}</span><small>{slot.taken ? "↗ Visit sponsor" : "Claim this spot →"}</small></Link>)}</div></div><div className="stand"/></div>)}</div>
      <div className="desk"/><div className="keyboard"/>
    </div></div></section>

    <section className="proof wrap" id="proof"><div className="proof-photo"><img src="/workspace-setup.png" alt="Mscode07 at his desk with the monitor setup"/><span>THE ACTUAL SETUP</span></div><div className="proof-copy"><p className="eyebrow">NOT A MOCKUP. MY REAL DESK.</p><h2>When I click,<br/><em>your brand is there.</em></h2><p>These are real X posts from my workspace. Sponsors get a physical position on the screens behind the work—not a promise of impressions, but a genuine chance to be visible whenever the setup is in frame.</p><div className="post-links"><a href="https://x.com/mscode07/status/2099518282869166207?s=20" target="_blank" rel="noreferrer">𝕏 View workspace post 01 ↗</a><a href="https://x.com/mscode07/status/2099125259362570576?s=20" target="_blank" rel="noreferrer">𝕏 View workspace post 02 ↗</a></div></div></section>

    <section className="offer wrap"><div><p className="eyebrow">WHAT YOU'RE BUYING</p><h2>A spot in the<br/><em>everyday frame.</em></h2></div><div className="offer-copy"><p>Your logo sits on the physical monitors I use to build, record, stream and share work. It is not another banner ad buried on a page.</p><ul><li>Visible on my real desk setup</li><li>Listed with a direct link on this site</li><li>May appear in posts, videos and screen recordings</li><li>A dedicated position, not a rotating ad</li></ul><Link href="/sponsor" className="text-link">See sponsorship details <Arrow /></Link></div></section>

    <section className="how wrap" id="how"><p className="eyebrow">HOW IT WORKS</p><div className="steps"><article><span>01</span><h3>Pick a spot</h3><p>Choose one of eight positions across the two screens.</p></article><article><span>02</span><h3>Add your SaaS</h3><p>Drop in your logo and tell people where to find you.</p></article><article><span>03</span><h3>Get seen</h3><p>Your mark goes on my desk and into the work I share.</p></article></div></section>

    <section className="not-banner"><div className="wrap"><p className="eyebrow">WHY THIS EXISTS</p><h2>Not another<br/>banner ad.</h2><p>This is a sponsorship of something that actually sits in my workspace. When I code, record, build and share what I’m working on, your logo is part of the environment.</p><Link href="/sponsor" className="button light">Become a screen sponsor <Arrow /></Link></div></section>
    <footer className="footer wrap"><Link className="wordmark" href="/">SPONSOR<br/>MY SCREENS<span>.</span></Link><p>Two screens. Twelve spots. That’s it.</p><div><Link href="/sponsors">Sponsors</Link><Link href="/sponsor">Claim a spot</Link></div></footer>
  </main>;
}
