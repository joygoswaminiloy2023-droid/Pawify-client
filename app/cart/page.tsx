"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import EmptyState from "../components/EmptyState";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const router = useRouter();

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <EmptyState title="Your cart is empty" subtitle="Add some goodies for your pet!" />
        ) : (
          <>
            <div className="space-y-4 mb-8">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
                  >
                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{item.name}</h3>
                      <p className="text-teal-700 font-bold">৳{item.price}</p>
                    </div>

                    <div className="flex items-center border border-slate-200 rounded-full overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-slate-300 hover:text-red-500 transition p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-2xl font-bold text-slate-900">৳{total}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/checkout")}
                className="w-full gradient-brand text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </>
        )}
      </div>
    </>
  );
}