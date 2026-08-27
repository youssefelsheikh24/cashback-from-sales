"use client";

import {
  VIDEO_CREATING_OPTIONS,
  VIDEO_DURATION_OPTIONS,
  SCRIPT_OPTIONS,
  CONCEPT_OPTIONS,
  YES_NO,
  MONTAGE_FOOTAGE_OPTIONS,
  MONTAGE_NEEDS_OPTIONS,
  PHOTO_SUBJECT_OPTIONS,
  PHOTO_TYPE_OPTIONS,
  RETOUCH_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  SHOOTING_DAYS_OPTIONS,
  NEED_OPTIONS,
  STUDIO_SHOOT_OPTIONS,
  STUDIO_EQUIPMENT_OPTIONS,
  CREW_ROLE_OPTIONS,
  CREW_LOCATION_OPTIONS,
  FULL_PRODUCTION_NEEDS,
  SERVICES,
} from "@/lib/constants";
import type { ProductionDetails, ServiceId } from "@/types";
import {
  TextField,
  NumberField,
  DateField,
  TextAreaField,
  SingleOptionGrid,
  MultiOptionGrid,
} from "./fields";

type DetailKey = keyof ProductionDetails;

interface Props {
  services: ServiceId[];
  details: ProductionDetails;
  setDetail: (group: DetailKey, key: string, value: string | string[]) => void;
}

