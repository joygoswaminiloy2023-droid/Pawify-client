"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon, label, value, sublabel, color = "teal",
}: {
  icon: LucideIcon; label: string; value: string | number; sublabel?: string; color?: "teal" | "amber" | "rose" | "violet";
}) {
  const colors = {
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {sublabel && <p className="text-xs text-teal-600 mt-1 font-medium">{sublabel}</p>}
    </motion.div>
  );
}