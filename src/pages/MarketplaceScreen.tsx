import { ArrowLeft, BadgeCheck, Eye, Search, ShoppingBag, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MarketplaceItemCard } from '../components/MarketplaceItemCard';
import type { MarketplaceCategory, MarketplaceItemType } from '../models/marketplace';
import {
  createMarketplaceReview,
  getAverageRating,
  getMarketplaceItem,
  getMarketplaceReviews,
  purchaseMarketplaceItem,
  searchMarketplaceItems,
  trackMarketplaceView,
  userOwnsMarketplaceItem,
} from '../services/marketplaceStorage';

const categories: Array<MarketplaceCategory | 'all'> = [
  'all',
  'Story Templates',
  'Scrapbook Layouts',
  'Photo Grids',
  'Event Pages',
  'Background Packs',
  'Frame Packs',
  'Animation Styles',
  'Full Keepsake Designs',
];

const itemTypes: Array<MarketplaceItemType | 'all'> = ['all', 'template', 'background', 'frame', 'animation', 'keepsake'];

function formatPrice(price: number, isProRequired: boolean) {
  if (price === 0 && isProRequired) return 'Included with Pro';
  if (price === 0) return 'Free';
  return `$${price.toFixed(2)}`;
}

function formatCategoryLabel(category: string) {
  return category === 'all' ? 'All categories' : category;
}

