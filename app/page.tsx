"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import PawLoader from "./components/PawLoader";
import EmptyState from "./components/EmptyState";
import {
  ChevronLeft, ChevronRight, Quote, Sparkles,
  Zap, Leaf, Gift, Phone, Mail, MapPin,
  Package as PackageIcon, ShoppingBag, DollarSign,
  ArrowRight, Store, ShieldCheck, Truck, Heart, Star, Users, Award,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CATEGORY_TILES = [
  {
    title: "Cat Food",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
    href: "/shop?petType=cat&category=food",
    color: "from-purple-500/20 to-pink-500/20"
  },
  {
    title: "Dog Food",
    image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&q=80",
    href: "/shop?petType=dog&category=food",
    color: "from-blue-500/20 to-teal-500/20"
  },
  {
    title: "Cat Litter",
    image: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=400&q=80",
    href: "/shop?petType=cat&category=accessories",
    color: "from-amber-500/20 to-orange-500/20"
  },
  {
    title: "Pet Toys",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80",
    href: "/shop?category=toys",
    color: "from-green-500/20 to-emerald-500/20"
  },
];

// Floating elements for hero
const floatingElements = [
  { icon: "🐾", x: "10%", y: "20%", delay: 0, duration: 6 },
  { icon: "🐕", x: "85%", y: "15%", delay: 1, duration: 8 },
  { icon: "🐈", x: "75%", y: "70%", delay: 2, duration: 7 },
  { icon: "🦴", x: "15%", y: "75%", delay: 0.5, duration: 9 },
  { icon: "⭐", x: "50%", y: "10%", delay: 1.5, duration: 5 },
  { icon: "❤️", x: "90%", y: "50%", delay: 0.8, duration: 6.5 },
];

// Helper function to get time ago
const getTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  return past.toLocaleDateString();
};

