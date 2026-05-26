import type { MarketplaceCategory, MarketplaceItem, MarketplaceItemType, MarketplaceReview, PurchaseType, UserEntitlement } from '../models/marketplace';
import { marketplaceItemSchema, marketplaceReviewSchema, userEntitlementSchema } from '../models/marketplace';
import { getCurrentUser, updateCurrentUser } from './authService';

const ITEMS_KEY = 'keepsake.marketplace.items';
const ENTITLEMENTS_KEY = 'keepsake.marketplace.entitlements';
const REVIEWS_KEY = 'keepsake.marketplace.reviews';

const seedItems: MarketplaceItem[] = [
  {
    id: 'market-template-family-archive',
    type: 'template',
    title: 'Family Archive Story',
    description: 'A layered narrative template for family history pages and heirloom letters.',
    previewImageUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 420 300%22%3E%3Crect width=%22420%22 height=%22300%22 fill=%22%23FDF7E3%22/%3E%3Crect x=%2240%22 y=%2240%22 width=%22150%22 height=%22200%22 rx=%2220%22 fill=%22%23F5E8E4%22/%3E%3Crect x=%22215%22 y=%2260%22 width=%22145%22 height=%2240%22 rx=%2214%22 fill=%22%23E0A458%22 opacity=%22.75%22/%3E%3Crect x=%22215%22 y=%22120%22 width=%22120%22 height=%2218%22 rx=%229%22 fill=%22%23352A2A%22 opacity=%22.55%22/%3E%3C/svg%3E',
    price: 12,
    creatorId: 'creator-keepsake',
    creatorName: 'Keepsake Studio',
    tags: ['family', 'history', 'letter'],
    category: 'Story Templates',
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
    version: '1.0.0',
    isProRequired: true,
    isVerifiedCreator: true,
    views: 128,
    purchases: 34,
    favorites: 18,
  },
  {
    id: 'market-background-linen',
    type: 'background',
    title: 'Warm Linen Background Pack',
    description: 'Soft paper, linen, and blush-toned backgrounds for printable pages.',
    previewImageUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 420 300%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 x2=%221%22 y1=%220%22 y2=%221%22%3E%3Cstop stop-color=%22%23FDF7E3%22/%3E%3Cstop offset=%221%22 stop-color=%22%23F5E8E4%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22420%22 height=%22300%22 fill=%22url(%23g)%22/%3E%3Ccircle cx=%22335%22 cy=%2265%22 r=%2288%22 fill=%22%23E0A458%22 opacity=%22.18%22/%3E%3C/svg%3E',
    price: 0,
    creatorId: 'creator-keepsake',
    creatorName: 'Keepsake Studio',
    tags: ['background', 'linen', 'paper'],
    category: 'Background Packs',
    createdAt: '2026-05-03T10:00:00.000Z',
    updatedAt: '2026-05-03T10:00:00.000Z',
    version: '1.0.0',
    isProRequired: false,
    isVerifiedCreator: true,
    views: 210,
    purchases: 91,
    favorites: 43,
  },
  {
    id: 'market-animation-filmstrip',
    type: 'animation',
    title: 'Filmstrip Memory Motion',
    description: 'A premium horizontal filmstrip animation preset for multi-photo keepsakes.',
    previewImageUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 420 300%22%3E%3Crect width=%22420%22 height=%22300%22 fill=%22%23352A2A%22/%3E%3Crect x=%2230%22 y=%2290%22 width=%22360%22 height=%22120%22 rx=%2224%22 fill=%22%2300A6A6%22 opacity=%22.75%22/%3E%3Crect x=%2260%22 y=%22110%22 width=%2270%22 height=%2280%22 rx=%2210%22 fill=%22%23FDF7E3%22/%3E%3Crect x=%22155%22 y=%22110%22 width=%2270%22 height=%2280%22 rx=%2210%22 fill=%22%23F5E8E4%22/%3E%3Crect x=%22250%22 y=%22110%22 width=%2270%22 height=%2280%22 rx=%2210%22 fill=%22%23E8F0E8%22/%3E%3C/svg%3E',
    price: 8,
    creatorId: 'creator-motion',
    creatorName: 'Motion Keeps',
    tags: ['animation', 'filmstrip', 'pro'],
    category: 'Animation Styles',
    createdAt: '2026-05-04T10:00:00.000Z',
    updatedAt: '2026-05-04T10:00:00.000Z',
    version: '1.2.0',
    isProRequired: true,
    isVerifiedCreator: true,
    views: 94,
    purchases: 17,
    favorites: 12,
  },
];

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    return JSON.parse(window.localStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function normalizeItems(items: unknown[]) {
  return items.map((item) => marketplaceItemSchema.safeParse(item)).filter((result) => result.success).map((result) => result.data);
}

export function getMarketplaceItems() {
  const stored = normalizeItems(readJson<unknown[]>(ITEMS_KEY, []));
  if (stored.length === 0) {
    writeJson(ITEMS_KEY, seedItems);
    return seedItems;
  }

  return stored;
}

export function getMarketplaceItem(id: string) {
  return getMarketplaceItems().find((item) => item.id === id);
}

export function searchMarketplaceItems(filters: {
  category?: MarketplaceCategory | 'all';
  creator?: string;
  maxPrice?: number;
  query?: string;
  tag?: string;
  type?: MarketplaceItemType | 'all';
}) {
  const query = filters.query?.toLowerCase().trim();
  return getMarketplaceItems().filter((item) => {
    if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.type && filters.type !== 'all' && item.type !== filters.type) return false;
    if (typeof filters.maxPrice === 'number' && item.price > filters.maxPrice) return false;
    if (filters.tag && !item.tags.includes(filters.tag)) return false;
    if (filters.creator && !item.creatorName.toLowerCase().includes(filters.creator.toLowerCase())) return false;
    if (query && !`${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(query)) return false;
    return true;
  });
}

export function createMarketplaceItem(input: Omit<MarketplaceItem, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'views' | 'purchases' | 'favorites'> & { version?: string }) {
  const now = new Date().toISOString();
  const user = getCurrentUser();
  const item: MarketplaceItem = {
    ...input,
    id: createId('market'),
    creatorId: input.creatorId || user.id,
    creatorName: input.creatorName || user.name,
    createdAt: now,
    updatedAt: now,
    version: input.version ?? '1.0.0',
    views: 0,
    purchases: 0,
    favorites: 0,
  };
  writeJson(ITEMS_KEY, [item, ...getMarketplaceItems()]);
  return item;
}

export function createItemVersion(itemId: string, updates: Partial<MarketplaceItem>) {
  const item = getMarketplaceItem(itemId);
  if (!item) {
    return undefined;
  }

  const versionParts = item.version.split('.').map((part) => Number(part) || 0);
  const major = versionParts[0] ?? 1;
  const minor = versionParts[1] ?? 0;
  const patch = versionParts[2] ?? 0;
  const nextVersion = `${major}.${minor}.${patch + 1}`;
  const updatedItem: MarketplaceItem = { ...item, ...updates, version: nextVersion, updatedAt: new Date().toISOString() };
  writeJson(ITEMS_KEY, getMarketplaceItems().map((current) => (current.id === itemId ? updatedItem : current)));
  return updatedItem;
}

export function trackMarketplaceView(itemId: string) {
  writeJson(ITEMS_KEY, getMarketplaceItems().map((item) => (item.id === itemId ? { ...item, views: item.views + 1 } : item)));
}

export function getUserEntitlements(userId = getCurrentUser().id) {
  return readJson<unknown[]>(ENTITLEMENTS_KEY, [])
    .map((item) => userEntitlementSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data)
    .filter((item) => item.userId === userId);
}

export function userOwnsMarketplaceItem(itemId: string, userId = getCurrentUser().id) {
  return getUserEntitlements(userId).some((entitlement) => entitlement.itemId === itemId);
}

export async function purchaseMarketplaceItem(itemId: string, purchaseType?: PurchaseType) {
  const user = getCurrentUser();
  const item = getMarketplaceItem(itemId);
  if (!item) {
    throw new Error('MARKETPLACE_ITEM_NOT_FOUND');
  }

  if (item.isProRequired && !user.isPro && item.price === 0) {
    throw new Error('PRO_REQUIRED');
  }

  const resolvedPurchaseType: PurchaseType = purchaseType ?? (item.price === 0 ? 'free' : item.isProRequired ? 'pro' : 'paid');
  const entitlement: UserEntitlement = {
    userId: user.id,
    itemId,
    purchaseDate: new Date().toISOString(),
    purchaseType: resolvedPurchaseType,
  };

  writeJson(ENTITLEMENTS_KEY, [entitlement, ...readJson<UserEntitlement[]>(ENTITLEMENTS_KEY, [])]);
  writeJson(ITEMS_KEY, getMarketplaceItems().map((current) => (current.id === itemId ? { ...current, purchases: current.purchases + 1 } : current)));
  updateCurrentUser({
    purchaseHistory: [
      {
        id: createId('purchase'),
        provider: 'manual',
        productId: itemId,
        purchasedAt: entitlement.purchaseDate,
        status: 'active',
      },
      ...user.purchaseHistory,
    ],
  });
  return entitlement;
}

export function getMarketplaceReviews(itemId: string) {
  return readJson<unknown[]>(REVIEWS_KEY, [])
    .map((item) => marketplaceReviewSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data)
    .filter((review) => review.itemId === itemId);
}

export function createMarketplaceReview(input: { itemId: string; rating: number; text?: string }) {
  const user = getCurrentUser();
  const review = marketplaceReviewSchema.parse({
    id: createId('review'),
    itemId: input.itemId,
    userId: user.id,
    rating: input.rating,
    text: input.text,
    createdAt: new Date().toISOString(),
  });
  writeJson(REVIEWS_KEY, [review, ...readJson<MarketplaceReview[]>(REVIEWS_KEY, [])]);
  return review;
}

export function getAverageRating(itemId: string) {
  const reviews = getMarketplaceReviews(itemId);
  if (!reviews.length) {
    return 0;
  }

  return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
}

export function getCreatorAnalytics(creatorId = getCurrentUser().id) {
  const items = getMarketplaceItems().filter((item) => item.creatorId === creatorId);
  return {
    items,
    views: items.reduce((total, item) => total + item.views, 0),
    purchases: items.reduce((total, item) => total + item.purchases, 0),
    favorites: items.reduce((total, item) => total + item.favorites, 0),
  };
}
