import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/services/rate-limit";

/**
 * Initiates a bank payout from the signed-in professional's wallet.
 *
 * The balance check and debit happen server-side with the service-role
 * client; the transfer itself goes through Paystack (recipient + transfer).
 * When Paystack declines the transfer (common on test/starter accounts) the
 * payout is still recorded as pending for manual processing, so the ledger
 * stays consistent.
 *
 * Responds 501 when Paystack isn't configured, 401 without a session.
 */
export async function POST(request: Request) {
  if (
    !rateLimit(clientKey(request, "withdraw"), { limit: 5, windowMs: 60_000 })
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

  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    return NextResponse.json(
      { error: "Backend is not configured." },
      { status: 501 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const amount = Math.round(Number(body?.amount));
  const reference = String(body?.reference ?? "").trim();
  if (!amount || amount <= 0 || !reference) {
    return NextResponse.json(
      { error: "amount and reference are required." },
      { status: 400 },
    );
  }

  // Bank details — default to Paystack's test bank so the demo flow works
  // without a bank-details form; real deployments pass these from settings.
  const bankCode = String(body?.bankCode ?? "057");
  const accountNumber = String(body?.accountNumber ?? "0000000000");
  const accountName = String(body?.accountName ?? "TeachCanvas Professional");

  // Server-side balance check + debit target.
  const { data: wallet } = await admin
    .from("wallets")
    .select("id, balance")
    .eq("owner_id", user.id)
    .eq("role", "teacher")
    .maybeSingle();
  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
  }
  if (Number(wallet.balance) < amount) {
    return NextResponse.json(
      { error: "Insufficient balance." },
      { status: 400 },
    );
  }

  // Attempt the real transfer via Paystack.
  let transferStatus: "sent" | "pending" = "pending";
  let note = "Queued for processing";
  try {
    const recipientRes = await fetch(
      "https://api.paystack.co/transferrecipient",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "nuban",
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "NGN",
        }),
      },
    );
    const recipient = await recipientRes.json();
    const recipientCode = recipient?.data?.recipient_code;

    if (recipientRes.ok && recipientCode) {
      const transferRes = await fetch("https://api.paystack.co/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "balance",
          amount: amount * 100, // kobo
          recipient: recipientCode,
          reference,
          reason: "TeachCanvas earnings payout",
        }),
      });
      const transfer = await transferRes.json();
      if (transferRes.ok && transfer?.status) {
        transferStatus = "sent";
        note = "Transfer initiated";
      } else {
        note = transfer?.message ?? note;
      }
    } else {
      note = recipient?.message ?? note;
    }
  } catch {
    // Network failure — fall through to the pending/manual path.
  }

  // Debit the wallet and record the payout (sent or pending-manual).
  await admin
    .from("wallets")
    .update({
      balance: Number(wallet.balance) - amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wallet.id);
  await admin.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    title: "Bank Withdrawal",
    subtitle: `${note} • Ref: ${reference}`,
    amount,
    direction: "out",
    status: transferStatus,
    reference,
  });

  return NextResponse.json({
    reference,
    status: transferStatus,
    amount,
    message: note,
  });
}
