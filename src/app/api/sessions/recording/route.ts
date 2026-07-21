import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clientKey, rateLimit } from "@/lib/services/rate-limit";

/**
 * Returns a short-lived signed URL for a session's voice recording
 * (`recordings/{sessionId}/voice`, uploaded by the professional when the
 * live session ends).
 *
 * The bucket is private, so access is gated here: the caller must be a
 * party to the session — the booking's learner or professional, or the
 * cohort's owner or an enrolled member. 404 when the session or its
 * recording doesn't exist (no leaking which ids are real).
 */
export async function GET(request: Request) {
  if (
    !rateLimit(clientKey(request, "recording"), { limit: 30, windowMs: 60_000 })
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

  const sessionId = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  if (!sessionId) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  // Caller must be a party to the session (1:1 booking or cohort).
  let allowed = false;
  const { data: booking } = await admin
    .from("bookings")
    .select("student_id, teacher_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (booking) {
    allowed = booking.student_id === user.id;
    if (!allowed && booking.teacher_id) {
      const { data: listing } = await admin
        .from("teachers")
        .select("profile_id")
        .eq("id", booking.teacher_id)
        .maybeSingle();
      allowed = listing?.profile_id === user.id;
    }
  } else {
    const { data: cohort } = await admin
      .from("cohort_sessions")
      .select("owner_id")
      .eq("id", sessionId)
      .maybeSingle();
    if (cohort) {
      allowed = cohort.owner_id === user.id;
      if (!allowed) {
        const { data: enrolment } = await admin
          .from("cohort_enrolments")
          .select("id")
          .eq("cohort_id", sessionId)
          .eq("member_id", user.id)
          .maybeSingle();
        allowed = Boolean(enrolment);
      }
    }
  }
  if (!allowed) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data, error } = await admin.storage
    .from("recordings")
    .createSignedUrl(`${sessionId}/voice`, 3600);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
