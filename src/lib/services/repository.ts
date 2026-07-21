"use client";

/**
 * Supabase-backed data access for the app's core entities. Each reader returns
 * the same domain shapes the UI already uses, so the store can swap between
 * this layer and the local mock/seed path with no downstream changes.
 *
 * These functions assume Supabase is configured; the caller (the store) only
 * invokes them when `isSupabaseEnabled`. If a client can't be created they
 * return empty/no-op results rather than throwing.
 */
import { createClient } from "@/lib/supabase/client";
import type {
  CohortSession,
  DaySlots,
  Role,
  Session,
  Teacher,
  Transaction,
  WalletAccount,
} from "@/lib/mock/types";
import type { ChatMessage, Slide } from "./types";
import { toTeacher, UUID_RE, type TeacherRow } from "./teacher-mapper";

function clockFrom(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── teachers ───────────────────────────────────────────────────────────────
export async function fetchTeachers(): Promise<Teacher[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .order("rating", { ascending: false });
  if (error || !data) return [];
  return (data as TeacherRow[]).map(toTeacher);
}

/** The signed-in professional's own catalog listing (null if none/anon). */
export async function fetchMyTeacherListing(): Promise<Teacher | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return toTeacher(data as TeacherRow);
}

/** Persists the professional's weekly availability to their listing. */
export async function updateMyAvailability(
  availability: DaySlots[],
  nextSlotLabel: string | null,
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("teachers")
    .update({ availability, next_slot_label: nextSlotLabel })
    .eq("profile_id", user.id);
  return !error;
}

/**
 * Saves an uploaded profile-picture URL on the user's profile and, for
 * professionals, mirrors it onto their public teachers listing (profiles are
 * own-read-only, so learner-facing cards read the photo from teachers).
 */
export async function saveAvatarUrl(url: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);
  // Best-effort mirror — no-op when the user has no listing.
  await supabase
    .from("teachers")
    .update({ avatar_url: url })
    .eq("profile_id", user.id);
  return !error;
}

// ─── bookings ────────────────────────────────────────────────────────────────
interface BookingRow {
  id: string;
  counterpart_name: string;
  student_name?: string | null;
  subject: string;
  topic: string;
  date_label: string;
  time_label: string;
  duration_mins: number;
  status: Session["status"];
  countdown: string | null;
  replay: boolean;
  rating: number | string | null;
  amount?: number | null;
}

function toSession(r: BookingRow): Session {
  return {
    id: r.id,
    counterpartName: r.counterpart_name,
    subject: r.subject,
    topic: r.topic,
    dateLabel: r.date_label,
    timeLabel: r.time_label,
    durationMins: r.duration_mins,
    status: r.status,
    countdown: r.countdown ?? undefined,
    replay: r.replay,
    rating: r.rating == null ? undefined : Number(r.rating),
    amount: r.amount ? Number(r.amount) : undefined,
  };
}

export async function fetchBookings(): Promise<Session[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("student_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as BookingRow[]).map(toSession);
}

/**
 * Sessions booked *with* the signed-in professional (teacher side of the
 * ledger). The counterpart shown is the learner, so `student_name` replaces
 * `counterpart_name` in the mapped Session.
 */
export async function fetchTeacherBookings(): Promise<Session[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: listing } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!listing) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("teacher_id", listing.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as BookingRow[]).map((r) => ({
    ...toSession(r),
    counterpartName: r.student_name || "Learner",
  }));
}

export interface NewBooking {
  teacherId: string | null;
  counterpartName: string;
  studentName?: string;
  subject: string;
  topic: string;
  dateLabel: string;
  timeLabel: string;
  durationMins: number;
  /** Naira held in escrow until the session completes. */
  amount?: number;
}

export async function insertBooking(b: NewBooking): Promise<Session | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      student_id: user.id,
      teacher_id: b.teacherId,
      counterpart_name: b.counterpartName,
      student_name: b.studentName ?? "",
      subject: b.subject,
      topic: b.topic,
      date_label: b.dateLabel,
      time_label: b.timeLabel,
      duration_mins: b.durationMins,
      status: "upcoming",
      amount: Math.round(b.amount ?? 0),
      escrow_status: b.amount ? "held" : "none",
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return toSession(data as BookingRow);
}

