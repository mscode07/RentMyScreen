import Link from "next/link";
export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const failed = status === "failed" || status === "cancelled" || status === "canceled";
  if (failed) return <main className="success failed-return"><div><p className="eyebrow">CHECKOUT NOT COMPLETED</p><div className="check">!</div><h1>That payment<br/><em>didn’t go through.</em></h1><p>No sponsorship was activated and your payment was not completed. You can return to the form and try again.</p><Link className="button" href="/sponsor">Return to sponsorship ↗</Link></div></main>;
  return <main className="success"><div><p className="eyebrow">CHECKOUT RECEIVED</p><div className="check">✓</div><h1>Thanks for<br/><em>supporting the desk.</em></h1><p>Your payment is being verified. Your placement will go live only after the signed Dodo webhook confirms it.</p><Link className="button" href="/sponsors">Meet the sponsors ↗</Link></div></main>;
}
