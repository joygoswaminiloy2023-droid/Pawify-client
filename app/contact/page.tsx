"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import {
  PawPrint,
  Mail,
  Clock,
  Package,
  ArrowRight,
  Sparkles,
  Send,
} from "lucide-react";
import Navbar from "../components/Navbar";

// ─── Paw trail: same signature element as the About page ─────────────
function PawTrail({ steps }: { steps: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const reduceMotion = useReducedMotion();

  const offsets = Array.from({ length: steps }, (_, i) => (i % 2 === 0 ? 0 : 22));

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-4 top-0 hidden h-full w-10 md:block lg:left-10"
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-10">
        {offsets.map((offset, i) => (
          <PawStep
            key={i}
            index={i}
            steps={steps}
            offset={offset}
            scrollYProgress={scrollYProgress}
            reduceMotion={!!reduceMotion}
          />
        ))}
      </div>
    </div>
  );
}

function PawStep({
  index,
  steps,
  offset,
  scrollYProgress,
  reduceMotion,
}: {
  index: number;
  steps: number;
  offset: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduceMotion: boolean;
}) {
  const start = index / steps;
  const end = (index + 0.6) / steps;
  const rawOpacity = useTransform(scrollYProgress, [start, end], [0.12, 1]);
  const rawScale = useTransform(scrollYProgress, [start, end], [0.6, 1]);

  return (
    <motion.div
      style={{
        opacity: reduceMotion ? 1 : rawOpacity,
        scale: reduceMotion ? 1 : rawScale,
        marginLeft: offset,
      }}
      className="text-teal-500"
    >
      <PawPrint className="h-5 w-5" fill="currentColor" strokeWidth={0} />
    </motion.div>
  );
}

function FloatingBlob({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }}
      className={`pointer-events-none absolute rounded-full blur-2xl ${className}`}
    />
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const TOPICS = ["Order & shipping", "Returns & refunds", "Vendor support", "Something else"];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up to your /api/contact route or email service
    setSubmitted(true);
  }

  return (
    <div className="relative overflow-hidden bg-[#FBF9F6] text-[#0B1E39]">
      <Navbar />
      <PawTrail steps={6} />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative px-6 pb-16 pt-28 md:pl-24 md:pr-12 lg:pl-32">
        <FloatingBlob className="right-[-4rem] top-10 h-56 w-56 bg-teal-200/40" delay={0} />
        <FloatingBlob className="right-16 top-64 h-40 w-40 bg-amber-200/40" delay={1.5} />

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="relative mx-auto max-w-3xl"
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Get in touch
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0B1E39] sm:text-5xl md:text-6xl"
          >
            Got a question?
            <br />
            <span className="text-teal-600">We&apos;re listening.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
          >
            Whether it&apos;s an order that went sideways, a product question,
            or you want to sell on Pawify — send us a message and a real
            person will get back to you within a day.
          </motion.p>
        </motion.div>
      </section>

      {/* ─── FORM + SIDE INFO ─────────────────────────────────── */}
      <section className="relative px-6 pb-24 md:pl-24 md:pr-12 lg:pl-32">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1.3fr_1fr]"
        >
          {/* Form card */}
          <motion.div
            variants={fadeUp}
            className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
          >
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="inline-flex rounded-2xl bg-teal-50 p-3 text-teal-600">
                  <PawPrint className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">
                  Got it — we&apos;re on it.
                </h3>
                <p className="max-w-xs text-sm text-slate-500">
                  Thanks for reaching out. Look out for a reply at the email
                  address you gave us.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                        topic === t
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Your name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jamie Rivera"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jamie@email.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder={`Tell us about your ${topic.toLowerCase()}...`}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Send message <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </motion.div>

          {/* Side info cards, styled like the "three sides" grid on About */}
          <div className="flex flex-col gap-5">
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-teal-50 p-3 text-teal-600">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-800">Email us directly</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Prefer email? Reach the team at{" "}
                <a href="mailto:support@pawify.app" className="font-medium text-teal-700 underline underline-offset-2">
                  support@pawify.app
                </a>
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-800">Response time</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Most messages get a reply within one business day.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-violet-50 p-3 text-violet-600">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-800">Selling on Pawify?</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Vendor questions go to a dedicated queue — just pick{" "}
                <span className="font-medium text-slate-700">
                  &quot;Vendor support&quot;
                </span>{" "}
                above.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── CTA, matching About page's closing panel ─────────── */}
      <section className="px-6 pb-28 pt-4 md:pl-24 md:pr-12 lg:pl-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-4xl flex-col items-start gap-6 rounded-3xl border border-teal-100 bg-teal-50 px-8 py-12 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0B1E39] sm:text-3xl">
              Still have questions?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Browse the shop while you wait, or check our help articles.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Browse the shop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}