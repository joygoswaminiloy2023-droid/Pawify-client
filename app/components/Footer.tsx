"use client";
import Link from "next/link";
import { PawPrint, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10 mb-10">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
            <PawPrint className="w-6 h-6 text-teal-400" /> Pawify
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Pawify is an online pet store offering quality pet products, food, and accessories for healthier, happier pets across Bangladesh.
          </p>
          <div className="flex gap-3">
            <FaFacebook className="w-4 h-4 hover:text-teal-400 cursor-pointer transition" />
            <FaInstagram className="w-4 h-4 hover:text-teal-400 cursor-pointer transition" />
            <FaTwitter className="w-4 h-4 hover:text-teal-400 cursor-pointer transition" />
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <div className="space-y-3 text-sm text-slate-400">
            <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> Dhaka, Bangladesh</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +880 1700-000000</p>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Useful Links</h4>
          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <Link href="/about" className="hover:text-teal-400 transition">About Us</Link>
            <Link href="/terms" className="hover:text-teal-400 transition">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-teal-400 transition">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-teal-400 transition">Contact Us</Link>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Shop</h4>
          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <Link href="/shop?category=food" className="hover:text-teal-400 transition">Pet Food</Link>
            <Link href="/shop?category=toys" className="hover:text-teal-400 transition">Toys</Link>
            <Link href="/shop?category=accessories" className="hover:text-teal-400 transition">Accessories</Link>
            <Link href="/vendors" className="hover:text-teal-400 transition">All Vendors</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Pawify. All rights reserved.
      </div>
    </footer>
  );
}