export function MarketplaceScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState<MarketplaceCategory | 'all'>(
    (searchParams.get('category') as MarketplaceCategory | null) ?? 'all',
  );
  const [type, setType] = useState<MarketplaceItemType | 'all'>(
    (searchParams.get('type') as MarketplaceItemType | null) ?? 'all',
  );
  const [tag, setTag] = useState('');
  const [creator, setCreator] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewRefresh, setReviewRefresh] = useState(0);

  const item = id ? getMarketplaceItem(id) : undefined;

  useEffect(() => {
    if (id) {
      trackMarketplaceView(id);
    }
  }, [id]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (category !== 'all') next.set('category', category);
    if (type !== 'all') next.set('type', type);
    setSearchParams(next, { replace: true });
  }, [category, query, setSearchParams, type]);

  const filteredItems = useMemo(
    () =>
      searchMarketplaceItems({
        category,
        creator,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        query,
        tag,
        type,
      }),
    [category, creator, maxPrice, query, tag, type],
  );

  const reviews = useMemo(() => (item ? getMarketplaceReviews(item.id) : []), [item, reviewRefresh]);
  const owned = item ? userOwnsMarketplaceItem(item.id) : false;
  const averageRating = item ? getAverageRating(item.id) : 0;

  async function handlePurchase() {
    if (!item) return;

    try {
      await purchaseMarketplaceItem(item.id);
      setPurchaseMessage('Unlocked. This item is now available in your Keepsake library.');
    } catch (error) {
      if (error instanceof Error && error.message === 'PRO_REQUIRED') {
        navigate(`/paywall?feature=marketplace-${item.id}`);
        return;
      }

      setPurchaseMessage('We could not complete the mock purchase. Please try again.');
    }
  }

  function handleReviewSubmit() {
    if (!item) return;
    createMarketplaceReview({ itemId: item.id, rating, text: reviewText.trim() || undefined });
    setReviewText('');
    setRating(5);
    setReviewRefresh((current) => current + 1);
  }

  if (item) {
    return (
      <section className="w-full space-y-6 md:space-y-10">
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/88 px-4 text-sm font-extrabold text-keepsake-ink shadow-soft transition hover:shadow-glow"
          to="/marketplace"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Marketplace
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="ks-card overflow-hidden">
            <img className="aspect-[16/10] w-full object-cover" src={item.previewImageUrl} alt="" loading="lazy" decoding="async" />
            <div className="space-y-4 p-5 md:p-7">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
                <span>{item.category}</span>
                <span>Version {item.version}</span>
                <span className="inline-flex items-center gap-1">
                  <Eye size={14} aria-hidden="true" />
                  {item.views + 1} views
                </span>
              </div>
              <h1 className="font-heading text-4xl font-bold leading-tight text-keepsake-ink md:text-6xl">
                {item.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-keepsake-muted md:text-lg md:leading-8">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((currentTag) => (
                  <span className="rounded-full bg-keepsake-blush px-3 py-1 text-xs font-bold text-keepsake-roseDeep" key={currentTag}>
                    #{currentTag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="ks-card space-y-5 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-muted">Creator</p>
                  <p className="mt-1 inline-flex items-center gap-2 font-bold text-keepsake-ink">
                    {item.creatorName}
                    {item.isVerifiedCreator ? <BadgeCheck size={17} className="text-keepsake-accentStrong" aria-hidden="true" /> : null}
                  </p>
                </div>
                <span className="rounded-full bg-keepsake-accent px-4 py-2 text-sm font-extrabold text-white">
                  {formatPrice(item.price, item.isProRequired)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-keepsake-cream p-3">
                  <p className="text-xl font-extrabold text-keepsake-ink">{item.purchases}</p>
                  <p className="text-xs font-bold text-keepsake-muted">Purchases</p>
                </div>
                <div className="rounded-2xl bg-keepsake-cream p-3">
                  <p className="text-xl font-extrabold text-keepsake-ink">{item.favorites}</p>
                  <p className="text-xs font-bold text-keepsake-muted">Favorites</p>
                </div>
                <div className="rounded-2xl bg-keepsake-cream p-3">
                  <p className="text-xl font-extrabold text-keepsake-ink">{averageRating ? averageRating.toFixed(1) : 'New'}</p>
                  <p className="text-xs font-bold text-keepsake-muted">Rating</p>
                </div>
              </div>
              <button
                className="ks-button-primary inline-flex min-h-12 w-full items-center justify-center gap-2 px-4 text-sm font-extrabold"
                type="button"
                onClick={() => void handlePurchase()}
                disabled={owned}
              >
                <ShoppingBag size={17} aria-hidden="true" />
                {owned ? 'Already unlocked' : item.price === 0 ? 'Unlock item' : 'Mock purchase'}
              </button>
              {purchaseMessage ? (
                <p className="rounded-2xl bg-keepsake-sageSoft px-4 py-3 text-sm font-bold text-keepsake-ink">
                  {purchaseMessage}
                </p>
              ) : null}
            </div>

            <div className="ks-card space-y-4 p-5 md:p-6">
              <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Reviews</h2>
              <div className="grid gap-3">
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Rating</span>
                  <select
                    className="min-h-11 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} stars
                      </option>
                    ))}
                  </select>
                </label>
                <textarea
                  className="min-h-24 resize-none rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 py-3 text-sm leading-6 text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Optional review"
                />
                <button className="rounded-full bg-white px-4 py-3 text-sm font-extrabold text-keepsake-accentStrong shadow-soft transition hover:shadow-glow" type="button" onClick={handleReviewSubmit}>
                  Add review
                </button>
              </div>
              <div className="space-y-3">
                {reviews.length ? (
                  reviews.map((review) => (
                    <article className="rounded-2xl bg-keepsake-cream p-4" key={review.id}>
                      <p className="inline-flex items-center gap-1 text-sm font-extrabold text-keepsake-ink">
                        <Star size={15} className="fill-keepsake-gold text-keepsake-gold" aria-hidden="true" />
                        {review.rating}/5
                      </p>
                      {review.text ? <p className="mt-2 text-sm leading-6 text-keepsake-muted">{review.text}</p> : null}
                    </article>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-keepsake-muted">No reviews yet.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-blush">
            Creative Marketplace
          </p>
          <h1 className="font-heading text-[3.4rem] font-bold leading-[0.92] text-white md:text-7xl">
            Find new ways to keep the memory.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/82 md:text-xl md:leading-8">
            Browse templates, backgrounds, frames, animation styles, and full keepsake designs from verified creators.
          </p>
        </div>
        <Link
          className="ks-button-primary inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-extrabold"
          to="/creator-portal"
        >
          Creator Portal
        </Link>
      </div>

      <div className="ks-card grid min-w-0 gap-4 overflow-hidden p-4 md:grid-cols-[minmax(0,1fr)_minmax(150px,180px)_minmax(150px,180px)] md:p-5">
        <label className="relative grid min-w-0 gap-2">
          <span className="ks-form-label text-sm font-bold">Search</span>
          <Search className="pointer-events-none absolute bottom-3 left-4 text-keepsake-muted" size={18} aria-hidden="true" />
          <input
            className="min-h-12 w-full min-w-0 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream pl-11 pr-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assets, tags, creators..."
          />
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="ks-form-label text-sm font-bold">Type</span>
          <select
            className="min-h-12 w-full min-w-0 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
            value={type}
            onChange={(event) => setType(event.target.value as MarketplaceItemType | 'all')}
          >
            {itemTypes.map((currentType) => (
              <option key={currentType} value={currentType}>
                {currentType === 'all' ? 'All types' : currentType}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="ks-form-label text-sm font-bold">Max price</span>
          <input
            className="min-h-12 w-full min-w-0 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
            min="0"
            type="number"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Any"
          />
        </label>
        <label className="grid min-w-0 gap-2 md:col-span-2">
          <span className="ks-form-label text-sm font-bold">Creator</span>
          <input
            className="min-h-12 w-full min-w-0 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
            value={creator}
            onChange={(event) => setCreator(event.target.value)}
            placeholder="Creator name"
          />
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="ks-form-label text-sm font-bold">Tag</span>
          <input
            className="min-h-12 w-full min-w-0 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="family"
          />
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((currentCategory) => (
          <button
            className={[
              'shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition active:scale-[0.96]',
              category === currentCategory
                ? 'text-white shadow-soft'
                : 'bg-white/90 text-keepsake-ink shadow-soft ring-1 ring-white/70 hover:bg-white hover:shadow-glow',
            ].join(' ')}
            key={currentCategory}
            type="button"
            style={category === currentCategory ? { backgroundColor: 'rgb(var(--ks-accent))' } : undefined}
            onClick={() => setCategory(currentCategory)}
          >
            {formatCategoryLabel(currentCategory)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((marketplaceItem) => (
          <MarketplaceItemCard
            averageRating={getAverageRating(marketplaceItem.id)}
            item={marketplaceItem}
            key={marketplaceItem.id}
            owned={userOwnsMarketplaceItem(marketplaceItem.id)}
          />
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="ks-card p-6">
          <h2 className="font-heading text-3xl font-bold text-keepsake-ink">No marketplace items found.</h2>
          <p className="mt-2 text-sm leading-6 text-keepsake-muted">Try a broader search or clear one of the filters.</p>
        </div>
      ) : null}
    </section>
  );
}
