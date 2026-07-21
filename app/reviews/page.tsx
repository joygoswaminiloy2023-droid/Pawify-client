"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import EmptyState from "../components/EmptyState";
import PawLoader from "../components/PawLoader";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Review {
  _id: string;
  productId: string;
  productName: string;
  productImage?: string;
  orderId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/reviews/my-reviews");
      console.log("Reviews response:", response);
      
      if (response.data?.success && response.data?.data) {
        setReviews(response.data.data);
      } else if (Array.isArray(response.data)) {
        setReviews(response.data);
      } else {
        setReviews([]);
      }
    } catch (error: any) {
      console.error("Failed to load reviews:", error);
      toast.error(error.message || "Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    setDeletingId(reviewId);
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      toast.error(error.message || "Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/user"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">My Reviews</h1>
          <p className="text-slate-500 mt-1">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>

        {loading ? (
          <PawLoader />
        ) : reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            subtitle="Review products you've purchased to help other pet owners!"
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {reviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  layout
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden">
                        {review.productImage ? (
                          <img
                            src={review.productImage}
                            alt={review.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🐾
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Link
                            href={`/product/${review.productId}`}
                            className="font-semibold text-slate-800 hover:text-teal-700 transition line-clamp-1"
                          >
                            {review.productName}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm font-medium text-slate-700">
                              {review.rating}.0
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(review.createdAt)}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {review.comment}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                        <div className="text-xs text-slate-400">
                          Order #{review.orderId.slice(-8).toUpperCase()}
                        </div>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deletingId === review._id}
                          className="text-xs text-slate-400 hover:text-rose-600 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === review._id ? (
                            "Deleting..."
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3" /> Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}
