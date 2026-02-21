"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Download,
  Plus,
  X,
  User,
  Mail,
  Shield,
  Lock,
  Trash2,
  UserX,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────
type StaffRole = "OWNER" | "MANAGER" | "STAFF";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────
function getRoleBadge(role: string): string {
  switch (role) {
    case "OWNER":
      return "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20";
    case "MANAGER":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "STAFF":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

// ─── Add Staff Modal ─────────────────────────────────────
interface AddStaffModalProps {
  onClose: () => void;
  onAdd: (data: {
    name: string;
    email: string;
    password: string;
    role: StaffRole;
  }) => Promise<string | null>;
}

function AddStaffModal({ onClose, onAdd }: AddStaffModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as StaffRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    const result = await onAdd(form);
    setLoading(false);

    if (result) {
      setError(result);
      return;
    }
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-900/30 bg-[#111A11] p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-100">Add Staff Member</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-950/30 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="newstaff@thcplus.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 4 characters"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-zinc-600">
              They&apos;ll use this to sign in to the staff portal.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as StaffRole })
                }
                className="flex h-10 w-full rounded-lg border border-emerald-900/50 bg-zinc-900/80 pl-10 pr-3 py-2 text-sm text-zinc-100 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="OWNER">Owner</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Staff Member"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Confirm Remove Modal ────────────────────────────────
interface ConfirmRemoveModalProps {
  staffName: string;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmRemoveModal({
  staffName,
  onClose,
  onConfirm,
}: ConfirmRemoveModalProps) {
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-red-900/30 bg-[#111A11] p-6"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900/20">
            <Trash2 className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">Remove Staff</h3>
            <p className="text-sm text-zinc-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="mb-6 text-sm text-zinc-300">
          Are you sure you want to remove <strong>{staffName}</strong>? They
          will no longer be able to sign in.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Remove
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Staff Management Page ───────────────────────────────
export default function StaffManagementPage() {
  const { data: sessionData } = useSession();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);

  const currentEmail = sessionData?.user?.email || "";

  // Load staff from API
  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // ─── Export to CSV ────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    const headers = ["Name", "Email", "Role", "Status", "Joined"];
    const rows = staff.map((s) => [
      s.name,
      s.email,
      s.role,
      s.isActive ? "Active" : "Inactive",
      new Date(s.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [staff]);

  // ─── Add Staff ────────────────────────────────────────────
  const handleAddStaff = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      role: StaffRole;
    }): Promise<string | null> => {
      try {
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const body = await res.json();
          return body.error || "Failed to add staff member";
        }

        await fetchStaff();
        return null;
      } catch {
        return "Network error. Please try again.";
      }
    },
    [fetchStaff]
  );

  // ─── Remove Staff ─────────────────────────────────────────
  const handleRemoveStaff = useCallback(
    async (member: StaffMember) => {
      try {
        await fetch(`/api/staff/${member.id}`, { method: "DELETE" });
        await fetchStaff();
      } catch (err) {
        console.error("Failed to remove staff:", err);
      }
      setRemoveTarget(null);
    },
    [fetchStaff]
  );

  // ─── Toggle Active/Inactive ───────────────────────────────
  const handleToggleActive = useCallback(
    async (member: StaffMember) => {
      try {
        await fetch(`/api/staff/${member.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !member.isActive }),
        });
        await fetchStaff();
      } catch (err) {
        console.error("Failed to toggle staff:", err);
      }
    },
    [fetchStaff]
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <Trophy className="mr-2 inline-block h-6 w-6 text-emerald-400" />
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {staff.filter((s) => s.isActive).length} active &middot;{" "}
            {staff.length} total staff members
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* ─── Staff Table ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-emerald-900/30 bg-[#111A11]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-900/20">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Staff Member
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Role
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Joined
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {staff.map((member) => {
                  const isCurrentUser = member.email === currentEmail;
                  const isOwner = member.role === "OWNER";

                  return (
                    <motion.tr
                      key={member.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      className={cn(
                        "border-b border-emerald-900/10 transition-colors hover:bg-emerald-950/20",
                        !member.isActive && "opacity-50"
                      )}
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/30 text-sm font-bold text-emerald-400">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">
                              {member.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-[10px] text-zinc-500">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            "text-[11px]",
                            getRoleBadge(member.role)
                          )}
                        >
                          {member.role}
                        </Badge>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-zinc-400">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={member.isActive ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {!isCurrentUser && !isOwner && (
                            <button
                              onClick={() => handleToggleActive(member)}
                              className={cn(
                                "rounded-lg p-1.5 text-zinc-500 transition-colors",
                                member.isActive
                                  ? "hover:bg-yellow-900/20 hover:text-yellow-400"
                                  : "hover:bg-emerald-900/20 hover:text-emerald-400"
                              )}
                              title={
                                member.isActive ? "Deactivate" : "Activate"
                              }
                            >
                              {member.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </button>
                          )}

                          {!isCurrentUser && !isOwner && (
                            <button
                              onClick={() => setRemoveTarget(member)}
                              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-900/20 hover:text-red-400"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                          {(isCurrentUser || isOwner) && (
                            <span className="text-[10px] text-zinc-600">
                              {isCurrentUser ? "You" : "Protected"}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add Staff Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <AddStaffModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddStaff}
          />
        )}
      </AnimatePresence>

      {/* ─── Confirm Remove Modal ─────────────────────────── */}
      <AnimatePresence>
        {removeTarget && (
          <ConfirmRemoveModal
            staffName={removeTarget.name}
            onClose={() => setRemoveTarget(null)}
            onConfirm={() => handleRemoveStaff(removeTarget)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
