"use client";

import { useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X, Film, Image as ImageIcon, FileText } from "lucide-react";
import { ACCEPTED_FILE_TYPES, MAX_FILES, MAX_FILE_SIZE } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import { cn } from "@/lib/utils";

function iconFor(file: File) {
  if (file.type.startsWith("video/")) return Film;
  if (file.type.startsWith("image/")) return ImageIcon;
  return file.type.includes("pdf") || file.type.includes("text") ? FileText : FileIcon;
}

export function FileUpload({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const list = Array.from(incoming);
    const next: File[] = [...files];
    let skipped = 0;

    for (const f of list) {
      if (next.length >= MAX_FILES) {
        skipped++;
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        skipped++;
        continue;
      }
      // De-dupe by name+size.
      if (next.some((e) => e.name === f.name && e.size === f.size)) continue;
      next.push(f);
    }

    onChange(next);
    setNotice(
      skipped > 0
        ? `${skipped} file${skipped > 1 ? "s" : ""} skipped (max ${MAX_FILES} files, ${formatBytes(
            MAX_FILE_SIZE
          )} each).`
        : null
    );
  };

  const removeAt = (i: number) => {
    const next = files.slice();
    next.splice(i, 1);
    onChange(next);
    setNotice(null);
  };

  return (
    <div className="w-full">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "focus-gold flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-9 text-center transition-all",
          dragging
            ? "border-gold-400 bg-gold-500/10"
            : "border-white/15 bg-white/[0.02] hover:border-gold-500/40 hover:bg-white/[0.04]"
        )}
      >
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-300">
          <UploadCloud className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-gray-200">
          Drop references here, or{" "}
          <span className="text-gold-300 underline underline-offset-2">browse</span>
        </p>
        <p className="mt-1.5 text-[11px] text-gray-500">
          PDF briefs · images · reference videos · scripts · moodboards — up to{" "}
          {MAX_FILES} files, {formatBytes(MAX_FILE_SIZE)} each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {notice && <p className="mt-2 text-xs text-amber-300/90">{notice}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => {
            const Icon = iconFor(f);
            return (
              <li
                key={`${f.name}-${f.size}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-gold-300">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-200">{f.name}</p>
                  <p className="text-[11px] text-gray-500">{formatBytes(f.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`Remove ${f.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/5 hover:text-rose-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
