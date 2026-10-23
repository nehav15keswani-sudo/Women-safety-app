// Offline-First Secure Device Authentication & Profile Vault for Safe Guard Women Safety
import { EmergencyContact } from '../types';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  emergencyPinHash: string; // 4-digit rapid unlock PIN
  createdAt: number;
  lastLoginAt: number;
  primaryGuardianName?: string;
  primaryGuardianPhone?: string;
}

const AUTH_STORAGE_KEY = 'safeguard_auth_users';
const CURRENT_SESSION_KEY = 'safeguard_current_user_id';

// SHA-256 cryptographic hashing using browser native Web Crypto API
export async function hashString(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Get all registered users from device vault
export function getAllUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem('aegis_auth_users');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Check if any user is already registered on this device
export function isAnyUserRegistered(): boolean {
  return getAllUsers().length > 0;
}

// Save users array
function saveUsers(users: UserProfile[]) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
}

// Get current active session user
export function getCurrentUser(): UserProfile | null {
  try {
    const currentId = localStorage.getItem(CURRENT_SESSION_KEY) || localStorage.getItem('aegis_current_user_id');
    if (!currentId) return null;

    const users = getAllUsers();
    return users.find((u) => u.id === currentId) || null;
  } catch {
    return null;
  }
}

// Sign Up / Register new account on device
export async function signUp(
  name: string,
  phone: string,
  email: string,
  password: string,
  pin: string,
  primaryGuardianName?: string,
  primaryGuardianPhone?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (!name.trim()) return { success: false, error: 'Full name is required for SOS distress alerts' };
  if (!phone.trim()) return { success: false, error: 'Your mobile phone number is required' };
  if (!password || password.length < 4) {
    return { success: false, error: 'Please enter a password of at least 4 characters' };
  }

  const effectivePin = pin && pin.length === 4 && /^\d{4}$/.test(pin) ? pin : '1234';

  const users = getAllUsers();
  const existing = users.find(
    (u) =>
      (email && u.email && u.email.toLowerCase() === email.toLowerCase().trim()) ||
      u.phone === phone.trim()
  );

  if (existing) {
    return { success: false, error: 'An account with this phone or email already exists. Please Sign In with your password.' };
  }

  const passwordHash = await hashString(password);
  const emergencyPinHash = await hashString(effectivePin);

  const newUser: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    emergencyPinHash,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    primaryGuardianName: primaryGuardianName?.trim(),
    primaryGuardianPhone: primaryGuardianPhone?.trim(),
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(CURRENT_SESSION_KEY, newUser.id);
  localStorage.setItem('aegis_user_name', newUser.name);

  // If primary guardian was provided during Sign Up, seed or update emergency contacts
  if (primaryGuardianName && primaryGuardianPhone) {
    try {
      const savedContacts = localStorage.getItem('aegis_contacts');
      const contacts: EmergencyContact[] = savedContacts ? JSON.parse(savedContacts) : [];
      const newGuardian: EmergencyContact = {
        id: `guardian_${Date.now()}`,
        name: primaryGuardianName.trim(),
        phone: primaryGuardianPhone.trim(),
        relationship: 'Primary Guardian',
        isPrimary: true,
        notifyOnSos: true,
      };
      // Demote others from primary
      const updatedContacts = [newGuardian, ...contacts.map((c) => ({ ...c, isPrimary: false }))];
      localStorage.setItem('aegis_contacts', JSON.stringify(updatedContacts));
    } catch {
      // ignore
    }
  }

  return { success: true, user: newUser };
}

// Sign In with password or 4-digit Emergency PIN
export async function signIn(
  identifier: string,
  credential: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (!identifier.trim()) return { success: false, error: 'Please enter your Name, Phone Number, or Email' };
  if (!credential.trim()) return { success: false, error: 'Please enter your password' };

  const users = getAllUsers();
  const cleanId = identifier.trim().toLowerCase();

  const user = users.find(
    (u) =>
      (u.email && u.email.toLowerCase() === cleanId) ||
      u.phone === cleanId ||
      u.name.toLowerCase() === cleanId
  );

  if (!user) {
    return { success: false, error: 'No account found with this name or phone. Please Sign Up first.' };
  }

  const inputHash = await hashString(credential);

  // Check password hash or emergency PIN hash
  if (inputHash === user.passwordHash || inputHash === user.emergencyPinHash) {
    user.lastLoginAt = Date.now();
    saveUsers(users);
    localStorage.setItem(CURRENT_SESSION_KEY, user.id);
    localStorage.setItem('aegis_user_name', user.name);
    return { success: true, user };
  }

  return { success: false, error: 'Incorrect password or PIN. Please try again.' };
}

// Quick 4-digit PIN unlock for rapid access
export async function quickPinUnlock(
  pin: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (pin.length !== 4) return { success: false, error: 'PIN must be 4 digits' };
  const current = getCurrentUser();
  if (!current) return { success: false, error: 'No active profile found' };

  const pinHash = await hashString(pin);
  if (pinHash === current.emergencyPinHash) {
    return { success: true, user: current };
  }

  return { success: false, error: 'Invalid Emergency PIN' };
}

// Sign Out
export function signOut(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY);
  localStorage.removeItem('aegis_current_user_id');
}

// Update User Profile
export async function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const updated: UserProfile = { ...users[index], ...updates };
  users[index] = updated;
  saveUsers(users);

  if (updates.name) {
    localStorage.setItem('aegis_user_name', updates.name);
  }

  return updated;
}
