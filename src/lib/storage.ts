import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { MAX_FILE_SIZE, MAX_FILES } from "@/lib/constants";
import type { UploadedFileMeta } from "@/types";

// Server-only file storage. Files live OUTSIDE /public and are streamed back to
// the Sales team through an authenticated route — client reference material is
// never publicly accessible.
const UPLOAD_ROOT = path.resolve(
  process.cwd(),
  process.env.UPLOAD_DIR || "./storage/uploads"
);

const ALLOWED_EXT = new Set([
  ".pdf", ".doc", ".docx", ".txt", ".rtf",
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic",
  ".mp4", ".mov", ".webm", ".m4v", ".avi",
]);

function safeExt(name: string): string {
  const ext = path.extname(name).toLowerCase();
  return ALLOWED_EXT.has(ext) ? ext : "";
}

/** Sanitize a client-provided filename for safe display (no path traversal). */
function cleanName(name: string): string {
  return path
    .basename(name)
    .replace(/[^\w.\- ]+/g, "_")
    .slice(0, 180) || "file";
}

/**
 * Persist uploaded files for a request into storage/uploads/<reference>/.
 * Enforces count/size/type limits. Returns metadata to store in the DB.
 */
export async function saveRequestFiles(
  reference: string,
  files: File[]
): Promise<UploadedFileMeta[]> {
  if (!files.length) return [];

  const accepted = files.filter((f) => f && f.size > 0).slice(0, MAX_FILES);
  const dir = path.join(UPLOAD_ROOT, reference);
  await fs.mkdir(dir, { recursive: true });

  const saved: UploadedFileMeta[] = [];
  for (const file of accepted) {
    if (file.size > MAX_FILE_SIZE) continue; // skip oversized silently
    const ext = safeExt(file.name);
    if (!ext) continue; // skip disallowed types

    const storedName = `${randomBytes(8).toString("hex")}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, storedName), buffer);

    saved.push({
      name: cleanName(file.name),
      size: file.size,
      type: file.type || "application/octet-stream",
      storedName,
    });
  }
  return saved;
}

/**
 * Resolve the absolute path to a stored file, guarding against traversal.
 * Returns null if the file is outside the request's directory or missing.
 */
export async function resolveStoredFile(
  reference: string,
  storedName: string
): Promise<string | null> {
  const dir = path.join(UPLOAD_ROOT, path.basename(reference));
  const full = path.join(dir, path.basename(storedName));
  if (!full.startsWith(dir)) return null;
  try {
    await fs.access(full);
    return full;
  } catch {
    return null;
  }
}

export const MAX_TOTAL_FILES = MAX_FILES;
