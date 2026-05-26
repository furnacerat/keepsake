import { beforeEach, describe, expect, it } from 'vitest';
import {
  createItemVersion,
  createMarketplaceItem,
  createMarketplaceReview,
  getAverageRating,
  getCreatorAnalytics,
  getMarketplaceItems,
  getUserEntitlements,
  purchaseMarketplaceItem,
  searchMarketplaceItems,
  userOwnsMarketplaceItem,
} from './marketplaceStorage';

beforeEach(() => {
  window.localStorage.clear();
});

describe('marketplaceStorage', () => {
  it('seeds marketplace items and filters by type', () => {
    expect(getMarketplaceItems()).toHaveLength(3);

    const animationItems = searchMarketplaceItems({ type: 'animation' });
    expect(animationItems).toHaveLength(1);
    expect(animationItems[0]?.title).toBe('Filmstrip Memory Motion');
  });

  it('creates entitlements when an item is purchased', async () => {
    const item = getMarketplaceItems().find((current) => current.price === 0);
    expect(item).toBeDefined();

    await purchaseMarketplaceItem(item!.id);

    expect(userOwnsMarketplaceItem(item!.id)).toBe(true);
    expect(getUserEntitlements()).toHaveLength(1);
  });

  it('stores reviews and calculates average rating', () => {
    const item = getMarketplaceItems()[0]!;

    createMarketplaceReview({ itemId: item.id, rating: 5, text: 'Beautiful.' });
    createMarketplaceReview({ itemId: item.id, rating: 3 });

    expect(getAverageRating(item.id)).toBe(4);
  });

  it('creates creator uploads and patch versions', () => {
    const created = createMarketplaceItem({
      category: 'Frame Packs',
      creatorId: 'local-user',
      creatorName: 'Keepsake User',
      description: 'A soft frame pack.',
      isProRequired: false,
      isVerifiedCreator: false,
      previewImageUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E',
      price: 4,
      tags: ['frame'],
      title: 'Soft Frame Pack',
      type: 'frame',
    });

    const patched = createItemVersion(created.id, { description: 'Updated frame pack.' });

    expect(patched?.version).toBe('1.0.1');
    expect(getCreatorAnalytics().items.some((item) => item.id === created.id)).toBe(true);
  });
});
