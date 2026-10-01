import { Plan } from '../types';

export const TRIAL_CONFIG = {
  days: 7,
  enabled: true,
  description: "7-Day Free Trial",
  subDescription: "No charge for 7 days"
};

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    yearlyPrice: 950,
    mins: 500,
    agents: 2,
    numbers: 1,
    features: ['500 Included Mins', '2 Active AI Agents', '1 Phone Number', 'Call Recording'],
    color: 'from-blue-600 to-indigo-600',
    recommended: true,
    trialDays: 7,
    trialDescription: '7-Day Free Trial'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 249,
    yearlyPrice: 2390,
    mins: 2500,
    agents: 8,
    numbers: 3,
    features: ['2,500 Included Mins', '8 Active AI Agents', '3 Phone Numbers', 'Advanced Analytics'],
    color: 'from-cyan-500 to-blue-600',
    trialDays: 7,
    trialDescription: '7-Day Free Trial'
  },
  {
    id: 'business',
    name: 'Business',
    price: 499,
    yearlyPrice: 4790,
    mins: 6000,
    agents: 20,
    numbers: 10,
    features: ['6,000 Included Mins', '20 Active AI Agents', '10 Phone Numbers', 'API Access', 'Dedicated Account Manager'],
    color: 'from-indigo-600 to-purple-600',
    trialDays: 7,
    trialDescription: '7-Day Free Trial'
  },
  {
    id: 'admin-full-access',
    name: 'Admin Full-Access',
    price: 0,
    yearlyPrice: 0,
    mins: 999999,
    agents: 999,
    numbers: 999,
    features: ['Access to ALL features', 'Unlimited usage for testing', 'All AI models', 'Advanced configuration'],
    color: 'from-rose-600 to-rose-800',
    hidden: true
  }
];

export interface TrialStatus {
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  status: 'active' | 'converted' | 'expired' | 'cancelled' | 'none';
  label: string;
}

export const getTrialStatus = (user: any): TrialStatus => {
  if (!user || !user.trialStart || !user.trialEnd) {
    return {
      isActive: false,
      isExpired: false,
      daysRemaining: 0,
      status: 'none',
      label: 'No Active Trial'
    };
  }

  const now = new Date().getTime();
  const end = new Date(user.trialEnd).getTime();

  if (user.trialStatus === 'cancelled') {
    return {
      isActive: false,
      isExpired: false,
      daysRemaining: 0,
      status: 'cancelled',
      label: 'Trial Cancelled'
    };
  }

  if (user.trialStatus === 'converted') {
    return {
      isActive: false,
      isExpired: false,
      daysRemaining: 0,
      status: 'converted',
      label: 'Subscribed (Trial Converted)'
    };
  }

  if (user.trialStatus === 'expired' || now > end) {
    return {
      isActive: false,
      isExpired: true,
      daysRemaining: 0,
      status: 'expired',
      label: 'Trial Expired'
    };
  }

  const diff = end - now;
  const daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

  return {
    isActive: true,
    isExpired: false,
    daysRemaining,
    status: 'active',
    label: `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`
  };
};
