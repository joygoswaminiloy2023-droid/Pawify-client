"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import VendorCard from "../components/VendorCard";
import PawLoader from "../components/PawLoader";
import EmptyState from "../components/EmptyState";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/vendor`)
      .then((res) => res.json())
      .then((data) => setVendors(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Our Vendors</h1>
          <p className="text-slate-500">Verified shops trusted by pet parents across Bangladesh.</p>
        </motion.div>

        {loading ? (
          <PawLoader />
        ) : vendors.length === 0 ? (
          <EmptyState title="No vendors yet" subtitle="Check back soon!" />
        ) : (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            {vendors.map((v) => (
              <motion.div key={v._id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <VendorCard vendor={v} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}