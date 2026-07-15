"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import {
  PawPrint,
  Heart,
  Package,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Bone,
  Fish,
  Bird,
  ShoppingBag,
} from "lucide-react";

// ─── Paw trail: the page's signature element ──────────────────────────
// A winding trail of paw prints down the left margin that fills in as
// the visitor scrolls — literally "following the trail" through
// Pawify's story. Ties back to the 404 page's "This trail went cold."
function PawTrail({ steps }: { steps: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const reduceMotion = useReducedMotion();

  const offsets = Array.from({ length: steps }, (_, i) => (i % 2 === 0 ? 0 : 22));

  return (
    <>
    <Navbar></Navbar>
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
    </>
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

// ─── Ambient floating blob, pure CSS/SVG — no external asset needed ───
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

import type { Variants } from "framer-motion";
import Navbar from "../components/Navbar";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-[#FBF9F6] text-[#0B1E39]">
      <PawTrail steps={9} />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative px-6 pb-24 pt-28 md:pl-24 md:pr-12 lg:pl-32">
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
            Our story
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0B1E39] sm:text-5xl md:text-6xl"
          >
            Everything your pet needs,
            <br />
            <span className="text-teal-600">made by people who love them too.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
          >
            Pawify started with a simple frustration: finding trustworthy pet
            vendors in one place shouldn&apos;t be this hard. So we built a
            marketplace where every seller is vetted, every product is
            reviewed by real owners, and every order arrives from someone who
            actually cares whether your dog liked it.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Browse the shop <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/vendor/apply"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
            >
              Sell on Pawify
            </Link>
          </motion.div>
        </motion.div>

        {/* Illustrated hero panel — pure SVG/CSS, nothing to load */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-teal-50 via-white to-amber-50 shadow-sm md:ml-24"
        >
          <div className="relative flex h-64 items-center justify-center gap-6 sm:h-80 md:h-[420px]">
            {[
              { Icon: PawPrint, delay: 0, size: "h-16 w-16", color: "text-teal-500" },
              { Icon: Heart, delay: 0.3, size: "h-10 w-10", color: "text-rose-400" },
              { Icon: Bone, delay: 0.6, size: "h-14 w-14", color: "text-amber-500" },
              { Icon: Fish, delay: 0.9, size: "h-11 w-11", color: "text-violet-400" },
              { Icon: Bird, delay: 1.2, size: "h-10 w-10", color: "text-teal-400" },
            ].map(({ Icon, delay, size, color }, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay }}
                className={`${color} opacity-90`}
              >
                <Icon className={size} strokeWidth={1.5} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── HOW PAWIFY WORKS ─────────────────────────────────── */}
      <section className="px-6 py-20 md:pl-24 md:pr-12 lg:pl-32">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mx-auto max-w-5xl"
        >
          <motion.div variants={fadeUp} className="mb-12 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              Three sides, one trail
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Built for pet parents, vendors, and the team keeping it fair.
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: Heart,
                color: "text-rose-600 bg-rose-50",
                title: "Pet parents",
                desc: "Browse reviewed products, track orders in real time, and shop with vendors other owners actually trust.",
              },
              {
                icon: Package,
                color: "text-amber-600 bg-amber-50",
                title: "Vendors",
                desc: "List products, manage stock, and reach customers directly — every listing reviewed before it goes live.",
              },
              {
                icon: ShieldCheck,
                color: "text-violet-600 bg-violet-50",
                title: "The Pawify team",
                desc: "We approve every vendor and every product, and step in fast if something's ever not right.",
              },
            ].map((role) => (
              <motion.div
                key={role.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${role.color}`}>
                  <role.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-800">{role.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {role.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── CATEGORY TILES (illustrated, replaces photo strip) ──── */}
      <section className="px-6 py-4 md:pl-24 md:pr-12 lg:pl-32">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {[
            { icon: Bone, label: "Food & Treats", color: "bg-amber-50 text-amber-600" },
            { icon: ShoppingBag, label: "Toys & Play", color: "bg-rose-50 text-rose-600" },
            { icon: ShieldCheck, label: "Health & Care", color: "bg-teal-50 text-teal-600" },
            { icon: PawPrint, label: "Accessories", color: "bg-violet-50 text-violet-600" },
          ].map((cat) => (
            <motion.div
              key={cat.label}
              variants={fadeUp}
              whileHover={{ y: -4, scale: 1.02 }}
              className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`rounded-2xl p-4 ${cat.color}`}>
                <cat.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-semibold text-slate-700">{cat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── VALUES ───────────────────────────────────────────── */}
      <section className="px-6 py-20 md:pl-24 md:pr-12 lg:pl-32">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mx-auto max-w-4xl"
        >
          <motion.h2
            variants={fadeUp}
            className="mb-10 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            What we actually care about.
          </motion.h2>

          <div className="space-y-6">
            {[
              {
                title: "Every vendor is reviewed, not just registered.",
                desc: "New sellers go through an approval step before their shop goes live — and every new or edited product is checked again before it's shown to buyers.",
              },
              {
                title: "Reviews come from real buyers.",
                desc: "Only people who've actually completed an order can leave a review, so ratings mean something.",
              },
              {
                title: "If something's wrong, a person looks at it.",
                desc: "Reports and disputes go to our admin team, not a bot. Accounts that break trust get restricted or removed.",
              },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                variants={fadeUp}
                className="flex gap-5 border-b border-slate-100 pb-6 last:border-0"
              >
                <span className="mt-1 font-mono text-sm text-teal-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-800">{value.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
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
              Ready to find your pet&apos;s next favorite thing?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Or if you sell pet products, we&apos;d love to have you on the trail.
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