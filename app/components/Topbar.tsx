"use client";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Link from "next/link";

export default function TopBar() {
  return (
    <div className="bg-teal-700 text-white text-xs">
      <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
        <p className="font-medium hidden sm:block">🐾 Same-Day Delivery Available Inside Dhaka!</p>
        <p className="font-medium sm:hidden">🐾 Same-Day Delivery in Dhaka!</p>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-teal-200 transition"><FaFacebook className="w-3.5 h-3.5" /></Link>
          <Link href="#" className="hover:text-teal-200 transition"><FaInstagram className="w-3.5 h-3.5" /></Link>
          <Link href="/contact" className="hidden md:inline hover:text-teal-200 transition">Contact Us</Link>
          <Link href="/faqs" className="hidden md:inline hover:text-teal-200 transition">FAQs</Link>
        </div>
      </div>
    </div>
  );
}