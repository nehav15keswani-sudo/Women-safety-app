// Offline-First Secure Device Authentication & Profile Vault for Aegis Women Safety

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  emergencyPinHash: string; // 4-digit rapid unlock PIN
  createdAt: number;
  lastLoginAt: number;
}

const AUTH_STORAGE_KEY = 'aegis_auth_users';
const CURRENT_SESSION_KEY = 'aegis_current_user_id';

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
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save users array
function saveUsers(users: UserProfile[]) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
}

// Get current active session user
export function getCurrentUser(): UserProfile | null {
  try {
    const currentId = localStorage.getItem(CURRENT_SESSION_KEY);
    const users = getAllUsers();
    if (!currentId && users.length > 0) {
      // Auto-login to existing user on first load
      return users[0];
    }
    return users.find((u) => u.id === currentId) || (users[0] ?? null);
  } catch {
    return null;
  }
}

// Initialize seed user if database is empty so emergency features are never locked
export async function initializeDefaultUser(): Promise<UserProfile> {
  const existing = getAllUsers();
  if (existing.length > 0) {
    const current = getCurrentUser();
    if (current) return current;
    return existing[0];
  }

  const defaultPasswordHash = await hashString('safety123');
  const defaultPinHash = await hashString('1234');

  const defaultUser: UserProfile = {
    id: 'user_default_neha',
    name: 'Neha Keswani',
    phone: '+91 98765 43210',
    email: 'neha15.keswani@gmail.com',
    passwordHash: defaultPasswordHash,
    emergencyPinHash: defaultPinHash,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  saveUsers([defaultUser]);
  localStorage.setItem(CURRENT_SESSION_KEY, defaultUser.id);
  localStorage.setItem('aegis_user_name', defaultUser.name);
  return defaultUser;
}

// Sign Up / Register new account
export async function signUp(
  name: string,
  phone: string,
  email: string,
  password: string,
  pin: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (!name.trim()) return { success: false, error: 'Name is required' };
  if (!phone.trim()) return { success: false, error: 'Emergency phone number is required' };
  if (password.length < 4) return { success: false, error: 'Password must be at least 4 characters' };
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return { success: false, error: 'Emergency PIN must be exactly 4 digits' };
  }

  const users = getAllUsers();
  const existing = users.find(
    (u) =>
      (email && u.email.toLowerCase() === email.toLowerCase().trim()) ||
      u.phone === phone.trim()
  );

  if (existing) {
    return { success: false, error: 'An account with this phone or email already exists. Please Sign In.' };
  }

  const passwordHash = await hashString(password);
  const emergencyPinHash = await hashString(pin);

  const newUser: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    emergencyPinHash,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(CURRENT_SESSION_KEY, newUser.id);
  localStorage.setItem('aegis_user_name', newUser.name);

  return { success: true, user: newUser };
}

// Sign In with password or 4-digit Emergency PIN
export async function signIn(
  identifier: string,
  credential: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  if (!identifier.trim()) return { success: false, error: 'Enter email, phone, or name' };
  if (!credential.trim()) return { success: false, error: 'Enter password or 4-digit PIN' };

  const users = getAllUsers();
  const cleanId = identifier.trim().toLowerCase();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      u.phone === cleanId ||
      u.name.toLowerCase() === cleanId
  );

  if (!user) {
    return { success: false, error: 'Account not found. Please Sign Up first.' };
  }

  const credHash = await hashString(credential);

  // Allow login via standard password OR 4-digit emergency PIN
  const isPasswordMatch = credHash === user.passwordHash;
  const isPinMatch = credHash === user.emergencyPinHash;

  if (!isPasswordMatch && !isPinMatch) {
    return { success: false, error: 'Incorrect password or emergency PIN.' };
  }

  user.lastLoginAt = Date.now();
  saveUsers(users);
  localStorage.setItem(CURRENT_SESSION_KEY, user.id);
  localStorage.setItem('aegis_user_name', user.name);

  return { success: true, user };
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
