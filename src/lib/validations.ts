import { z } from "zod";
import { SERVICES } from "@/lib/constants";

// Accepts Egyptian (01xxxxxxxxx / +20…) and general international formats.
const phoneRegex = /^(\+?\d{1,4}[\s-]?)?(\(?\d{1,4}\)?[\s-]?)?[\d\s-]{7,15}$/;

const SERVICE_IDS = SERVICES.map((s) => s.id) as [string, ...string[]];

/* ── Step 01 — Contact ── */
export const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  phone: z
    .string()
    .trim()
    .min(8, "Phone number must be at least 8 digits")
    .max(25, "Phone number is too long")
    .refine((v) => phoneRegex.test(v), "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email address").max(120),
  brandName: z.string().trim().min(2, "Brand / Company name is required").max(100),
  whatsapp: z
    .string()
    .trim()
    .max(25, "WhatsApp number is too long")
    .refine((v) => v === "" || phoneRegex.test(v), "Please enter a valid WhatsApp number")
    .optional()
    .default(""),
});

/* ── Step 02 — Services ── */
export const servicesSchema = z.object({
  services: z
    .array(z.enum(SERVICE_IDS))
    .min(1, "Please select at least one service you need"),
});

/* ── Dynamic details — validated leniently (server trusts the shape loosely) ── */
const strArr = z.array(z.string()).default([]);
const optStr = z.string().max(500).optional().default("");

const detailsSchema = z
  .object({
    videoProduction: z
      .object({
        creating: optStr,
        numberOfVideos: optStr,
        durationPerVideo: optStr,
        hasScript: optStr,
        hasConcept: optStr,
      })
      .partial()
      .optional(),
    montage: z
      .object({
        hasFootage: optStr,
        numberToEdit: optStr,
        totalFootage: optStr,
        needs: strArr,
        hasReference: optStr,
      })
      .partial()
      .optional(),
    photography: z
      .object({
        shooting: optStr,
        numberOfSubjects: optStr,
        type: optStr,
        needsRetouching: optStr,
      })
      .partial()
      .optional(),
    location: z
      .object({
        locationType: optStr,
        preferredArea: optStr,
        preferredDate: optStr,
        shootingDays: optStr,
        shootingHours: optStr,
        peopleOnSet: optStr,
        needEquipment: optStr,
        needCrew: optStr,
      })
      .partial()
      .optional(),
    studio: z
      .object({
        shooting: optStr,
        preferredDate: optStr,
        hours: optStr,
        people: optStr,
        equipment: strArr,
      })
      .partial()
      .optional(),
    crew: z
      .object({
        roles: strArr,
        shootingDays: optStr,
        preferredDate: optStr,
        location: optStr,
      })
      .partial()
      .optional(),
    fullProduction: z
      .object({
        producing: z.string().max(2000).optional().default(""),
        needs: strArr,
        numberOfVideos: optStr,
        preferredDate: optStr,
        deliveryDeadline: optStr,
      })
      .partial()
      .optional(),
  })
  .partial()
  .default({});

/* ── Full submission schema — the source of truth validated on the server ── */
export const productionRequestSchema = z.object({
  fullName: contactSchema.shape.fullName,
  phone: contactSchema.shape.phone,
  email: contactSchema.shape.email,
  brandName: contactSchema.shape.brandName,
  whatsapp: contactSchema.shape.whatsapp,

  services: servicesSchema.shape.services,
  details: detailsSchema,

  projectDescription: z
    .string()
    .trim()
    .min(15, "Please tell us a little more about the shoot (at least 15 characters)")
    .max(4000, "Project description is too long (max 4000 characters)"),
  referenceLink: z
    .string()
    .trim()
    .max(500)
    .refine(
      (v) => v === "" || /^(https?:\/\/|www\.)/i.test(v),
      "Please enter a valid link (starting with http:// or https://)"
    )
    .optional()
    .default(""),

  preferredShootDate: z.string().max(40).optional().default(""),
  deliveryDeadline: z.string().max(40).optional().default(""),
  flexibility: z.string().max(60).optional().default(""),

  budget: z.string().min(1, "Please select a production budget"),
});

export type ProductionRequestInput = z.infer<typeof productionRequestSchema>;

/* ── CRM ── */
export const REQUEST_STATUSES = [
  "New",
  "Reviewing",
  "Quoted",
  "Booked",
  "Completed",
  "Lost",
] as const;

export const requestUpdateSchema = z.object({
  status: z.enum(REQUEST_STATUSES).optional(),
  internalNotes: z.string().max(3000).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
