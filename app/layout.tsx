import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Pawify — Everything Your Pet Needs",
  description: "Shop premium pet food, toys, and accessories from trusted vendors.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <CartProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: { borderRadius: "16px", background: "#0f172a", color: "#fff" },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}