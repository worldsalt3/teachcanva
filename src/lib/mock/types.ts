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
  /** Max seats this professional accepts in a cohort live session. */
  cohortCapacity: number;
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

export type SessionStatus = "live" | "upcoming" | "completed" | "cancelled";

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
  /** Amount (₦) held in escrow for this booking; refunded on cancellation. */
  amount?: number;
}

export type CohortStatus = "scheduled" | "live" | "ended";

/** A 1:many cohort live session hosted by a professional. */
export interface CohortSession {
  id: string;
  professionalId: string;
  professionalName: string;
  title: string;
  topic: string; // e.g. "Product Design"
  tag: string; // short vertical label, e.g. "DESIGN"
  dateLabel: string; // "OCT 26"
  timeLabel: string; // "06:00 PM"
  countdown?: string; // "in 2d 4h"
  durationMins: number;
  seatLimit: number;
  seatsTaken: number;
  pricePerSeat: number;
  status: CohortStatus;
  /** Set when the session is part of a scheduled series / workshop. */
  series?: { name: string; part: number; of: number };
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
