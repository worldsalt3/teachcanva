export type Role = "student" | "teacher";

export interface Education {
  degree: string;
  school: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DaySlots {
  label: string; // "MON"
  day: number; // 12
  available: boolean;
  slots: TimeSlot[];
}

export interface Teacher {
  id: string;
  name: string;
  title: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  sessionsCount: number;
  hourlyRate: number;
  sessionLengthMins: number;
  isLive: boolean;
  isPro: boolean;
  verified: boolean;
  nextSlotLabel?: string;
  bio: string;
  education: Education[];
  expertise: string[];
  tpBonusPerHour: number;
  availability: DaySlots[];
  reviews: Review[];
}

export type SessionStatus = "live" | "upcoming" | "completed";

export interface Session {
  id: string;
  counterpartName: string;
  subject: string;
  topic: string;
  dateLabel: string; // "OCT 24"
  timeLabel: string; // "04:00 PM" or "14:30 - 15:30"
  durationMins: number;
  status: SessionStatus;
  countdown?: string; // "in 2h 14m"
  replay?: boolean;
  rating?: number;
}

export interface LiveNowItem {
  id: string;
  teacherId: string;
  teacherName: string;
  topic: string;
  tag: string; // "STEM"
  viewers: number;
}

export interface Topic {
  id: string;
  label: string;
}

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  direction: "in" | "out";
  status: "completed" | "pending" | "sent";
}

export interface WalletAccount {
  balance: number;
  pendingPayouts: number;
  pendingClearsIn: string;
  lifetimeEarnings: number;
  tpBalance: number;
  referralCode: string;
  referralReward: number;
  transactions: Transaction[];
}

export interface SessionReward {
  label: string;
  tp: number;
}

export interface CurrentUser {
  id: string;
  name: string;
  firstName: string;
  role: Role;
  tpBalance: number;
}
