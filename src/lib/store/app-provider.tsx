"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  currentStudent,
  currentTeacher,
  studentUpcoming,
  studentWallet as seedStudentWallet,
  teacherWallet as seedTeacherWallet,
  cohortSessions as seedCohorts,
  teachers as seedTeachers,
  getTeacher,
} from "@/lib/mock";
import type {
  CohortSession,
  Role,
  Session,
  Teacher,
  Transaction,
  WalletAccount,
} from "@/lib/mock/types";
import type {
  AppNotification,
  BookingDraft,
  ChatMessage,
  CohortDraft,
  EnrolResult,
  Slide,
} from "@/lib/services/types";
import { isPaystackEnabled, isSupabaseEnabled } from "@/lib/services/config";
import { getSessionUser, signOutBackend } from "@/lib/services/auth";
import {
  applyWalletTransaction,
  fetchBookings,
  fetchCohortEnrolments,
  fetchCohortSessions,
  fetchOwnedSlides,
  fetchTeachers,
  fetchWallet,
  insertBooking,
  insertChatMessage,
  insertCohortSession,
  replaceSlides,
  setCohortStatus,
  upsertCohortEnrolment,
} from "@/lib/services/repository";
import { UUID_RE } from "@/lib/services/teacher-mapper";

const STORAGE_KEY = "teachcanvas:v1";

const seedNotifications: AppNotification[] = [
  {
    id: "n-1",
    title: "Session starting soon",
    body: "Economics 101 with Prof. Amina begins in 1 hour.",
    time: "1h",
    kind: "session",
    read: false,
    href: "/home",
  },
  {
    id: "n-2",
    title: "You earned 50 LP",
    body: "Quality bonus from your Advanced Calculus session.",
    time: "3h",
    kind: "tp",
    read: false,
    href: "/wallet",
  },
  {
    id: "n-3",
    title: "Top-up successful",
    body: "Your wallet was credited with ₦20,000.",
    time: "Yesterday",
    kind: "payment",
    read: true,
    href: "/wallet",
  },
  {
    id: "n-4",
    title: "Welcome to TeachCanvas",
    body: "Find a professional and join your first live session.",
    time: "2d",
    kind: "system",
    read: true,
    href: "/explore",
  },
];

interface PersistShape {
  authenticated: boolean;
  userId: string | null;
  profileName: string | null;
  role: Role;
  teachers: Teacher[];
  studentWallet: WalletAccount;
  teacherWallet: WalletAccount;
  studentBookings: Session[];
  cohorts: CohortSession[];
  cohortEnrolments: Record<string, "enrolled" | "waitlisted">;
  notifications: AppNotification[];
  chat: Record<string, ChatMessage[]>;
  slides: Record<string, Slide[]>;
}

function emptyWallet(): WalletAccount {
  return {
    balance: 0,
    pendingPayouts: 0,
    pendingClearsIn: "3–5 business days",
    lifetimeEarnings: 0,
    tpBalance: 0,
    referralCode: "",
    referralReward: 500,
    transactions: [],
  };
}

function initialState(): PersistShape {
  if (isSupabaseEnabled) {
    // Real backend: start blank and gated — everything hydrates from
    // Supabase after sign-in. No seeded data.
    return {
      authenticated: false,
      userId: null,
      profileName: null,
      role: "student",
      teachers: [],
      studentWallet: emptyWallet(),
      teacherWallet: emptyWallet(),
      studentBookings: [],
      cohorts: [],
      cohortEnrolments: {},
      notifications: [],
      chat: {},
      slides: {},
    };
  }
  return {
    // Stub preview (no backend configured): seeded as authenticated so the
    // app is instantly explorable; logging out gates behind the login flow.
    authenticated: true,
    userId: null,
    profileName: null,
    role: "student",
    teachers: structuredClone(seedTeachers),
    studentWallet: structuredClone(seedStudentWallet),
    teacherWallet: structuredClone(seedTeacherWallet),
    studentBookings: structuredClone(studentUpcoming),
    cohorts: structuredClone(seedCohorts),
    cohortEnrolments: {},
    notifications: structuredClone(seedNotifications),
    chat: {},
    slides: {},
  };
}

