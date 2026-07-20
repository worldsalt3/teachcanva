import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/services/rate-limit";

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

/** Credits a professional's teacher wallet (balance + lifetime + ledger). */
async function creditTeacherWallet(
  admin: Admin,
  profileId: string,
  amount: number,
  title: string,
  reference: string,
): Promise<number> {
  const { data: wallet } = await admin
    .from("wallets")
    .select("id, balance, lifetime_earnings")
    .eq("owner_id", profileId)
    .eq("role", "teacher")
    .maybeSingle();
  if (!wallet) return 0;
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
    title,
    subtitle: "Escrow released on completion",
    amount,
    direction: "in",
    status: "completed",
    reference,
  });
  return amount;
}

/**
 * Settles a cohort session: only the owner ending it flips the status to
 * `ended`, releases every held enrolment escrow, and credits the total to
 * the professional's wallet. Learners hitting this route are a no-op.
 * Idempotent: an already-ended cohort releases nothing.
 */
async function completeCohort(
  admin: Admin,
  userId: string,
  cohortId: string,
): Promise<NextResponse> {
  const { data: cohort } = await admin
    .from("cohort_sessions")
    .select("id, owner_id, title, status")
    .eq("id", cohortId)
    .maybeSingle();
  if (!cohort) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (cohort.owner_id !== userId || cohort.status === "ended") {
    return NextResponse.json({
      bookingId: cohortId,
      status: cohort.status,
      released: 0,
    });
  }

  const { data: enrolments } = await admin
    .from("cohort_enrolments")
    .select("amount_paid")
    .eq("cohort_id", cohortId)
    .eq("status", "enrolled")
    .eq("escrow_status", "held");
  const total = (enrolments ?? []).reduce(
    (sum, e) => sum + Number(e.amount_paid ?? 0),
    0,
  );

  await admin
    .from("cohort_sessions")
    .update({ status: "ended" })
    .eq("id", cohortId);
  if (enrolments?.length) {
    await admin
      .from("cohort_enrolments")
      .update({ escrow_status: "released" })
      .eq("cohort_id", cohortId)
      .eq("status", "enrolled")
      .eq("escrow_status", "held");
  }

  let released = 0;
  if (total > 0) {
    released = await creditTeacherWallet(
      admin,
      cohort.owner_id,
      total,
      `Cohort earnings — ${cohort.title || "Live session"}`,
      `COHORT-${cohortId}`,
    );
  }
  return NextResponse.json({ bookingId: cohortId, status: "ended", released });
}

/**
 * Marks a 1:1 booking as completed and releases its escrow to the
 * professional's wallet (balance + lifetime earnings + ledger entry).
 * Ids that match a cohort session instead settle the cohort (owner only).
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
    // Not a 1:1 booking — cohort live sessions settle here too.
    return completeCohort(admin, user.id, bookingId);
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
    released = await creditTeacherWallet(
      admin,
      teacherProfileId,
      amount,
      `Session earnings — ${booking.topic || "Live session"}`,
      `ESCROW-${bookingId}`,
    );
  }

  return NextResponse.json({ bookingId, status: "completed", released });
}
