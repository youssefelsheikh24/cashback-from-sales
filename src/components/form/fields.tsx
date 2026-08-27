"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/* ─────────────────────────  Text input  ───────────────────────── */
interface TextFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  required?: boolean;
  optional?: boolean;
  min?: number;
}

export function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  inputMode,
  required,
  optional,
  min,
}: TextFieldProps) {
  const errId = `${id}-error`;
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-[11px] font-medium uppercase tracking-[0.15em] text-gray-400 mb-2"
      >
        {label}
        {required && <span className="text-gold-400 ml-1">*</span>}
        {optional && <span className="text-gray-600 ml-1 normal-case tracking-normal">(optional)</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        min={min}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        className={cn(
          "glass-input w-full rounded-xl px-4 py-3.5 text-[15px] text-white placeholder:text-gray-600",
          error && "input-error"
        )}
      />
      {error && (
        <p id={errId} role="alert" className="mt-1.5 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────  Number input  ───────────────────────── */
export function NumberField(props: Omit<TextFieldProps, "type" | "inputMode">) {
  return <TextField {...props} type="number" inputMode="numeric" min={props.min ?? 1} />;
}

/* ─────────────────────────  Date input  ───────────────────────── */
export function DateField({
  id,
  label,
  value,
  onChange,
  error,
  required,
  optional,
  min,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  optional?: boolean;
  min?: string;
}) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-[11px] font-medium uppercase tracking-[0.15em] text-gray-400 mb-2"
      >
        {label}
        {required && <span className="text-gold-400 ml-1">*</span>}
        {optional && <span className="text-gray-600 ml-1 normal-case tracking-normal">(optional)</span>}
      </label>
      <input
        id={id}
        name={id}
        type="date"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "glass-input w-full rounded-xl px-4 py-3.5 text-[15px] text-white placeholder:text-gray-600 [color-scheme:dark]",
          error && "input-error"
        )}
      />
      {error && <p role="alert" className="mt-1.5 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

/* ─────────────────────────  Textarea  ───────────────────────── */
interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  optional?: boolean;
  maxLength?: number;
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  rows = 5,
  required,
  optional,
  maxLength,
}: TextAreaFieldProps) {
  const errId = `${id}-error`;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="block text-[11px] font-medium uppercase tracking-[0.15em] text-gray-400"
        >
          {label}
          {required && <span className="text-gold-400 ml-1">*</span>}
          {optional && <span className="text-gray-600 ml-1 normal-case tracking-normal">(optional)</span>}
        </label>
        {maxLength && (
          <span className="text-[10px] text-gray-600 tabular-nums">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        className={cn(
          "glass-input w-full rounded-xl px-4 py-3.5 text-[15px] text-white placeholder:text-gray-600 resize-none leading-relaxed",
          error && "input-error"
        )}
      />
      {error && (
        <p id={errId} role="alert" className="mt-1.5 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* ────────────────  Multi-select option grid (checkboxes)  ──────────────── */
interface MultiOptionGridProps {
  legend: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
  columns?: 2 | 3;
  required?: boolean;
}

export function MultiOptionGrid({
  legend,
  options,
  selected,
  onToggle,
  error,
  columns = 2,
  required,
}: MultiOptionGridProps) {
  return (
    <fieldset className="w-full">
      <legend className="text-[11px] font-medium uppercase tracking-[0.15em] text-gray-400 mb-3">
        {legend}
        {required && <span className="text-gold-400 ml-1">*</span>}
      </legend>
      <div
        className={cn(
          "grid gap-2.5",
          columns === 3 ? "sm:grid-cols-3 grid-cols-2" : "sm:grid-cols-2 grid-cols-1"
        )}
      >
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => onToggle(opt)}
              className={cn(
                "option-card focus-gold group flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-gray-200",
                isSelected && "selected text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                  isSelected
                    ? "border-gold-400 bg-gold-500 text-black"
                    : "border-white/20 bg-white/5 text-transparent"
                )}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="font-medium">{opt}</span>
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-rose-400">{error}</p>}
    </fieldset>
  );
}

/* ────────────────  Single-select option grid (radio)  ──────────────── */
interface SingleOptionGridProps {
  legend: string;
  options: readonly string[];
  value: string;
  onSelect: (value: string) => void;
  error?: string;
  columns?: 2 | 3;
  required?: boolean;
}

export function SingleOptionGrid({
  legend,
  options,
  value,
  onSelect,
  error,
  columns = 2,
  required,
}: SingleOptionGridProps) {
  return (
    <fieldset className="w-full">
      <legend className="text-[11px] font-medium uppercase tracking-[0.15em] text-gray-400 mb-3">
        {legend}
        {required && <span className="text-gold-400 ml-1">*</span>}
      </legend>
      <div
        className={cn(
          "grid gap-2.5",
          columns === 3 ? "sm:grid-cols-3 grid-cols-2" : "sm:grid-cols-2 grid-cols-1"
        )}
      >
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(opt)}
              className={cn(
                "option-card focus-gold flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-gray-200",
                isSelected && "selected text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isSelected ? "border-gold-400" : "border-white/25"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full transition-transform",
                    isSelected ? "scale-100 bg-gold-500" : "scale-0 bg-transparent"
                  )}
                />
              </span>
              <span className="font-medium">{opt}</span>
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-rose-400">{error}</p>}
    </fieldset>
  );
}
