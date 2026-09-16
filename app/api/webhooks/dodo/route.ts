import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/mongodb";

type DodoObject = { payment_id?: string; id?: string; metadata?: { sponsor_id?: string } };
type DodoPayload = { type?: string; data?: DodoObject & { object?: DodoObject } };

export async function POST(request: Request) {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!webhookKey) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const rawBody = await request.text();
  try {
    const webhook = new Webhook(webhookKey);
    await webhook.verify(rawBody, { "webhook-id": request.headers.get("webhook-id") ?? "", "webhook-signature": request.headers.get("webhook-signature") ?? "", "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "" });
    const payload = JSON.parse(rawBody) as DodoPayload;
    const eventData = payload.data?.object ?? payload.data;
    const sponsorId = eventData?.metadata?.sponsor_id;
    if (!(["payment.succeeded", "subscription.active"] as string[]).includes(payload.type ?? "") || !sponsorId || !ObjectId.isValid(sponsorId)) return NextResponse.json({ received: true });
    const client = await getMongoClient();
    await client.db(process.env.MONGODB_DB).collection("sponsors").updateOne(
      { _id: new ObjectId(sponsorId), status: "PENDING" },
      { $set: { status: "ACTIVE", paymentId: eventData?.payment_id ?? eventData?.id ?? null, activatedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, $unset: { reservationExpiresAt: "" } },
    );
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }
}
