"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { api } from "@/lib/api";
import Navbar from "../../components/Navbar";

type Status = "confirming" | "success" | "error";

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<Status>("confirming");
  const [errorMsg, setErrorMsg] = useState("");

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!sessionId || !orderId) {
      setStatus("error");
      setErrorMsg("Missing payment details in the URL.");
      return;
    }

    const confirm = async () => {
      try {
        await api.post("/api/payments/confirm-purchase", { sessionId, orderId });
        clearCart();
        setStatus("success");
      } catch (err: any) {
        try {
          const statusRes = await api.get(`/api/payments/status/${orderId}`);
          if (["paid", "shipped", "delivered"].includes(statusRes.status)) {
            clearCart();
            setStatus("success");
            return;
          }
        } catch {
          // ignore, fall through to error
        }
        setStatus("error");
        setErrorMsg(err.message || "Could not confirm your payment.");
      }
    };

    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, orderId]);

  return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        {status === "confirming" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Loader2 className="w-14 h-14 text-teal-600 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Confirming your payment...</h1>
            <p className="text-slate-500">Please don&apos;t close this page.</p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
            >
              <CheckCircle2 className="w-16 h-16 text-teal-600 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment successful! 🐾</h1>
            <p className="text-slate-500 mb-8">
              Your order has been placed and your pet&apos;s goodies are on the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/dashboard/user")}
                className="gradient-brand text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
              >
                View My Orders <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">We couldn&apos;t confirm your payment</h1>
            <p className="text-slate-500 mb-8">
              {errorMsg} If money was deducted, your order will update automatically shortly — check
              "My Orders&quot; in a few minutes, or contact support.
            </p>
            <button
              onClick={() => router.push("/dashboard/user")}
              className="gradient-brand text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Go to My Orders
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}