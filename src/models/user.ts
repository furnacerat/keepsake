export type SubscriptionTier = 'free' | 'pro' | 'family' | 'lifetime';

export type PurchaseRecord = {
  id: string;
  provider: 'stripe' | 'apple' | 'google' | 'manual';
  productId: string;
  purchasedAt: string;
  status: 'active' | 'canceled' | 'refunded' | 'expired';
};

export type User = {
  id: string;
  name: string;
  email?: string;
  isPro: boolean;
  subscriptionTier: SubscriptionTier;
  purchaseHistory: PurchaseRecord[];
};

export const defaultUser: User = {
  id: 'local-user',
  name: 'Keepsake User',
  isPro: false,
  subscriptionTier: 'free',
  purchaseHistory: [],
};