/* A framed block wrapping each service's questions, with its icon + title. */
function ServiceBlock({
  id,
  children,
}: {
  id: ServiceId;
  children: React.ReactNode;
}) {
  const svc = SERVICES.find((s) => s.id === id)!;
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-xl">
          {svc.icon}
        </span>
        <div>
          <h3 className="font-heading text-lg font-semibold uppercase tracking-wide text-white">
            {svc.title}
          </h3>
          <div className="accent-bar-gold mt-1.5 !w-10" />
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function DynamicSections({ services, details, setDetail }: Props) {
  const has = (id: ServiceId) => services.includes(id);

  const toggleIn = (
    group: DetailKey,
    key: string,
    current: string[] | undefined,
    value: string
  ) => {
    const arr = current || [];
    const next = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    setDetail(group, key, next);
  };

  return (
    <div className="space-y-5">
      {/* ── VIDEO PRODUCTION ── */}
      {has("video-production") && (
        <ServiceBlock id="video-production">
          <SingleOptionGrid
            legend="What are you creating?"
            options={VIDEO_CREATING_OPTIONS}
            value={details.videoProduction?.creating || ""}
            onSelect={(v) => setDetail("videoProduction", "creating", v)}
            columns={3}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="vp-count"
              label="How many videos?"
              value={details.videoProduction?.numberOfVideos || ""}
              onChange={(v) => setDetail("videoProduction", "numberOfVideos", v)}
              placeholder="e.g. 3"
            />
          </div>
          <SingleOptionGrid
            legend="Approximate duration per video"
            options={VIDEO_DURATION_OPTIONS}
            value={details.videoProduction?.durationPerVideo || ""}
            onSelect={(v) => setDetail("videoProduction", "durationPerVideo", v)}
            columns={3}
          />
          <SingleOptionGrid
            legend="Do you already have a script?"
            options={SCRIPT_OPTIONS}
            value={details.videoProduction?.hasScript || ""}
            onSelect={(v) => setDetail("videoProduction", "hasScript", v)}
            columns={3}
          />
          <SingleOptionGrid
            legend="Do you already have a concept?"
            options={CONCEPT_OPTIONS}
            value={details.videoProduction?.hasConcept || ""}
            onSelect={(v) => setDetail("videoProduction", "hasConcept", v)}
            columns={3}
          />
        </ServiceBlock>
      )}

      {/* ── MONTAGE / VIDEO EDITING ── */}
      {has("montage") && (
        <ServiceBlock id="montage">
          <SingleOptionGrid
            legend="Do you already have the footage?"
            options={YES_NO}
            value={details.montage?.hasFootage || ""}
            onSelect={(v) => setDetail("montage", "hasFootage", v)}
            columns={2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="mo-count"
              label="How many videos need editing?"
              value={details.montage?.numberToEdit || ""}
              onChange={(v) => setDetail("montage", "numberToEdit", v)}
              placeholder="e.g. 5"
            />
          </div>
          <SingleOptionGrid
            legend="Approximate total footage"
            options={MONTAGE_FOOTAGE_OPTIONS}
            value={details.montage?.totalFootage || ""}
            onSelect={(v) => setDetail("montage", "totalFootage", v)}
            columns={3}
          />
          <MultiOptionGrid
            legend="What do you need? (select all that apply)"
            options={MONTAGE_NEEDS_OPTIONS}
            selected={details.montage?.needs || []}
            onToggle={(v) => toggleIn("montage", "needs", details.montage?.needs, v)}
            columns={3}
          />
          <SingleOptionGrid
            legend="Do you have a reference for the editing style?"
            options={YES_NO}
            value={details.montage?.hasReference || ""}
            onSelect={(v) => setDetail("montage", "hasReference", v)}
            columns={2}
          />
          {details.montage?.hasReference === "Yes" && (
            <p className="rounded-lg border border-gold-500/20 bg-gold-500/[0.06] px-3.5 py-2.5 text-xs text-gold-200/90">
              Great — you can attach your reference in the “References &amp; Files”
              section on the next step.
            </p>
          )}
        </ServiceBlock>
      )}

      {/* ── PHOTOGRAPHY ── */}
      {has("photography") && (
        <ServiceBlock id="photography">
          <SingleOptionGrid
            legend="What are you shooting?"
            options={PHOTO_SUBJECT_OPTIONS}
            value={details.photography?.shooting || ""}
            onSelect={(v) => setDetail("photography", "shooting", v)}
            columns={3}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="ph-subjects"
              label="Approx. number of subjects / products"
              value={details.photography?.numberOfSubjects || ""}
              onChange={(v) => setDetail("photography", "numberOfSubjects", v)}
              placeholder="e.g. 12"
            />
          </div>
          <SingleOptionGrid
            legend="What type of photography?"
            options={PHOTO_TYPE_OPTIONS}
            value={details.photography?.type || ""}
            onSelect={(v) => setDetail("photography", "type", v)}
            columns={2}
          />
          <SingleOptionGrid
            legend="Do you need photo editing / retouching?"
            options={RETOUCH_OPTIONS}
            value={details.photography?.needsRetouching || ""}
            onSelect={(v) => setDetail("photography", "needsRetouching", v)}
            columns={3}
          />
        </ServiceBlock>
      )}

      {/* ── SHOOTING LOCATION ── */}
      {has("location") && (
        <ServiceBlock id="location">
          <SingleOptionGrid
            legend="What type of location are you looking for?"
            options={LOCATION_TYPE_OPTIONS}
            value={details.location?.locationType || ""}
            onSelect={(v) => setDetail("location", "locationType", v)}
            columns={3}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="loc-area"
              label="Preferred area"
              value={details.location?.preferredArea || ""}
              onChange={(v) => setDetail("location", "preferredArea", v)}
              placeholder="e.g. New Cairo, Zamalek…"
            />
            <DateField
              id="loc-date"
              label="Preferred shooting date"
              value={details.location?.preferredDate || ""}
              onChange={(v) => setDetail("location", "preferredDate", v)}
            />
            <SingleOptionGrid
              legend="How many shooting days?"
              options={SHOOTING_DAYS_OPTIONS}
              value={details.location?.shootingDays || ""}
              onSelect={(v) => setDetail("location", "shootingDays", v)}
              columns={2}
            />
            <NumberField
              id="loc-hours"
              label="Approximate shooting hours"
              value={details.location?.shootingHours || ""}
              onChange={(v) => setDetail("location", "shootingHours", v)}
              placeholder="e.g. 8"
            />
            <NumberField
              id="loc-people"
              label="Number of people on set"
              value={details.location?.peopleOnSet || ""}
              onChange={(v) => setDetail("location", "peopleOnSet", v)}
              placeholder="e.g. 10"
            />
          </div>
          <SingleOptionGrid
            legend="Do you need equipment?"
            options={NEED_OPTIONS}
            value={details.location?.needEquipment || ""}
            onSelect={(v) => setDetail("location", "needEquipment", v)}
            columns={3}
          />
          <SingleOptionGrid
            legend="Do you need a production crew?"
            options={NEED_OPTIONS}
            value={details.location?.needCrew || ""}
            onSelect={(v) => setDetail("location", "needCrew", v)}
            columns={3}
          />
        </ServiceBlock>
      )}

      {/* ── STUDIO ── */}
      {has("studio") && (
        <ServiceBlock id="studio">
          <SingleOptionGrid
            legend="What will you be shooting?"
            options={STUDIO_SHOOT_OPTIONS}
            value={details.studio?.shooting || ""}
            onSelect={(v) => setDetail("studio", "shooting", v)}
            columns={3}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <DateField
              id="st-date"
              label="Preferred date"
              value={details.studio?.preferredDate || ""}
              onChange={(v) => setDetail("studio", "preferredDate", v)}
            />
            <NumberField
              id="st-hours"
              label="Number of hours"
              value={details.studio?.hours || ""}
              onChange={(v) => setDetail("studio", "hours", v)}
              placeholder="e.g. 4"
            />
            <NumberField
              id="st-people"
              label="Number of people"
              value={details.studio?.people || ""}
              onChange={(v) => setDetail("studio", "people", v)}
              placeholder="e.g. 6"
            />
          </div>
          <MultiOptionGrid
            legend="Equipment needed (select all that apply)"
            options={STUDIO_EQUIPMENT_OPTIONS}
            selected={details.studio?.equipment || []}
            onToggle={(v) => toggleIn("studio", "equipment", details.studio?.equipment, v)}
            columns={3}
          />
        </ServiceBlock>
      )}

      {/* ── PRODUCTION CREW ── */}
      {has("crew") && (
        <ServiceBlock id="crew">
          <MultiOptionGrid
            legend="What crew do you need? (select all that apply)"
            options={CREW_ROLE_OPTIONS}
            selected={details.crew?.roles || []}
            onToggle={(v) => toggleIn("crew", "roles", details.crew?.roles, v)}
            columns={3}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="cr-days"
              label="Number of shooting days"
              value={details.crew?.shootingDays || ""}
              onChange={(v) => setDetail("crew", "shootingDays", v)}
              placeholder="e.g. 2"
            />
            <DateField
              id="cr-date"
              label="Preferred shooting date"
              value={details.crew?.preferredDate || ""}
              onChange={(v) => setDetail("crew", "preferredDate", v)}
            />
          </div>
          <SingleOptionGrid
            legend="Shooting location"
            options={CREW_LOCATION_OPTIONS}
            value={details.crew?.location || ""}
            onSelect={(v) => setDetail("crew", "location", v)}
            columns={3}
          />
        </ServiceBlock>
      )}

      {/* ── FULL PRODUCTION ── */}
      {has("full-production") && (
        <ServiceBlock id="full-production">
          <TextAreaField
            id="fp-producing"
            label="What are you producing?"
            value={details.fullProduction?.producing || ""}
            onChange={(v) => setDetail("fullProduction", "producing", v)}
            placeholder="Briefly describe the production you have in mind…"
            rows={3}
            maxLength={2000}
          />
          <MultiOptionGrid
            legend="What do you need from CashBack? (select all that apply)"
            options={FULL_PRODUCTION_NEEDS}
            selected={details.fullProduction?.needs || []}
            onToggle={(v) =>
              toggleIn("fullProduction", "needs", details.fullProduction?.needs, v)
            }
            columns={3}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              id="fp-count"
              label="Number of final videos"
              value={details.fullProduction?.numberOfVideos || ""}
              onChange={(v) => setDetail("fullProduction", "numberOfVideos", v)}
              placeholder="e.g. 4"
            />
            <DateField
              id="fp-date"
              label="Preferred shooting date"
              value={details.fullProduction?.preferredDate || ""}
              onChange={(v) => setDetail("fullProduction", "preferredDate", v)}
            />
            <DateField
              id="fp-deadline"
              label="Final delivery deadline"
              value={details.fullProduction?.deliveryDeadline || ""}
              onChange={(v) => setDetail("fullProduction", "deliveryDeadline", v)}
            />
          </div>
        </ServiceBlock>
      )}
    </div>
  );
}
