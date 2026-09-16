import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const dodoBaseUrl = process.env.DODO_PAYMENTS_ENVIRONMENT === "test_mode"
  ? "https://test.dodopayments.com"
  : "https://live.dodopayments.com";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { slot, companyName, websiteUrl, logoDataUrl, description, contactEmail, founderName } = data;
    if (!Number.isInteger(slot) || slot < 1 || slot > 12 || !companyName || !contactEmail || !logoDataUrl) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }
    try { new URL(websiteUrl); } catch { return NextResponse.json({ error: "Enter a valid website URL." }, { status: 400 }); }
    if (!String(logoDataUrl).startsWith("data:image/") || String(logoDataUrl).length > MAX_LOGO_SIZE * 1.4) {
      return NextResponse.json({ error: "Your logo must be a valid image smaller than 2 MB." }, { status: 400 });
    }
    if (!process.env.DODO_PAYMENTS_API_KEY || !process.env.DODO_SPONSOR_PRODUCT_ID) {
      return NextResponse.json({ error: "Payment setup is not complete yet." }, { status: 503 });
    }

    const client = await getMongoClient();
    const sponsors = client.db(process.env.MONGODB_DB).collection("sponsors");
    const unavailable = await sponsors.findOne({ slotId: slot, status: { $in: ["PENDING", "ACTIVE"] }, reservationExpiresAt: { $gt: new Date() } });
    if (unavailable) return NextResponse.json({ error: "That spot is currently being claimed. Please pick another one." }, { status: 409 });

    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const pending = await sponsors.insertOne({ slotId: slot, companyName, websiteUrl, logoDataUrl, description: description || null, contactEmail, founderName: founderName || null, status: "PENDING", reservationExpiresAt, createdAt: new Date() });
    const returnUrl = process.env.DODO_PAYMENTS_RETURN_URL || `${process.env.NEXT_PUBLIC_SITE_URL}/success`;
    const dodoResponse = await fetch(`${dodoBaseUrl}/checkouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}` },
      body: JSON.stringify({ product_cart: [{ product_id: process.env.DODO_SPONSOR_PRODUCT_ID, quantity: 1 }], customer: { email: contactEmail, name: companyName }, return_url: returnUrl, cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/sponsor?slot=${slot}`, metadata: { sponsor_id: pending.insertedId.toString(), slot_id: String(slot) } }),
    });
    const checkout = await dodoResponse.json();
    if (!dodoResponse.ok || !checkout.checkout_url) {
      await sponsors.deleteOne({ _id: pending.insertedId, status: "PENDING" });
      return NextResponse.json({ error: checkout.message || "Dodo could not create checkout. Check your test-mode product." }, { status: 502 });
    }
    await sponsors.updateOne({ _id: pending.insertedId }, { $set: { dodoCheckoutSessionId: checkout.session_id } });
    return NextResponse.json({ checkoutUrl: checkout.checkout_url });
  } catch {
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
