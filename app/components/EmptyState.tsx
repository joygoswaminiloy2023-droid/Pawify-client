"use client";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";

export default function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-4">
        <PawPrint className="w-10 h-10 text-teal-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
    </motion.div>
  );
}