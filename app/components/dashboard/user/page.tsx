"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell, { NavItem } from "@/app/components/dashboard/DashboardShell";
import StatusBadge from "@/app/components/dashboard/StatusBadge";
import StatCard from "@/app/components/dashboard/StatCard";

import PawLoader from "@/app/components/PawLoader";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Package, User, Star, CreditCard,
  Truck, X, Save, MapPin, CheckCircle, Clock, Loader2,
} from "lucide-react";
import EmptyState from "@/app/components/EmptyState";

type Tab = "overview" | "orders" | "profile";

export default function UserDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "", image: "" });
  const [reviewModal, setReviewModal] = useState<{ orderId: string; productId: string; name: string } | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  // Track which items are being reviewed locally
  const [locallyReviewed, setLocallyReviewed] = useState<Set<string>>(new Set());

  const NAV: NavItem[] = [
    { label: "Overview", icon: LayoutDashboard, active: tab === "overview", onClick: () => setTab("overview") },
    { label: "My Orders", icon: Package, active: tab === "orders", onClick: () => setTab("orders") },
    { label: "Profile", icon: User, active: tab === "profile", onClick: () => setTab("profile") },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, meRes, reviewsRes] = await Promise.all([
        api.get("/api/orders/my-orders"),
        api.get("/api/users/me"),
        api.get("/api/reviews/my-reviews").catch(() => ({ data: { data: [] } })),
      ]);
      
      console.log("Orders loaded:", ordersRes.data);
      console.log("Reviews loaded:", reviewsRes.data);
      
      setOrders(ordersRes.data || []);
      setProfile(meRes.data);
      setProfileForm({
        name: meRes.data?.name || "",
        phone: meRes.data?.phone || "",
        address: meRes.data?.address || "",
        image: meRes.data?.image || "",
      });

      // Track which items have been reviewed and store reviews
      const reviewed = new Set<string>();
      const reviewsData = reviewsRes.data?.data || reviewsRes.data || [];
      const reviewsArray = Array.isArray(reviewsData) ? reviewsData : [];
      reviewsArray.forEach((review: any) => {
        const key = `${review.orderId}-${review.productId}`;
        reviewed.add(key);
      });
      setReviewedItems(reviewed);
      setMyReviews(reviewsArray);
      
      // Clear local reviewed items on load
      setLocallyReviewed(new Set());

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCancelOrder = async (id: string) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await api.delete(`/api/orders/${id}`);
      toast.success("Order cancelled");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
    }
  };

  const handleProfileSave = async () => {
    try {
      await api.patch("/api/users/profile", profileForm);
      toast.success("Profile updated! 🐾");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    
    setSubmittingReview(true);
    try {
      await api.post("/api/reviews", {
        productId: reviewModal.productId,
        orderId: reviewModal.orderId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      
      toast.success("Thanks for the review! 🐾");
      
      // Add to both reviewed items and locally reviewed
      const key = `${reviewModal.orderId}-${reviewModal.productId}`;
      setReviewedItems(prev => new Set(prev).add(key));
      setLocallyReviewed(prev => new Set(prev).add(key));
      
      // Add to myReviews for immediate display
      setMyReviews(prev => [...prev, {
        _id: Date.now().toString(),
        productId: reviewModal.productId,
        productName: reviewModal.name,
        orderId: reviewModal.orderId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        userName: profile?.name || 'User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]);
      
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: "" });
      
      // Refresh data after a delay to sync with server
      setTimeout(() => {
        loadData();
      }, 1000);
      
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      setMyReviews(prev => prev.filter(r => r._id !== reviewId));
      // Also update reviewedItems
      const deletedReview = myReviews.find(r => r._id === reviewId);
      if (deletedReview) {
        const key = `${deletedReview.orderId}-${deletedReview.productId}`;
        setReviewedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      toast.error(error.message || "Failed to delete review");
    }
  };

  const totalSpent = orders
    .filter((o) => ["paid", "shipped", "delivered"].includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Check if an item can be reviewed
  const canReviewItem = (order: any, item: any) => {
    // Must be delivered order
    if (order.status !== "delivered") return false;
    // Item must be delivered
    if (!item.delivered) return false;
    // Check if already reviewed (from server or local)
    const key = `${order._id}-${item.productId}`;
    return !reviewedItems.has(key) && !locallyReviewed.has(key);
  };

  // Check if an item has been reviewed
  const isItemReviewed = (orderId: string, productId: string) => {
    const key = `${orderId}-${productId}`;
    return reviewedItems.has(key) || locallyReviewed.has(key);
  };

  // Count delivered orders
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  return (
    <DashboardShell navItems={NAV} title="My Dashboard">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-full w-fit border border-slate-100">
        {(["overview", "orders", "profile"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition ${
              tab === t ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {t === "orders" ? "My Orders" : t}
          </button>
        ))}
      </div>

      {loading ? (
        <PawLoader />
      ) : (
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid sm:grid-cols-3 gap-5 mb-8">
                <StatCard icon={Package} label="Total Orders" value={orders.length} color="teal" />
                <StatCard icon={CreditCard} label="Total Spent" value={`৳${totalSpent}`} color="violet" />
                <StatCard
                  icon={CheckCircle}
                  label="Delivered"
                  value={deliveredOrders}
                  color="teal"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <EmptyState title="No orders yet" subtitle="Go find something pawsome to buy!" />
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((o) => (
                        <div key={o._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {o.items?.[0]?.name} {o.items?.length > 1 && `+${o.items.length - 1} more`}
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">My Reviews</h3>
                    <Link
                      href="/reviews"
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium transition"
                    >
                      View all
                    </Link>
                  </div>
                  {myReviews.length === 0 ? (
                    <EmptyState title="No reviews yet" subtitle="Review products you've purchased!" />
                  ) : (
                    <div className="space-y-3">
                      {myReviews.slice(0, 5).map((review: any) => (
                        <div key={review._id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{review.productName}</p>
                            <p className="text-xs text-slate-400 truncate">{review.comment || 'No comment'}</p>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {orders.length === 0 ? (
                <EmptyState title="No orders yet" subtitle="Go find something pawsome to buy!" />
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => {
                    // Check delivery progress
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

                        {/* Delivery Progress Bar */}
                        {totalItems > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                              <span>Delivery Progress</span>
                              <span>{deliveredItems}/{totalItems} items</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-teal-600 transition-all duration-500"
                                style={{ width: `${(deliveredItems / totalItems) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Items List */}
                        <div className="space-y-3 mb-4">
                          {o.items?.map((item: any, i: number) => {
                            const isDelivered = item.delivered || false;
                            const reviewed = isItemReviewed(o._id, item.productId);
                            const canReview = canReviewItem(o, item);
                            
                            console.log(`Item: ${item.name}, Delivered: ${isDelivered}, Reviewed: ${reviewed}, CanReview: ${canReview}`);
                            
                            return (
                              <div key={i} className="flex flex-wrap items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-800">{item.name}</span>
                                    {isDelivered && (
                                      <span className="text-xs text-green-600 flex items-center gap-0.5">
                                        <CheckCircle className="w-3 h-3" /> ✓
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-400">× {item.quantity}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-slate-800">৳{item.price * item.quantity}</span>
                                  
                                  {!isDelivered && o.status !== "delivered" && (
                                    <span className="text-xs text-amber-600 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> Pending
                                    </span>
                                  )}
                                  
                                  {/* Review Button - Only shows if can review */}
                                  {canReview && (
                                    <button
                                      onClick={() =>
                                        setReviewModal({
                                          orderId: o._id,
                                          productId: item.productId,
                                          name: item.name,
                                        })
                                      }
                                      className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition flex items-center gap-1"
                                    >
                                      <Star className="w-3 h-3" /> Review
                                    </button>
                                  )}
                                  
                                  {/* Reviewed state - disabled button */}
                                  {reviewed && isDelivered && (
                                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" /> Reviewed
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin className="w-3.5 h-3.5" /> {o.shippingAddress}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-teal-700">৳{o.totalAmount}</span>
                            {["pending", "paid"].includes(o.status) && (
                              <button
                                onClick={() => handleCancelOrder(o._id)}
                                className="text-xs text-rose-500 hover:text-rose-700 font-medium transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {tab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                {profileForm.image ? (
                  <img src={profileForm.image} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold">
                    {profileForm.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{profile?.email}</p>
                  <p className="text-xs text-slate-400">Member since {new Date(profile?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone</label>
                  <input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Address</label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    rows={3}
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Profile Image URL</label>
                  <input
                    value={profileForm.image}
                    onChange={(e) => setProfileForm({ ...profileForm, image: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProfileSave}
                  className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 transition"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => !submittingReview && setReviewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Review {reviewModal.name}</h3>
                <button 
                  onClick={() => !submittingReview && setReviewModal(null)}
                  disabled={submittingReview}
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="flex gap-1 mb-4 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => !submittingReview && setReviewForm({ ...reviewForm, rating: star })}
                    disabled={submittingReview}
                  >
                    <Star
                      className={`w-8 h-8 transition ${
                        star <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="How was it? (optional)"
                rows={3}
                disabled={submittingReview}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition resize-none mb-4 disabled:opacity-50"
              />

              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}