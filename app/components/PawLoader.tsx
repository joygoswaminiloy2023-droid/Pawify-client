"use client";
import { motion, AnimatePresence } from "framer-motion";

// Custom paw shape — same signature shape used across all loader variants
function PawShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <ellipse cx="32" cy="42" rx="15" ry="12" />
      <ellipse cx="12" cy="22" rx="7" ry="9" transform="rotate(-18 12 22)" />
      <ellipse cx="28" cy="12" rx="7.5" ry="10" transform="rotate(-6 28 12)" />
      <ellipse cx="44" cy="12" rx="7.5" ry="10" transform="rotate(6 44 12)" />
      <ellipse cx="56" cy="24" rx="7" ry="9" transform="rotate(20 56 24)" />
    </svg>
  );
}

type Size = "sm" | "md" | "lg";
type Variant = "trail" | "spin";

interface LoaderProps {
  /** "trail" = walking paw trail (page/section loading). "spin" = single spinning paw (buttons, inline, tight spaces). */
  variant?: Variant;
  size?: Size;
  label?: string;
  /** Centers within the full viewport height — use for whole-page loading states. */
  fullScreen?: boolean;
  /** Renders as a fixed translucent backdrop above existing content — use to block UI during an action (e.g. submitting a payment). */
  overlay?: boolean;
  /** Show/hide when used as an overlay, so it can live permanently in a component tree and toggle. */
  show?: boolean;
  className?: string;
}

// Fluid, breakpoint-aware sizing — widths use responsive Tailwind steps instead
// of one fixed px value, and everything caps out with max-w-full so it never
// overflows a narrow viewport.
const TRAIL_SIZE: Record<Size, { paw: string; wrapper: string; text: string }> = {
  sm: {
    paw: "w-3.5 h-3.5 sm:w-4 sm:h-4",
    wrapper: "w-full max-w-[9rem] sm:max-w-[10rem] h-10 sm:h-12",
    text: "text-xs",
  },
  md: {
    paw: "w-5 h-5 sm:w-6 sm:h-6",
    wrapper: "w-full max-w-[13rem] sm:max-w-[16rem] h-16 sm:h-20",
    text: "text-xs sm:text-sm",
  },
  lg: {
    paw: "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8",
    wrapper: "w-full max-w-[16rem] sm:max-w-[20rem] md:max-w-[22rem] h-20 sm:h-24",
    text: "text-sm sm:text-base",
  },
};

const SPIN_SIZE: Record<Size, string> = {
  sm: "w-3.5 h-3.5 sm:w-4 sm:h-4",
  md: "w-5 h-5 sm:w-6 sm:h-6",
  lg: "w-7 h-7 sm:w-9 sm:h-9",
};

const TRAIL = [0, 1, 2, 3, 4];

function TrailLoader({ size = "md", label }: { size?: Size; label?: string }) {
  const { paw, wrapper, text } = TRAIL_SIZE[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 w-full px-4">
      <div className={`relative mx-auto overflow-hidden ${wrapper}`}>
        <motion.div
          className="absolute inset-0 m-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-teal-300/30 blur-2xl"
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute left-0 right-0 bottom-3 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />

        {TRAIL.map((i) => {
          const leftFoot = i % 2 === 0;
          return (
            <motion.div
              key={i}
              className="absolute bottom-2"
              style={{ left: "100%" }}
              animate={{
                left: ["100%", "-10%"],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.5],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
                times: [0, 0.15, 0.75, 1],
              }}
            >
              <PawShape className={`${paw} text-teal-600 ${leftFoot ? "-translate-y-2" : "translate-y-2"}`} />
            </motion.div>
          );
        })}
      </div>

      {label && (
        <motion.p
          className={`${text} font-medium text-slate-400 tracking-wide text-center max-w-[16rem] sm:max-w-xs break-words`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}

function SpinLoader({ size = "md", label }: { size?: Size; label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap px-2">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${SPIN_SIZE[size]} shrink-0`}
      >
        <PawShape className="w-full h-full text-teal-600" />
      </motion.div>
      {label && <span className="text-xs sm:text-sm font-medium text-slate-500 text-center">{label}</span>}
    </div>
  );
}

export default function Loader({
  variant = "trail",
  size = "md",
  label = "Loading...",
  fullScreen = false,
  overlay = false,
  show = true,
  className = "",
}: LoaderProps) {
  const core = variant === "trail" ? <TrailLoader size={size} label={label} /> : <SpinLoader size={size} label={label} />;

  if (overlay) {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-white/75 backdrop-blur-sm px-4 overflow-x-hidden ${className}`}
          >
            {core}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (fullScreen) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center px-4 overflow-x-hidden ${className}`}>
        {core}
      </div>
    );
  }

  return <div className={`w-full py-10 sm:py-16 flex items-center justify-center px-4 overflow-x-hidden ${className}`}>{core}</div>;
}