interface AppContextValue extends PersistShape {
  hydrated: boolean;
  studentName: string;
  unreadCount: number;
  // auth
  signIn: () => void;
  signOut: () => void;
  setProfileName: (name: string) => void;
  setRole: (role: Role) => void;
  // bookings + wallet
  createBooking: (draft: BookingDraft) => Session;
  cancelBooking: (id: string) => void;
  topUpWallet: (role: Role, amount: number, reference: string) => void;
  withdrawWallet: (role: Role, amount: number, reference: string) => void;
  // cohorts
  enrolInCohort: (id: string) => EnrolResult;
  createCohortSession: (draft: CohortDraft) => CohortSession;
  startCohort: (id: string) => void;
  notifyGoLive: (topic: string, sessionId?: string) => void;
  // notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // chat
  sendChatMessage: (sessionId: string, text: string) => void;
  receiveChatMessage: (sessionId: string, message: ChatMessage) => void;
  replaceChatThread: (sessionId: string, messages: ChatMessage[]) => void;
  // class preparation
  saveSlides: (sessionId: string, slides: Slide[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function ledgerDate(): string {
  return new Date().toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function clock(): string {
  return new Date().toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<PersistShape>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Loads everything from the backend for the current session. Used on mount
  // and again right after sign-in/sign-up so fresh sessions get their data.
  const loadBackend = useCallback(async (): Promise<boolean> => {
    const user = await getSessionUser();
    if (!user) return false;
    const [
      bookings,
      slides,
      studentW,
      teacherW,
      teachers,
      cohorts,
      enrolments,
    ] = await Promise.all([
      fetchBookings(),
      fetchOwnedSlides(),
      fetchWallet("student"),
      fetchWallet("teacher"),
      fetchTeachers(),
      fetchCohortSessions(),
      fetchCohortEnrolments(),
    ]);
    setState((s) => ({
      ...s,
      authenticated: true,
      userId: user.id,
      profileName: user.name ?? s.profileName,
      role: user.role,
      studentBookings: bookings,
      slides,
      studentWallet: studentW ?? emptyWallet(),
      teacherWallet: teacherW ?? emptyWallet(),
      teachers,
      cohorts,
      cohortEnrolments: enrolments,
    }));
    return true;
  }, []);

  // Load persisted state after mount to keep SSR output deterministic. With
  // Supabase configured we hydrate from the backend (auth gates the shells);
  // otherwise we fall back to the local-only persisted snapshot.
  useEffect(() => {
    if (isSupabaseEnabled) {
      let cancelled = false;
      void (async () => {
        const ok = await loadBackend();
        if (cancelled) return;
        if (!ok) {
          // Backend on but no session → gate behind the login flow.
          setState((s) => ({ ...s, authenticated: false }));
        }
        setHydrated(true);
      })();
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<PersistShape>;
          setState((s) => ({ ...s, ...saved }));
        }
      } catch {
        // ignore corrupt storage
      }
      setHydrated(true);
    });
  }, [loadBackend]);

  // Persist on every change once hydrated. Skipped when Supabase is the source
  // of truth so we never serve a stale local snapshot over backend data.
  useEffect(() => {
    if (!hydrated || isSupabaseEnabled) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota / private-mode errors
    }
  }, [state, hydrated]);

  const signIn = useCallback(() => {
    setState((s) => ({ ...s, authenticated: true }));
    // Fresh session → pull the user's real data (profile, wallets, bookings).
    if (isSupabaseEnabled) void loadBackend();
  }, [loadBackend]);

