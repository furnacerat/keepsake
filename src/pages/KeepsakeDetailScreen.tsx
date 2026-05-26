import { CalendarPlus, Clock, Edit3, Image, LockKeyhole, MailOpen, Mic, Share2, Trash2, UserRound } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { RelatedKeepsakesPanel } from '../components/RelatedKeepsakesPanel';
import { TemplateEngine } from '../components/TemplateEngine';
import { downloadUnlockCalendarEvent } from '../services/calendarExport';
import { deleteKeepsake, getKeepsake } from '../services/keepsakeStorage';

function getMemoryDate(memoryDate?: string, approximateTimePeriod?: string, createdAt?: string) {
  return memoryDate ?? approximateTimePeriod ?? (createdAt ? new Date(createdAt).toLocaleDateString() : 'Date unknown');
}

export function KeepsakeDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const keepsake = id ? getKeepsake(id) : undefined;

  if (!keepsake) {
    return <Navigate to="/keepsakes" replace />;
  }

  const currentKeepsake = keepsake;
  const isLocked = currentKeepsake.status === 'locked';
  const hasDesignedTemplate = Boolean(currentKeepsake.templateId);
  const templatePhotos =
    currentKeepsake.mediaItems
      ?.filter((media) => media.type === 'photo')
      .map((media) => ({ id: media.id, src: media.src })) ?? [];
  const memoryDate = getMemoryDate(currentKeepsake.memoryDate, currentKeepsake.approximateTimePeriod, currentKeepsake.createdAt);

  async function handleShare() {
    const shareText = `${currentKeepsake.title}\n\n${currentKeepsake.message}`;
    if (navigator.share) {
      await navigator.share({ title: currentKeepsake.title, text: shareText });
      return;
    }

    await navigator.clipboard?.writeText(shareText);
  }

  function handleDelete() {
    const confirmed = window.confirm('Delete this keepsake? This cannot be undone.');
    if (!confirmed) return;

    deleteKeepsake(currentKeepsake.id);
    navigate('/keepsakes');
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 md:space-y-10">
      <Link className="inline-flex min-h-11 items-center rounded-full bg-white/88 px-4 text-sm font-extrabold text-keepsake-accentStrong shadow-soft" to="/keepsakes">
        My Keepsakes
      </Link>

      {isLocked ? (
        <div className="relative overflow-hidden rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/78 p-6 text-center shadow-keepsake md:p-10">
          <div className="pointer-events-none absolute inset-x-8 top-8 h-28 rounded-full bg-keepsake-gold/20 blur-3xl" />
          <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-keepsake-blush text-keepsake-roseDeep shadow-soft">
            <LockKeyhole size={28} aria-hidden="true" />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">Locked Keepsake</p>
          <h1 className="mt-2 font-heading text-[2.5rem] font-bold leading-none text-keepsake-ink md:text-5xl">
            {keepsake.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-keepsake-muted">Some moments are worth waiting for.</p>
          {keepsake.unlockDate ? (
            <>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-keepsake-cream px-4 py-2 text-sm font-bold text-keepsake-muted">
                <Clock size={16} aria-hidden="true" />
                Unlocks on {keepsake.unlockDate}
              </p>
              <button
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-keepsake-roseDeep px-4 text-sm font-extrabold text-white shadow-soft transition active:scale-[0.985] hover:bg-keepsake-rose focus:outline-none focus-visible:ring-2 focus-visible:ring-keepsake-rose/45"
                type="button"
                onClick={() => downloadUnlockCalendarEvent(keepsake)}
              >
                <CalendarPlus size={18} strokeWidth={2.3} aria-hidden="true" />
                Add to Calendar
              </button>
            </>
          ) : null}
        </div>
      ) : (
        <article className="keepsake-unlock overflow-hidden rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/84 p-6 shadow-keepsake md:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <p className="message-reveal text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
                {keepsake.memoryType ?? 'Unlocked Keepsake'}
              </p>
              <h1 className="message-reveal mt-3 font-heading text-[2.8rem] font-bold leading-[0.95] text-keepsake-ink md:text-6xl">
                {keepsake.title}
              </h1>
              <div className="message-reveal mt-5 flex flex-wrap gap-2 text-sm font-bold text-keepsake-muted">
                <span className="inline-flex items-center gap-2 rounded-full bg-keepsake-cream px-3 py-2">
                  <UserRound size={16} aria-hidden="true" />
                  {keepsake.person || 'Someone meaningful'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-keepsake-cream px-3 py-2">
                  <Clock size={16} aria-hidden="true" />
                  {memoryDate}
                </span>
              </div>
            </div>
            <div className="envelope-stage hidden lg:grid" aria-hidden="true">
              <div className="soft-glow" />
              <div className="envelope">
                <div className="envelope__back" />
                <div className="envelope__letter">
                  <MailOpen size={26} strokeWidth={2.1} />
                </div>
                <div className="envelope__flap" />
                <div className="envelope__front" />
              </div>
            </div>
          </div>

          <div className="message-reveal mt-7 whitespace-pre-wrap rounded-[1.25rem] bg-keepsake-cream p-5 font-heading text-[1.55rem] leading-snug text-keepsake-ink shadow-[0_0_45px_rgba(201,156,95,0.18)] md:p-8 md:text-3xl">
            {keepsake.message}
          </div>

          <div className="message-reveal mt-5 grid gap-3 md:grid-cols-2">
            {keepsake.photoPlaceholder ? (
              <div className="rounded-2xl border border-dashed border-keepsake-roseDeep/20 bg-keepsake-blush/45 p-5">
                <p className="inline-flex items-center gap-2 text-sm font-extrabold text-keepsake-roseDeep">
                  <Image size={18} aria-hidden="true" />
                  Photo placeholder
                </p>
                <p className="mt-2 text-sm leading-6 text-keepsake-muted">A photo can be attached here when media storage is connected.</p>
              </div>
            ) : null}
            {keepsake.voicePlaceholder ? (
              <div className="rounded-2xl border border-dashed border-keepsake-roseDeep/20 bg-keepsake-sageSoft/70 p-5">
                <p className="inline-flex items-center gap-2 text-sm font-extrabold text-keepsake-roseDeep">
                  <Mic size={18} aria-hidden="true" />
                  Voice placeholder
                </p>
                <p className="mt-2 text-sm leading-6 text-keepsake-muted">A voice memory can be attached here when audio storage is connected.</p>
              </div>
            ) : null}
          </div>

          {hasDesignedTemplate ? (
            <div className="message-reveal mt-7">
              <TemplateEngine
                templateId={keepsake.templateId ?? 'simple-story'}
                data={{
                  photos: templatePhotos,
                  media: keepsake.mediaItems,
                  title: keepsake.title,
                  body: keepsake.body ?? keepsake.message,
                  backgroundStyle: keepsake.backgroundStyle ?? 'warm',
                  showQrPlaceholder: true,
                  showPlaybackControls: keepsake.showPlaybackControls,
                  highResolution: false,
                }}
              />
            </div>
          ) : null}

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-keepsake-ink px-4 text-sm font-extrabold text-white shadow-soft transition hover:shadow-glow"
              to={`/create?edit=${keepsake.id}`}
            >
              <Edit3 size={17} aria-hidden="true" />
              Edit
            </Link>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-extrabold text-keepsake-accentStrong shadow-soft transition hover:shadow-glow"
              type="button"
              onClick={() => void handleShare()}
            >
              <Share2 size={17} aria-hidden="true" />
              Share
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-keepsake-blush px-4 text-sm font-extrabold text-keepsake-roseDeep shadow-soft transition hover:shadow-glow"
              type="button"
              onClick={handleDelete}
            >
              <Trash2 size={17} aria-hidden="true" />
              Delete
            </button>
          </div>
        </article>
      )}

      <RelatedKeepsakesPanel keepsakeId={keepsake.id} />
    </section>
  );
}
