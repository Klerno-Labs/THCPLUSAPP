/**
 * Shared staff account store backed by localStorage.
 * Used by both the login page and the staff management page.
 *
 * TODO: Replace with real database + API when PostgreSQL is connected.
 */

export type StaffRole = "OWNER" | "DEV" | "MANAGER" | "STAFF";

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  isActive: boolean;
  joinedAt: string;
}

const STORAGE_KEY = "thcplus-staff-accounts";

// Default accounts seeded on first load
const DEFAULT_ACCOUNTS: StaffAccount[] = [
  {
    id: "staff_owner",
    name: "Marcus Chen",
    email: "owner@thcplus.com",
    password: "owner123",
    role: "OWNER",
    isActive: true,
    joinedAt: "2024-01-01",
  },
  {
    id: "staff_dev",
    name: "Developer",
    email: "dev@thcplus.com",
    password: "dev123",
    role: "DEV",
    isActive: true,
    joinedAt: "2024-01-01",
  },
  {
    id: "staff_manager",
    name: "Alex Johnson",
    email: "manager@thcplus.com",
    password: "manager123",
    role: "MANAGER",
    isActive: true,
    joinedAt: "2024-03-15",
  },
  {
    id: "staff_staff",
    name: "Jordan Rivera",
    email: "staff@thcplus.com",
    password: "staff123",
    role: "STAFF",
    isActive: true,
    joinedAt: "2024-06-01",
  },
];

/** Get all staff accounts. Seeds defaults if localStorage is empty. */
export function getStaffAccounts(): StaffAccount[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StaffAccount[];
      if (parsed.length > 0) return parsed;
    }
  } catch {
    // corrupted data — re-seed
  }

  // Seed defaults
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  return DEFAULT_ACCOUNTS;
}

/** Save the full accounts array to localStorage. */
function saveAccounts(accounts: StaffAccount[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

/** Add a new staff account. Returns the created account. */
export function addStaffAccount(data: {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}): StaffAccount | { error: string } {
  const accounts = getStaffAccounts();

  // Check for duplicate email
  if (accounts.some((a) => a.email.toLowerCase() === data.email.toLowerCase())) {
    return { error: "An account with this email already exists." };
  }

  const newAccount: StaffAccount = {
    id: `staff_${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    role: data.role,
    isActive: true,
    joinedAt: new Date().toISOString().split("T")[0],
  };

  accounts.push(newAccount);
  saveAccounts(accounts);
  return newAccount;
}

/** Remove a staff account by id. Protects owner accounts. */
export function removeStaffAccount(id: string): boolean {
  const accounts = getStaffAccounts();
  const account = accounts.find((a) => a.id === id);

  if (!account) return false;
  if (account.role === "OWNER") return false; // Cannot delete owners

  const filtered = accounts.filter((a) => a.id !== id);
  saveAccounts(filtered);
  return true;
}

/** Update a staff account's details. */
export function updateStaffAccount(
  id: string,
  data: Partial<Pick<StaffAccount, "name" | "email" | "role" | "isActive">>
): StaffAccount | null {
  const accounts = getStaffAccounts();
  const index = accounts.findIndex((a) => a.id === id);
  if (index === -1) return null;

  // Check email uniqueness if changing email
  if (data.email && data.email.toLowerCase() !== accounts[index].email.toLowerCase()) {
    const duplicate = accounts.some(
      (a, i) => i !== index && a.email.toLowerCase() === data.email!.toLowerCase()
    );
    if (duplicate) return null;
  }

  accounts[index] = { ...accounts[index], ...data };
  saveAccounts(accounts);
  return accounts[index];
}

/** Authenticate a staff member by email and password. Returns account or null. */
export function authenticateStaff(
  email: string,
  password: string
): StaffAccount | null {
  const accounts = getStaffAccounts();
  const account = accounts.find(
    (a) =>
      a.email.toLowerCase() === email.toLowerCase() &&
      a.password === password &&
      a.isActive
  );
  return account || null;
}
