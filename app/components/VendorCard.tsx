"use client";
import { motion } from "framer-motion";
import { Store, Star } from "lucide-react";

export default function VendorCard({ vendor }: { vendor: any }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow"
    >
      <div className="h-24 gradient-brand relative">
        {vendor.banner && (
          <img src={vendor.banner} alt="" className="w-full h-full object-cover opacity-80" />
        )}
      </div>
      <div className="p-6 -mt-10 relative">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border-4 border-white overflow-hidden mb-3">
          {vendor.logo ? (
            <img src={vendor.logo} alt={vendor.shopName} className="w-full h-full object-cover" />
          ) : (
            <Store className="w-6 h-6 text-teal-600" />
          )}
        </div>
        <h3 className="font-bold text-lg text-slate-900">{vendor.shopName}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{vendor.description}</p>
        <div className="flex items-center gap-1 text-sm text-amber-500">
          <Star className="w-4 h-4 fill-amber-400" />
          <span className="font-semibold">{vendor.rating?.toFixed(1) || "New"}</span>
        </div>
      </div>
    </motion.div>
  );
}