  const signOut = useCallback(() => {
    if (isSupabaseEnabled) {
      void signOutBackend();
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(() => ({ ...initialState(), authenticated: false }));
    router.replace("/");
  }, [router]);

  const setProfileName = useCallback((name: string) => {
    setState((s) => ({ ...s, profileName: name.trim() || null }));
  }, []);

  const setRole = useCallback((role: Role) => {
    setState((s) => ({ ...s, role }));
  }, []);

  const createBooking = useCallback((draft: BookingDraft): Session => {
    let booking!: Session;

    setState((s) => {
      const teacher =
        s.teachers.find((t) => t.id === draft.teacherId) ??
        (isSupabaseEnabled ? undefined : getTeacher(draft.teacherId));
      booking = {
        id: `bk-${Date.now()}`,
        counterpartName: teacher?.name ?? "Professional",
        subject: teacher?.subjects[0] ?? "Session",
        topic: draft.topic.trim() || teacher?.title || "Live session",
        dateLabel: draft.dateLabel,
        timeLabel: draft.time,
        durationMins: teacher?.sessionLengthMins ?? 60,
        status: "upcoming",
        amount: draft.amount,
      };

      const next: PersistShape = {
        ...s,
        studentBookings: [booking, ...s.studentBookings],
      };

      if (draft.payWith === "wallet") {
        // Funds are held in escrow until the session completes (FR-W02).
        const tx: Transaction = {
          id: `t-${Date.now()}`,
          title: `${booking.subject}: ${booking.topic}`,
          subtitle: `${booking.counterpartName} • Held in escrow until session ends`,
          amount: draft.amount,
          direction: "out",
          status: "pending",
        };
        next.studentWallet = {
          ...s.studentWallet,
          balance: Math.max(0, s.studentWallet.balance - draft.amount),
          transactions: [tx, ...s.studentWallet.transactions],
        };
      }

      const note: AppNotification = {
        id: `n-${Date.now()}`,
        title: "Session booked",
        body: `${booking.topic} with ${booking.counterpartName} is confirmed.`,
        time: "Just now",
        kind: "session",
        read: false,
        href: "/home",
      };
      next.notifications = [note, ...s.notifications];
      return next;
    });

    if (isSupabaseEnabled) {
      void insertBooking({
        teacherId: UUID_RE.test(draft.teacherId) ? draft.teacherId : null,
        counterpartName: booking.counterpartName,
        subject: booking.subject,
        topic: booking.topic,
        dateLabel: booking.dateLabel,
        timeLabel: booking.timeLabel,
        durationMins: booking.durationMins,
      });
      if (draft.payWith === "wallet") {
        void applyWalletTransaction("student", {
          title: `${booking.subject}: ${booking.topic}`,
          subtitle: `${booking.counterpartName} • Held in escrow until session ends`,
          amount: draft.amount,
          direction: "out",
          status: "pending",
        });
      }
    }

    return booking;
  }, []);

  /**
   * Cancel an upcoming booking (allowed up to 2 hrs before start, FR-S07).
   * Any escrowed amount is refunded to the learner's wallet automatically.
   */
  const cancelBooking = useCallback((id: string) => {
    let refunded = 0;
    let cancelledTopic = "";
    setState((s) => {
      const booking = s.studentBookings.find((b) => b.id === id);
      if (!booking || booking.status !== "upcoming") return s;
      refunded = booking.amount ?? 0;
      cancelledTopic = booking.topic;

      const next: PersistShape = {
        ...s,
        studentBookings: s.studentBookings.filter((b) => b.id !== id),
      };

      if (booking.amount) {
        const tx: Transaction = {
          id: `t-${Date.now()}`,
          title: `Refund — ${booking.topic}`,
          subtitle: `Cancelled • ${ledgerDate()}`,
          amount: booking.amount,
          direction: "in",
          status: "completed",
        };
        next.studentWallet = {
          ...s.studentWallet,
          balance: s.studentWallet.balance + booking.amount,
          transactions: [tx, ...s.studentWallet.transactions],
        };
      }

      const note: AppNotification = {
        id: `n-${Date.now()}`,
        title: "Session cancelled",
        body: booking.amount
          ? `${booking.topic} was cancelled. ₦${booking.amount.toLocaleString("en-NG")} refunded to your wallet.`
          : `${booking.topic} was cancelled.`,
        time: "Just now",
        kind: "session",
        read: false,
        href: "/wallet",
      };
      next.notifications = [note, ...s.notifications];
      return next;
    });

    if (isSupabaseEnabled && refunded > 0) {
      void applyWalletTransaction("student", {
        title: `Refund — ${cancelledTopic}`,
        subtitle: `Cancelled • ${ledgerDate()}`,
        amount: refunded,
        direction: "in",
        status: "completed",
      });
    }
  }, []);

  /**
   * Enrol in a cohort live session (FR-S02). Charges the per-seat fee from
   * the wallet and holds it in escrow; joins the waitlist when seats are full.
   */
  const enrolInCohort = useCallback((id: string): EnrolResult => {
    // Widened so TS doesn't narrow to the literal (assigned inside setState).
    let result = "enrolled" as EnrolResult;
    let paid = 0;
    let enrolledTitle = "";
    let enrolledHost = "";
    setState((s) => {
      const cohort = s.cohorts.find((c) => c.id === id);
      if (!cohort || s.cohortEnrolments[id]) return s;
      enrolledTitle = cohort.title;
      enrolledHost = cohort.professionalName;

      if (cohort.seatsTaken >= cohort.seatLimit) {
        result = "waitlisted";
        const note: AppNotification = {
          id: `n-${Date.now()}`,
          title: "Added to waitlist",
          body: `You're on the waitlist for ${cohort.title}. We'll notify you when a seat opens.`,
          time: "Just now",
          kind: "session",
          read: false,
          href: "/cohorts",
        };
        return {
          ...s,
          cohortEnrolments: { ...s.cohortEnrolments, [id]: "waitlisted" },
          notifications: [note, ...s.notifications],
        };
      }

      if (s.studentWallet.balance < cohort.pricePerSeat) {
        result = "insufficient";
        return s;
      }
      paid = cohort.pricePerSeat;

      const tx: Transaction = {
        id: `t-${Date.now()}`,
        title: `Cohort seat — ${cohort.title}`,
        subtitle: `${cohort.professionalName} • Held in escrow until session ends`,
        amount: cohort.pricePerSeat,
        direction: "out",
        status: "pending",
      };
      const note: AppNotification = {
        id: `n-${Date.now()}`,
        title: "Cohort seat confirmed",
        body: `You're enrolled in ${cohort.title} with ${cohort.professionalName}.`,
        time: "Just now",
        kind: "session",
        read: false,
        href: "/cohorts",
      };
      return {
        ...s,
        cohorts: s.cohorts.map((c) =>
          c.id === id ? { ...c, seatsTaken: c.seatsTaken + 1 } : c,
        ),
        cohortEnrolments: { ...s.cohortEnrolments, [id]: "enrolled" },
        studentWallet: {
          ...s.studentWallet,
          balance: s.studentWallet.balance - cohort.pricePerSeat,
          transactions: [tx, ...s.studentWallet.transactions],
        },
        notifications: [note, ...s.notifications],
      };
    });

    if (isSupabaseEnabled && result !== "insufficient") {
      void upsertCohortEnrolment(id, result, paid);
      if (result === "enrolled" && paid > 0) {
        void applyWalletTransaction("student", {
          title: `Cohort seat — ${enrolledTitle}`,
          subtitle: `${enrolledHost} • Held in escrow until session ends`,
          amount: paid,
          direction: "out",
          status: "pending",
        });
      }
    }
    return result;
  }, []);

  /** Schedule a new cohort live session as the professional (FR-S04). */
  const createCohortSession = useCallback(
    (draft: CohortDraft): CohortSession => {
      let cohort!: CohortSession;
      setState((s) => {
        cohort = {
          id: `coh-${Date.now()}`,
          professionalId: s.userId ?? currentTeacher.id,
          professionalName:
            s.profileName ??
            (isSupabaseEnabled ? "Professional" : currentTeacher.name),
          title: draft.title.trim() || "Cohort live session",
          topic: draft.topic,
          tag: draft.topic.toUpperCase().slice(0, 8),
          dateLabel: draft.dateLabel,
          timeLabel: draft.timeLabel,
          durationMins: draft.durationMins,
          seatLimit: draft.seatLimit,
          seatsTaken: 0,
          pricePerSeat: draft.pricePerSeat,
          status: "scheduled",
        };
        const note: AppNotification = {
          id: `n-${Date.now()}`,
          title: "Cohort session scheduled",
          body: `${cohort.title} is open for enrolment — ${cohort.seatLimit} seats at ₦${cohort.pricePerSeat.toLocaleString("en-NG")}.`,
          time: "Just now",
          kind: "session",
          read: false,
          href: "/cohorts",
        };
        return {
          ...s,
          cohorts: [cohort, ...s.cohorts],
          notifications: [note, ...s.notifications],
        };
      });
      if (isSupabaseEnabled) {
        const localId = cohort.id;
        // Reconcile with the DB-generated id so go-live status updates and
        // learner joins reference the same session.
        void insertCohortSession(cohort).then((remoteId) => {
          if (!remoteId) return;
          setState((s) => ({
            ...s,
            cohorts: s.cohorts.map((c) =>
              c.id === localId ? { ...c, id: remoteId } : c,
            ),
          }));
        });
      }
      return cohort;
    },
    [],
  );

  /**
   * Start a scheduled cohort session: flips it live (locally + remotely) so
   * it appears on learners' Live Now rail, and notifies followers (FR-N03).
   */
  const startCohort = useCallback((id: string) => {
    setState((s) => {
      const cohort = s.cohorts.find((c) => c.id === id);
      if (!cohort || cohort.status === "live") return s;
      const note: AppNotification = {
        id: `n-${Date.now()}`,
        title: `${cohort.professionalName} is live now`,
        body: `${cohort.title} just started — join the live canvas.`,
        time: "Just now",
        kind: "session",
        read: false,
        href: `/live/${id}?as=student`,
      };
      return {
        ...s,
        cohorts: s.cohorts.map((c) =>
          c.id === id ? { ...c, status: "live" as const } : c,
        ),
        notifications: [note, ...s.notifications],
      };
    });
    if (isSupabaseEnabled) {
      void setCohortStatus(id, "live");
    }
  }, []);

  /** 'Go Live' alert pushed to followers when a professional starts (FR-N03). */
  const notifyGoLive = useCallback((topic: string, sessionId?: string) => {
    setState((s) => {
      const note: AppNotification = {
        id: `n-${Date.now()}`,
        title: `${s.profileName ?? "Your professional"} is live now`,
        body: `${topic} just started — join the live canvas.`,
        time: "Just now",
        kind: "session",
        read: false,
        href: `/live/${sessionId ?? "live-advanced-calculus"}?as=student`,
      };
      return { ...s, notifications: [note, ...s.notifications] };
    });
  }, []);

  const topUpWallet = useCallback(
    (role: Role, amount: number, reference: string) => {
      setState((s) => {
        const key = role === "teacher" ? "teacherWallet" : "studentWallet";
        const wallet = s[key];
        const tx: Transaction = {
          id: `t-${Date.now()}`,
          title: "Wallet Top-up — Card",
          subtitle: `${ledgerDate()} • Ref: ${reference}`,
          amount,
          direction: "in",
          status: "completed",
        };
        return {
          ...s,
          [key]: {
            ...wallet,
            balance: wallet.balance + amount,
            transactions: [tx, ...wallet.transactions],
          },
        };
      });
      // With Paystack live, /api/payments/verify credits the wallet
      // server-side with the confirmed amount — skip the client write.
      if (isSupabaseEnabled && !isPaystackEnabled) {
        void applyWalletTransaction(role, {
          title: "Wallet Top-up — Card",
          subtitle: `${ledgerDate()} • Ref: ${reference}`,
          amount,
          direction: "in",
          status: "completed",
          reference,
        });
      }
    },
    [],
  );

  const withdrawWallet = useCallback(
    (role: Role, amount: number, reference: string) => {
      setState((s) => {
        const key = role === "teacher" ? "teacherWallet" : "studentWallet";
        const wallet = s[key];
        const tx: Transaction = {
          id: `t-${Date.now()}`,
          title: "Bank Withdrawal",
          subtitle: `${ledgerDate()} • Ref: ${reference}`,
          amount,
          direction: "out",
          status: "sent",
        };
        return {
          ...s,
          [key]: {
            ...wallet,
            balance: Math.max(0, wallet.balance - amount),
            transactions: [tx, ...wallet.transactions],
          },
        };
      });
      // With Paystack live, /api/payments/withdraw debits the wallet
      // server-side after its own balance check — skip the client write.
      if (isSupabaseEnabled && !isPaystackEnabled) {
        void applyWalletTransaction(role, {
          title: "Bank Withdrawal",
          subtitle: `${ledgerDate()} • Ref: ${reference}`,
          amount,
          direction: "out",
          status: "sent",
          reference,
        });
      }
    },
    [],
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const sendChatMessage = useCallback((sessionId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    let author = "You";
    setState((s) => {
      author =
        s.profileName ?? (isSupabaseEnabled ? "Member" : currentStudent.name);
      const thread = s.chat[sessionId] ?? [];
      const message: ChatMessage = {
        id: `m-${Date.now()}`,
        author: "You",
        self: true,
        text: trimmed,
        time: clock(),
      };
      return { ...s, chat: { ...s.chat, [sessionId]: [...thread, message] } };
    });
    if (isSupabaseEnabled) {
      void insertChatMessage(sessionId, author, trimmed);
    }
  }, []);

  /** Appends a realtime message from the backend (skips own echoes). */
  const receiveChatMessage = useCallback(
    (sessionId: string, message: ChatMessage) => {
      if (message.self) return;
      setState((s) => {
        const thread = s.chat[sessionId] ?? [];
        if (thread.some((m) => m.id === message.id)) return s;
        return {
          ...s,
          chat: { ...s.chat, [sessionId]: [...thread, message] },
        };
      });
    },
    [],
  );

  /** Replaces a thread with backend history (initial realtime sync). */
  const replaceChatThread = useCallback(
    (sessionId: string, messages: ChatMessage[]) => {
      if (!messages.length) return;
      setState((s) => ({
        ...s,
        chat: { ...s.chat, [sessionId]: messages },
      }));
    },
    [],
  );

  const saveSlides = useCallback((sessionId: string, slides: Slide[]) => {
    setState((s) => ({
      ...s,
      slides: { ...s.slides, [sessionId]: slides },
    }));
    if (isSupabaseEnabled) {
      void replaceSlides(sessionId, slides);
    }
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const unreadCount = state.notifications.filter((n) => !n.read).length;
    return {
      ...state,
      hydrated,
      studentName:
        state.profileName ??
        (isSupabaseEnabled ? "Member" : currentStudent.name),
      unreadCount,
      signIn,
      signOut,
      setProfileName,
      setRole,
      createBooking,
      cancelBooking,
      topUpWallet,
      withdrawWallet,
      enrolInCohort,
      createCohortSession,
      startCohort,
      notifyGoLive,
      markNotificationRead,
      markAllNotificationsRead,
      sendChatMessage,
      receiveChatMessage,
      replaceChatThread,
      saveSlides,
    };
  }, [
    state,
    hydrated,
    signIn,
    signOut,
    setProfileName,
    setRole,
    createBooking,
    cancelBooking,
    topUpWallet,
    withdrawWallet,
    enrolInCohort,
    createCohortSession,
    startCohort,
    notifyGoLive,
    markNotificationRead,
    markAllNotificationsRead,
    sendChatMessage,
    receiveChatMessage,
    replaceChatThread,
    saveSlides,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within <AppProvider>");
  }
  return ctx;
}

export { currentStudent, currentTeacher };
