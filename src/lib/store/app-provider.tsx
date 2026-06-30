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
  getTeacher,
} from "@/lib/mock";
import type {
  Role,
  Session,
  Transaction,
  WalletAccount,
} from "@/lib/mock/types";
import type {
  AppNotification,
  BookingDraft,
  ChatMessage,
  Slide,
} from "@/lib/services/types";

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
    title: "You earned 50 TP",
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
    body: "Find a tutor and book your first live session.",
    time: "2d",
    kind: "system",
    read: true,
    href: "/explore",
  },
];

interface PersistShape {
  authenticated: boolean;
  profileName: string | null;
  studentWallet: WalletAccount;
  teacherWallet: WalletAccount;
  studentBookings: Session[];
  notifications: AppNotification[];
  chat: Record<string, ChatMessage[]>;
  slides: Record<string, Slide[]>;
}

function initialState(): PersistShape {
  return {
    // Seeded as authenticated so the app is instantly previewable; logging out
    // clears this and gates the shells behind the landing/login flow.
    authenticated: true,
    profileName: null,
    studentWallet: structuredClone(seedStudentWallet),
    teacherWallet: structuredClone(seedTeacherWallet),
    studentBookings: structuredClone(studentUpcoming),
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
  // bookings + wallet
  createBooking: (draft: BookingDraft) => Session;
  topUpWallet: (role: Role, amount: number, reference: string) => void;
  withdrawWallet: (role: Role, amount: number, reference: string) => void;
  // notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // chat
  sendChatMessage: (sessionId: string, text: string) => void;
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

  // Load persisted state after mount to keep SSR output deterministic. The
  // update is queued as a microtask so it runs just after the first (server-
  // matching) render rather than synchronously inside the effect body.
  useEffect(() => {
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
  }, []);

  // Persist on every change once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota / private-mode errors
    }
  }, [state, hydrated]);

  const signIn = useCallback(() => {
    setState((s) => ({ ...s, authenticated: true }));
  }, []);

  const signOut = useCallback(() => {
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

  const createBooking = useCallback((draft: BookingDraft): Session => {
    const teacher = getTeacher(draft.teacherId);
    const booking: Session = {
      id: `bk-${Date.now()}`,
      counterpartName: teacher?.name ?? "Tutor",
      subject: teacher?.subjects[0] ?? "Session",
      topic: draft.topic.trim() || teacher?.title || "Tutoring session",
      dateLabel: draft.dateLabel,
      timeLabel: draft.time,
      durationMins: teacher?.sessionLengthMins ?? 60,
      status: "upcoming",
    };

    setState((s) => {
      const next: PersistShape = {
        ...s,
        studentBookings: [booking, ...s.studentBookings],
      };

      if (draft.payWith === "wallet") {
        const tx: Transaction = {
          id: `t-${Date.now()}`,
          title: `${booking.subject}: ${booking.topic}`,
          subtitle: `${booking.counterpartName} • ${ledgerDate()}`,
          amount: draft.amount,
          direction: "out",
          status: "completed",
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

    return booking;
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
    setState((s) => {
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
  }, []);

  const saveSlides = useCallback((sessionId: string, slides: Slide[]) => {
    setState((s) => ({
      ...s,
      slides: { ...s.slides, [sessionId]: slides },
    }));
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const unreadCount = state.notifications.filter((n) => !n.read).length;
    return {
      ...state,
      hydrated,
      studentName: state.profileName ?? currentStudent.name,
      unreadCount,
      signIn,
      signOut,
      setProfileName,
      createBooking,
      topUpWallet,
      withdrawWallet,
      markNotificationRead,
      markAllNotificationsRead,
      sendChatMessage,
      saveSlides,
    };
  }, [
    state,
    hydrated,
    signIn,
    signOut,
    setProfileName,
    createBooking,
    topUpWallet,
    withdrawWallet,
    markNotificationRead,
    markAllNotificationsRead,
    sendChatMessage,
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
