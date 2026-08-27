"use client";

import type { ProductionDetails, ProductionFormData, ServiceId } from "@/types";
import {
  BUDGET_OPTIONS,
  FLEXIBILITY_OPTIONS,
  SHOOT_SERVICES,
} from "@/lib/constants";
import {
  TextField,
  TextAreaField,
  DateField,
  SingleOptionGrid,
} from "./fields";
import { ServiceCards } from "./ServiceCards";
import { DynamicSections } from "./DynamicSections";
import { FileUpload } from "./FileUpload";

type Errors = Partial<Record<string, string>>;

interface StepProps {
  data: ProductionFormData;
  errors: Errors;
  set: <K extends keyof ProductionFormData>(
    key: K,
    value: ProductionFormData[K]
  ) => void;
}

export function StepHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-7">
      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold-400/90">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold uppercase text-white leading-[1.05]">
        {title}
      </h2>
      <div className="accent-bar-gold mt-3.5" />
      {subtitle && <p className="mt-3.5 text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
}

/* ───────────────────  STEP 01 — CONTACT  ─────────────────── */
export function Step01Contact({ data, errors, set }: StepProps) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 01 — Contact"
        title="Let's get in touch"
        subtitle="Just the essentials so our Sales team can reach you."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="fullName"
          label="Name"
          value={data.fullName}
          onChange={(v) => set("fullName", v)}
          error={errors.fullName}
          placeholder="Ahmed Mohamed"
          autoComplete="name"
          required
        />
        <TextField
          id="brandName"
          label="Brand / Company Name"
          value={data.brandName}
          onChange={(v) => set("brandName", v)}
          error={errors.brandName}
          placeholder="Your brand"
          autoComplete="organization"
          required
        />
        <TextField
          id="phone"
          label="Phone Number"
          type="tel"
          inputMode="tel"
          value={data.phone}
          onChange={(v) => set("phone", v)}
          error={errors.phone}
          placeholder="+20 100 123 4567"
          autoComplete="tel"
          required
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          value={data.email}
          onChange={(v) => set("email", v)}
          error={errors.email}
          placeholder="you@company.com"
          autoComplete="email"
          required
        />
        <div className="sm:col-span-2">
          <TextField
            id="whatsapp"
            label="WhatsApp Number"
            type="tel"
            inputMode="tel"
            value={data.whatsapp}
            onChange={(v) => set("whatsapp", v)}
            error={errors.whatsapp}
            placeholder="+20 100 123 4567"
            optional
          />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────  STEP 02 — SERVICES  ─────────────────── */
export function Step02Services({ data, errors, set }: StepProps) {
  const toggle = (id: ServiceId) => {
    const next = data.services.includes(id)
      ? data.services.filter((s) => s !== id)
      : [...data.services, id];
    set("services", next);
  };

  return (
    <div>
      <StepHeader
        eyebrow="Step 02 — What do you need?"
        title="Pick your services"
        subtitle="Select everything you need — you can combine as many as you like."
      />
      <ServiceCards selected={data.services} onToggle={toggle} error={errors.services} />
    </div>
  );
}

/* ───────────────────  STEP 03 — PRODUCTION DETAILS  ─────────────────── */
export function Step03Production({
  data,
  setDetail,
}: {
  data: ProductionFormData;
  setDetail: (group: keyof ProductionDetails, key: string, value: string | string[]) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 03 — Production Details"
        title="The specifics"
        subtitle="Only the questions relevant to what you selected — nothing more."
      />
      <DynamicSections
        services={data.services}
        details={data.details}
        setDetail={setDetail}
      />
    </div>
  );
}

/* ───────────────────  STEP 04 — THE SHOOT (brief + files + scheduling)  ─────────────────── */
export function Step04Shoot({ data, errors, set }: StepProps) {
  const involvesShoot = data.services.some((s) => SHOOT_SERVICES.includes(s));
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <StepHeader
        eyebrow="Step 04 — The Shoot"
        title="Tell us about it"
        subtitle="Your brief, any references, and when you're planning to roll."
      />

      <div className="space-y-6">
        <TextAreaField
          id="projectDescription"
          label="Tell us about the shoot"
          value={data.projectDescription}
          onChange={(v) => set("projectDescription", v)}
          error={errors.projectDescription}
          placeholder="Tell us what you're planning, what you're trying to create, and anything important our production team should know."
          rows={6}
          maxLength={4000}
          required
        />

        {/* References & files */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 sm:p-6">
          <h3 className="font-heading text-lg font-semibold uppercase tracking-wide text-white">
            Have references?
          </h3>
          <p className="mt-1 mb-4 text-[13px] text-gray-400">
            Share anything that helps us picture it — briefs, images, reference
            videos, scripts or moodboards.
          </p>
          <FileUpload files={data._files || []} onChange={(f) => set("_files", f)} />
          <div className="mt-4">
            <TextField
              id="referenceLink"
              label="Reference Link"
              value={data.referenceLink}
              onChange={(v) => set("referenceLink", v)}
              error={errors.referenceLink}
              placeholder="Google Drive / YouTube / Instagram / other reference"
              optional
            />
          </div>
        </div>

        {/* Scheduling */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 sm:p-6">
          <h3 className="font-heading text-lg font-semibold uppercase tracking-wide text-white">
            Schedule &amp; Delivery
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {involvesShoot && (
              <DateField
                id="preferredShootDate"
                label="Preferred Shooting Date"
                value={data.preferredShootDate}
                onChange={(v) => set("preferredShootDate", v)}
                min={today}
                optional
              />
            )}
            <DateField
              id="deliveryDeadline"
              label="Final Delivery Deadline"
              value={data.deliveryDeadline}
              onChange={(v) => set("deliveryDeadline", v)}
              min={today}
              optional
            />
          </div>
          <div className="mt-5">
            <SingleOptionGrid
              legend="How flexible is your schedule?"
              options={FLEXIBILITY_OPTIONS}
              value={data.flexibility}
              onSelect={(v) => set("flexibility", v)}
              columns={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────  STEP 05 — BUDGET  ─────────────────── */
export function Step05Budget({ data, errors, set }: StepProps) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 05 — Budget"
        title="What's your production budget?"
        subtitle="A rough range is perfect — it helps us tailor the right quote."
      />
      <SingleOptionGrid
        legend="Select a range"
        options={BUDGET_OPTIONS}
        value={data.budget}
        onSelect={(v) => set("budget", v)}
        error={errors.budget}
        columns={2}
        required
      />
    </div>
  );
}
