# Keepsake Marketplace

Phase 10 adds a local mock marketplace that is ready to swap to a real backend later.

## Collections

`MarketplaceItem`

- `id`
- `type`: `template`, `background`, `frame`, `animation`, or `keepsake`
- `title`
- `description`
- `previewImageUrl`
- `price`
- `creatorId`
- `creatorName`
- `tags`
- `category`
- `createdAt`
- `updatedAt`
- `version`
- `isProRequired`
- `isVerifiedCreator`
- `views`
- `purchases`
- `favorites`

`UserEntitlements`

- `userId`
- `itemId`
- `purchaseDate`
- `purchaseType`: `free`, `pro`, or `paid`

`MarketplaceReview`

- `id`
- `itemId`
- `userId`
- `rating`
- `text`
- `createdAt`

## Storage

The phase uses `localStorage` through `src/services/marketplaceStorage.ts`.

- Marketplace items are seeded on first read.
- Purchases create user entitlements immediately.
- Reviews are stored locally and used to calculate average rating.
- Creator uploads create marketplace items with version `1.0.0`.
- Patch updates increment the patch version.

## UI

- `/marketplace` browses assets by category, type, price, creator, tag, and search query.
- `/marketplace/:id` shows item detail, preview, creator status, mock purchase, entitlement state, analytics, and reviews.
- `/creator-portal` lets creators upload assets, add preview images, set price, toggle Pro requirement, toggle verified status, and create patch versions.
- `TemplateEditorScreen` includes quick marketplace links for templates, backgrounds, frames, and animations.

## Entitlements

`userOwnsMarketplaceItem(itemId)` checks whether the current user has an entitlement. The current mock purchase flow calls `purchaseMarketplaceItem(itemId)`, writes an entitlement, increments purchases, and adds a purchase record to the local user model.

Pro-required marketplace items can route to the existing paywall when appropriate. Existing built-in templates still use `requiresPro` and send non-Pro users to `/paywall`.

## Future Backend Mapping

The current API shape is intentionally close to a server model:

- Move the three localStorage collections to database tables.
- Replace `purchaseMarketplaceItem` with Stripe or RevenueCat checkout plus webhook fulfillment.
- Replace creator verification toggles with admin-controlled creator profile fields.
- Add signed upload URLs for preview images and asset bundles.
