"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell, { NavItem } from "@/app/components/dashboard/DashboardShell";
import StatCard from "@/app/components/dashboard/StatCard";
import StatusBadge from "@/app/components/dashboard/StatusBadge";
import EmptyState from "@/app/components/EmptyState";
import PawLoader from "@/app/components/PawLoader";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Users, Store, Package, Receipt, Check, X as XIcon,
  Ban, ShieldCheck, DollarSign, Star, TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import Image from "next/image";

type Tab = "overview" | "users" | "vendors" | "products" | "transactions";

const COLORS = ["#0d9488", "#0891b2", "#f59e0b", "#f43f5e", "#8b5cf6"];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [vendorApps, setVendorApps] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const NAV: NavItem[] = [
    { label: "Overview", icon: LayoutDashboard, active: tab === "overview", onClick: () => setTab("overview") },
    { label: "Users", icon: Users, active: tab === "users", onClick: () => setTab("users") },
    { label: "Vendors", icon: Store, active: tab === "vendors", onClick: () => setTab("vendors") },
    { label: "Products", icon: Package, active: tab === "products", onClick: () => setTab("products") },
    { label: "Transactions", icon: Receipt, active: tab === "transactions", onClick: () => setTab("transactions") },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, usersRes, appsRes, productsRes, txRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/analytics"),
        api.get("/api/admin/users"),
        api.get("/api/admin/vendor-applications"),
        api.get("/api/admin/products/pending"),
        api.get("/api/admin/transactions"),
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data || []);
      setVendorApps(appsRes.data || []);
      setPendingProducts(productsRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUserStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/admin/users/${id}/status`, { status });
      toast.success(`User marked as ${status}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    }
  };

  const handleVendorApp = async (id: string, action: "approve" | "reject") => {
    try {
      await api.patch(`/api/admin/vendor-applications/${id}/${action}`, {});
      toast.success(`Application ${action}d`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  const handleProductAction = async (id: string, action: "approve" | "reject") => {
    try {
      await api.patch(`/api/admin/products/${id}/${action}`, {});
      toast.success(`Product ${action}d`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  return (
    <DashboardShell navItems={NAV} title="Admin Dashboard">
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-full w-fit border border-slate-100 overflow-x-auto">
        {(["overview", "users", "vendors", "products", "transactions"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition ${
              tab === t ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {t}
            {t === "vendors" && vendorApps.length > 0 && (
              <span className="ml-1.5 bg-amber-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">{vendorApps.length}</span>
            )}
            {t === "products" && pendingProducts.length > 0 && (
              <span className="ml-1.5 bg-amber-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingProducts.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <PawLoader />
      ) : (
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard icon={Users} label="Total Users" value={stats?.userCount || 0} color="teal" />
                <StatCard icon={Store} label="Active Vendors" value={stats?.vendorCount || 0} color="violet" />
                <StatCard icon={Package} label="Total Products" value={stats?.productCount || 0} color="amber" />
                <StatCard icon={DollarSign} label="Total Revenue" value={`৳${stats?.totalRevenue || 0}`} color="rose" />
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Sales line chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-600" /> Sales Trend
                  </h3>
                  {analytics?.salesByDay?.length ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={analytics.salesByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="total" stroke="#0d9488" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState title="No sales data yet" subtitle="Charts will populate as orders come in." />
                  )}
                </div>

                {/* Category pie chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Products by Category</h3>
                  {analytics?.categoryBreakdown?.length ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={analytics.categoryBreakdown}
                          dataKey="count"
                          nameKey="_id"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                       // eslint-disable-next-line @typescript-eslint/no-explicit-any
                       label={(entry: any) => entry._id}
                        >
                          {analytics.categoryBreakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState title="No products yet" subtitle="Approve some products to see this chart." />
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Top selling products bar chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Best Selling Products</h3>
                  {analytics?.topProducts?.length ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analytics.topProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="_id" type="category" width={110} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="totalSold" fill="#0d9488" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState title="No sales yet" subtitle="Top products will show once orders complete." />
                  )}
                </div>

                {/* Most reviewed */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" /> Most Reviewed Products
                  </h3>
                  {analytics?.mostReviewed?.length ? (
                    <div className="space-y-3">
                      {analytics.mostReviewed.map((r: any) => (
                        <div key={r._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <span className="text-sm text-slate-700 truncate">{r.product?.name || "Unknown"}</span>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" /> {r.avgRating?.toFixed(1)}
                            </span>
                            <span className="text-slate-400">{r.reviewCount} reviews</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No reviews yet" subtitle="Reviews will appear here once customers leave feedback." />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-6 py-3">Name</th>
                    <th className="text-left px-6 py-3">Email</th>
                    <th className="text-left px-6 py-3">Role</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-right px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t border-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800">{u.name}</td>
                      <td className="px-6 py-4 text-slate-500">{u.email}</td>
                      <td className="px-6 py-4 capitalize text-slate-600">{u.role}</td>
                      <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== "admin" && (
                          <div className="flex justify-end gap-2">
                            {u.status !== "active" && (
                              <button
                                onClick={() => handleUserStatus(u._id, "active")}
                                className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition"
                                title="Activate"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {u.status !== "restricted" && (
                              <button
                                onClick={() => handleUserStatus(u._id, "restricted")}
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                                title="Restrict"
                              >
                                <XIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {u.status !== "banned" && (
                              <button
                                onClick={() => handleUserStatus(u._id, "banned")}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                                title="Ban"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {tab === "vendors" && (
            <motion.div key="vendors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {vendorApps.length === 0 ? (
                <EmptyState title="No pending applications" subtitle="New vendor requests will show up here." />
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {vendorApps.map((app) => (
                    <motion.div key={app._id} layout className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                          <Store className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{app.shopName}</h4>
                          <p className="text-xs text-slate-400">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">{app.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVendorApp(app._id, "approve")}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleVendorApp(app._id, "reject")}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <XIcon className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === "products" && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {pendingProducts.length === 0 ? (
                <EmptyState title="No pending products" subtitle="New vendor product submissions will appear here." />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pendingProducts.map((p) => (
                    <motion.div key={p._id} layout className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="h-36 bg-slate-100">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} className="w-full h-full object-cover" width={100} height={100} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-slate-800 truncate">{p.name}</h4>
                        <p className="text-xs text-slate-400 capitalize mb-2">{p.category} · {p.petType} · ৳{p.price}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleProductAction(p._id, "approve")}
                            className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleProductAction(p._id, "reject")}
                            className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === "transactions" && (
            <motion.div key="transactions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {transactions.length === 0 ? (
                <EmptyState title="No transactions yet" subtitle="Completed payments will appear here." />
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-6 py-3">Transaction ID</th>
                      <th className="text-left px-6 py-3">Date</th>
                      <th className="text-left px-6 py-3">Status</th>
                      <th className="text-right px-6 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t._id} className="border-t border-slate-50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{t.transactionId?.slice(-16)}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                        <td className="px-6 py-4 text-right font-semibold text-teal-700">৳{t.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </DashboardShell>
  );
}