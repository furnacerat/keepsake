import { z } from 'zod';

export const marketplaceItemTypeSchema = z.enum(['template', 'background', 'frame', 'animation', 'keepsake']);
export const purchaseTypeSchema = z.enum(['free', 'pro', 'paid']);
export const marketplaceCategorySchema = z.enum([
  'Story Templates',
  'Scrapbook Layouts',
  'Photo Grids',
  'Event Pages',
  'Background Packs',
  'Frame Packs',
  'Animation Styles',
  'Full Keepsake Designs',
]);

export const marketplaceItemSchema = z.object({
  id: z.string(),
  type: marketplaceItemTypeSchema,
  title: z.string(),
  description: z.string(),
  previewImageUrl: z.string(),
  price: z.number().nonnegative(),
  creatorId: z.string(),
  creatorName: z.string(),
  tags: z.array(z.string()),
  category: marketplaceCategorySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.string(),
  isProRequired: z.boolean(),
  isVerifiedCreator: z.boolean(),
  views: z.number().int().nonnegative(),
  purchases: z.number().int().nonnegative(),
  favorites: z.number().int().nonnegative(),
});

export const userEntitlementSchema = z.object({
  userId: z.string(),
  itemId: z.string(),
  purchaseDate: z.string(),
  purchaseType: purchaseTypeSchema,
});

export const marketplaceReviewSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  userId: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().optional(),
  createdAt: z.string(),
});

export type MarketplaceItemType = z.infer<typeof marketplaceItemTypeSchema>;
export type MarketplaceCategory = z.infer<typeof marketplaceCategorySchema>;
export type MarketplaceItem = z.infer<typeof marketplaceItemSchema>;
export type UserEntitlement = z.infer<typeof userEntitlementSchema>;
export type MarketplaceReview = z.infer<typeof marketplaceReviewSchema>;
export type PurchaseType = z.infer<typeof purchaseTypeSchema>;
