"use client";

import React, { useState, useCallback, useMemo } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  inStock: boolean;
  thcContent?: string;
  cbdContent?: string;
  strain?: string;
  imageUrl?: string;
  sku: string;
  createdAt: string;
}

type SortField = "name" | "category" | "price" | "quantity" | "createdAt";
type SortDirection = "asc" | "desc";

// ─── Mock Data ───────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Flower",
  "Pre-Rolls",
  "Edibles",
  "Concentrates",
  "Vaporizers",
  "Tinctures",
  "Topicals",
  "Accessories",
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Blue Dream",
    category: "Flower",
    price: 42.0,
    quantity: 85,
    inStock: true,
    thcContent: "21%",
    cbdContent: "0.1%",
    strain: "Hybrid",
    sku: "FLW-BD-35",
    createdAt: "2025-01-15",
  },
  {
    id: "p2",
    name: "Sour Diesel",
    category: "Flower",
    price: 75.0,
    quantity: 42,
    inStock: true,
    thcContent: "26%",
    cbdContent: "0.2%",
    strain: "Sativa",
    sku: "FLW-SD-70",
    createdAt: "2025-01-18",
  },
  {
    id: "p3",
    name: "OG Kush Cartridge 1g",
    category: "Vaporizers",
    price: 45.0,
    quantity: 120,
    inStock: true,
    thcContent: "89%",
    strain: "Indica",
    sku: "VAP-OGK-10",
    createdAt: "2025-02-01",
  },
  {
    id: "p4",
    name: "Mango Kush Gummies 10mg",
    category: "Edibles",
    price: 28.0,
    quantity: 200,
    inStock: true,
    thcContent: "10mg/pc",
    sku: "EDI-MKG-10",
    createdAt: "2025-02-05",
  },
  {
    id: "p5",
    name: "Wedding Cake",
    category: "Flower",
    price: 48.0,
    quantity: 0,
    inStock: false,
    thcContent: "25%",
    cbdContent: "0.1%",
    strain: "Hybrid",
    sku: "FLW-WC-35",
    createdAt: "2025-01-20",
  },
  {
    id: "p6",
    name: "CBD Tincture 1000mg",
    category: "Tinctures",
    price: 55.0,
    quantity: 65,
    inStock: true,
    cbdContent: "1000mg",
    sku: "TIN-CBD-1000",
    createdAt: "2025-02-10",
  },
  {
    id: "p7",
    name: "Jack Herer Pre-Roll 1g",
    category: "Pre-Rolls",
    price: 12.0,
    quantity: 300,
    inStock: true,
    thcContent: "22%",
    strain: "Sativa",
    sku: "PRE-JH-10",
    createdAt: "2025-02-08",
  },
  {
    id: "p8",
    name: "Live Resin Wax 1g",
    category: "Concentrates",
    price: 52.0,
    quantity: 35,
    inStock: true,
    thcContent: "78%",
    strain: "Indica",
    sku: "CON-LRW-10",
    createdAt: "2025-02-12",
  },
  {
    id: "p9",
    name: "Chocolate Edible Bar 100mg",
    category: "Edibles",
    price: 30.0,
    quantity: 90,
    inStock: true,
    thcContent: "100mg total",
    sku: "EDI-CHO-100",
    createdAt: "2025-02-03",
  },
  {
    id: "p10",
    name: "Pain Relief Balm 500mg",
    category: "Topicals",
    price: 38.0,
    quantity: 50,
    inStock: true,
    cbdContent: "500mg",
    sku: "TOP-PRB-500",
    createdAt: "2025-01-25",
  },
  {
    id: "p11",
    name: "Granddaddy Purple",
    category: "Flower",
    price: 42.0,
    quantity: 15,
    inStock: true,
    thcContent: "23%",
    cbdContent: "0.1%",
    strain: "Indica",
    sku: "FLW-GDP-35",
    createdAt: "2025-02-14",
  },
  {
    id: "p12",
    name: "Glass Pipe Premium",
    category: "Accessories",
    price: 35.0,
    quantity: 25,
    inStock: true,
    sku: "ACC-GPP-01",
    createdAt: "2025-01-10",
  },
  {
    id: "p13",
    name: "Northern Lights 7g",
    category: "Flower",
    price: 72.0,
    quantity: 28,
    inStock: true,
    thcContent: "24%",
    strain: "Indica",
    sku: "FLW-NL-70",
    createdAt: "2025-02-16",
  },
  {
    id: "p14",
    name: "Pineapple Express Pre-Roll 5pk",
    category: "Pre-Rolls",
    price: 35.0,
    quantity: 0,
    inStock: false,
    thcContent: "20%",
    strain: "Hybrid",
    sku: "PRE-PE-50",
    createdAt: "2025-02-11",
  },
];

