import { BadgeCheck, BarChart3, ImagePlus, PackagePlus, Upload } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MarketplaceCategory, MarketplaceItemType } from '../models/marketplace';
import { createItemVersion, createMarketplaceItem, getCreatorAnalytics } from '../services/marketplaceStorage';

const itemTypes: MarketplaceItemType[] = ['template', 'background', 'frame', 'animation', 'keepsake'];
const categories: MarketplaceCategory[] = [
  'Story Templates',
  'Scrapbook Layouts',
  'Photo Grids',
  'Event Pages',
  'Background Packs',
  'Frame Packs',
  'Animation Styles',
  'Full Keepsake Designs',
];

const fallbackPreview =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 420 300%22%3E%3Crect width=%22420%22 height=%22300%22 fill=%22%23FDF7E3%22/%3E%3Crect x=%2248%22 y=%2248%22 width=%22324%22 height=%22204%22 rx=%2224%22 fill=%22%23F5E8E4%22/%3E%3Ccircle cx=%22138%22 cy=%22125%22 r=%2238%22 fill=%22%2300A6A6%22 opacity=%22.65%22/%3E%3Crect x=%22196%22 y=%22105%22 width=%22118%22 height=%2218%22 rx=%229%22 fill=%22%23352A2A%22 opacity=%22.55%22/%3E%3Crect x=%22196%22 y=%22140%22 width=%2288%22 height=%2214%22 rx=%227%22 fill=%22%23E0A458%22/%3E%3C/svg%3E';

function readPreviewFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function CreatorPortal() {
  const [type, setType] = useState<MarketplaceItemType>('template');
  const [category, setCategory] = useState<MarketplaceCategory>('Story Templates');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [tags, setTags] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState(fallbackPreview);
  const [isProRequired, setIsProRequired] = useState(false);
  const [isVerifiedCreator, setIsVerifiedCreator] = useState(false);
  const [creatorName, setCreatorName] = useState('Local Creator');
  const [message, setMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const analytics = useMemo(() => getCreatorAnalytics(), [refreshKey]);
  const effectiveMaxPrice = isVerifiedCreator ? 200 : 20;

  async function handlePreviewUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setPreviewImageUrl(await readPreviewFile(file));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericPrice = Math.min(Number(price) || 0, effectiveMaxPrice);

    createMarketplaceItem({
      category,
      creatorId: '',
      creatorName,
      description: description.trim() || 'A creator asset for Keepsake.',
      isProRequired,
      isVerifiedCreator,
      previewImageUrl,
      price: numericPrice,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      title: title.trim() || 'Untitled Marketplace Asset',
      type,
    });

    setMessage('Asset uploaded to the mock marketplace.');
    setTitle('');
    setDescription('');
    setPrice('0');
    setTags('');
    setPreviewImageUrl(fallbackPreview);
    setRefreshKey((current) => current + 1);
  }

  function handleCreatePatch(itemId: string) {
    createItemVersion(itemId, {});
    setMessage('New patch version created.');
    setRefreshKey((current) => current + 1);
  }

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-blush">
            Creator Portal
          </p>
          <h1 className="font-heading text-[3.4rem] font-bold leading-[0.92] text-white md:text-7xl">
            Share beautiful building blocks.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/82 md:text-xl md:leading-8">
            Upload templates, backgrounds, frames, animations, and full keepsake designs with simple versioning and mock analytics.
          </p>
        </div>
        <Link className="rounded-full bg-white/90 px-5 py-3 text-sm font-extrabold text-keepsake-ink shadow-soft transition hover:shadow-glow" to="/marketplace">
          View Marketplace
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form className="ks-card space-y-5 p-5 md:p-7" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-keepsake-blush text-keepsake-roseDeep">
              <PackagePlus size={22} aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Upload asset</h2>
              <p className="text-sm leading-6 text-keepsake-muted">Mock upload today, real commerce-ready fields later.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="ks-form-label text-sm font-bold">Asset type</span>
              <select className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={type} onChange={(event) => setType(event.target.value as MarketplaceItemType)}>
                {itemTypes.map((itemType) => (
                  <option key={itemType} value={itemType}>{itemType}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="ks-form-label text-sm font-bold">Category</span>
              <select className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={category} onChange={(event) => setCategory(event.target.value as MarketplaceCategory)}>
                {categories.map((currentCategory) => (
                  <option key={currentCategory} value={currentCategory}>{currentCategory}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 md:col-span-2">
              <span className="ks-form-label text-sm font-bold">Title</span>
              <input className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label className="grid gap-2 md:col-span-2">
              <span className="ks-form-label text-sm font-bold">Description</span>
              <textarea className="min-h-28 resize-none rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 py-3 font-semibold leading-6 text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="ks-form-label text-sm font-bold">Price</span>
              <input className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25" max={effectiveMaxPrice} min="0" step="0.01" type="number" value={price} onChange={(event) => setPrice(event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="ks-form-label text-sm font-bold">Creator name</span>
              <input className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={creatorName} onChange={(event) => setCreatorName(event.target.value)} />
            </label>
            <label className="grid gap-2 md:col-span-2">
              <span className="ks-form-label text-sm font-bold">Tags</span>
              <input className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="family, wedding, heritage" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <img className="aspect-[4/3] w-full rounded-keepsake object-cover shadow-soft" src={previewImageUrl} alt="" />
            <label className="grid min-h-36 cursor-pointer place-items-center rounded-keepsake border border-dashed border-keepsake-roseDeep/25 bg-keepsake-cream p-4 text-center">
              <span className="inline-flex flex-col items-center gap-2 text-sm font-extrabold text-keepsake-roseDeep">
                <ImagePlus size={24} aria-hidden="true" />
                Upload preview image
              </span>
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  void handlePreviewUpload(event.target.files);
                  event.target.value = '';
                }}
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl bg-keepsake-blush px-4 py-3 text-sm font-bold text-keepsake-roseDeep">
              <input className="h-4 w-4 accent-keepsake-roseDeep" type="checkbox" checked={isProRequired} onChange={(event) => setIsProRequired(event.target.checked)} />
              Requires Pro
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-keepsake-sageSoft px-4 py-3 text-sm font-bold text-keepsake-ink">
              <input className="h-4 w-4 accent-keepsake-accent" type="checkbox" checked={isVerifiedCreator} onChange={(event) => setIsVerifiedCreator(event.target.checked)} />
              Verified creator
            </label>
          </div>

          <button className="ks-button-primary inline-flex min-h-12 w-full items-center justify-center gap-2 px-4 text-sm font-extrabold" type="submit">
            <Upload size={17} aria-hidden="true" />
            Upload to Marketplace
          </button>
          {message ? <p className="rounded-2xl bg-keepsake-sageSoft px-4 py-3 text-sm font-bold text-keepsake-ink">{message}</p> : null}
        </form>

        <aside className="space-y-4">
          <div className="ks-card space-y-4 p-5 md:p-6">
            <div className="flex items-center gap-3">
              <BarChart3 size={22} className="text-keepsake-accentStrong" aria-hidden="true" />
              <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Analytics</h2>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-keepsake-cream p-3">
                <p className="text-xl font-extrabold text-keepsake-ink">{analytics.views}</p>
                <p className="text-xs font-bold text-keepsake-muted">Views</p>
              </div>
              <div className="rounded-2xl bg-keepsake-cream p-3">
                <p className="text-xl font-extrabold text-keepsake-ink">{analytics.purchases}</p>
                <p className="text-xs font-bold text-keepsake-muted">Sales</p>
              </div>
              <div className="rounded-2xl bg-keepsake-cream p-3">
                <p className="text-xl font-extrabold text-keepsake-ink">{analytics.favorites}</p>
                <p className="text-xs font-bold text-keepsake-muted">Favorites</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-keepsake-muted">
              Verified creators can price assets above $20 and receive a badge throughout the marketplace.
            </p>
          </div>

          <div className="ks-card space-y-3 p-5 md:p-6">
            <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Your versions</h2>
            {analytics.items.length ? (
              analytics.items.map((item) => (
                <article className="rounded-2xl bg-keepsake-cream p-4" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-keepsake-ink">{item.title}</h3>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-keepsake-muted">
                        {item.isVerifiedCreator ? <BadgeCheck size={13} className="text-keepsake-accentStrong" aria-hidden="true" /> : null}
                        v{item.version}
                      </p>
                    </div>
                    <button className="rounded-full bg-white px-3 py-2 text-xs font-extrabold text-keepsake-accentStrong shadow-soft transition hover:shadow-glow" type="button" onClick={() => handleCreatePatch(item.id)}>
                      Patch
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-keepsake-muted">Upload your first asset to see version history.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
