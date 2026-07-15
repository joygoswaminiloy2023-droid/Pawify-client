"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, Store, Mail, Loader2, ArrowLeft, CheckCircle, XCircle, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function VendorWaitingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      checkVendorStatus();
    }
  }, [user, authLoading]);

  const checkVendorStatus = async () => {
    setChecking(true);
    try {
      const res = await api.get("/api/vendor/status");
      console.log("Vendor status response:", res.data);

      if (res.data.isVendor) {
        setStatus("approved");
        setTimeout(() => {
          router.push("/dashboard/vendor");
        }, 2000);
        return;
      }

      if (res.data.wasRejected) {
        setStatus("rejected");
        setApplication(res.data.application);
        return;
      }

      if (res.data.hasPendingApplication) {
        setStatus("pending");
        setApplication(res.data.application);
      } else {
        // No application found, redirect to home
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to check vendor status:", err);
      toast.error("Failed to check application status");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {status === "pending" && (
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
            )}
            {status === "approved" && (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            {status === "rejected" && (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {status === "pending" && "Application Under Review"}
            {status === "approved" && "Application Approved! 🎉"}
            {status === "rejected" && "Application Rejected"}
          </h1>
          <p className="text-slate-500 mt-2">
            {status === "pending" && "Your vendor application is being reviewed by our team."}
            {status === "approved" && "Redirecting you to your vendor dashboard..."}
            {status === "rejected" && "Your application was not approved. You can reapply from your dashboard."}
          </p>
        </div>

        {application && (
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-teal-600" />
              Application Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Shop Name</span>
                <span className="font-medium text-slate-800">{application.shopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Description</span>
                <span className="font-medium text-slate-800 text-right max-w-xs">{application.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                  status === "pending" ? "bg-amber-100 text-amber-700" :
                  status === "approved" ? "bg-green-100 text-green-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Applied</span>
                <span className="font-medium text-slate-800">
                  {new Date(application.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">We'll notify you via email</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Once an admin reviews your application, you'll receive an email notification.
                  This usually takes 1-3 business days.
                </p>
                <button
                  onClick={checkVendorStatus}
                  disabled={checking}
                  className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  {checking ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check status manually"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Application Rejected</h4>
                <p className="text-sm text-red-700 mt-1">
                  Your vendor application was not approved. You can reapply from your dashboard.
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {status === "pending" && (
            <>
              <button
                onClick={() => router.push("/")}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition"
              >
                Browse Store
              </button>
              <button
                disabled
                title="Available once your vendor application is approved"
                className="flex-1 bg-slate-100 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Go to Dashboard
              </button>
            </>
          )}
          {status === "approved" && (
            <div className="w-full text-center text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
              Redirecting to vendor dashboard...
            </div>
          )}
          {status === "rejected" && (
            <button
              onClick={() => router.push("/")}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Go to Home
            </button>
          )}
        </div>

        {status === "pending" && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-xs text-slate-500 mt-1">Submitted</span>
              </div>
              <div className="flex-1 h-0.5 bg-teal-600"></div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold animate-pulse">2</div>
                <span className="text-xs text-slate-500 mt-1">Review</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200"></div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-300 text-white flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-xs text-slate-500 mt-1">Approved</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}