const ITEMS_PER_PAGE = 8;

// ─── Product Form Dialog ─────────────────────────────────
interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
}

function ProductFormDialog({ product, onClose, onSave }: ProductFormProps) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "Flower",
    price: product?.price?.toString() || "",
    quantity: product?.quantity?.toString() || "0",
    thcContent: product?.thcContent || "",
    cbdContent: product?.cbdContent || "",
    strain: product?.strain || "",
    sku: product?.sku || "",
    inStock: product?.inStock ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...product,
      name: form.name,
      category: form.category,
      price: parseFloat(form.price) || 0,
      quantity: parseInt(form.quantity) || 0,
      thcContent: form.thcContent || undefined,
      cbdContent: form.cbdContent || undefined,
      strain: form.strain || undefined,
      sku: form.sku,
      inStock: form.inStock,
    });
    onClose();
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
          <div className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-900/30 bg-[#090F09] transition-colors hover:border-emerald-700/50">
            <Upload className="mb-2 h-6 w-6 text-zinc-600" />
            <span className="text-xs text-zinc-600">
              Click to upload product image
            </span>
            <span className="mt-0.5 text-[10px] text-zinc-700">
              PNG, JPG up to 5MB
            </span>
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
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-emerald-900/50 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                SKU
              </label>
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="FLW-BD-35"
                required
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
                THC Content
              </label>
              <Input
                value={form.thcContent}
                onChange={(e) =>
                  setForm({ ...form, thcContent: e.target.value })
                }
                placeholder="e.g. 21%"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                CBD Content
              </label>
              <Input
                value={form.cbdContent}
                onChange={(e) =>
                  setForm({ ...form, cbdContent: e.target.value })
                }
                placeholder="e.g. 0.1%"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">
                Strain Type
              </label>
              <select
                value={form.strain}
                onChange={(e) => setForm({ ...form, strain: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-emerald-900/50 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="">None</option>
                <option value="Indica">Indica</option>
                <option value="Sativa">Sativa</option>
                <option value="Hybrid">Hybrid</option>
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
            <Button type="submit">
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
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuantityId, setEditingQuantityId] = useState<string | null>(null);
  const [editingQuantityValue, setEditingQuantityValue] = useState("");

  // ─── Filtering & Sorting ────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category
    if (categoryFilter !== "All") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
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

  const handleToggleStock = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
  }, []);

  const handleQuantitySave = useCallback(
    (productId: string) => {
      const qty = parseInt(editingQuantityValue);
      if (!isNaN(qty) && qty >= 0) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, quantity: qty } : p
          )
        );
      }
      setEditingQuantityId(null);
    },
    [editingQuantityValue]
  );

  const handleSaveProduct = useCallback(
    (data: Partial<Product>) => {
      if (data.id) {
        // Edit existing
        setProducts((prev) =>
          prev.map((p) => (p.id === data.id ? { ...p, ...data } : p))
        );
      } else {
        // Add new
        const newProduct: Product = {
          id: `p_${Date.now()}`,
          name: data.name || "",
          category: data.category || "Flower",
          price: data.price || 0,
          quantity: data.quantity || 0,
          inStock: data.inStock ?? true,
          thcContent: data.thcContent,
          cbdContent: data.cbdContent,
          strain: data.strain,
          sku: data.sku || "",
          createdAt: new Date().toISOString().split("T")[0],
        };
        setProducts((prev) => [newProduct, ...prev]);
      }
    },
    []
  );

  const handleDeleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

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
            placeholder="Search products, SKUs..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {CATEGORIES.map((cat) => (
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

      {/* ─── Product Table ───────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-emerald-900/30 bg-[#111A11]">
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
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#090F09]">
                        <ImageIcon className="h-4 w-4 text-zinc-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span>{product.sku}</span>
                          {product.strain && (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px]"
                            >
                              {product.strain}
                            </Badge>
                          )}
                          {product.thcContent && (
                            <span>THC {product.thcContent}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-400">
                      {product.category}
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
                      onClick={() => handleToggleStock(product.id)}
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