/** Updates a booking's lifecycle status (owner-side RLS applies). */
export async function updateBookingStatus(
  id: string,
  status: Session["status"],
  escrowStatus?: "none" | "held" | "released" | "refunded",
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;
  const patch: Record<string, unknown> = { status };
  if (escrowStatus) patch.escrow_status = escrowStatus;
  const { error } = await supabase.from("bookings").update(patch).eq("id", id);
  return !error;
}

/**
 * Streams booking changes addressed to the given professional listing so the
 * schedule refreshes without a reload. Inserts include the mapped session
 * (for a "new booking" notification); updates just signal a refetch.
 * Returns an unsubscribe fn.
 */
export function subscribeTeacherBookings(
  listingId: string,
  onChange: (kind: "insert" | "update", session?: Session) => void,
): () => void {
  const supabase = createClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`bookings:${listingId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "bookings",
        filter: `teacher_id=eq.${listingId}`,
      },
      (payload: { new: BookingRow }) => {
        const r = payload.new;
        onChange("insert", {
          ...toSession(r),
          counterpartName: r.student_name || "Learner",
        });
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "bookings",
        filter: `teacher_id=eq.${listingId}`,
      },
      () => onChange("update"),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── slides ──────────────────────────────────────────────────────────────────
interface SlideRow {
  id: string;
  session_id: string;
  kind: Slide["kind"];
  title: string;
  body: string;
  src: string | null;
}

function toSlide(r: SlideRow): Slide {
  return {
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body,
    src: r.src ?? undefined,
  };
}

/** All slides owned by the current user, grouped by session id. */
export async function fetchOwnedSlides(): Promise<Record<string, Slide[]>> {
  const supabase = createClient();
  if (!supabase) return {};
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("slides")
    .select("id, session_id, kind, title, body, src, position")
    .eq("owner_id", user.id)
    .order("position", { ascending: true });
  if (error || !data) return {};

  const grouped: Record<string, Slide[]> = {};
  for (const row of data as (SlideRow & { position: number })[]) {
    (grouped[row.session_id] ??= []).push(toSlide(row));
  }
  return grouped;
}

export async function fetchSlides(sessionId: string): Promise<Slide[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("slides")
    .select("id, session_id, kind, title, body, src, position")
    .eq("session_id", sessionId)
    .order("position", { ascending: true });
  if (error || !data) return [];
  return (data as SlideRow[]).map(toSlide);
}

/** Replaces the current user's slides for a session with the given list. */
export async function replaceSlides(
  sessionId: string,
  slides: Slide[],
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("slides")
    .delete()
    .eq("owner_id", user.id)
    .eq("session_id", sessionId);

  if (slides.length === 0) return;

  await supabase.from("slides").insert(
    slides.map((s, position) => ({
      session_id: sessionId,
      owner_id: user.id,
      position,
      kind: s.kind,
      title: s.title,
      body: s.body,
      src: s.src ?? null,
    })),
  );
}

// ─── chat ────────────────────────────────────────────────────────────────────
interface ChatRow {
  id: string;
  author_id: string;
  author_name: string;
  text: string;
  created_at: string;
}

export async function fetchChat(sessionId: string): Promise<ChatMessage[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, author_id, author_name, text, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];

  return (data as ChatRow[]).map((r) => ({
    id: r.id,
    author: r.author_name,
    self: r.author_id === user?.id,
    text: r.text,
    time: clockFrom(r.created_at),
  }));
}

export async function insertChatMessage(
  sessionId: string,
  authorName: string,
  text: string,
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    author_id: user.id,
    author_name: authorName,
    text,
  });
}

/** Subscribes to new chat messages for a session. Returns an unsubscribe fn. */
export function subscribeChat(
  sessionId: string,
  onMessage: (message: ChatMessage) => void,
): () => void {
  const supabase = createClient();
  if (!supabase) return () => {};

  let selfId: string | undefined;
  void (async () => {
    const { data } = await supabase.auth.getUser();
    selfId = data.user?.id;
  })();

  const channel = supabase
    .channel(`chat:${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `session_id=eq.${sessionId}`,
      },
      (payload: { new: ChatRow }) => {
        const r = payload.new;
        onMessage({
          id: r.id,
          author: r.author_name,
          self: r.author_id === selfId,
          text: r.text,
          time: clockFrom(r.created_at),
        });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── live board sync (realtime broadcast) ────────────────────────────────────

/** Drawing events broadcast between live-session participants. */
export type BoardEvent =
  | { type: "begin" }
  | {
      type: "seg";
      /** Normalized 0..1 coordinates so canvases of any size stay in sync. */
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      color: string;
      erase: boolean;
    }
  | { type: "undo" }
  | { type: "clear" };

/**
 * Joins the realtime broadcast channel for a session's canvas. Own messages
 * are not echoed back (`self: false`). Returns a no-op pair when Supabase is
 * off so the board works standalone.
 */
export function connectBoard(
  sessionId: string,
  onEvents: (events: BoardEvent[], sentAt?: number) => void,
): { send: (events: BoardEvent[]) => void; disconnect: () => void } {
  const supabase = createClient();
  if (!supabase) return { send: () => {}, disconnect: () => {} };

  const channel = supabase.channel(`board:${sessionId}`, {
    config: { broadcast: { self: false } },
  });
  channel
    .on("broadcast", { event: "draw" }, (message: Record<string, unknown>) => {
      const payload = (
        message as { payload?: { events?: BoardEvent[]; sentAt?: number } }
      ).payload;
      const events = payload?.events;
      if (Array.isArray(events) && events.length)
        onEvents(events, payload?.sentAt);
    })
    .subscribe();

  return {
    send: (events) => {
      if (!events.length) return;
      void channel.send({
        type: "broadcast",
        event: "draw",
        payload: { events, sentAt: Date.now() },
      });
    },
    disconnect: () => {
      void supabase.removeChannel(channel);
    },
  };
}

// ─── wallet ──────────────────────────────────────────────────────────────────
interface WalletRow {
  id: string;
  balance: number;
  pending_payouts: number;
  lifetime_earnings: number;
  tp_balance: number;
  referral_code: string;
  referral_reward: number;
}

interface TxRow {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  direction: Transaction["direction"];
  status: Transaction["status"];
}

export async function fetchWallet(role: Role): Promise<WalletAccount | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("owner_id", user.id)
    .eq("role", role)
    .single();
  if (!wallet) return null;

  const w = wallet as WalletRow;
  const { data: txs } = await supabase
    .from("wallet_transactions")
    .select("id, title, subtitle, amount, direction, status")
    .eq("wallet_id", w.id)
    .order("created_at", { ascending: false });

  return {
    balance: Number(w.balance),
    pendingPayouts: Number(w.pending_payouts),
    pendingClearsIn: "3–5 business days",
    lifetimeEarnings: Number(w.lifetime_earnings),
    tpBalance: Number(w.tp_balance),
    referralCode: w.referral_code,
    referralReward: w.referral_reward,
    transactions: ((txs as TxRow[]) ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      subtitle: t.subtitle,
      amount: Number(t.amount),
      direction: t.direction,
      status: t.status,
    })),
  };
}

