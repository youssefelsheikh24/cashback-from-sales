export type RequestStatus =
  | "New"
  | "Reviewing"
  | "Quoted"
  | "Booked"
  | "Completed"
  | "Lost";

export type ServiceId =
  | "video-production"
  | "montage"
  | "photography"
  | "location"
  | "studio"
  | "crew"
  | "full-production";

/* ── Dynamic, per-service production details ── */
export interface VideoProductionDetails {
  creating: string;
  numberOfVideos: string;
  durationPerVideo: string;
  hasScript: string;
  hasConcept: string;
}

export interface MontageDetails {
  hasFootage: string;
  numberToEdit: string;
  totalFootage: string;
  needs: string[];
  hasReference: string;
}

export interface PhotographyDetails {
  shooting: string;
  numberOfSubjects: string;
  type: string;
  needsRetouching: string;
}

export interface LocationDetails {
  locationType: string;
  preferredArea: string;
  preferredDate: string;
  shootingDays: string;
  shootingHours: string;
  peopleOnSet: string;
  needEquipment: string;
  needCrew: string;
}

export interface StudioDetails {
  shooting: string;
  preferredDate: string;
  hours: string;
  people: string;
  equipment: string[];
}

export interface CrewDetails {
  roles: string[];
  shootingDays: string;
  preferredDate: string;
  location: string;
}

export interface FullProductionDetails {
  producing: string;
  needs: string[];
  numberOfVideos: string;
  preferredDate: string;
  deliveryDeadline: string;
}

export interface ProductionDetails {
  videoProduction?: Partial<VideoProductionDetails>;
  montage?: Partial<MontageDetails>;
  photography?: Partial<PhotographyDetails>;
  location?: Partial<LocationDetails>;
  studio?: Partial<StudioDetails>;
  crew?: Partial<CrewDetails>;
  fullProduction?: Partial<FullProductionDetails>;
}

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
  storedName: string;
}

/* ── The full client-side form state ── */
export interface ProductionFormData {
  // Step 01 — Contact
  fullName: string;
  phone: string;
  email: string;
  brandName: string;
  whatsapp: string;

  // Step 02 — Services
  services: ServiceId[];

  // Step 03 — Dynamic production details
  details: ProductionDetails;

  // Step 04 — The brief / shoot
  projectDescription: string;
  referenceLink: string;
  preferredShootDate: string;
  deliveryDeadline: string;
  flexibility: string;

  // Step 05 — Budget
  budget: string;

  // Client-only: selected reference files (sent as multipart, never JSON).
  _files?: File[];
}

/* ── Persisted request (as returned to the Sales CRM) ── */
export interface ProductionRequest {
  id: string;
  reference: string;
  fullName: string;
  phone: string;
  email: string;
  brandName: string;
  whatsapp?: string | null;
  services: ServiceId[];
  details: ProductionDetails;
  projectDescription: string;
  referenceLink?: string | null;
  files: UploadedFileMeta[];
  preferredShootDate?: string | null;
  deliveryDeadline?: string | null;
  flexibility?: string | null;
  budget: string;
  status: RequestStatus;
  internalNotes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface NotificationItem {
  id: string;
  requestId?: string | null;
  title: string;
  message: string;
  brand?: string | null;
  service?: string | null;
  budget?: string | null;
  reference?: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

export interface SalesStats {
  total: number;
  New: number;
  Reviewing: number;
  Quoted: number;
  Booked: number;
  Completed: number;
  Lost: number;
}
