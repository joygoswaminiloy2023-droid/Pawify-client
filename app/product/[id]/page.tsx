"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, ArrowLeft, Minus, Plus, Store } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import PawLoader from "@/app/components/PawLoader";
import Navbar from "@/app/components/Navbar";
import ProductCard from "@/app/components/ProductCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  // Fetch related products once we know the current product's category/petType
  useEffect(() => {
    if (!product) return;

    setRelatedLoading(true);
    const query = new URLSearchParams();
    if (product.category) query.set("category", product.category);

    fetch(`${API_URL}/api/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.data || []).filter((p: any) => p._id !== product._id);

        // Prefer same petType within the same category, then fill with the rest of the category
        const sameType = items.filter((p: any) => p.petType === product.petType);
        const rest = items.filter((p: any) => p.petType !== product.petType);
        setRelated([...sameType, ...rest].slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setRelatedLoading(false));
  }, [product]);

  if (loading) {
    return (
      <>
        <Navbar />
        <PawLoader />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p className="text-slate-400">Product not found.</p>
        </div>
      </>
    );
  }

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      vendorId: product.vendorId,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.images?.[0] || "",
    });
    toast.success(`${product.name} added to cart! 🐾`);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-100 rounded-3xl overflow-hidden h-96 md:h-[480px]"
          >
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🐾</div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-xs font-bold uppercase text-teal-600 mb-2">
              {product.petType} · {product.category}
            </span>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">{product.name}</h1>
            <p className="text-slate-500 mb-6">{product.description}</p>

            <div className="text-3xl font-bold text-teal-700 mb-6">৳{product.price}</div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-slate-500">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-slate-400">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full gradient-brand text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-40"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </motion.button>

            <Link
              href={`/vendors`}
              className="mt-6 flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700 transition"
            >
              <Store className="w-4 h-4" /> Visit vendor's store
            </Link>
          </motion.div>
        </div>

        {/* Related products */}
        {!relatedLoading && related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-20"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">You might also like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}