// Helper function to get pet emoji from product name
const getPetEmoji = (productName: string) => {
  const name = productName?.toLowerCase() || "";
  if (name.includes("dog") || name.includes("puppy")) return "🐕";
  if (name.includes("cat") || name.includes("kitten")) return "🐈";
  if (name.includes("bird") || name.includes("parrot")) return "🐦";
  if (name.includes("fish")) return "🐟";
  if (name.includes("rabbit") || name.includes("bunny")) return "🐰";
  return "🐾";
};

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [realStats, setRealStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalReviews: 0,
  });
  const [countedStats, setCountedStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalReviews: 0,
  });
  
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  // Auto-play reviews
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoPlay && reviews.length > 1) {
      interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, reviews.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log("🔍 Fetching data from:", API_URL);
        
        // ✅ Fetch products - SHOW ALL PRODUCTS (no filtering)
        let featuredProducts = [];
        let productCount = 0;
        try {
          const productsRes = await fetch(`${API_URL}/api/products`);
          console.log("📦 Products response status:", productsRes.status);
          
          if (productsRes.ok) {
            const productsData = await productsRes.json();
            console.log("📦 Products data:", productsData);
            
            if (productsData.success && productsData.data) {
              const allProducts = productsData.data;
              productCount = allProducts.length;
              
              // ✅ REMOVED FILTERS - Show all products
              // No price filter, no approval status filter
              featuredProducts = allProducts.slice(0, 8);
              
              console.log(`✅ Showing ${featuredProducts.length} featured products out of ${productCount} total`);
              console.log("📦 Products:", featuredProducts.map((p: any) => ({ name: p.name, price: p.price, status: p.approvalStatus })));
            }
          } else {
            console.error("❌ Products API returned status:", productsRes.status);
          }
        } catch (err) {
          console.error("❌ Failed to fetch products:", err);
        }
        setProducts(featuredProducts);

        // ✅ Fetch reviews
        let reviewsData: any[] = [];
        try {
          const reviewsRes = await fetch(`${API_URL}/api/reviews`);
          console.log("⭐ Reviews response status:", reviewsRes.status);
          
          if (reviewsRes.ok) {
            const reviewsResult = await reviewsRes.json();
            console.log("⭐ Reviews data:", reviewsResult);
            
            if (reviewsResult.success && reviewsResult.data) {
              reviewsData = reviewsResult.data;
              setReviews(reviewsData);
            }
          }
        } catch (err) {
          console.error("❌ Failed to fetch reviews:", err);
        }

        // ✅ Fetch real stats
        let totalUsers = 0;
        let totalVendors = 0;

        try {
          const statsRes = await fetch(`${API_URL}/api/stats`);
          console.log("📊 Stats response status:", statsRes.status);
          
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            console.log("📊 Stats data:", statsData);
            
            if (statsData.success && statsData.data) {
              totalUsers = statsData.data.userCount || 0;
              totalVendors = statsData.data.vendorCount || 0;
              console.log(`✅ Stats: Users=${totalUsers}, Vendors=${totalVendors}`);
            }
          }
        } catch (err) {
          console.error("❌ Failed to fetch public stats:", err);
        }

        if (totalVendors === 0) {
          try {
            const vendorsRes = await fetch(`${API_URL}/api/vendor`);
            if (vendorsRes.ok) {
              const vendorsData = await vendorsRes.json();
              if (vendorsData.success && vendorsData.data) {
                totalVendors = vendorsData.data.length || 0;
              }
            }
          } catch (err) {
            console.error("❌ Failed to fetch vendors:", err);
          }
        }

        // ✅ FIXED: no more fake "|| 1" fallbacks masking real zero counts
        const finalStats = {
          totalUsers: totalUsers,
          totalVendors: totalVendors,
          totalProducts: productCount || featuredProducts.length,
          totalReviews: reviewsData.length,
        };
        
        console.log("✅ Final stats:", finalStats);
        setRealStats(finalStats);

      } catch (err) {
        console.error("❌ Error fetching data:", err);
        // ✅ FIXED: reflect a real failed/empty state instead of fake "1"s
        setRealStats({
          totalUsers: 0,
          totalVendors: 0,
          totalProducts: 0,
          totalReviews: 0,
        });
        toast.error("Failed to load some data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Animate stats counting
  useEffect(() => {
    const duration = 1500;
    const steps = 50;
    const interval = duration / steps;

    const targetStats = {
      totalUsers: realStats.totalUsers,
      totalVendors: realStats.totalVendors,
      totalProducts: realStats.totalProducts,
      totalReviews: realStats.totalReviews,
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCountedStats({
        totalUsers: Math.floor(targetStats.totalUsers * progress),
        totalVendors: Math.floor(targetStats.totalVendors * progress),
        totalProducts: Math.floor(targetStats.totalProducts * progress),
        totalReviews: Math.floor(targetStats.totalReviews * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCountedStats(targetStats);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [realStats]);

  const nextReview = () => {
    if (reviews.length === 0) return;
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const prevReview = () => {
    if (reviews.length === 0) return;
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const currentReview = reviews.length > 0 ? reviews[currentReviewIndex] : null;
  const totalReviews = reviews.length;

  return (
    <>
      <Navbar />

      {/* SECTION 1: HERO WITH ANIMATED REVIEW */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative overflow-hidden min-h-screen flex items-center"
      >
        <div className="absolute inset-0 gradient-brand">
          {floatingElements.map((el, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl md:text-5xl pointer-events-none"
              style={{ left: el.x, top: el.y }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: el.duration,
                delay: el.delay,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {el.icon}
            </motion.div>
          ))}
          
          <motion.div 
            className="absolute top-20 left-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm mb-6 border border-white/20"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                No. 1 Online Pet Shop in Bangladesh
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎉
                </motion.span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-white"
              >
                Everything your pet
                <span className="text-yellow-300 block">needs, delivered</span>
                with love. ❤️
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/80 mb-8"
              >
                Buy at the best price — premium food, toys, and accessories from verified vendors across Bangladesh.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link 
                  href="/shop" 
                  className="group bg-white text-teal-700 px-8 py-3 rounded-full font-semibold hover:scale-105 transition flex items-center gap-2 shadow-lg"
                >
                  Shop Now 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
                <Link 
                  href="/login" 
                  className="border border-white/40 backdrop-blur-sm px-8 py-3 rounded-full font-semibold text-white hover:bg-white/10 transition flex items-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  Become a Vendor
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-6 mt-8 text-white/70 text-sm"
              >
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verified Vendors
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  Fast Delivery
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-rose-400" />
                  10k+ Happy Pets
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-3 -right-3 bg-rose-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  {totalReviews > 0 ? `${totalReviews} Reviews` : "Live Review"}
                </motion.div>

                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
                  className="rounded-2xl overflow-hidden mb-6"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80"
                    alt="Happy pets"
                    className="w-full h-64 object-cover"
                    width={800}
                    height={300}
                  />
                </motion.div>

                <div className="relative">
                  <AnimatePresence mode="wait">
                    {currentReview ? (
                      <motion.div
                        key={currentReviewIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/5 rounded-xl p-5"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                              {currentReview.userName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <motion.div
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -bottom-1 -right-1 text-lg"
                            >
                              {getPetEmoji(currentReview.productName)}
                            </motion.div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">{currentReview.userName || 'Anonymous'}</p>
                              <span className="text-white/40 text-xs">•</span>
                              <span className="text-white/60 text-xs">
                                {currentReview.createdAt ? getTimeAgo(currentReview.createdAt) : 'Just now'}
                              </span>
                            </div>
                            <div className="flex gap-0.5 text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < (currentReview.rating || 0) ? 'fill-current' : 'opacity-30'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed">
                          "{currentReview.comment || 'No comment provided'}"
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-white/50 text-xs">
                          <span>{currentReview.productName ? `⭐ ${currentReview.productName}` : '⭐ Product'}</span>
                          <span className="w-1 h-1 rounded-full bg-white/30"></span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                            {Math.floor(Math.random() * 50) + 5} likes
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/5 rounded-xl p-5 text-center text-white/50"
                      >
                        <p>No reviews yet. Be the first to review! 🐾</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {totalReviews > 1 && (
                    <>
                      <button
                        onClick={prevReview}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 text-white transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextReview}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 text-white transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {totalReviews > 1 && (
                  <div className="flex justify-center gap-1.5 mt-4">
                    {reviews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentReviewIndex(index);
                          setAutoPlay(false);
                          setTimeout(() => setAutoPlay(true), 5000);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentReviewIndex 
                            ? 'w-8 bg-white' 
                            : 'w-1.5 bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 2: STATS COUNTER - Only 4 Stats */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase text-teal-600 tracking-wide">Trusted by Thousands</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Pawify in Numbers</h2>
            <p className="text-slate-500 mt-2">Real-time statistics from our platform</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Happy Customers", value: countedStats.totalUsers, suffix: "+", color: "from-blue-500 to-cyan-500" },
              { icon: Store, label: "Verified Vendors", value: countedStats.totalVendors, suffix: "+", color: "from-teal-500 to-emerald-500" },
              { icon: PackageIcon, label: "Products Available", value: countedStats.totalProducts, suffix: "+", color: "from-purple-500 to-pink-500" },
              { icon: Star, label: "Total Reviews", value: countedStats.totalReviews, suffix: "+", color: "from-amber-500 to-orange-500" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-slate-50 hover:shadow-lg transition group"
              >
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <motion.p 
                  className="text-2xl md:text-3xl font-bold text-slate-900"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
                >
                  {stat.value.toLocaleString()}{stat.suffix}
                </motion.p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: WHY PAWIFY */}
      <section className="py-16 bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase text-teal-600 tracking-wide">Why Pawify</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Built with Love for Pets</h2>
            <p className="text-slate-500 mt-2">We're on a mission to make pet parenting easier in Bangladesh</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: "Quality Guaranteed",
                desc: "Every product is verified for quality and safety before listing",
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Same-day delivery in Dhaka and 24-48 hours nationwide",
                color: "from-blue-400 to-cyan-500"
              },
              {
                icon: Heart,
                title: "Pet-First Approach",
                desc: "We prioritize your pet's health and happiness above everything",
                color: "from-rose-400 to-pink-500"
              },
              {
                icon: ShieldCheck,
                title: "Secure Shopping",
                desc: "Safe payments and buyer protection on every purchase",
                color: "from-emerald-400 to-teal-500"
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase text-teal-600 tracking-wide">Why Choose Us</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">What Makes Pawify Special</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Truck, 
                title: "Fast Delivery", 
                desc: "Same-day delivery across Dhaka and 24-hour delivery nationwide.",
                color: "from-blue-500 to-cyan-500"
              },
              { 
                icon: ShieldCheck, 
                title: "Verified Vendors", 
                desc: "Every shop and product is manually reviewed for quality and authenticity.",
                color: "from-teal-500 to-emerald-500"
              },
              { 
                icon: Store, 
                title: "Wide Selection", 
                desc: "From premium food to toys, grooming & health - everything under one roof.",
                color: "from-purple-500 to-pink-500"
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition`}>
                  <f.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-xl text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CATEGORIES */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase text-teal-600 tracking-wide">Pet Food & Accessories</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Shop by Category</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:row-span-2"
            >
              <Link href={CATEGORY_TILES[0].href} className="relative rounded-3xl overflow-hidden group h-64 md:h-[400px] block">
                <Image
                  src={CATEGORY_TILES[0].image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  width={400}
                  height={400}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_TILES[0].color} opacity-20`} />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-white text-2xl font-bold block">{CATEGORY_TILES[0].title}</span>
                  <span className="text-white/70 text-sm">Shop Now →</span>
                </div>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {CATEGORY_TILES.slice(1, 3).map((tile, i) => (
                <motion.div
                  key={tile.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={tile.href} className="relative rounded-3xl overflow-hidden group h-40 md:h-[192px] block">
                    <Image
                      src={tile.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      width={400}
                      height={192}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} opacity-20`} />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-white font-semibold text-sm block">{tile.title}</span>
                      <span className="text-white/60 text-xs">Browse →</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Link href={CATEGORY_TILES[3].href} className="relative rounded-3xl overflow-hidden group h-64 md:h-[400px] block">
                <Image
                  src={CATEGORY_TILES[3].image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  width={400}
                  height={400}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_TILES[3].color} opacity-20`} />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-white text-2xl font-bold block">{CATEGORY_TILES[3].title}</span>
                  <span className="text-white/70 text-sm">Shop Now →</span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FEATURED PRODUCTS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase text-teal-600 tracking-wide">Pawify Exclusive</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Featured Products</h2>
            <p className="text-slate-500 mt-2">Explore the best quality supplies for your furry friends.</p>
          </motion.div>

          {loading ? (
            <PawLoader />
          ) : products.length === 0 ? (
            <EmptyState 
              title="No products available" 
              subtitle="Check back soon for new products! 🐾" 
            />
          ) : (
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {products.map((p) => (
                <motion.div 
                  key={p._id} 
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -5 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border border-teal-600 text-teal-700 px-8 py-3 rounded-full font-semibold hover:bg-teal-600 hover:text-white transition group"
            >
              View All Products 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 7: REAL REVIEWS */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase text-teal-600 tracking-wide">What Pet Parents Say</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Real Reviews from Real Customers</h2>
            <p className="text-slate-500 mt-2">Based on {totalReviews} real customer reviews</p>
          </motion.div>

          {loading ? (
            <PawLoader />
          ) : reviews.length === 0 ? (
            <EmptyState 
              title="No reviews yet" 
              subtitle="Be the first to leave a review! 🐾" 
            />
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((review, i) => (
                <motion.div
                  key={review._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                      {review.userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{review.userName || 'Anonymous'}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        {review.createdAt ? getTimeAgo(review.createdAt) : 'Just now'}
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        {getPetEmoji(review.productName)} {review.productName || 'Pet Product'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? 'fill-current' : 'opacity-30'}`} />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                    {review.comment || 'No comment provided'}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    {Math.floor(Math.random() * 30) + 5} likes
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 transition group"
            >
              Read All {totalReviews} Reviews 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8: NEWSLETTER */}
      <section className="py-16 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">Join Our Newsletter</h2>
            <p className="text-white/80 mb-6 text-sm">Get updates on new arrivals and exclusive offers for your pets.</p>
            <form className="flex gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-full border-0 outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button className="bg-white text-teal-700 px-6 py-3 rounded-full font-semibold hover:scale-105 transition flex items-center gap-2">
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-white/60 text-xs mt-4">No spam, unsubscribe anytime. 🐾</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}