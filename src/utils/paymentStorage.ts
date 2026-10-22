// Payment & 100% Free Women Safety Shield Storage for Auto-SOS

export type AutoSosPlanTier = 'women_free' | 'free' | 'monthly' | 'annual' | 'lifetime' | 'patron_sponsor';

export interface AutoSosSubscription {
  tier: AutoSosPlanTier;
  status: 'active' | 'trial' | 'inactive';
  planName: string;
  amount: number;
  currency: 'INR';
  paymentMethod: 'WomenFreeGrant' | 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  transactionId: string;
  activatedAt: number;
  expiresAt: number; // 0 for permanent
  autoRenew: boolean;
  isWomanUserFree: boolean;
}

const SUBSCRIPTION_STORAGE_KEY = 'aegis_autosos_subscription';

export const AUTOSOS_PLANS = [
  {
    id: 'women_free' as AutoSosPlanTier,
    name: 'Auto-SOS Free for Women',
    price: 0,
    period: '100% Free Forever for Women',
    badge: '★ Official Women Safety Shield ★',
    recommended: true,
    isFreeForWomen: true,
    features: [
      '100% Free for all women in India',
      '24/7 Automated Fall & Crash Telemetry',
      'Violent Struggle & Sudden Shake Detection',
      '1-Touch Lock Screen SOS & Stay-Awake Mode',
      'Instant Zero-Delay GSM SMS Relays with GPS',
      'Continuous 60s Ambient Audio Evidence Lock',
      'No credit card or payment ever required',
    ],
  },
  {
    id: 'patron_sponsor' as AutoSosPlanTier,
    name: 'Sponsor a Sister / Ally Patron',
    price: 99,
    period: 'optional solidarity support',
    badge: 'Support Women Safety',
    isFreeForWomen: false,
    features: [
      'Funds 24/7 server infrastructure for women in need',
      'Enables free SMS gateway relays across rural India',
      'Verified Aegis Safety Ally badge',
      'Optional contribution; Auto-SOS remains free for all women',
    ],
  },
  {
    id: 'annual' as AutoSosPlanTier,
    name: 'Corporate / Guardian Sponsor',
    price: 799,
    period: 'annual community sponsor',
    badge: 'Community Sponsor',
    isFreeForWomen: false,
    features: [
      'Sponsors free offline SOS access for 10 women',
      'Priority offline map routing updates',
      'Official community guardian certificate',
    ],
  },
];

export function getAutoSosSubscription(): AutoSosSubscription {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (raw) {
      const parsed: AutoSosSubscription = JSON.parse(raw);
      return parsed;
    }
  } catch {
    // fallback
  }

  // DEFAULT FOR ALL WOMEN USERS: 100% FREE ACTIVE SHIELD
  const defaultFreeSub: AutoSosSubscription = {
    tier: 'women_free',
    status: 'active',
    planName: 'Auto-SOS 100% Free for Women',
    amount: 0,
    currency: 'INR',
    paymentMethod: 'WomenFreeGrant',
    transactionId: `FREE_WOMEN_SHIELD_${Date.now().toString(36).toUpperCase()}`,
    activatedAt: Date.now(),
    expiresAt: 0, // Permanent Free
    autoRenew: false,
    isWomanUserFree: true,
  };

  saveAutoSosSubscription(defaultFreeSub);
  return defaultFreeSub;
}

export function saveAutoSosSubscription(sub: AutoSosSubscription): void {
  localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(sub));
}

export function activateAutoSosPlan(
  tier: AutoSosPlanTier,
  method: 'WomenFreeGrant' | 'UPI' | 'Card' | 'NetBanking' | 'Wallet',
  transactionId?: string
): AutoSosSubscription {
  const plan = AUTOSOS_PLANS.find((p) => p.id === tier);
  const now = Date.now();

  const isWomenFree = tier === 'women_free';

  const newSub: AutoSosSubscription = {
    tier,
    status: 'active',
    planName: plan ? plan.name : 'Auto-SOS Free for Women',
    amount: plan ? plan.price : 0,
    currency: 'INR',
    paymentMethod: isWomenFree ? 'WomenFreeGrant' : method,
    transactionId:
      transactionId ||
      (isWomenFree
        ? `FREE_WOMEN_SHIELD_${Date.now().toString(36).toUpperCase()}`
        : `TXN_AEGIS_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`),
    activatedAt: now,
    expiresAt: 0, // Lifetime active
    autoRenew: false,
    isWomanUserFree: isWomenFree,
  };

  saveAutoSosSubscription(newSub);
  return newSub;
}

export function hasAutoSosProAccess(): boolean {
  // Always active & free for women!
  const sub = getAutoSosSubscription();
  return sub.status === 'active';
}
