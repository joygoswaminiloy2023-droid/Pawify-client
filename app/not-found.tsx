import Link from "next/link";
import { Home, Search, PawPrint } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-lg w-full text-center relative">
        {/* Paw print trail wandering off the edge — the page's signature moment */}
        <div className="flex justify-center items-end gap-3 mb-8 select-none" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <PawPrint
              key={i}
              className="text-teal-500"
              style={{
                width: `${28 - i * 3}px`,
                height: `${28 - i * 3}px`,
                opacity: 1 - i * 0.18,
                transform: `translateY(${i % 2 === 0 ? -4 : 4}px) rotate(${i * 12 - 20}deg)`,
              }}
            />
          ))}
        </div>

        <h1 className="text-6xl font-extrabold text-slate-900 mb-2 tracking-tight">404</h1>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          This trail went cold.
        </h2>
        <p className="text-slate-500 mb-8">
          We couldn't find the page you were looking for. It may have moved, or the link might be off.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 gradient-brand text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
          >
            <Home className="w-4 h-4" />
            Back to home
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl transition"
          >
            <Search className="w-4 h-4" />
            Browse the shop
          </Link>
        </div>
      </div>
    </div>
  );
}