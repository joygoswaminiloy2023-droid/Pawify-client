import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CheckoutSuccessContent from "./CheckoutSuccessContent";

function SuccessFallback() {
  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <Loader2 className="w-14 h-14 text-teal-600 animate-spin mx-auto mb-6" />
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading...</h1>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}