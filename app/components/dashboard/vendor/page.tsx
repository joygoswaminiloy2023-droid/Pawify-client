"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell, { NavItem } from "@/app/components/dashboard/DashboardShell";
import StatusBadge from "@/app/components/dashboard/StatusBadge";
import StatCard from "@/app/components/dashboard/StatCard";
import PawLoader from "@/app/components/PawLoader";
import EmptyState from "@/app/components/EmptyState";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Package, Receipt, Plus, X, Save, Trash2, 
  Pencil, DollarSign, ShoppingBag, Star, Truck, CheckCircle, 
  Clock, MapPin, User, MessageSquare,
} from "lucide-react";
import Image from "next/image";

type Tab = "overview" | "products" | "orders" | "reviews" | "transactions";

const emptyProduct = { 
  name: "", 
  category: "food", 
  petType: "dog", 
  description: "", 
  price: "", 
  stock: "", 
  images: "" 
};

export default function VendorDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [delivering, setDelivering] = useState<string | null>(null);

  const NAV: NavItem[] = [
    { label: "Overview", icon: LayoutDashboard, active: tab === "overview", onClick: () => setTab("overview") },
    { label: "Products", icon: Package, active: tab === "products", onClick: () => setTab("products") },
    { label: "Orders", icon: Truck, active: tab === "orders", onClick: () => setTab("orders") },
    { label: "Reviews", icon: Star, active: tab === "reviews", onClick: () => setTab("reviews") },
    { label: "Transactions", icon: Receipt, active: tab === "transactions", onClick: () => setTab("transactions") },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("Loading vendor data...");
      
      const [statsRes, productsRes, txRes, ordersRes, reviewsRes] = await Promise.all([
        api.get("/api/vendor/stats"),
        api.get("/api/products/vendor/mine"),
        api.get("/api/vendor/transactions"),
        api.get("/api/orders/vendor-orders"),
        api.get("/api/reviews/vendor/reviews").catch((err) => {
          console.error("Reviews fetch error:", err);
          return { data: [] };
        }),
      ]);
      
      let reviewsData = [];
      if (reviewsRes.data?.data) {
        reviewsData = reviewsRes.data.data;
      } else if (Array.isArray(reviewsRes.data)) {
        reviewsData = reviewsRes.data;
      } else {
        reviewsData = [];
      }
      
      setStats(statsRes.data?.data || statsRes.data || {});
      setProducts(productsRes.data || []);
      setTransactions(txRes.data || []);
      setOrders(ordersRes.data?.data || ordersRes.data || []);
      setReviews(reviewsData);
      
    } catch (err: any) {
      console.error("Load data error:", err);
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setForm({
      name: p.name,
      category: p.category,
      petType: p.petType,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      images: (p.images || []).join(", "),
    });
    setEditingId(p._id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required.");
      return;
    }
    const payload = {
      name: form.name,
      category: form.category,
      petType: form.petType,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await api.patch(`/api/products/${editingId}`, payload);
        toast.success("Product updated — pending admin approval before it goes live.", {
          duration: 5000,
          icon: "⏳",
        });
      } else {
        await api.post("/api/products", payload);
        toast.success("Product submitted for approval", { duration: 4000 });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success("Product deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleDeliverItem = async (orderId: string, productId: string, productName: string) => {
    const deliveryKey = `${orderId}-${productId}`;
    setDelivering(deliveryKey);
    
    try {
      console.log(`Delivering item: ${productName} (Order: ${orderId})`);
      
      const response = await api.patch(`/api/orders/${orderId}/deliver-item`, { productId });
      console.log("Deliver response:", response.data);
      
      toast.success(`"${productName}" marked as delivered!`, {
        duration: 3000,
        position: "top-center",
      });
      
      await loadData();
      
    } catch (err: any) {
      console.error("Deliver error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to mark as delivered";
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
      });
    } finally {
      setDelivering(null);
    }
  };

  const getItemDeliveryStatus = (item: any) => {
    if (item.delivered) {
      return {
        label: "Delivered ✓",
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle className="w-3 h-3" />
      };
    }
    return {
      label: "Pending",
      color: "bg-amber-100 text-amber-700",
      icon: <Clock className="w-3 h-3" />
    };
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending" || o.status === "paid").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  if (loading) return <PawLoader />;

  return (
    <DashboardShell navItems={NAV} title="Vendor Dashboard">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 bg-white p-1.5 rounded-full w-fit border border-slate-100 flex-wrap">
          {(["overview", "products", "orders", "reviews", "transactions"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition ${
                tab === t ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "products" && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={openCreate}
            className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-700 transition"
          >
            <Plus className="w-4 h-4" /> Add Product
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard icon={Package} label="Total Products" value={stats?.productCount || 0} color="teal" />
              <StatCard icon={DollarSign} label="Total Revenue" value={`৳${stats?.totalRevenue || 0}`} color="violet" />
              <StatCard icon={ShoppingBag} label="Total Orders" value={orderStats.total} color="amber" />
              <StatCard 
                icon={Star} 
                label="Rating" 
                value={avgRating > 0 ? avgRating.toFixed(1) : "No reviews"} 
                color="rose" 
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Recent Orders</h3>
                {!orders.length ? (
                  <EmptyState title="No orders yet" subtitle="Once your products are approved, orders will show up here." />
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            Order #{o._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-teal-700">৳{o.totalAmount}</span>
                          <StatusBadge status={o.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  Recent Reviews
                  {reviews.length > 0 && (
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                      {reviews.length}
                    </span>
                  )}
                </h3>
                {!reviews.length ? (
                  <EmptyState title="No reviews yet" subtitle="Reviews will appear here once customers start reviewing." />
                ) : (
                  <div className="space-y-3">
                    {reviews.slice(0, 5).map((r) => (
                      <div key={r._id} className="py-3 border-b border-slate-50 last:border-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1,2,3,4,5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">{r.userName || 'Anonymous'}</span>
                          </div>
                          <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        {r.comment && (
                          <p className="text-sm text-slate-600 mt-1">{r.comment}</p>
                        )}
                        {r.productName && (
                          <p className="text-xs text-slate-400 mt-1">Product: {r.productName}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {tab === "products" && (
          <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {products.length === 0 ? (
              <EmptyState title="No products yet" subtitle="Click 'Add Product' to submit your first item for approval." />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((p) => (
                  <motion.div key={p._id} layout className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="h-36 bg-slate-100 relative">
                      {p.images?.[0] ? (
                        <Image width={300} height={144}  src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                      )}
                      <div className="absolute top-2 right-2">
                        <StatusBadge status={p.approvalStatus} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-800 truncate">{p.name}</h4>
                      <p className="text-xs text-slate-400 capitalize mb-2">{p.category} · {p.petType}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-700">৳{p.price}</span>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "orders" && (
          <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <p className="text-2xl font-bold text-slate-800">{orderStats.total}</p>
                <p className="text-xs text-slate-400">Total Orders</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{orderStats.pending}</p>
                <p className="text-xs text-slate-400">Pending</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{orderStats.shipped}</p>
                <p className="text-xs text-slate-400">Shipped</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
                <p className="text-xs text-slate-400">Delivered</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <EmptyState title="No orders yet" subtitle="Waiting for your first order!" />
            ) : (
              <div className="space-y-4">
                {orders.map((o) => {
                  const totalItems = o.items?.length || 0;
                  const deliveredItems = o.items?.filter((i: any) => i.delivered).length || 0;
                  const allDelivered = totalItems > 0 && deliveredItems === totalItems;
                  
                  return (
                    <motion.div
                      key={o._id}
                      layout
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Order #{o._id.slice(-8).toUpperCase()}</p>
                          <p className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            <User className="w-3 h-3 inline mr-1" />
                            Customer: {o.userId?.toString().slice(-8) || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={o.status} />
                          {allDelivered && o.status === "delivered" && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Complete
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Delivery Progress</span>
                          <span>{deliveredItems}/{totalItems} items</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-600 transition-all duration-500"
                            style={{ width: `${totalItems > 0 ? (deliveredItems / totalItems) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        {o.items?.map((item: any, i: number) => {
                          const deliveryStatus = getItemDeliveryStatus(item);
                          const deliveryKey = `${o._id}-${item.productId}`;
                          const isDelivering = delivering === deliveryKey;
                          
                          return (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                                <p className="text-xs text-slate-400">Qty: {item.quantity} × ৳{item.price}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-teal-700">৳{item.price * item.quantity}</span>
                                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${deliveryStatus.color}`}>
                                  {deliveryStatus.icon} {deliveryStatus.label}
                                </span>
                                {!item.delivered && o.status !== "delivered" && (
                                  <button
                                    onClick={() => handleDeliverItem(o._id, item.productId, item.name)}
                                    disabled={isDelivering}
                                    className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isDelivering ? (
                                      <>
                                        <span className="inline-block animate-spin">⏳</span>
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <Truck className="w-3 h-3" /> Deliver
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5" /> {o.shippingAddress || 'No address'}
                        </div>
                        <span className="font-bold text-teal-700">Total: ৳{o.totalAmount}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {tab === "reviews" && (
          <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <p className="text-2xl font-bold text-slate-800">{reviews.length}</p>
                <p className="text-xs text-slate-400">Total Reviews</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <p className="text-2xl font-bold text-amber-500">{avgRating > 0 ? avgRating.toFixed(1) : '-'}</p>
                <p className="text-xs text-slate-400">Average Rating</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
                <div className="flex justify-center gap-0.5">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">Rating</p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <EmptyState title="No reviews yet" subtitle="Customer reviews will appear here once they start reviewing your products." />
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                            {r.userName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{r.userName || 'Anonymous'}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1,2,3,4,5].map((star) => (
                                  <Star key={star} className={`w-4 h-4 ${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                ))}
                              </div>
                              <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {r.comment && (
                          <p className="text-slate-600 text-sm">{r.comment}</p>
                        )}
                        {r.productName && (
                          <p className="text-xs text-slate-400 mt-2">Product: {r.productName}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "transactions" && (
          <motion.div key="transactions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {transactions.length === 0 ? (
              <EmptyState title="No transactions yet" subtitle="Paid orders will appear here." />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-6 py-3">Order</th>
                      <th className="text-left px-6 py-3">Date</th>
                      <th className="text-left px-6 py-3">Status</th>
                      <th className="text-right px-6 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t._id} className="border-t border-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-800">#{t._id.slice(-8).toUpperCase()}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                        <td className="px-6 py-4 text-right font-semibold text-teal-700">৳{t.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-lg text-slate-800">{editingId ? "Edit Product" : "Add Product"}</h3>
                <button onClick={() => setModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>

              <div className="space-y-3">
                <input
                  placeholder="Product name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition"
                  >
                    {["food", "toys", "accessories", "grooming", "health"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={form.petType}
                    onChange={(e) => setForm({ ...form, petType: e.target.value })}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition"
                  >
                    {["dog", "cat", "bird", "fish", "small-pet"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price (৳)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition"
                  />
                </div>
                <input
                  placeholder="Image URLs (comma separated)"
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition"
                />

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 transition mt-2"
                >
                  <Save className="w-4 h-4" /> {editingId ? "Update Product" : "Submit for Approval"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}