"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RotateCcw, Home, PawPrint } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ rotate: -8 }}
          animate={{ rotate: [-8, 8, -8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 mx-auto mb-6 bg-teal-100 rounded-full flex items-center justify-center"
        >
          <PawPrint className="w-12 h-12 text-teal-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Ruff day.</h1>
        <p className="text-slate-500 mb-1">
          Something went wrong loading this page.
        </p>
        {error?.message && (
          <p className="text-xs text-slate-400 font-mono mt-2 mb-6 bg-slate-100 rounded-lg px-3 py-2 inline-block break-all">
            {error.message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 gradient-brand text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl transition"
          >
            <Home className="w-4 h-4" />
            Back to home
          </button>
        </div>
      </motion.div>
    </div>
  );
}