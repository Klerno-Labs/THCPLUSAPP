"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  strainType?: string | null;
  thcPercentage?: number | null;
  cbdPercentage?: number | null;
  inStock: boolean;
  weight?: string | null;
  category: {
    nameEn: string;
    slug: string;
  };
  avgRating?: number;
  _count?: {
    reviews: number;
  };
}

interface Category {
  id: string;
  nameEn: string;
  slug: string;
  _count?: {
    products: number;
  };
}

interface ProductsGridProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}

const strainTypes = ["SATIVA", "INDICA", "HYBRID", "CBD"] as const;

const priceRanges = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "Over $100", min: 100, max: Infinity },
] as const;

export default function ProductsGrid({
  products,
  categories,
  initialCategory,
}: ProductsGridProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || ""
  );
  const [selectedStrain, setSelectedStrain] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState(-1);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name">(
    "default"
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedStrain) count++;
    if (selectedPriceRange >= 0) count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategory, selectedStrain, selectedPriceRange, inStockOnly]);

  const clearFilters = useCallback(() => {
    setSelectedCategory("");
    setSelectedStrain("");
    setSelectedPriceRange(-1);
    setInStockOnly(false);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.nameEn.toLowerCase().includes(q) ||
          (p.strainType && p.strainType.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory) {
      result = result.filter(
        (p) => p.category.slug === selectedCategory
      );
    }

    // Strain
    if (selectedStrain) {
      result = result.filter((p) => p.strainType === selectedStrain);
    }

    // Price range
    if (selectedPriceRange >= 0) {
      const range = priceRanges[selectedPriceRange];
      result = result.filter(
        (p) => p.price >= range.min && p.price < range.max
      );
    }

    // In stock
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
    selectedStrain,
    selectedPriceRange,
    inStockOnly,
    sortBy,
  ]);

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="sticky top-14 z-30 border-b border-emerald-900/30 bg-[#090F09]/95 backdrop-blur-md sm:top-16">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Sort dropdown */}
            <div className="relative hidden sm:block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 appearance-none rounded-lg border border-emerald-900/50 bg-zinc-900/80 px-3 pr-8 text-sm text-zinc-200 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-emerald-900/30 bg-[#0D150D]"
          >
            <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6">
              {/* Categories */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      !selectedCategory
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                    )}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === cat.slug ? "" : cat.slug
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        selectedCategory === cat.slug
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      )}
                    >
                      {cat.nameEn}
                      {cat._count?.products != null && (
                        <span className="ml-1 text-zinc-600">
                          ({cat._count.products})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strain Type */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Strain Type
                </h4>
                <div className="flex flex-wrap gap-2">
                  {strainTypes.map((strain) => (
                    <button
                      key={strain}
                      onClick={() =>
                        setSelectedStrain(
                          selectedStrain === strain ? "" : strain
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        selectedStrain === strain
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      )}
                    >
                      {strain}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Price Range
                </h4>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setSelectedPriceRange(
                          selectedPriceRange === i ? -1 : i
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        selectedPriceRange === i
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* In stock + Clear */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-zinc-300">
                    In stock only
                  </span>
                </label>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filter badges (mobile sort included) */}
      {(activeFilterCount > 0 || search) && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {search && (
              <Badge
                variant="outline"
                className="gap-1 text-xs"
              >
                Search: &ldquo;{search}&rdquo;
                <button onClick={() => setSearch("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="outline" className="gap-1 text-xs">
                {categories.find((c) => c.slug === selectedCategory)?.nameEn}
                <button onClick={() => setSelectedCategory("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedStrain && (
              <Badge variant="outline" className="gap-1 text-xs">
                {selectedStrain}
                <button onClick={() => setSelectedStrain("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedPriceRange >= 0 && (
              <Badge variant="outline" className="gap-1 text-xs">
                {priceRanges[selectedPriceRange].label}
                <button onClick={() => setSelectedPriceRange(-1)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {inStockOnly && (
              <Badge variant="outline" className="gap-1 text-xs">
                In Stock
                <button onClick={() => setInStockOnly(false)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <p className="text-sm text-zinc-500">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-emerald-900/30 py-16">
            <Filter className="h-8 w-8 text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-300">
              No products found
            </h3>
            <p className="text-sm text-zinc-500">
              Try adjusting your search or filters
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={clearFilters} className="mt-2">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
