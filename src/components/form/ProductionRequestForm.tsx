"use client";

import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import type { ProductionDetails, ProductionFormData } from "@/types";
import {
  contactSchema,
  servicesSchema,
  productionRequestSchema,
} from "@/lib/validations";
import { StepProgress } from "./StepProgress";
import {
  Step01Contact,
  Step02Services,
  Step03Production,
  Step04Shoot,
  Step05Budget,
} from "./steps";
import { ReviewSummary } from "./ReviewSummary";
import { SuccessScreen } from "./SuccessScreen";
import { LiveSummary } from "./LiveSummary";

const TOTAL_STEPS = 6;

const EMPTY: ProductionFormData = {
  fullName: "",
  phone: "",
  email: "",
  brandName: "",
  whatsapp: "",
  services: [],
  details: {},
  projectDescription: "",
  referenceLink: "",
  preferredShootDate: "",
  deliveryDeadline: "",
  flexibility: "",
  budget: "",
  _files: [],
};

type Errors = Partial<Record<string, string>>;

export function ProductionRequestForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<ProductionFormData>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const set = useCallback(
    <K extends keyof ProductionFormData>(key: K, value: ProductionFormData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => (prev[key as string] ? { ...prev, [key]: undefined } : prev));
    },
    []
  );

  // Nested setter for the dynamic per-service details.
  const setDetail = useCallback(
    (group: keyof ProductionDetails, key: string, value: string | string[]) => {
      setData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          [group]: { ...(prev.details[group] || {}), [key]: value },
        },
      }));
    },
    []
  );

  const validateStep = useCallback(
    (targetStep: number): boolean => {
      const next: Errors = {};

      if (targetStep === 1) {
        const r = contactSchema.safeParse(data);
        if (!r.success) {
          const fe = r.error.flatten().fieldErrors;
          for (const k of Object.keys(fe)) {
            const m = fe[k as keyof typeof fe]?.[0];
            if (m) next[k] = m;
          }
        }
      } else if (targetStep === 2) {
        const r = servicesSchema.safeParse(data);
        if (!r.success) next.services = "Please select at least one service you need";
      } else if (targetStep === 4) {
        if (data.projectDescription.trim().length < 15) {
          next.projectDescription =
            "Please tell us a little more about the shoot (at least 15 characters)";
        }
        if (
          data.referenceLink.trim() &&
          !/^(https?:\/\/|www\.)/i.test(data.referenceLink.trim())
        ) {
          next.referenceLink = "Please enter a valid link (http:// or https://)";
        }
      } else if (targetStep === 5) {
        if (!data.budget) next.budget = "Please select a production budget";
      }

      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [data]
  );

  const goNext = useCallback(() => {
    if (!validateStep(step)) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [step, validateStep]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const goToStep = useCallback((target: number) => {
    setDirection(target < step ? -1 : 1);
    setErrors({});
    setStep(Math.min(Math.max(target, 1), TOTAL_STEPS));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const stepOfField: Record<string, number> = {
    fullName: 1, phone: 1, email: 1, brandName: 1, whatsapp: 1,
    services: 2,
    projectDescription: 4, referenceLink: 4,
    budget: 5,
  };

  const submit = useCallback(async () => {
    if (submitting || submittedRef.current) return;

    // Full-schema safety net before hitting the server.
    const full = productionRequestSchema.safeParse(data);
    if (!full.success) {
      const fe = full.error.flatten().fieldErrors;
      const firstKey = Object.keys(fe)[0];
      if (firstKey && stepOfField[firstKey]) setStep(stepOfField[firstKey]);
      const next: Errors = {};
      for (const k of Object.keys(fe)) {
        const m = fe[k as keyof typeof fe]?.[0];
        if (m) next[k] = m;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Build multipart: JSON payload (no File objects) + the files themselves.
      const { _files, ...payload } = full.data as ProductionFormData;
      const form = new FormData();
      form.append("payload", JSON.stringify(payload));
      (data._files || []).forEach((file) => form.append("files", file));

      const res = await fetch("/api/request", { method: "POST", body: form });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Something went wrong. Please try again.");
      }

      submittedRef.current = true;
      setReference(json.reference || "CB-----");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting, data]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
      if (step < TOTAL_STEPS) goNext();
      else submit();
    }
  };

  if (submitted) {
    return (
      <div className="glass-main-card w-full max-w-2xl rounded-[28px] p-8 sm:p-12">
        <SuccessScreen brandName={data.brandName} reference={reference} />
      </div>
    );
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <div className="glass-main-card w-full max-w-5xl rounded-[28px] overflow-hidden">
      <div className="grid lg:grid-cols-[1.6fr_1fr]">
        {/* ── Form column ── */}
        <div className="p-6 sm:p-9 lg:p-10">
          <StepProgress current={step} total={TOTAL_STEPS} />

          <form
            onSubmit={(e) => e.preventDefault()}
            onKeyDown={onKeyDown}
            className="mt-8"
            noValidate
          >
            <div className="relative min-h-[360px]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step === 1 && <Step01Contact data={data} errors={errors} set={set} />}
                  {step === 2 && <Step02Services data={data} errors={errors} set={set} />}
                  {step === 3 && <Step03Production data={data} setDetail={setDetail} />}
                  {step === 4 && <Step04Shoot data={data} errors={errors} set={set} />}
                  {step === 5 && <Step05Budget data={data} errors={errors} set={set} />}
                  {step === 6 && <ReviewSummary data={data} goToStep={goToStep} />}
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
                  role="alert"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{submitError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Navigation ── */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 1 || submitting}
                className="btn-ghost focus-gold inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="btn-gold-glow focus-gold inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  aria-busy={submitting}
                  className="btn-gold-glow focus-gold inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold uppercase tracking-wider"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Request a Quote
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Brand / live-summary column ── */}
        <LiveSummary data={data} step={step} />
      </div>
    </div>
  );
}
