import type { Role } from "@/lib/mock/types";

/** In-app notification shown on the notifications screen and bell badge. */
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string; // relative label, e.g. "1h", "Yesterday"
  kind: "session" | "payment" | "tp" | "system";
  read: boolean;
  href?: string;
}

/** A single chat message inside a live session. */
export interface ChatMessage {
  id: string;
  author: string;
  self: boolean;
  text: string;
  time: string; // "14:32"
}

/** A presentation slide a teacher prepares for a class. */
export type SlideKind = "text" | "image" | "video";

export interface Slide {
  id: string;
  kind: SlideKind;
  title: string; // text slide heading, or caption for a media slide
  body: string; // text slide content (empty for media slides)
  src?: string; // image data URL, or video object/data URL
}

/** Everything needed to create a booking from the booking flow. */
export interface BookingDraft {
  teacherId: string;
  dateLabel: string; // "THU 15"
  time: string; // "04:00 PM"
  topic: string;
  amount: number; // total charged (₦, major units)
  payWith: "wallet" | "card";
}

/** Everything needed for a professional to schedule a cohort live session. */
export interface CohortDraft {
  title: string;
  topic: string;
  dateLabel: string; // "OCT 26"
  timeLabel: string; // "06:00 PM"
  durationMins: number;
  seatLimit: number;
  pricePerSeat: number; // ₦, major units
}

/** Outcome of a cohort enrolment attempt. */
export type EnrolResult = "enrolled" | "waitlisted" | "insufficient";

/** Credentials passed to the auth service on sign up / log in. */
export interface AuthCredentials {
  name?: string;
  email: string;
  role: Role;
}
