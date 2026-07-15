"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowRight, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import EmptyState from "../components/EmptyState";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address.");
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      // Group items by vendor — your order schema expects a single vendorId per order.
      // If you support multi-vendor carts, this creates one order per vendor.
      const itemsByVendor: Record<string, typeof items> = {};
      for (const item of items) {
        if (!itemsByVendor[item.vendorId]) itemsByVendor[item.vendorId] = [];
        itemsByVendor[item.vendorId].push(item);
      }

      const vendorIds = Object.keys(itemsByVendor);
      if (vendorIds.length > 1) {
        toast.error("Please checkout one vendor's items at a time for now.");
        setLoading(false);
        return;
      }

      const vendorId = vendorIds[0];
      const vendorItems = itemsByVendor[vendorId];

      // 1. Create the order
      const orderRes = await api.post("/api/orders", {
        vendorId,
        items: vendorItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        shippingAddress,
      });

      const orderId = orderRes.orderId;

      // 2. Create the Stripe checkout session for that order
      const sessionRes = await api.post("/api/payments/create-checkout-session", {
        orderId,
      });

      if (!sessionRes.url) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      // 3. Redirect to Stripe's hosted checkout
      window.location.href = sessionRes.url;
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        {items.length === 0 ? (
          <EmptyState title="Your cart is empty" subtitle="Add something before checking out!" />
        ) : (
          <>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
              <h3 className="font-semibold text-slate-800 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-slate-800">৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-slate-500">Total</span>
                <span className="text-2xl font-bold text-slate-900">৳{total}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1 flex items-center gap-1 mb-2">
                <MapPin className="w-3.5 h-3.5" /> Shipping Address
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                placeholder="House, road, area, city..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition resize-none"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={loading}
              className="w-full gradient-brand text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Redirecting to payment..." : "Pay with Stripe"} <ArrowRight className="w-5 h-5" />
            </motion.button>
          </>
        )}
      </div>
    </>
  );
}