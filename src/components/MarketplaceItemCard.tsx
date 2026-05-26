import { BadgeCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MarketplaceItem } from '../models/marketplace';

function formatPrice(price: number, isProRequired: boolean) {
  if (price === 0 && isProRequired) return 'Pro';
  if (price === 0) return 'Free';
  return `$${price.toFixed(2)}`;
}

type MarketplaceItemCardProps = {
  averageRating?: number;
  item: MarketplaceItem;
  owned?: boolean;
};

export function MarketplaceItemCard({ averageRating = 0, item, owned = false }: MarketplaceItemCardProps) {
  return (
    <Link
      className="ks-card group block overflow-hidden transition hover:-translate-y-1 hover:shadow-glow"
      to={`/marketplace/${item.id}`}
    >
      <div className="aspect-[4/3] overflow-hidden bg-keepsake-cream">
        <img
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          src={item.previewImageUrl}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="space-y-3 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
              {item.category}
            </p>
            <h3 className="mt-1 font-heading text-2xl font-bold leading-tight text-keepsake-ink">
              {item.title}
            </h3>
          </div>
          <span className="rounded-full bg-keepsake-accent px-3 py-1 text-xs font-extrabold text-white">
            {owned ? 'Owned' : formatPrice(item.price, item.isProRequired)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-keepsake-muted">{item.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-keepsake-muted">
          <span className="inline-flex items-center gap-1">
            {item.isVerifiedCreator ? <BadgeCheck size={14} className="text-keepsake-accentStrong" aria-hidden="true" /> : null}
            {item.creatorName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star size={14} className="fill-keepsake-gold text-keepsake-gold" aria-hidden="true" />
            {averageRating ? averageRating.toFixed(1) : 'New'}
          </span>
        </div>
      </div>
    </Link>
  );
}
