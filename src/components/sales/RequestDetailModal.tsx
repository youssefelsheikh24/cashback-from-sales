"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Mail, Phone, MessageCircle, Building2, User, Wallet, Calendar,
  Clock, FileText, StickyNote, Trash2, Loader2, Check, Film, MapPin,
  Camera, Clapperboard, Link2, Download, Save,
} from "lucide-react";
import type { ProductionRequest, RequestStatus } from "@/types";
import { REQUEST_STATUSES, STATUS_STYLES, SERVICE_LABELS } from "@/lib/constants";
import { StatusBadge } from "./StatusBadge";
import { formatFullDateTime, formatBytes, toWhatsAppLink, toDialable } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function RequestDetailModal({
  request,
  onClose,
  onUpdated,
  onDeleted,
}: {
  request: ProductionRequest;
  onClose: () => void;
  onUpdated: (r: ProductionRequest) => void;
  onDeleted: (id: string) => void;
}) {
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [notes, setNotes] = useState(request.internalNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const d = request.details || {};

  const changeStatus = async (next: RequestStatus) => {
    if (next === status || saving) return;
    const prev = status;
    setStatus(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Update failed");
      onUpdated(json.request);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1600);
    } catch (e) {
      setStatus(prev);
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: notes }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
      onUpdated(json.request);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 1600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${request.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Delete failed");
      onDeleted(request.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete request");
      setDeleting(false);
    }
  };

  const waNumber = request.whatsapp || request.phone;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`Request details for ${request.fullName}`}
          className="glass-main-card max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-t-[28px] sm:rounded-[28px]"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F6E29C] to-[#9B7517] text-sm font-bold text-black">
                {request.fullName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold uppercase text-white">
                  {request.fullName}
                </h2>
                <p className="text-sm text-gold-200/80">
                  {request.brandName} · <span className="font-mono text-gray-400">{request.reference}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="btn-ghost focus-gold flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2.5 border-b border-white/[0.08] px-6 py-4 sm:px-8">
            <QuickAction icon={Phone} label="Call" href={`tel:${toDialable(request.phone)}`} />
            <QuickAction
              icon={MessageCircle}
              label="WhatsApp"
              href={toWhatsAppLink(waNumber)}
              external
            />
            <QuickAction icon={Mail} label="Email" href={`mailto:${request.email}`} />
          </div>

          {/* Body */}
          <div className="max-h-[calc(94vh-320px)] overflow-y-auto px-6 py-6 sm:px-8">
            {/* Status control */}
            <Section title="Status">
              <div className="flex flex-wrap gap-2">
                {REQUEST_STATUSES.map((s) => {
                  const active = status === s;
                  const st = STATUS_STYLES[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={saving}
                      onClick={() => changeStatus(s)}
                      className={cn(
                        "focus-gold rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all disabled:opacity-60",
                        active
                          ? cn(st.bg, st.border, st.text, "ring-1 ring-inset ring-white/10")
                          : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25 hover:text-white"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 h-4 text-xs">
                {saving && (
                  <span className="inline-flex items-center gap-1.5 text-gray-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                  </span>
                )}
                {justSaved && !saving && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <Check className="h-3 w-3" /> Status updated
                  </span>
                )}
              </div>
            </Section>

            {/* Client */}
            <Section title="Client">
              <Field icon={User} label="Name" value={request.fullName} />
              <Field icon={Building2} label="Brand / Company" value={request.brandName} gold />
              <Field icon={Phone} label="Phone" value={request.phone} href={`tel:${toDialable(request.phone)}`} />
              <Field icon={Mail} label="Email" value={request.email} href={`mailto:${request.email}`} />
              {request.whatsapp && (
                <Field icon={MessageCircle} label="WhatsApp" value={request.whatsapp} href={toWhatsAppLink(request.whatsapp)} />
              )}
            </Section>

            {/* Services */}
            <Section title="Services">
              <div className="flex flex-wrap gap-1.5">
                {request.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-gold-500/25 bg-gold-500/10 px-2.5 py-1 text-xs text-gold-200"
                  >
                    {SERVICE_LABELS[s] || s}
                  </span>
                ))}
              </div>
            </Section>

            {/* Production (Video) */}
            {d.videoProduction && hasValues(d.videoProduction) && (
              <Section title="Production" icon={Film}>
                <Field label="Project type" value={d.videoProduction.creating} />
                <Field label="Number of videos" value={d.videoProduction.numberOfVideos} />
                <Field label="Duration per video" value={d.videoProduction.durationPerVideo} />
                <Field label="Script" value={d.videoProduction.hasScript} />
                <Field label="Concept" value={d.videoProduction.hasConcept} />
              </Section>
            )}

            {/* Montage */}
            {d.montage && hasValues(d.montage) && (
              <Section title="Montage / Editing" icon={Film}>
                <Field label="Footage available" value={d.montage.hasFootage} />
                <Field label="Videos to edit" value={d.montage.numberToEdit} />
                <Field label="Total footage" value={d.montage.totalFootage} />
                <ChipField label="Editing needs" values={d.montage.needs} />
                <Field label="Has style reference" value={d.montage.hasReference} />
              </Section>
            )}

            {/* Photography */}
            {d.photography && hasValues(d.photography) && (
              <Section title="Photography" icon={Camera}>
                <Field label="Shooting" value={d.photography.shooting} />
                <Field label="Number of subjects" value={d.photography.numberOfSubjects} />
                <Field label="Type" value={d.photography.type} />
                <Field label="Retouching" value={d.photography.needsRetouching} />
              </Section>
            )}

            {/* Location */}
            {d.location && hasValues(d.location) && (
              <Section title="Location" icon={MapPin}>
                <Field label="Location type" value={d.location.locationType} />
                <Field label="Preferred area" value={d.location.preferredArea} />
                <Field label="Shooting date" value={d.location.preferredDate} />
                <Field label="Shooting days" value={d.location.shootingDays} />
                <Field label="Hours" value={d.location.shootingHours} />
                <Field label="People on set" value={d.location.peopleOnSet} />
                <Field label="Needs equipment" value={d.location.needEquipment} />
                <Field label="Needs crew" value={d.location.needCrew} />
              </Section>
            )}

            {/* Studio */}
            {d.studio && hasValues(d.studio) && (
              <Section title="Studio" icon={Clapperboard}>
                <Field label="Shooting" value={d.studio.shooting} />
                <Field label="Preferred date" value={d.studio.preferredDate} />
                <Field label="Hours" value={d.studio.hours} />
                <Field label="People" value={d.studio.people} />
                <ChipField label="Equipment" values={d.studio.equipment} />
              </Section>
            )}

            {/* Crew */}
            {d.crew && hasValues(d.crew) && (
              <Section title="Production Crew" icon={User}>
                <ChipField label="Roles needed" values={d.crew.roles} />
                <Field label="Shooting days" value={d.crew.shootingDays} />
                <Field label="Preferred date" value={d.crew.preferredDate} />
                <Field label="Location" value={d.crew.location} />
              </Section>
            )}

            {/* Full production */}
            {d.fullProduction && hasValues(d.fullProduction) && (
              <Section title="Full Production" icon={Clapperboard}>
                {d.fullProduction.producing && (
                  <div className="mb-4">
                    <FieldLabel label="Producing" />
                    <p className="mt-2 whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm leading-relaxed text-gray-300">
                      {d.fullProduction.producing}
                    </p>
                  </div>
                )}
                <ChipField label="Needs from CashBack" values={d.fullProduction.needs} />
                <Field label="Final videos" value={d.fullProduction.numberOfVideos} />
                <Field label="Preferred date" value={d.fullProduction.preferredDate} />
                <Field label="Delivery deadline" value={d.fullProduction.deliveryDeadline} />
              </Section>
            )}

            {/* Scheduling */}
            {(request.preferredShootDate || request.deliveryDeadline || request.flexibility) && (
              <Section title="Scheduling" icon={Calendar}>
                <Field icon={Calendar} label="Shooting date" value={request.preferredShootDate || ""} />
                <Field icon={Clock} label="Delivery deadline" value={request.deliveryDeadline || ""} />
                <Field label="Flexibility" value={request.flexibility || ""} />
              </Section>
            )}

            {/* Commercial */}
            <Section title="Commercial" icon={Wallet}>
              <Field icon={Wallet} label="Budget" value={request.budget} gold />
            </Section>

            {/* Files & references */}
            {(request.files.length > 0 || request.referenceLink) && (
              <Section title="Files &amp; References" icon={FileText}>
                {request.referenceLink && (
                  <a
                    href={request.referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 text-sm text-gold-200 transition-colors hover:border-gold-500/40"
                  >
                    <Link2 className="h-4 w-4 shrink-0 text-gold-400" />
                    <span className="truncate">{request.referenceLink}</span>
                  </a>
                )}
                {request.files.length > 0 && (
                  <ul className="space-y-2">
                    {request.files.map((f) => (
                      <li key={f.storedName}>
                        <a
                          href={`/api/requests/${request.id}/files/${encodeURIComponent(f.storedName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:border-gold-500/40"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-gold-300">
                            <FileText className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-gray-200">{f.name}</p>
                            <p className="text-[11px] text-gray-500">{formatBytes(f.size)}</p>
                          </div>
                          <Download className="h-4 w-4 text-gray-500" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            )}

            {/* Notes — the brief */}
            <Section title="Notes — The Brief" icon={FileText}>
              <p className="whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm leading-relaxed text-gray-300">
                {request.projectDescription}
              </p>
            </Section>

            {/* Internal notes (Sales) */}
            <Section title="Internal Notes" icon={StickyNote}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={3000}
                placeholder="Add internal notes for the Sales team…"
                className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none"
              />
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="btn-ghost focus-gold inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-gray-300 hover:text-gold-300"
                >
                  {savingNotes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save notes
                </button>
                {notesSaved && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                    <Check className="h-3 w-3" /> Saved
                  </span>
                )}
              </div>
            </Section>

            <Section title="Meta">
              <Field icon={Calendar} label="Submitted" value={formatFullDateTime(request.createdAt)} />
            </Section>

            {error && <p role="alert" className="mt-2 text-sm text-rose-400">{error}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-6 py-4 sm:px-8">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              Current: <StatusBadge status={status} size="sm" />
            </div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn-ghost focus-gold inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-rose-300/90 hover:border-rose-500/40 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Delete permanently?</span>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="btn-ghost focus-gold rounded-full px-3 py-2 text-xs text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={doDelete}
                  disabled={deleting}
                  className="focus-gold inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25"
                >
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Confirm
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Helpers ── */
function hasValues(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((v) =>
    Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim().length > 0
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
  external,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="btn-ghost focus-gold inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-200 hover:border-gold-500/40 hover:text-gold-200 sm:flex-none"
    >
      <Icon className="h-4 w-4 text-gold-400" />
      {label}
    </a>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h3 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-400/80">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {title}
      </h3>
      {children}
    </section>
  );
}

function FieldLabel({ icon: Icon, label }: { icon?: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-500">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-600" />}
      {label}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  href,
  gold,
}: {
  icon?: React.ElementType;
  label: string;
  value?: string;
  href?: string;
  gold?: boolean;
}) {
  if (!value || !value.trim()) return null;
  return (
    <div className="mb-3 flex items-start justify-between gap-4 border-b border-white/[0.04] pb-3 last:border-0">
      <FieldLabel icon={Icon} label={label} />
      {href ? (
        <a
          href={href}
          className={cn("text-right text-sm font-medium hover:underline", gold ? "text-gold-300" : "text-gray-200")}
        >
          {value}
        </a>
      ) : (
        <span className={cn("text-right text-sm font-medium", gold ? "text-gold-300" : "text-gray-200")}>
          {value}
        </span>
      )}
    </div>
  );
}

function ChipField({ label, values }: { label: string; values?: string[] }) {
  if (!values || values.length === 0) return null;
  return (
    <div className="mb-3 border-b border-white/[0.04] pb-3 last:border-0">
      <FieldLabel label={label} />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-gray-200">
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
