import type { User } from '../models/user';

export function requirePro(user: User, feature: string) {
  if (!user.isPro) {
    throw new Error('PRO_REQUIRED');
  }

  return { allowed: true, feature };
}
