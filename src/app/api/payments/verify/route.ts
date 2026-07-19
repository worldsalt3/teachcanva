import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/services/rate-limit";
import {
  getMonnifyToken,
  isMonnifyServerConfigured,
  monnifyBaseUrl,
} from "@/lib/services/monnify";

/**
 * Verifies a Monnify transaction by payment reference (server-side, bearer
 * token) and records the outcome via the service-role client.
 *
 * When `?credit=student|teacher` is passed and the charge is genuinely
 * successful, the signed-in user's wallet is credited here — with the amount
 * Monnify reports, never a client-supplied figure. Crediting is idempotent
 * per reference.
 *
 * Responds 501 when Monnify isn't configured.
 */
export async function GET(request: Request) {
  if (
    !rateLimit(clientKey(request, "verify"), { limit: 20, windowMs: 60_000 })
  ) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!isMonnifyServerConfigured()) {
    return NextResponse.json(
      { error: "Monnify is not configured." },
      { status: 501 },
    );
  }

  const params = new URL(request.url).searchParams;
  const reference = params.get("reference");
  const credit = params.get("credit");
  if (!reference) {
    return NextResponse.json(
      { error: "reference is required." },
      { status: 400 },
    );
  }
  if (credit && credit !== "student" && credit !== "teacher") {
    return NextResponse.json(
      { error: "invalid credit role." },
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

  const res = await fetch(
    `${monnifyBaseUrl}/api/v1/merchant/transactions/query?paymentReference=${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.requestSuccessful) {
    return NextResponse.json(
      { error: json?.responseMessage ?? "Could not verify payment." },
      { status: 502 },
    );
  }

  const tx = json.responseBody ?? {};
  const paid = tx.paymentStatus === "PAID" || tx.paymentStatus === "OVERPAID";
  const amountNaira = Math.round(Number(tx.amountPaid ?? 0));
  const channel =
    typeof tx.paymentMethod === "string"
      ? tx.paymentMethod.toLowerCase().replace(/_/g, "-")
      : null;
  let credited = false;

  const admin = createAdminClient();
  if (admin) {
    // Resolve the signed-in user from the request cookies (may be null when
    // verify is called without a session — we still record the payment).
    const supabase = await createClient();
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;

    // Idempotency guard: a payment row that is already `success` was credited
    // by an earlier verify call.
    const { data: existing } = await admin
      .from("payments")
      .select("id, status")
      .eq("reference", reference)
      .maybeSingle();

    const alreadySettled = existing?.status === "success";

    if (existing) {
      await admin
        .from("payments")
        .update({
          status: paid ? "success" : "failed",
          channel,
          paid_at: paid ? new Date().toISOString() : null,
        })
        .eq("reference", reference);
    } else {
      await admin.from("payments").insert({
        owner_id: user?.id ?? null,
        reference,
        amount: amountNaira,
        status: paid ? "success" : "failed",
        channel,
        purpose: credit ? `wallet-topup-${credit}` : "charge",
        metadata: {
          verifiedVia: "api",
          transactionReference: tx.transactionReference ?? null,
        },
        paid_at: paid ? new Date().toISOString() : null,
      });
    }

    // Server-side wallet credit: only for a fresh, successful, authenticated
    // top-up — the client never writes its own balance for card charges.
    if (paid && credit && user && !alreadySettled && amountNaira > 0) {
      const { data: wallet } = await admin
        .from("wallets")
        .select("id, balance")
        .eq("owner_id", user.id)
        .eq("role", credit)
        .maybeSingle();

      if (wallet) {
        await admin
          .from("wallets")
          .update({
            balance: Number(wallet.balance) + amountNaira,
            updated_at: new Date().toISOString(),
          })
          .eq("id", wallet.id);
        await admin.from("wallet_transactions").insert({
          wallet_id: wallet.id,
          title: "Wallet Top-up — Card",
          subtitle: `Verified by Monnify • Ref: ${reference}`,
          amount: amountNaira,
          direction: "in",
          status: "completed",
          reference,
        });
        credited = true;
      }
    }
  }

  return NextResponse.json({
    reference,
    status: paid ? "success" : "failed",
    amount: amountNaira,
    channel: channel ?? "card",
    paidAt: tx.paidOn ?? new Date().toISOString(),
    credited,
  });
}
