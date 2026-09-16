import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await getMongoClient();
    await client.db("admin").command({ ping: 1 });

    return NextResponse.json({ ok: true, database: "connected" });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        database: "unavailable",
        message: "Could not connect to MongoDB Atlas Connection.",
      },
      { status: 503 },
    );
  }
}
