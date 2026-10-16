import { UserSubscription, PlanTier, PlanDetails } from '../types';

const STORAGE_KEY = 'promptvibe_user_subscription';

export const PLANS: Record<PlanTier, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    priceMonthly: 0,
    dailyChats: 4,
    monthlyChats: 0,
    features: [
      '4 Free Generation/Refinement Chats per day',
      'Daily credit auto-refresh every 24 hours',
      'Midjourney v6.1 & Runway Gen-3 syntax export',
      'Cinematic, Photorealistic & Abstract styles',
      'Visual prompt anatomy breakdown',
    ],
  },
  golden: {
    id: 'golden',
    name: 'Golden Plan',
    priceMonthly: 5.00,
    dailyChats: 0,
    monthlyChats: 30,
    features: [
      '30 Generation & Refinement Chats per month',
      'Full Midjourney flag customizer (--ar, --v, --s, --c)',
      'Runway Gen-3 camera motion director',
      'Cinematic, Photorealistic, Abstract & Anime presets',
      'High-priority generation speed',
      'Unlimited prompt export in TXT and JSON',
    ],
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond Plan',
    priceMonthly: 12.00,
    dailyChats: 0,
    monthlyChats: 80,
    popular: true,
    features: [
      '80 Generation & Refinement Chats per month',
      'Everything in Golden Plan',
      'Negative Prompt Architect & Lens Calibration',
      '3 Dynamic variations generated per request',
      'Camera rig simulation (Focal length, Aperture, Sensor)',
      'Prompt Library with unlimited cloud saves',
      'Priority feature updates',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    priceMonthly: 25.00,
    dailyChats: 0,
    monthlyChats: 200,
    features: [
      '200 Generation & Refinement Chats per month',
      'Everything in Diamond Plan',
      'Power-user batch generation mode',
      'Advanced Runway Motion Brush vector calculator',
      'Sora, Kling, Luma & Flux.1 prompt syntax engines',
      'Commercial visual director toolkit',
      'Dedicated VIP server throughput',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    priceMonthly: 99.00,
    dailyChats: 0,
    monthlyChats: 999999,
    unlimited: true,
    customPricing: true,
    features: [
      'Unlimited Generation & Refinement Chats',
      'Multi-seat workspace & team collaboration',
      'Custom fine-tuned studio prompt presets',
      'Direct REST API access for studio pipelines',
      'Dedicated account manager & SLA guarantee',
      'Custom invoicing & billing controls',
    ],
  },
};

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getBillingCycleEndString(): string {
  const now = new Date();
  now.setDate(now.getDate() + 30);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function loadUserSubscription(): UserSubscription {
  const defaultSub: UserSubscription = {
    plan: 'enterprise',
    dailyChatsRemaining: 4,
    dailyChatsLimit: 4,
    monthlyChatsRemaining: 999999,
    monthlyChatsLimit: 999999,
    lastResetDate: getTodayString(),
    billingCycleEnd: getBillingCycleEndString(),
    isOwner: true,
    ownerEmail: 'sailajac749@gmail.com',
    companyName: 'Founder Workspace',
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUserSubscription(defaultSub);
      return defaultSub;
    }

    const sub: UserSubscription = JSON.parse(raw);
    const today = getTodayString();

    // Ensure owner email is always set
    if (!sub.ownerEmail) {
      sub.ownerEmail = 'sailajac749@gmail.com';
      sub.isOwner = true;
    }

    // Check if daily credits should reset for free tier
    if (sub.plan === 'free' && sub.lastResetDate !== today) {
      sub.dailyChatsRemaining = 4;
      sub.lastResetDate = today;
      saveUserSubscription(sub);
    }

    return sub;
  } catch (err) {
    console.error('Error loading user subscription:', err);
    return defaultSub;
  }
}

export function saveUserSubscription(sub: UserSubscription): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
  } catch (err) {
    console.error('Error saving user subscription:', err);
  }
}

export function canConsumeChat(sub: UserSubscription): boolean {
  if (sub.isOwner) return true; // App Owner has unlimited access
  if (sub.plan === 'enterprise') return true;
  if (sub.plan === 'free') {
    return sub.dailyChatsRemaining > 0;
  }
  return sub.monthlyChatsRemaining > 0;
}

export function consumeChatCredit(sub: UserSubscription): { success: boolean; updatedSub: UserSubscription } {
  if (sub.isOwner || sub.plan === 'enterprise') {
    return { success: true, updatedSub: sub };
  }

  if (sub.plan === 'free') {
    if (sub.dailyChatsRemaining <= 0) {
      return { success: false, updatedSub: sub };
    }
    const updated = {
      ...sub,
      dailyChatsRemaining: sub.dailyChatsRemaining - 1,
    };
    saveUserSubscription(updated);
    return { success: true, updatedSub: updated };
  }

  // Paid plans (golden, diamond, premium)
  if (sub.monthlyChatsRemaining <= 0) {
    return { success: false, updatedSub: sub };
  }

  const updated = {
    ...sub,
    monthlyChatsRemaining: sub.monthlyChatsRemaining - 1,
  };
  saveUserSubscription(updated);
  return { success: true, updatedSub: updated };
}

export function upgradePlan(targetPlan: PlanTier, companyName?: string): UserSubscription {
  const planInfo = PLANS[targetPlan];
  const today = getTodayString();
  const billingEnd = getBillingCycleEndString();

  let updated: UserSubscription;

  if (targetPlan === 'free') {
    updated = {
      plan: 'free',
      dailyChatsRemaining: 4,
      dailyChatsLimit: 4,
      monthlyChatsRemaining: 0,
      monthlyChatsLimit: 0,
      lastResetDate: today,
      billingCycleEnd: billingEnd,
    };
  } else if (targetPlan === 'enterprise') {
    updated = {
      plan: 'enterprise',
      dailyChatsRemaining: 0,
      dailyChatsLimit: 0,
      monthlyChatsRemaining: 999999,
      monthlyChatsLimit: 999999,
      lastResetDate: today,
      billingCycleEnd: billingEnd,
      companyName: companyName || 'Studio Visuals Corp',
      teamMembers: ['lead-director@studio.ai', 'vfx-lead@studio.ai', 'creator@studio.ai'],
    };
  } else {
    updated = {
      plan: targetPlan,
      dailyChatsRemaining: 0,
      dailyChatsLimit: 0,
      monthlyChatsRemaining: planInfo.monthlyChats,
      monthlyChatsLimit: planInfo.monthlyChats,
      lastResetDate: today,
      billingCycleEnd: billingEnd,
    };
  }

  saveUserSubscription(updated);
  return updated;
}

export function resetDemoDailyCredits(): UserSubscription {
  const current = loadUserSubscription();
  const updated: UserSubscription = {
    ...current,
    dailyChatsRemaining: 4,
    lastResetDate: getTodayString(),
  };
  saveUserSubscription(updated);
  return updated;
}
