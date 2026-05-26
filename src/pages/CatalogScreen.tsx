import { Navigate } from 'react-router-dom';
import { IdeaCard } from '../components/IdeaCard';
import { getCatalog, type SectionPath } from '../data/ideas';

type CatalogScreenProps = {
  path: SectionPath;
};

export function CatalogScreen({ path }: CatalogScreenProps) {
  const catalog = getCatalog(path);

  if (!catalog) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
          {catalog.eyebrow}
        </p>
        <h1 className="mb-4 font-heading text-3xl font-bold leading-[0.94] tracking-normal text-keepsake-ink md:mb-8 md:text-5xl lg:text-6xl">
          {catalog.title}
        </h1>
        <p className="text-lg leading-7 text-keepsake-muted md:text-xl md:leading-8">
          {catalog.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6" aria-label={`${catalog.eyebrow} ideas`}>
        {catalog.ideas.map((idea) => (
          <IdeaCard idea={idea} key={idea.type} />
        ))}
      </div>
    </section>
  );
}
