import { defaultUser } from '../models/user';
import type { User } from '../models/user';

const STORAGE_KEY = 'keepsake.currentUser';

function readStoredUser(): User | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    return parsed && typeof parsed === 'object'
      ? {
          ...defaultUser,
          ...parsed,
          isPro: Boolean(parsed.isPro),
          subscriptionTier: parsed.subscriptionTier ?? defaultUser.subscriptionTier,
          purchaseHistory: Array.isArray(parsed.purchaseHistory) ? parsed.purchaseHistory : [],
        }
      : undefined;
  } catch {
    return undefined;
  }
}

export function getCurrentUser(): User {
  return readStoredUser() ?? defaultUser;
}

export function updateCurrentUser(updates: Partial<User>): User {
  const currentUser = getCurrentUser();
  const nextUser = {
    ...currentUser,
    ...updates,
    isPro: Boolean(updates.isPro ?? currentUser.isPro),
    subscriptionTier: updates.subscriptionTier ?? currentUser.subscriptionTier,
    purchaseHistory: updates.purchaseHistory ?? currentUser.purchaseHistory,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  return nextUser;
}
