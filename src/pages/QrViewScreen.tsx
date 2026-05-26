import { LockKeyhole, Share2 } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import { getKeepsakes } from '../services/keepsakeStorage';
import { getQrRecord } from '../services/qrService';
import { MediaEngine } from '../components/MediaEngine';
import { AnimatedKeepsakeRenderer } from '../components/AnimatedKeepsakeRenderer';

export function QrViewScreen() {
  const { id } = useParams();
  const record = id ? getQrRecord(id) : undefined;

  if (!record) {
    return <Navigate to="/" replace />;
  }

  const media = getKeepsakes()
    .flatMap((keepsake) => keepsake.mediaItems ?? [])
    .filter((item) => record.contentIds.includes(item.id));
  const animatedKeepsake = getKeepsakes().find((keepsake) => keepsake.qrCodeId === record.id || keepsake.id === record.keepsakeId);
  const isPrivate = record.security === 'private-pin' || record.security === 'family-only';

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 md:space-y-10">
      <div className="rounded-[1.6rem] border border-keepsake-roseDeep/10 bg-white/82 p-5 shadow-keepsake md:p-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
          Pages Come To Life
        </p>
        <h1 className="font-heading text-[3rem] font-bold leading-[0.94] text-keepsake-ink md:text-6xl">
          {record.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-keepsake-blush px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-keepsake-roseDeep">
            {isPrivate ? <LockKeyhole size={14} aria-hidden="true" /> : null}
            {record.security}
          </span>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-keepsake-muted shadow-soft"
            type="button"
            onClick={() => void navigator.share?.({ title: record.title, url: window.location.href })}
          >
            <Share2 size={14} aria-hidden="true" />
            Share
          </button>
        </div>
      </div>

      {isPrivate ? (
        <div className="rounded-[1.45rem] bg-keepsake-ink p-5 text-white shadow-keepsake">
          <p className="font-heading text-2xl font-bold">Protected memory</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            This mocked page records the privacy mode. Real PIN and family authentication can be wired to the same QR metadata.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4">
        {animatedKeepsake?.animationStyle && animatedKeepsake.animationStyle !== 'none' ? (
          <AnimatedKeepsakeRenderer
            animationMetadata={animatedKeepsake.animationMetadata ?? record.animationMetadata}
            animationStyle={animatedKeepsake.animationStyle ?? record.animationStyle ?? 'gentleFade'}
            data={{
              photos:
                animatedKeepsake.mediaItems
                  ?.filter((item) => item.type === 'photo')
                  .map((item) => ({ id: item.id, src: item.src })) ?? [],
              media: animatedKeepsake.mediaItems ?? media,
              title: animatedKeepsake.title,
              body: animatedKeepsake.body ?? animatedKeepsake.message,
              backgroundStyle: animatedKeepsake.backgroundStyle ?? 'warm',
              showPlaybackControls: animatedKeepsake.showPlaybackControls,
              showQrPlaceholder: true,
            }}
            templateId={animatedKeepsake.templateId ?? 'simple-story'}
          />
        ) : media.length === 0 ? (
          <div className="rounded-[1.45rem] bg-white/78 p-5 shadow-keepsake">
            <p className="font-bold text-keepsake-muted">
              This QR record is ready, but the linked media lives in local keepsake storage on the device that created it.
            </p>
          </div>
        ) : (
          media.map((item) => (
            <MediaEngine className="min-h-80" key={item.id} media={item} controls mode="page" />
          ))
        )}
      </div>
    </section>
  );
}
