import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MAX_FILE_SIZE, MAX_FILES } from "@/lib/constants";
import type { UploadedFileMeta } from "@/types";

// Client reference files live in a PRIVATE Supabase Storage bucket. They are
// NEVER public — the Sales download route mints a short-lived signed URL on
// demand, gated behind session auth. Edge compatible (pure HTTPS, no fs).

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "cashback-sales-refs";

let _client: SupabaseClient | null = null;
function supabase(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Supabase storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }
  if (!_client) {
    _client = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

const ALLOWED_EXT = new Set([
  ".pdf", ".doc", ".docx", ".txt", ".rtf",
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic",
  ".mp4", ".mov", ".webm", ".m4v", ".avi",
]);

function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot).toLowerCase() : "";
  return ALLOWED_EXT.has(ext) ? ext : "";
}

function baseName(name: string): string {
  return name.replace(/^.*[\\/]/, "");
}

function cleanName(name: string): string {
  return baseName(name).replace(/[^\w.\- ]+/g, "_").slice(0, 180) || "file";
}

function randomHex(bytes = 8): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Upload reference files for a request to `<reference>/<random>.<ext>` inside
 * the private bucket. `storedName` is the object path used later for download.
 */
export async function saveRequestFiles(
  reference: string,
  files: File[]
): Promise<UploadedFileMeta[]> {
  if (!files.length) return [];
  const accepted = files.filter((f) => f && f.size > 0).slice(0, MAX_FILES);
  const sb = supabase();

  const saved: UploadedFileMeta[] = [];
  for (const file of accepted) {
    if (file.size > MAX_FILE_SIZE) continue;
    const ext = extOf(file.name);
    if (!ext) continue;

    const objectPath = `${reference}/${randomHex()}${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error } = await sb.storage.from(BUCKET).upload(objectPath, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) {
      console.error("Supabase upload failed:", error.message);
      continue;
    }

    saved.push({
      name: cleanName(file.name),
      size: file.size,
      type: file.type || "application/octet-stream",
      storedName: objectPath, // full object path within the bucket
    });
  }
  return saved;
}

/**
 * Create a short-lived signed URL (default 5 min) for a stored object.
 * The object path is validated to belong to the given reference.
 */
export async function signedUrlForFile(
  reference: string,
  storedName: string,
  expiresInSeconds = 300
): Promise<string | null> {
  // Guard: the stored path must live under this request's reference folder.
  if (!storedName.startsWith(`${reference}/`) || storedName.includes("..")) {
    return null;
  }
  const { data, error } = await supabase()
    .storage.from(BUCKET)
    .createSignedUrl(storedName, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}

export const MAX_TOTAL_FILES = MAX_FILES;