/**
 * Applies a wallet mutation via the atomic `wallet_apply` Postgres function
 * (security definer: row-locks the wallet, checks funds, records the tx).
 * Fire-and-forget from the store; no-ops when Supabase is off.
 */
export async function applyWalletTransaction(
  role: Role,
  tx: {
    title: string;
    subtitle: string;
    amount: number;
    direction: Transaction["direction"];
    status: Transaction["status"];
    reference?: string;
  },
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  const { error } = await supabase.rpc("wallet_apply", {
    p_role: role,
    p_title: tx.title,
    p_subtitle: tx.subtitle,
    p_amount: Math.round(tx.amount),
    p_direction: tx.direction,
    p_status: tx.status,
    p_reference: tx.reference ?? null,
  });
  if (error) console.warn("wallet_apply failed:", error.message);
}

// ─── cohorts ─────────────────────────────────────────────────────────────────
interface CohortRow {
  id: string;
  owner_id: string | null;
  professional_name: string;
  title: string;
  topic: string;
  tag: string;
  date_label: string;
  time_label: string;
  duration_mins: number;
  seat_limit: number;
  price_per_seat: number;
  status: CohortSession["status"];
  series_name: string | null;
  series_part: number | null;
  series_of: number | null;
}

export async function fetchCohortSessions(): Promise<CohortSession[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const [{ data: rows, error }, { data: seats }] = await Promise.all([
    supabase
      .from("cohort_sessions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("cohort_seats").select("cohort_id, seats_taken"),
  ]);
  if (error || !rows) return [];

  const seatMap = new Map(
    ((seats as { cohort_id: string; seats_taken: number }[]) ?? []).map((s) => [
      s.cohort_id,
      s.seats_taken,
    ]),
  );

  return (rows as CohortRow[]).map((r) => ({
    id: r.id,
    professionalId: r.owner_id ?? "",
    professionalName: r.professional_name || "Professional",
    title: r.title,
    topic: r.topic,
    tag: r.tag,
    dateLabel: r.date_label,
    timeLabel: r.time_label,
    durationMins: r.duration_mins,
    seatLimit: r.seat_limit,
    seatsTaken: seatMap.get(r.id) ?? 0,
    pricePerSeat: r.price_per_seat,
    status: r.status,
    series:
      r.series_name && r.series_part && r.series_of
        ? { name: r.series_name, part: r.series_part, of: r.series_of }
        : undefined,
  }));
}

/**
 * Persists a cohort the current professional scheduled (owner = user).
 * Returns the DB-generated id so local state can reconcile.
 */
export async function insertCohortSession(
  c: CohortSession,
): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("cohort_sessions")
    .insert({
      owner_id: user.id,
      professional_name: c.professionalName,
      title: c.title,
      topic: c.topic,
      tag: c.tag,
      date_label: c.dateLabel,
      time_label: c.timeLabel,
      duration_mins: c.durationMins,
      seat_limit: c.seatLimit,
      price_per_seat: c.pricePerSeat,
      status: c.status,
    })
    .select("id")
    .single();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

/** Updates a cohort's status (RLS restricts writes to the owner). */
export async function setCohortStatus(
  cohortId: string,
  status: CohortSession["status"],
): Promise<void> {
  const supabase = createClient();
  if (!supabase || !UUID_RE.test(cohortId)) return;
  await supabase.from("cohort_sessions").update({ status }).eq("id", cohortId);
}

/** The current member's enrolments, keyed by cohort id. */
export async function fetchCohortEnrolments(): Promise<
  Record<string, "enrolled" | "waitlisted">
> {
  const supabase = createClient();
  if (!supabase) return {};
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("cohort_enrolments")
    .select("cohort_id, status")
    .eq("member_id", user.id)
    .in("status", ["enrolled", "waitlisted"]);
  if (error || !data) return {};

  const map: Record<string, "enrolled" | "waitlisted"> = {};
  for (const row of data as {
    cohort_id: string;
    status: "enrolled" | "waitlisted";
  }[]) {
    map[row.cohort_id] = row.status;
  }
  return map;
}

/**
 * Records an enrolment/waitlist for the current member. Local seed cohorts
 * use non-uuid ids that don't exist remotely, so those are skipped.
 */
export async function upsertCohortEnrolment(
  cohortId: string,
  status: "enrolled" | "waitlisted",
  amountPaid: number,
): Promise<void> {
  const supabase = createClient();
  if (!supabase || !UUID_RE.test(cohortId)) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("cohort_enrolments").upsert(
    {
      cohort_id: cohortId,
      member_id: user.id,
      status,
      amount_paid: amountPaid,
      escrow_status: status === "enrolled" ? "held" : "none",
    },
    { onConflict: "cohort_id,member_id" },
  );
}
