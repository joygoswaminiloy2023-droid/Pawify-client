"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import {
  PawPrint, ShoppingCart, Search, Menu, X,
  User as UserIcon, Bone, Fish, Bird, Cat, Dog, ChevronDown, Store
} from "lucide-react";
import TopBar from "./Topbar";
import Image from "next/image";


const CATEGORIES = [
  { label: "Cat", icon: Cat, href: "/shop?petType=cat" },
  { label: "Cat Food", icon: Bone, href: "/shop?petType=cat&category=food" },
  { label: "Dog", icon: Dog, href: "/shop?petType=dog" },
  { label: "Dog Food", icon: Bone, href: "/shop?petType=dog&category=food" },
  { label: "Small Animal", icon: PawPrint, href: "/shop?petType=small-pet" },
  { label: "Bird", icon: Bird, href: "/shop?petType=bird" },
  { label: "Fish", icon: Fish, href: "/shop?petType=fish" },
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/shop${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  };

  return (
    <div className="sticky top-0 z-50">
      <TopBar />

      {/* Main navbar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl text-teal-700 flex-shrink-0">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
              <PawPrint className="w-7 h-7" />
            </motion.div>
            Pawify
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products..."
              className="w-full px-4 py-2.5 rounded-l-full border border-slate-200 border-r-0 focus:border-teal-500 outline-none transition text-sm"
            />
            <button
              type="submit"
              className="px-5 rounded-r-full bg-teal-600 text-white hover:bg-teal-700 transition flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-5 ml-auto">
            {!loading && !user && (
              <Link href="/login" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-700 transition">
                <UserIcon className="w-4 h-4" /> Login / Register
              </Link>
            )}

            {!loading && user && (
              <Link
                href={`/dashboard/${user.role}`}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-teal-700 transition"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={28}
                    height={28}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                {user.name.split(" ")[0]}
              </Link>
            )}

            <Link href="/wishlist" className="relative text-slate-600 hover:text-teal-700 transition">
            
            </Link>

            <Link href="/cart" className="relative text-slate-600 hover:text-teal-700 transition">
              <ShoppingCart className="w-5 h-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-teal-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {!loading && user && (
              <button onClick={logout} className="hidden sm:block text-xs text-slate-400 hover:text-red-500 transition">
                Logout
              </button>
            )}

            <button className="md:hidden text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div className="bg-teal-700 text-white hidden md:block relative">
        <div className="max-w-7xl mx-auto px-6 h-11 flex items-center gap-8 text-sm font-medium">
          <div className="relative">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex items-center gap-2 hover:text-teal-200 transition"
            >
              <Menu className="w-4 h-4" /> Browse Categories <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {categoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-11 left-0 w-64 bg-white text-slate-700 rounded-b-xl shadow-2xl overflow-hidden z-50"
                >
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.label}
                      href={c.href}
                      onClick={() => setCategoryOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-teal-50 hover:text-teal-700 transition text-sm"
                    >
                      <c.icon className="w-4 h-4" /> {c.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/" className="hover:text-teal-200 transition">Home</Link>
          <Link href="/shop" className="hover:text-teal-200 transition">Shop</Link>
         
          <Link href="/about" className="hover:text-teal-200 transition">About Us</Link>
          <Link href="/contact" className="hover:text-teal-200 transition">Contact</Link>

          <div className="ml-auto flex items-center gap-6">
            <Link href="/shop?offer=true" className="hover:text-teal-200 transition font-semibold">Special Offer</Link>
           
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <form onSubmit={handleSearch} className="px-6 py-3 flex">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 rounded-l-full border border-slate-200 outline-none text-sm"
              />
              <button type="submit" className="px-4 rounded-r-full bg-teal-600 text-white">
                <Search className="w-4 h-4" />
              </button>
            </form>
            <div className="flex flex-col px-6 pb-4 gap-1 text-sm font-medium text-slate-600">
              <Link href="/shop" className="py-2">Shop</Link>
              <Link href="/about" className="py-2">About Us</Link>
              <Link href="/contact" className="py-2">Contact</Link>
              <Link href="/shop?offer=true" className="py-2">Special Offer</Link>
              {!user && <Link href="/login" className="py-2">Login / Register</Link>}
              {user && (
                <>
                  <Link href={`/dashboard/${user.role}`} className="py-2">Dashboard</Link>
                  <button onClick={logout} className="py-2 text-left text-red-500">Logout</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}