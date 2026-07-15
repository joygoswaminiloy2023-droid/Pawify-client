"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart, Star, Heart, Eye, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  petType: string;
  vendorId: string;
  stock: number;
  rating?: number;
  description?: string;
  createdAt?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [productRating, setProductRating] = useState(product.rating || 0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real ratings for the product
  useEffect(() => {
    const fetchProductRating = async () => {
      try {
        const res = await api.get(`/api/reviews/product/${product._id}`);
        if (res.data.success && res.data.data) {
          const reviews = res.data.data;
          setReviewCount(reviews.length);
          if (reviews.length > 0) {
            const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
            setProductRating(Math.round(avg * 10) / 10);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product rating:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductRating();
  }, [product._id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product._id,
      vendorId: product.vendorId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || "",
    });
    toast.success(`${product.name} added to cart! 🐾`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist ❤️" : "Added to wishlist ❤️");
  };

  // Generate stars for rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-3.5 h-3.5 text-slate-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        )}
        {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-slate-300" />
        ))}
      </div>
    );
  };

  // Get time since added
  const getTimeAgo = (date?: string) => {
    if (!date) return "Recently added";
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product._id}`}>
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative">
          
          {/* Image Section */}
          <div className="relative h-56 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
            {product.images?.[0] ? (
              <motion.img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🐾
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {isOutOfStock && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                  Out of Stock
                </span>
              )}
              {isLowStock && !isOutOfStock && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                  Only {product.stock} left
                </span>
              )}
              {!isOutOfStock && product.createdAt && new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> New
                </span>
              )}
            </div>

            {/* Pet Type Badge */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              <span className="bg-white/90 backdrop-blur text-[10px] font-bold uppercase px-2.5 py-1 rounded-full text-teal-700 shadow-lg">
                {product.petType || product.category}
              </span>
            </div>

            {/* Quick Action Buttons - Appear on hover */}
            <div className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex justify-end gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300`}>
              <button
                onClick={handleWishlist}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition shadow-lg"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600 hover:text-rose-500'} transition`} />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Category & Stock Status */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {product.category}
              </span>
              {!isOutOfStock && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                  <CheckCircle className="w-3 h-3" />
                  In Stock
                </span>
              )}
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-teal-600 transition">
              {product.name}
            </h3>

            {/* Description preview */}
            {product.description && (
              <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                {product.description.slice(0, 60)}...
              </p>
            )}

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-2.5">
              {isLoading ? (
                <div className="flex items-center gap-1">
                  <div className="w-16 h-3 bg-slate-200 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  {renderStars(productRating)}
                  <span className="text-xs font-medium text-slate-600">
                    {productRating > 0 ? productRating.toFixed(1) : 'New'}
                  </span>
                  {reviewCount > 0 && (
                    <span className="text-[10px] text-slate-400">
                      ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Price & Add to Cart */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <div>
                <span className="text-xl font-bold text-teal-700">৳{product.price}</span>
                {product.price > 100 && (
                  <span className="text-[10px] text-slate-400 line-through ml-2">
                    ৳{(product.price * 1.2).toFixed(0)}
                  </span>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                  isOutOfStock 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-200'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                {!isOutOfStock && <ShoppingCart className="w-3.5 h-3.5" />}
              </motion.button>
            </div>

            {/* Time added */}
            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{getTimeAgo(product.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Sparkles icon component
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L14 8L19 10L14 12L12 17L10 12L5 10L10 8L12 3Z" />
      <path d="M19 4L20 6L22 6L20 8L19 10L17 8L15 6L17 4L19 4Z" />
      <path d="M5 14L6 16L8 16L6 18L5 20L3 18L1 16L3 14L5 14Z" />
    </svg>
  );
}