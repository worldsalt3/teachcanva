import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/services/rate-limit";
import {
  getMonnifyToken,
  isMonnifyServerConfigured,
  monnifyBaseUrl,
} from "@/lib/services/monnify";

/**
 * Initializes a Monnify transaction (server-side, bearer token) and records
 * a pending payment for the signed-in user. Returns the hosted checkout URL
 * for a redirect flow. Responds 501 when Monnify isn't configured.
 */
export async function POST(request: Request) {
  if (
    !rateLimit(clientKey(request, "pay-init"), { limit: 10, windowMs: 60_000 })
  ) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!isMonnifyServerConfigured()) {
    return NextResponse.json(
      { error: "Monnify is not configured." },
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

  const token = await getMonnifyToken();
  if (!token) {
    return NextResponse.json(
      { error: "Could not authenticate with Monnify." },
      { status: 502 },
    );
  }

  const reference =
    typeof body?.reference === "string" && body.reference
      ? body.reference
      : `TCH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  const res = await fetch(
    `${monnifyBaseUrl}/api/v1/merchant/transactions/init-transaction`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount), // Monnify works in Naira (major units)
        customerName: typeof body?.name === "string" ? body.name : email,
        customerEmail: email,
        paymentReference: reference,
        paymentDescription:
          typeof body?.purpose === "string" ? body.purpose : "TeachCanvas",
        currencyCode: "NGN",
        contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE,
        redirectUrl:
          typeof body?.redirectUrl === "string" ? body.redirectUrl : undefined,
        metadata: body?.metadata ?? {},
      }),
    },
  );
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.requestSuccessful) {
    return NextResponse.json(
      { error: json?.responseMessage ?? "Could not initialize payment." },
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
        reference,
        amount: Math.round(amount),
        status: "pending",
        purpose: typeof body?.purpose === "string" ? body.purpose : null,
        metadata: body?.metadata ?? {},
      });
    }
  }

  return NextResponse.json({
    authorizationUrl: json.responseBody.checkoutUrl,
    transactionReference: json.responseBody.transactionReference,
    reference,
  });
}
