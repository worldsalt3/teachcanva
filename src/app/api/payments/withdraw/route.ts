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
 * Initiates a bank payout from the signed-in professional's wallet.
 *
 * The balance check and debit happen server-side with the service-role
 * client; the transfer itself goes through Monnify's single disbursement
 * API. When Monnify declines the transfer (common on sandbox/unfunded
 * wallets) the payout is still recorded as pending for manual processing,
 * so the ledger stays consistent.
 *
 * Responds 501 when Monnify isn't configured, 401 without a session.
 */
export async function POST(request: Request) {
  if (
    !rateLimit(clientKey(request, "withdraw"), { limit: 5, windowMs: 60_000 })
  ) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!isMonnifyServerConfigured()) {
    return NextResponse.json(
      { error: "Monnify is not configured." },
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

  // Bank details — default to Monnify's sandbox test bank so the demo flow
  // works without a bank-details form; real deployments pass these from
  // settings.
  const bankCode = String(body?.bankCode ?? "035");
  const accountNumber = String(body?.accountNumber ?? "2085886393");
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

  // Attempt the real transfer via Monnify's single disbursement API.
  let transferStatus: "sent" | "pending" = "pending";
  let note = "Queued for processing";
  try {
    const token = await getMonnifyToken();
    const sourceAccount = process.env.MONNIFY_WALLET_ACCOUNT_NUMBER;

    if (token && sourceAccount) {
      const transferRes = await fetch(
        `${monnifyBaseUrl}/api/v2/disbursements/single`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            reference,
            narration: "TeachCanvas earnings payout",
            destinationBankCode: bankCode,
            destinationAccountNumber: accountNumber,
            destinationAccountName: accountName,
            currency: "NGN",
            sourceAccountNumber: sourceAccount,
          }),
        },
      );
      const transfer = await transferRes.json().catch(() => null);
      const status = transfer?.responseBody?.status;
      if (
        transferRes.ok &&
        transfer?.requestSuccessful &&
        (status === "SUCCESS" || status === "PENDING")
      ) {
        transferStatus = "sent";
        note = "Transfer initiated";
      } else if (status === "PENDING_AUTHORIZATION") {
        note = "Awaiting transfer authorization";
      } else {
        note = transfer?.responseMessage ?? note;
      }
    } else if (!sourceAccount) {
      note = "Payout wallet not configured";
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
