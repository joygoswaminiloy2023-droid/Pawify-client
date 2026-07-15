"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { PawPrint, Menu, X, LogOut, LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;       // use for real route links
  onClick?: () => void; // use for in-page tab switching
  active?: boolean;     // explicit active state (needed for tab-based dashboards)
}

export default function DashboardShell({
  children, navItems, title,
}: {
  children: React.ReactNode; navItems: NavItem[]; title: string;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.active !== undefined ? item.active : item.href ? pathname === item.href : false;

  const renderNavItem = (item: NavItem, variant: "desktop" | "mobile") => {
    const active = isActive(item);
    const baseClass =
      variant === "desktop"
        ? `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition relative w-full text-left ${
            active ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`
        : `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition w-full text-left ${
            active ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800"
          }`;

    const content = (
      <>
        <item.icon className="w-4.5 h-4.5" />
        {item.label}
        {variant === "desktop" && active && (
          <motion.div
            layoutId="active-nav"
            className="absolute inset-0 rounded-xl border border-teal-400/30"
          />
        )}
      </>
    );

    // Tab-switching item: render as a button
    if (item.onClick) {
      return (
        <button
          key={item.label}
          onClick={() => {
            item.onClick?.();
            if (variant === "mobile") setMobileOpen(false);
          }}
          className={baseClass}
        >
          {content}
        </button>
      );
    }

    // Real route item: render as a Link
    return (
      <Link
        key={item.label}
        href={item.href!}
        onClick={() => variant === "mobile" && setMobileOpen(false)}
        className={baseClass}
      >
        {content}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl px-6 h-20 border-b border-slate-800">
          <PawPrint className="w-6 h-6 text-teal-400" /> Pawify
        </Link>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => renderNavItem(item, "desktop"))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            {user?.image ? (
              <img src={user.image} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full mt-2 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 h-20 border-b border-slate-800">
                <span className="flex items-center gap-2 font-bold text-xl">
                  <PawPrint className="w-6 h-6 text-teal-400" /> Pawify
                </span>
                <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => renderNavItem(item, "mobile"))}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full mt-4 px-4 py-3 rounded-xl text-sm text-rose-400 hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 h-20 flex items-center px-6 gap-4 sticky top-0 z-30">
          <button className="md:hidden text-slate-600" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}