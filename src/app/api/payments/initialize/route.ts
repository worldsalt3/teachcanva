import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/services/rate-limit";

/**
 * Initializes a Paystack transaction (server-side, using the secret key) and
 * records a pending payment for the signed-in user. Returns the authorization
 * URL for a redirect checkout. Responds 501 when Paystack isn't configured.
 */
export async function POST(request: Request) {
  if (
    !rateLimit(clientKey(request, "pay-init"), { limit: 10, windowMs: 60_000 })
  ) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Paystack is not configured." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);
  const email = String(body?.email ?? "");
  if (!amount || !email) {
    return NextResponse.json(
      { error: "amount and email are required." },
      { status: 400 },
    );
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // Paystack works in kobo
      reference:
        typeof body?.reference === "string" ? body.reference : undefined,
      metadata: body?.metadata ?? {},
    }),
  });
  const json = await res.json();
  if (!res.ok || !json?.status) {
    return NextResponse.json(
      { error: json?.message ?? "Could not initialize payment." },
      { status: 502 },
    );
  }

  // Best-effort: tie a pending payment record to the user for later reconcile.
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("payments").insert({
        owner_id: user.id,
        reference: json.data.reference,
        amount: Math.round(amount),
        status: "pending",
        purpose: typeof body?.purpose === "string" ? body.purpose : null,
        metadata: body?.metadata ?? {},
      });
    }
  }

  return NextResponse.json({
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  });
}
