"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────
interface Category {
  id: string;
  nameEn: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  category: Category;
  price: number;
  quantity: number;
  inStock: boolean;
  thcPercentage: number | null;
  cbdPercentage: number | null;
  strainType: string | null;
  weight: string | null;
  imageUrl?: string;
  descriptionEn?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  createdAt: string;
  _count?: { reviews: number; orderItems: number };
  avgRating?: number | null;
}

type SortField = "name" | "category" | "price" | "quantity" | "createdAt";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 8;

// ─── Product Form Dialog ─────────────────────────────────
interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (product: Product | null, data: Record<string, unknown>) => Promise<void>;
}

function ProductFormDialog({ product, categories, onClose, onSave }: ProductFormProps) {
  const [form, setForm] = useState({
    name: product?.name || "",
    categoryId: product?.categoryId || (categories[0]?.id ?? ""),
    price: product?.price?.toString() || "",
    quantity: product?.quantity?.toString() || "0",
    thcPercentage: product?.thcPercentage?.toString() || "",
    cbdPercentage: product?.cbdPercentage?.toString() || "",
    strainType: product?.strainType || "",
    weight: product?.weight || "",
    inStock: product?.inStock ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  const [imageUrl, setImageUrl] = useState<string>(product?.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      alert("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImageUrl(data.url);
      setImagePreview(data.url);
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        categoryId: form.categoryId,
        price: parseFloat(form.price) || 0,
        quantity: parseInt(form.quantity) || 0,
        inStock: form.inStock,
        thcPercentage: form.thcPercentage ? parseFloat(form.thcPercentage) : null,
        cbdPercentage: form.cbdPercentage ? parseFloat(form.cbdPercentage) : null,
        strainType: form.strainType || null,
        weight: form.weight || null,
        imageUrl: imageUrl || null,
      };
      await onSave(product ?? null, payload);
      onClose();
    } catch (err) {
      console.error("Failed to save product:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-emerald-900/30 bg-[#111A11] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Area */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className={cn(
              "flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
              isUploading
                ? "border-emerald-600/50 bg-emerald-950/20"
                : imagePreview
                ? "border-emerald-700/40 bg-[#090F09]"
                : "border-emerald-900/30 bg-[#090F09] hover:border-emerald-700/50"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-emerald-400" />
                <span className="text-xs text-emerald-400">Uploading...</span>
              </>
            ) : imagePreview ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <Image
                  src={imagePreview}
                  alt="Product preview"
                  width={112}
                  height={112}
                  className="h-28 w-auto rounded-lg object-contain"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                    setImageUrl("");
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-zinc-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mb-2 h-6 w-6 text-zinc-600" />
                <span className="text-xs text-zinc-600">
                  Click or drag to upload product image
                </span>
                <span className="mt-0.5 text-[10px] text-zinc-700">
                  PNG, JPG, WebP up to 5MB
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                Product Name
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Blue Dream 3.5g"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-emerald-900/50 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                Weight
              </label>
              <Input
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="e.g. 3.5g"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                Price ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                Quantity
              </label>
              <Input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                THC %
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.thcPercentage}
                onChange={(e) =>
                  setForm({ ...form, thcPercentage: e.target.value })
                }
                placeholder="e.g. 21.0"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                CBD %
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.cbdPercentage}
                onChange={(e) =>
                  setForm({ ...form, cbdPercentage: e.target.value })
                }
                placeholder="e.g. 0.1"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                Strain Type
              </label>
              <select
                value={form.strainType}
                onChange={(e) => setForm({ ...form, strainType: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-emerald-900/50 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="">None</option>
                <option value="INDICA">Indica</option>
                <option value="SATIVA">Sativa</option>
                <option value="HYBRID">Hybrid</option>
                <option value="CBD">CBD</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-zinc-400">
                In Stock
              </label>
              <button
                type="button"
                onClick={() => setForm({ ...form, inStock: !form.inStock })}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  form.inStock ? "bg-emerald-600" : "bg-zinc-700"
                )}
              >
                <span
                  className={cn(
                    "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                    form.inStock && "translate-x-5"
                  )}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Product Management Page ─────────────────────────────
export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuantityId, setEditingQuantityId] = useState<string | null>(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState("");

  // ─── Fetch Products ────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=200");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const fetchedProducts: Product[] = data.products ?? [];
      setProducts(fetchedProducts);

      // Extract unique categories from products
      const catMap = new Map<string, Category>();
      for (const p of fetchedProducts) {
        if (p.category && !catMap.has(p.category.id)) {
          catMap.set(p.category.id, p.category);
        }
      }
      setCategories(Array.from(catMap.values()).sort((a, b) => a.nameEn.localeCompare(b.nameEn)));
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ─── Category filter labels (derived) ──────────────────
  const categoryFilterOptions = useMemo(() => {
    return ["All", ...categories.map((c) => c.nameEn)];
  }, [categories]);

  // ─── Filtering & Sorting ────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.nameEn.toLowerCase().includes(q) ||
          (p.strainType && p.strainType.toLowerCase().includes(q)) ||
          (p.weight && p.weight.toLowerCase().includes(q))
      );
    }

    // Category
    if (categoryFilter !== "All") {
      result = result.filter((p) => p.category.nameEn === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "category":
          cmp = a.category.nameEn.localeCompare(b.category.nameEn);
          break;
        case "price":
          cmp = a.price - b.price;
          break;
        case "quantity":
          cmp = a.quantity - b.quantity;
          break;
        case "createdAt":
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [products, searchQuery, categoryFilter, sortField, sortDirection]);

  // ─── Pagination ─────────────────────────────────────────
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ─── Handlers ──────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleToggleStock = useCallback(async (productId: string, currentInStock: boolean) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: !currentInStock }),
      });
      if (!res.ok) throw new Error("Failed to toggle stock status");
      await fetchProducts();
    } catch (err) {
      console.error("Error toggling stock:", err);
    }
  }, [fetchProducts]);

  const handleQuantitySave = useCallback(
    async (productId: string) => {
      const qty = parseInt(editingQuantityValue);
      if (!isNaN(qty) && qty >= 0) {
        try {
          const res = await fetch(`/api/products/${productId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: qty }),
          });
          if (!res.ok) throw new Error("Failed to update quantity");
          await fetchProducts();
        } catch (err) {
          console.error("Error updating quantity:", err);
        }
      }
      setEditingQuantityId(null);
    },
    [editingQuantityValue, fetchProducts]
  );

  const handleSaveProduct = useCallback(
    async (existingProduct: Product | null, data: Record<string, unknown>) => {
      if (existingProduct) {
        // Edit existing via PATCH
        const res = await fetch(`/api/products/${existingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to update product");
        }
      } else {
        // Create new via POST
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to create product");
        }
      }
      await fetchProducts();
    },
    [fetchProducts]
  );

  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  }, [fetchProducts]);

  const SortHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
    >
      {children}
      <ArrowUpDown
        className={cn(
          "h-3 w-3",
          sortField === field ? "text-emerald-400" : "text-zinc-700"
        )}
      />
    </button>
  );

  // ─── Loading State ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-sm text-zinc-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <Package className="mr-2 inline-block h-6 w-6 text-emerald-400" />
            Product Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {products.length} products &middot;{" "}
            {products.filter((p) => p.inStock).length} in stock
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* ─── Search & Filters ────────────────────────────── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {categoryFilterOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setCurrentPage(1);
              }}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all",
                categoryFilter === cat
                  ? "bg-emerald-600/15 text-emerald-400"
                  : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Mobile Product Cards (visible below sm breakpoint) ── */}
      <div className="space-y-3 sm:hidden">
        {paginatedProducts.map((product) => (
          <div
            key={product.id}
            className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-4"
          >
            {/* Product header */}
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#090F09]">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="h-12 w-12 object-cover" unoptimized />
                ) : (
                  <ImageIcon className="h-5 w-5 text-zinc-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">
                  {product.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                  {product.weight && <span>{product.weight}</span>}
                  {product.strainType && (
                    <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                      {product.strainType}
                    </Badge>
                  )}
                  {product.thcPercentage != null && (
                    <span>THC {product.thcPercentage}%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-[#090F09] p-2 text-center">
                <p className="text-xs text-zinc-500">Category</p>
                <p className="mt-0.5 text-xs font-medium text-zinc-300 truncate">
                  {product.category.nameEn}
                </p>
              </div>
              <div className="rounded-lg bg-[#090F09] p-2 text-center">
                <p className="text-xs text-zinc-500">Price</p>
                <p className="mt-0.5 text-sm font-medium text-zinc-200">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-[#090F09] p-2 text-center">
                <p className="text-xs text-zinc-500">Qty</p>
                <button
                  onClick={() => {
                    setEditingQuantityId(product.id);
                    setEditingQuantityValue(product.quantity.toString());
                  }}
                  className={cn(
                    "mt-0.5 text-sm font-medium",
                    product.quantity === 0
                      ? "text-red-400"
                      : product.quantity < 20
                      ? "text-yellow-400"
                      : "text-zinc-200"
                  )}
                >
                  {product.quantity}
                </button>
              </div>
            </div>

            {/* Footer: status toggle + actions */}
            <div className="mt-3 flex items-center justify-between border-t border-emerald-900/20 pt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStock(product.id, product.inStock)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    product.inStock ? "bg-emerald-600" : "bg-zinc-700"
                  )}
                  aria-label={product.inStock ? "In Stock - toggle off" : "Out of Stock - toggle on"}
                >
                  <span
                    className={cn(
                      "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                      product.inStock && "translate-x-5"
                    )}
                  />
                </button>
                <span className={cn("text-xs font-medium", product.inStock ? "text-emerald-400" : "text-zinc-500")}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-emerald-950/30 hover:text-emerald-400"
                  aria-label={`Edit ${product.name}`}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-950/30 hover:text-red-400"
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {paginatedProducts.length === 0 && (
          <div className="rounded-xl border border-emerald-900/20 bg-[#111A11] py-12 text-center">
            <p className="text-sm text-zinc-500">No products match your search.</p>
          </div>
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-900/30 bg-[#111A11] px-4 py-3">
            <p className="text-xs text-zinc-500">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}{" "}
              of {filteredProducts.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-emerald-950/30 hover:text-zinc-300 disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs font-medium text-zinc-400">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-emerald-950/30 hover:text-zinc-300 disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Product Table (visible at sm and above) ─────── */}
      <div className="hidden overflow-hidden rounded-xl border border-emerald-900/30 bg-[#111A11] sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-900/20">
                <th className="px-4 py-3 text-left">
                  <SortHeader field="name">Product</SortHeader>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader field="category">Category</SortHeader>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader field="price">Price</SortHeader>
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader field="quantity">Qty</SortHeader>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Status
                  </span>
                </th>
                <th className="px-4 py-3 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-emerald-900/10 transition-colors hover:bg-emerald-950/20"
                >
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#090F09]">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="h-10 w-10 object-cover" unoptimized />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-zinc-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          {product.weight && (
                            <span>{product.weight}</span>
                          )}
                          {product.strainType && (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px]"
                            >
                              {product.strainType}
                            </Badge>
                          )}
                          {product.thcPercentage != null && (
                            <span>THC {product.thcPercentage}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-400">
                      {product.category.nameEn}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-zinc-200">
                      ${product.price.toFixed(2)}
                    </span>
                  </td>

                  {/* Quantity — Inline Editing */}
                  <td className="px-4 py-3">
                    {editingQuantityId === product.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={editingQuantityValue}
                          onChange={(e) =>
                            setEditingQuantityValue(e.target.value)
                          }
                          onBlur={() => handleQuantitySave(product.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleQuantitySave(product.id);
                            if (e.key === "Escape")
                              setEditingQuantityId(null);
                          }}
                          autoFocus
                          className="w-16 rounded border border-emerald-600 bg-[#090F09] px-2 py-1 text-sm text-zinc-200 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQuantitySave(product.id)}
                          className="rounded p-1 text-emerald-400 hover:bg-emerald-950/50"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingQuantityId(product.id);
                          setEditingQuantityValue(product.quantity.toString());
                        }}
                        className={cn(
                          "rounded px-2 py-0.5 text-sm font-medium transition-colors hover:bg-emerald-950/30",
                          product.quantity === 0
                            ? "text-red-400"
                            : product.quantity < 20
                            ? "text-yellow-400"
                            : "text-zinc-200"
                        )}
                        title="Click to edit"
                      >
                        {product.quantity}
                      </button>
                    )}
                  </td>

                  {/* In Stock Toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStock(product.id, product.inStock)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        product.inStock ? "bg-emerald-600" : "bg-zinc-700"
                      )}
                      title={product.inStock ? "In Stock" : "Out of Stock"}
                    >
                      <span
                        className={cn(
                          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                          product.inStock && "translate-x-5"
                        )}
                      />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-emerald-950/30 hover:text-emerald-400"
                        title="Edit product"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-950/30 hover:text-red-400"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-sm text-zinc-500">
                      No products match your search.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ──────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-emerald-900/20 px-4 py-3">
            <p className="text-xs text-zinc-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}{" "}
              of {filteredProducts.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-emerald-950/30 hover:text-zinc-300 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-medium transition-colors",
                      currentPage === page
                        ? "bg-emerald-600/20 text-emerald-400"
                        : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    )}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-emerald-950/30 hover:text-zinc-300 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Product Form Dialog ───────────────────────────── */}
      <AnimatePresence>
        {(showAddForm || editingProduct) && (
          <ProductFormDialog
            product={editingProduct}
            categories={categories}
            onClose={() => {
              setShowAddForm(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
