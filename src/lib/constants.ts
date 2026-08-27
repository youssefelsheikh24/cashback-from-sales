import type { RequestStatus, ServiceId } from "@/types";

/* ─────────────────────────  SERVICE CARDS (Step 02)  ───────────────────────── */
export interface ServiceDef {
  id: ServiceId;
  icon: string; // emoji
  title: string;
  description: string;
}

export const SERVICES: ServiceDef[] = [
  {
    id: "video-production",
    icon: "🎬",
    title: "Video Production",
    description: "We shoot and produce the content for you, end to end.",
  },
  {
    id: "montage",
    icon: "✂️",
    title: "Montage / Video Editing",
    description: "You have the footage — we craft the edit.",
  },
  {
    id: "photography",
    icon: "📸",
    title: "Photography",
    description: "Product, food, fashion, corporate, events & more.",
  },
  {
    id: "location",
    icon: "📍",
    title: "Shooting Location",
    description: "Book the perfect location for your shoot.",
  },
  {
    id: "studio",
    icon: "🎥",
    title: "Studio",
    description: "A fully-equipped indoor studio, ready to roll.",
  },
  {
    id: "crew",
    icon: "👥",
    title: "Production Crew",
    description: "Director, camera, lighting, sound and more.",
  },
  {
    id: "full-production",
    icon: "🎞️",
    title: "Full Production",
    description: "From concept to final delivery — the whole thing.",
  },
];

export const SERVICE_LABELS: Record<ServiceId, string> = SERVICES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.title }),
  {} as Record<ServiceId, string>
);

// Services that involve an actual shoot — used to decide whether to ask for a
// preferred shooting date in the scheduling step.
export const SHOOT_SERVICES: ServiceId[] = [
  "video-production",
  "photography",
  "location",
  "studio",
  "crew",
  "full-production",
];

/* ─────────────────────────  VIDEO PRODUCTION  ───────────────────────── */
export const VIDEO_CREATING_OPTIONS = [
  "Commercial",
  "Social Media Campaign",
  "Reel",
  "Product Video",
  "Corporate Video",
  "Food Video",
  "Fashion Video",
  "Music Video",
  "Event Video",
  "Other",
] as const;

export const VIDEO_DURATION_OPTIONS = [
  "Under 15 sec",
  "15–30 sec",
  "30–60 sec",
  "1–3 min",
  "3+ min",
] as const;

export const SCRIPT_OPTIONS = ["Yes", "No", "We need help with it"] as const;
export const CONCEPT_OPTIONS = [
  "Yes",
  "No",
  "We need help developing one",
] as const;

/* ─────────────────────────  MONTAGE  ───────────────────────── */
export const YES_NO = ["Yes", "No"] as const;

export const MONTAGE_FOOTAGE_OPTIONS = [
  "Under 1 hour",
  "1–3 hours",
  "3–5 hours",
  "5–10 hours",
  "10+ hours",
] as const;

export const MONTAGE_NEEDS_OPTIONS = [
  "Basic Editing",
  "Advanced Editing",
  "Color Grading",
  "Sound Design",
  "Motion Graphics",
  "VFX",
  "Subtitles",
  "Reels / Short-form Cuts",
  "Social Media Versions",
] as const;

/* ─────────────────────────  PHOTOGRAPHY  ───────────────────────── */
export const PHOTO_SUBJECT_OPTIONS = [
  "Products",
  "Food",
  "Fashion",
  "People",
  "Corporate",
  "Events",
  "Lifestyle",
  "Other",
] as const;

export const PHOTO_TYPE_OPTIONS = [
  "Studio",
  "On Location",
  "Outdoor",
  "Not Sure",
] as const;

export const RETOUCH_OPTIONS = ["Yes", "No", "Not Sure"] as const;

/* ─────────────────────────  SHOOTING LOCATION  ───────────────────────── */
export const LOCATION_TYPE_OPTIONS = [
  "Studio",
  "Apartment",
  "Villa",
  "Office",
  "Restaurant",
  "Café",
  "Industrial",
  "Outdoor",
  "Luxury",
  "Other",
] as const;

export const SHOOTING_DAYS_OPTIONS = [
  "Half Day",
  "1 Day",
  "2 Days",
  "3+ Days",
] as const;

export const NEED_OPTIONS = ["Yes", "No", "Not Sure"] as const;

/* ─────────────────────────  STUDIO  ───────────────────────── */
export const STUDIO_SHOOT_OPTIONS = [
  "Product",
  "Fashion",
  "Food",
  "Interview",
  "Commercial",
  "Content",
  "Photography",
  "Other",
] as const;

export const STUDIO_EQUIPMENT_OPTIONS = [
  "Cameras",
  "Lighting",
  "Sound",
  "Green Screen",
  "Props",
  "Other",
] as const;

/* ─────────────────────────  PRODUCTION CREW  ───────────────────────── */
export const CREW_ROLE_OPTIONS = [
  "Director",
  "Producer",
  "Director of Photography",
  "Camera Operator",
  "Lighting",
  "Sound",
  "Gaffer",
  "Grip",
  "Makeup Artist",
  "Stylist",
  "Art Director",
  "Production Assistant",
  "Other",
] as const;

export const CREW_LOCATION_OPTIONS = [
  "Client Location",
  "CashBack Location",
  "Outdoor",
  "Studio",
  "Not Decided",
] as const;

/* ─────────────────────────  FULL PRODUCTION  ───────────────────────── */
export const FULL_PRODUCTION_NEEDS = [
  "Concept",
  "Script",
  "Director",
  "Producer",
  "Location",
  "Studio",
  "Talent",
  "Makeup",
  "Styling",
  "Art Direction",
  "Camera",
  "Lighting",
  "Sound",
  "Production Crew",
  "Editing",
  "Color Grading",
  "Motion Graphics",
  "VFX",
] as const;

/* ─────────────────────────  SCHEDULING  ───────────────────────── */
export const FLEXIBILITY_OPTIONS = [
  "Very Flexible",
  "Somewhat Flexible",
  "Fixed Date",
  "Urgent",
] as const;

/* ─────────────────────────  BUDGET  ───────────────────────── */
export const BUDGET_OPTIONS = [
  "Under 10,000 EGP",
  "10,000 – 25,000 EGP",
  "25,000 – 50,000 EGP",
  "50,000 – 100,000 EGP",
  "100,000+ EGP",
  "Not sure yet",
] as const;

/* ─────────────────────────  FILE UPLOADS  ───────────────────────── */
export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file
export const ACCEPTED_FILE_TYPES =
  ".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.gif,.heic,.mp4,.mov,.webm,.m4v,.avi";

/* ─────────────────────────  CRM STATUSES  ───────────────────────── */
export const REQUEST_STATUSES: RequestStatus[] = [
  "New",
  "Reviewing",
  "Quoted",
  "Booked",
  "Completed",
  "Lost",
];

// Tailwind class tokens per status — used by badges, filters and stats.
export const STATUS_STYLES: Record<
  RequestStatus,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  New: {
    label: "New",
    dot: "bg-gold-400",
    text: "text-gold-300",
    bg: "bg-gold-500/10",
    border: "border-gold-500/30",
  },
  Reviewing: {
    label: "Reviewing",
    dot: "bg-sky-400",
    text: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
  },
  Quoted: {
    label: "Quoted",
    dot: "bg-violet-400",
    text: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
  },
  Booked: {
    label: "Booked",
    dot: "bg-amber-400",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
  },
  Completed: {
    label: "Completed",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
  },
  Lost: {
    label: "Lost",
    dot: "bg-rose-400",
    text: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/25",
  },
};
