import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/services/rate-limit";

/**
 * Marks a 1:1 booking as completed and releases its escrow to the
 * professional's wallet (balance + lifetime earnings + ledger entry).
 *
 * Callable by either party of the booking (the learner who owns it or the
 * professional it is addressed to). Idempotent: a booking that is already
 * `completed` (or has its escrow released) is skipped.
 *
 * Responds 501 when the backend isn't configured, 401 without a session.
 */
export async function POST(request: Request) {
  if (
    !rateLimit(clientKey(request, "complete"), { limit: 10, windowMs: 60_000 })
  ) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
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
  const bookingId = String(body?.bookingId ?? "").trim();
  if (!bookingId) {
    return NextResponse.json(
      { error: "bookingId is required." },
      { status: 400 },
    );
  }

  const { data: booking } = await admin
    .from("bookings")
    .select("id, student_id, teacher_id, status, escrow_status, amount, topic")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  // Caller must be a party to the booking.
  let isParty = booking.student_id === user.id;
  let teacherProfileId: string | null = null;
  if (booking.teacher_id) {
    const { data: listing } = await admin
      .from("teachers")
      .select("profile_id")
      .eq("id", booking.teacher_id)
      .maybeSingle();
    teacherProfileId = listing?.profile_id ?? null;
    isParty ||= teacherProfileId === user.id;
  }
  if (!isParty) {
    return NextResponse.json({ error: "Not your session." }, { status: 403 });
  }

  // Idempotency: only an upcoming/live booking transitions to completed.
  if (booking.status === "completed" || booking.status === "cancelled") {
    return NextResponse.json({
      bookingId,
      status: booking.status,
      released: 0,
    });
  }

  const amount = Number(booking.amount ?? 0);
  const shouldRelease = booking.escrow_status === "held" && amount > 0;

  await admin
    .from("bookings")
    .update({
      status: "completed",
      escrow_status: shouldRelease ? "released" : booking.escrow_status,
      replay: true,
    })
    .eq("id", bookingId);

  // Release escrow to the professional's wallet.
  let released = 0;
  if (shouldRelease && teacherProfileId) {
    const { data: wallet } = await admin
      .from("wallets")
      .select("id, balance, lifetime_earnings")
      .eq("owner_id", teacherProfileId)
      .eq("role", "teacher")
      .maybeSingle();
    if (wallet) {
      await admin
        .from("wallets")
        .update({
          balance: Number(wallet.balance) + amount,
          lifetime_earnings: Number(wallet.lifetime_earnings) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);
      await admin.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        title: `Session earnings — ${booking.topic || "Live session"}`,
        subtitle: "Escrow released on completion",
        amount,
        direction: "in",
        status: "completed",
        reference: `ESCROW-${bookingId}`,
      });
      released = amount;
    }
  }

  return NextResponse.json({ bookingId, status: "completed", released });
}
