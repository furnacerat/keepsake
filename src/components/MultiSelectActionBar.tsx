import {
  Archive,
  CalendarPlus,
  Heart,
  Sparkles,
  Star,
  Tags,
  UserPlus,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';

type MultiSelectActionBarProps = {
  selectedCount: number;
  onAddTags: () => void;
  onAddToFilingDrawer: () => void;
  onAddToTimeline: () => void;
  onClearSelection: () => void;
  onCreateKeepsake: () => void;
  onMarkFavorite: () => void;
  onMarkMeaningful: () => void;
  onSetEventTag: () => void;
  onTagPeople: () => void;
};

function ActionButton({
  children,
  icon,
  onClick,
}: {
  children: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white/85 px-3 text-xs font-extrabold text-keepsake-roseDeep shadow-soft transition hover:bg-keepsake-blush md:text-sm"
      type="button"
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}

export function MultiSelectActionBar({
  selectedCount,
  onAddTags,
  onAddToFilingDrawer,
  onAddToTimeline,
  onClearSelection,
  onCreateKeepsake,
  onMarkFavorite,
  onMarkMeaningful,
  onSetEventTag,
  onTagPeople,
}: MultiSelectActionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <aside className="fixed inset-x-3 bottom-24 z-20 rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-keepsake-ink/95 p-3 text-white shadow-keepsake backdrop-blur-xl md:sticky md:top-24 md:bottom-auto md:mx-0 md:rounded-[1.35rem] md:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-heading text-2xl font-bold leading-none">{selectedCount} selected</p>
        <button
          className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          type="button"
          onClick={onClearSelection}
          aria-label="Clear selection"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible">
        <ActionButton icon={<Archive size={15} aria-hidden="true" />} onClick={onAddToFilingDrawer}>
          Add to Filing Drawer
        </ActionButton>
        <ActionButton icon={<CalendarPlus size={15} aria-hidden="true" />} onClick={onAddToTimeline}>
          Add to Timeline
        </ActionButton>
        <ActionButton icon={<Sparkles size={15} aria-hidden="true" />} onClick={onCreateKeepsake}>
          Create Keepsake
        </ActionButton>
        <ActionButton icon={<UserPlus size={15} aria-hidden="true" />} onClick={onTagPeople}>
          Tag People
        </ActionButton>
        <ActionButton icon={<Tags size={15} aria-hidden="true" />} onClick={onAddTags}>
          Add Tags
        </ActionButton>
        <ActionButton icon={<Tags size={15} aria-hidden="true" />} onClick={onSetEventTag}>
          Set Event Tag
        </ActionButton>
        <ActionButton icon={<Heart size={15} aria-hidden="true" />} onClick={onMarkMeaningful}>
          Mark Meaningful
        </ActionButton>
        <ActionButton icon={<Star size={15} aria-hidden="true" />} onClick={onMarkFavorite}>
          Mark Favorite
        </ActionButton>
      </div>
    </aside>
  );
}
