"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import EmptyState from "../components/EmptyState";
import PawLoader from "../components/PawLoader";
import ProductCard from "../components/ProductCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CATEGORIES = ["all", "food", "toys", "accessories", "grooming", "health"];
const PET_TYPES = ["all", "dog", "cat", "bird", "fish", "small-pet"];
const PAGE_SIZE = 20;

export default function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Source of truth is the URL — the Navbar's search bar and category
  // dropdown navigate here with these query params already set.
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const petType = searchParams.get("petType") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

  const updateFilter = (key: "category" | "petType", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Changing a filter should always take you back to page 1.
    params.delete("page");
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
    // Scroll back to the top of the grid so users see the new page immediately.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      if (petType !== "all") params.set("petType", petType);

      try {
        const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // Note: search/category/petType changes refetch the full matching list;
    // pagination itself is handled client-side below, so `page` is not a dependency here.
  }, [search, category, petType]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = products.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  // If the URL points past the last available page (e.g. after a filter
  // shrinks the result set), snap it back to a valid page.
  useEffect(() => {
    if (page !== safePage) {
      goToPage(safePage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, safePage]);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Shop</h1>
          <p className="text-slate-500">
            {search ? (
              <>Showing results for <span className="font-semibold text-slate-700">"{search}"</span></>
            ) : (
              "Everything your furry, feathery, or scaly friend needs."
            )}
          </p>
        </motion.div>

        {/* Mobile filter toggle (search bar now lives only in the Navbar) */}
        <div className="flex justify-end mb-6 md:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 rounded-full border border-slate-200 text-slate-600 flex items-center gap-2 text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar filters */}
          <motion.aside
            initial={false}
            animate={{ height: showFilters ? "auto" : undefined }}
            className={`${showFilters ? "block" : "hidden"} md:block space-y-6`}
          >
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Category</h4>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateFilter("category", c)}
                    className={`text-left px-3 py-2 rounded-lg text-sm capitalize transition ${
                      category === c ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Pet Type</h4>
              <div className="flex flex-col gap-1">
                {PET_TYPES.map((p) => (
                  <button
                    key={p}
                    onClick={() => updateFilter("petType", p)}
                    className={`text-left px-3 py-2 rounded-lg text-sm capitalize transition ${
                      petType === p ? "bg-teal-50 text-teal-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Product grid */}
          <div>
            {loading ? (
              <PawLoader />
            ) : products.length === 0 ? (
              <EmptyState title="No products found" subtitle="Try a different search or filter." />
            ) : (
              <>
                <motion.div
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                >
                  {paginatedProducts.map((p) => (
                    <motion.div
                      key={p._id}
                      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => goToPage(safePage - 1)}
                      disabled={safePage === 1}
                      className="p-2 rounded-full border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((n) => {
                        // Show first, last, current, and neighbors; collapse the rest.
                        return (
                          n === 1 ||
                          n === totalPages ||
                          Math.abs(n - safePage) <= 1
                        );
                      })
                      .reduce<(number | "ellipsis")[]>((acc, n, i, arr) => {
                        if (i > 0 && n - (arr[i - 1] as number) > 1) {
                          acc.push("ellipsis");
                        }
                        acc.push(n);
                        return acc;
                      }, [])
                      .map((n, i) =>
                        n === "ellipsis" ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">
                            …
                          </span>
                        ) : (
                          <button
                            key={n}
                            onClick={() => goToPage(n)}
                            className={`w-9 h-9 rounded-full text-sm font-medium transition ${
                              n === safePage
                                ? "bg-teal-600 text-white"
                                : "text-slate-600 hover:bg-slate-50 border border-slate-200"
                            }`}
                          >
                            {n}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => goToPage(safePage + 1)}
                      disabled={safePage === totalPages}
                      className="p-2 rounded-full border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <p className="text-center text-xs text-slate-400 mt-4">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, products.length)} of {products.length} products
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}