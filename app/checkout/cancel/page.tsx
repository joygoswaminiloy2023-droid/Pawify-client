"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, ArrowRight } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment cancelled</h1>
          <p className="text-slate-500 mb-8">
            No worries — your cart is still saved. You can try checking out again whenever you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/cart")}
              className="gradient-brand text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              Back to Cart <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}