import { CalendarPlus, Clock, LockKeyhole, MailOpen } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { RelatedKeepsakesPanel } from '../components/RelatedKeepsakesPanel';
import { TemplateEngine } from '../components/TemplateEngine';
import { downloadUnlockCalendarEvent } from '../services/calendarExport';
import { getKeepsake } from '../services/keepsakeStorage';

export function KeepsakeDetailScreen() {
  const { id } = useParams();
  const keepsake = id ? getKeepsake(id) : undefined;

  if (!keepsake) {
    return <Navigate to="/keepsakes" replace />;
  }

  const isLocked = keepsake.status === 'locked';
  const hasDesignedTemplate = Boolean(keepsake.templateId);
  const templatePhotos =
    keepsake.mediaItems
      ?.filter((media) => media.type === 'photo')
      .map((media) => ({ id: media.id, src: media.src })) ?? [];

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 md:space-y-10">
      <Link className="text-sm font-bold text-keepsake-roseDeep" to="/keepsakes">
        My Keepsakes
      </Link>

      {isLocked ? (
        <div className="relative overflow-hidden rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/78 p-6 text-center shadow-keepsake md:p-10">
          <div className="pointer-events-none absolute inset-x-8 top-8 h-28 rounded-full bg-keepsake-gold/20 blur-3xl" />
          <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full bg-keepsake-blush text-keepsake-roseDeep shadow-soft">
            <LockKeyhole size={28} aria-hidden="true" />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
            Locked Keepsake
          </p>
          <h1 className="mt-2 font-heading text-[2.5rem] font-bold leading-none text-keepsake-ink md:text-5xl">
            {keepsake.title}
          </h1>
          <p className="mt-4 text-base leading-7 text-keepsake-muted">
            Some moments are worth waiting for.
          </p>
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
        <article className="keepsake-unlock overflow-hidden rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/80 p-6 shadow-keepsake md:p-10">
          <div className="envelope-stage" aria-hidden="true">
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
          <p className="message-reveal mt-7 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
            Unlocked Keepsake
          </p>
          <h1 className="message-reveal mt-3 font-heading text-[2.8rem] font-bold leading-[0.95] text-keepsake-ink md:text-5xl">
            {keepsake.title}
          </h1>
          <p className="message-reveal mt-3 text-sm font-semibold text-keepsake-muted">
            Created {new Date(keepsake.createdAt).toLocaleDateString()}
          </p>
          <div className="message-reveal mt-7 whitespace-pre-wrap rounded-[1.25rem] bg-keepsake-cream p-5 font-heading text-[1.7rem] leading-snug text-keepsake-ink shadow-[0_0_45px_rgba(201,156,95,0.18)] md:p-8 md:text-3xl">
            {keepsake.message}
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
        </article>
      )}

      <RelatedKeepsakesPanel keepsakeId={keepsake.id} />
    </section>
  );
}
