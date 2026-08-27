import type { ProductionRequest as DbRequest } from "@prisma/client";
import type {
  ProductionRequest,
  ProductionDetails,
  ServiceId,
  UploadedFileMeta,
} from "@/types";

function parseJSON<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

/** Convert a DB row (JSON-stringified fields) into the API/UI shape. */
export function serializeRequest(row: DbRequest): ProductionRequest {
  return {
    id: row.id,
    reference: row.reference,
    fullName: row.fullName,
    phone: row.phone,
    email: row.email,
    brandName: row.brandName,
    whatsapp: row.whatsapp,
    services: parseJSON<ServiceId[]>(row.services, []),
    details: parseJSON<ProductionDetails>(row.details, {}),
    projectDescription: row.projectDescription,
    referenceLink: row.referenceLink,
    files: parseJSON<UploadedFileMeta[]>(row.files, []),
    preferredShootDate: row.preferredShootDate,
    deliveryDeadline: row.deliveryDeadline,
    flexibility: row.flexibility,
    budget: row.budget,
    status: row.status as ProductionRequest["status"],
    internalNotes: row.internalNotes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
