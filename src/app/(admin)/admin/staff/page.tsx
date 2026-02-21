"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Download,
  Plus,
  X,
  Medal,
  Timer,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getStaffAccounts,
  addStaffAccount,
  removeStaffAccount,
  updateStaffAccount,
  type StaffAccount,
  type StaffRole,
} from "@/lib/staff-store";

// ─── Types ───────────────────────────────────────────────
interface StaffMember extends StaffAccount {
  ordersProcessed: number;
  avgConfirmTime: number;
  avgReadyTime: number;
  completionRate: number;
  todayOrders: number;
  weekOrders: number;
}

type LeaderboardPeriod = "daily" | "weekly";

// ─── Helpers ─────────────────────────────────────────────
function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function getRoleBadge(role: string): string {
  switch (role) {
    case "OWNER":
      return "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20";
    case "DEV":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "MANAGER":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "STAFF":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

/** Generate mock performance stats for a staff member */
function generateStats(account: StaffAccount): StaffMember {
  const seed = account.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (min: number, max: number) =>
    min + (((seed * 9301 + 49297) % 233280) / 233280) * (max - min);

  return {
    ...account,
    ordersProcessed: Math.floor(rand(50, 1300)),
    avgConfirmTime: Math.floor(rand(30, 75)),
    avgReadyTime: Math.floor(rand(300, 550)),
    completionRate: Number(rand(93, 99.5).toFixed(1)),
    todayOrders: account.isActive ? Math.floor(rand(0, 25)) : 0,
    weekOrders: account.isActive ? Math.floor(rand(20, 120)) : 0,
  };
}

// ─── Add Staff Modal ─────────────────────────────────────
interface AddStaffModalProps {
  onClose: () => void;
  onAdd: (data: {
    name: string;
    email: string;
    password: string;
    role: StaffRole;
  }) => string | null;
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

  const handleSubmit = (e: React.FormEvent) => {
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

    const result = onAdd(form);
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
            <Button type="submit">Add Staff Member</Button>
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
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] =
    useState<LeaderboardPeriod>("daily");
  const [showAddModal, setShowAddModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);

  // Get current user from session
  const [currentEmail, setCurrentEmail] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("thcplus-staff-session");
      if (raw) {
        const session = JSON.parse(raw);
        setCurrentEmail(session.email || "");
      }
    } catch {}
  }, []);

  // Load staff from localStorage-backed store
  useEffect(() => {
    const accounts = getStaffAccounts();
    setStaff(accounts.map(generateStats));
  }, []);

  // ─── Leaderboard ────────────────────────────────────────
  const leaderboard = useMemo(() => {
    const active = staff.filter((s) => s.isActive);
    return [...active].sort((a, b) => {
      if (leaderboardPeriod === "daily") {
        return b.todayOrders - a.todayOrders;
      }
      return b.weekOrders - a.weekOrders;
    });
  }, [staff, leaderboardPeriod]);

  // ─── Export to CSV ────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    const headers = [
      "Name",
      "Email",
      "Role",
      "Status",
      "Joined",
      "Orders Processed",
      "Avg Confirm Time",
      "Completion Rate",
      "Today Orders",
      "Week Orders",
    ];
    const rows = staff.map((s) => [
      s.name,
      s.email,
      s.role,
      s.isActive ? "Active" : "Inactive",
      s.joinedAt,
      s.ordersProcessed,
      formatTime(s.avgConfirmTime),
      `${s.completionRate}%`,
      s.todayOrders,
      s.weekOrders,
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
    (data: {
      name: string;
      email: string;
      password: string;
      role: StaffRole;
    }): string | null => {
      const result = addStaffAccount(data);
      if ("error" in result) return result.error;

      const accounts = getStaffAccounts();
      setStaff(accounts.map(generateStats));
      return null;
    },
    []
  );

  // ─── Remove Staff ─────────────────────────────────────────
  const handleRemoveStaff = useCallback((member: StaffMember) => {
    const success = removeStaffAccount(member.id);
    if (success) {
      const accounts = getStaffAccounts();
      setStaff(accounts.map(generateStats));
    }
    setRemoveTarget(null);
  }, []);

  // ─── Toggle Active/Inactive ───────────────────────────────
  const handleToggleActive = useCallback((member: StaffMember) => {
    updateStaffAccount(member.id, { isActive: !member.isActive });
    const accounts = getStaffAccounts();
    setStaff(accounts.map(generateStats));
  }, []);

  const medalColors = ["text-[#D4AF37]", "text-zinc-300", "text-amber-700"];

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

      {/* ─── Leaderboard ─────────────────────────────────── */}
      {leaderboard.length > 0 && (
        <div className="mb-6 rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-[#D4AF37]" />
              <h3 className="text-sm font-semibold text-zinc-200">
                Leaderboard
              </h3>
            </div>
            <div className="flex gap-1 rounded-lg bg-[#090F09] p-1">
              {(["daily", "weekly"] as LeaderboardPeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setLeaderboardPeriod(period)}
                  className={cn(
                    "rounded-md px-3 py-1 text-[11px] font-medium capitalize transition-colors",
                    leaderboardPeriod === period
                      ? "bg-emerald-600/20 text-emerald-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {leaderboard.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-4 py-3 transition-colors",
                  index === 0
                    ? "bg-[#D4AF37]/5 border border-[#D4AF37]/20"
                    : index === 1
                    ? "bg-zinc-400/5 border border-zinc-400/10"
                    : index === 2
                    ? "bg-amber-700/5 border border-amber-700/10"
                    : "bg-[#090F09]"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {index < 3 ? (
                    <Medal className={cn("h-5 w-5", medalColors[index])} />
                  ) : (
                    <span className="text-sm font-bold text-zinc-600">
                      #{index + 1}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-200">
                    {member.name}
                  </p>
                  <Badge
                    className={cn("mt-0.5 text-[10px]", getRoleBadge(member.role))}
                  >
                    {member.role}
                  </Badge>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">
                    {leaderboardPeriod === "daily"
                      ? member.todayOrders
                      : member.weekOrders}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {leaderboardPeriod === "daily" ? "today" : "this week"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

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
                  Total Orders
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Avg Confirm
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Completion
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

                      {/* Total Orders */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-zinc-200">
                          {member.ordersProcessed.toLocaleString()}
                        </span>
                      </td>

                      {/* Avg Confirm Time */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Timer className="h-3.5 w-3.5 text-zinc-500" />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              member.avgConfirmTime <= 45
                                ? "text-emerald-400"
                                : member.avgConfirmTime <= 60
                                ? "text-yellow-400"
                                : "text-red-400"
                            )}
                          >
                            {formatTime(member.avgConfirmTime)}
                          </span>
                        </div>
                      </td>

                      {/* Completion Rate */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                member.completionRate >= 97
                                  ? "bg-emerald-500"
                                  : member.completionRate >= 95
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              )}
                              style={{ width: `${member.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-zinc-300">
                            {member.completionRate}%
                          </span>
                        </div>
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
