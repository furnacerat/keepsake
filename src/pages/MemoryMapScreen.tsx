import { CalendarDays, CircleDot, MapPin, Search, Tags, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MemoryNode } from '../models/memoryGraph';
import {
  generateLifeChapters,
  getMemoryEdges,
  getMemoryNodes,
  searchMemoryGraph,
  syncAllKeepsakesToGraph,
} from '../services/MemoryGraphEngine';

const nodeIcons = {
  album: Tags,
  event: CalendarDays,
  keepsake: CircleDot,
  person: UsersRound,
  place: MapPin,
  tag: Tags,
  timePeriod: CalendarDays,
};

function getNodeTone(type: MemoryNode['type']) {
  if (type === 'person') return 'bg-keepsake-blush text-keepsake-roseDeep';
  if (type === 'place') return 'bg-keepsake-sageSoft text-keepsake-ink';
  if (type === 'event') return 'bg-keepsake-cream text-keepsake-accentStrong';
  if (type === 'timePeriod') return 'bg-white text-keepsake-roseDeep';
  return 'bg-white text-keepsake-ink';
}

export function MemoryMapScreen() {
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const graph = useMemo(() => {
    syncAllKeepsakesToGraph();
    return {
      nodes: getMemoryNodes(),
      edges: getMemoryEdges(),
      chapters: generateLifeChapters(),
    };
  }, [refreshKey]);

  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId);
  const connectedEdges = selectedNodeId
    ? graph.edges.filter((edge) => edge.fromNodeId === selectedNodeId || edge.toNodeId === selectedNodeId)
    : [];
  const connectedNodes = connectedEdges
    .map((edge) => graph.nodes.find((node) => node.id === (edge.fromNodeId === selectedNodeId ? edge.toNodeId : edge.fromNodeId)))
    .filter((node): node is MemoryNode => Boolean(node));
  const searchResults = query.trim() ? searchMemoryGraph(query) : [];

  const groupedNodes = graph.nodes.reduce<Record<MemoryNode['type'], MemoryNode[]>>(
    (groups, node) => {
      groups[node.type] = [...(groups[node.type] ?? []), node];
      return groups;
    },
    { album: [], event: [], keepsake: [], person: [], place: [], tag: [], timePeriod: [] },
  );

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-blush">
            AI Memory Graph
          </p>
          <h1 className="font-heading text-[3.4rem] font-bold leading-[0.92] text-white md:text-7xl">
            The hidden shape of your memories.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/82 md:text-xl md:leading-8">
            Explore people, places, events, time periods, and keepsakes as one connected life story.
          </p>
        </div>
        <button
          className="ks-button-primary inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-extrabold"
          type="button"
          onClick={() => setRefreshKey((current) => current + 1)}
        >
          Refresh Graph
        </button>
      </div>

      <div className="ks-card grid gap-3 p-4 md:p-5">
        <label className="relative grid gap-2">
          <span className="ks-form-label text-sm font-bold">Search by person / place / event / chapter</span>
          <Search className="pointer-events-none absolute bottom-3 left-4 text-keepsake-muted" size={18} aria-hidden="true" />
          <input
            className="min-h-12 w-full rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream pl-11 pr-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Grandma, Paris, Wedding, Summer 2020..."
          />
        </label>
        {searchResults.length ? (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.slice(0, 9).map(({ node, keepsake }) => (
              <div className="rounded-2xl bg-white p-3 text-sm font-bold text-keepsake-ink shadow-soft transition hover:shadow-glow" key={node.id}>
                <button className="w-full text-left" type="button" onClick={() => setSelectedNodeId(node.id)}>
                  {node.label}
                  <span className="ml-2 text-xs uppercase text-keepsake-muted">{node.type}</span>
                </button>
                {keepsake ? (
                  <Link className="mt-2 block text-xs font-extrabold text-keepsake-accentStrong" to={`/keepsakes/${keepsake.id}`}>
                    Open keepsake
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          {(['person', 'event', 'place', 'timePeriod', 'keepsake'] as const).map((type) => {
            const Icon = nodeIcons[type];
            const nodes = groupedNodes[type];

            return (
              <section className="ks-card p-5 md:p-6" key={type}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-heading text-3xl font-bold capitalize text-keepsake-ink">{type === 'timePeriod' ? 'Life Chapters' : `${type}s`}</h2>
                  <span className="rounded-full bg-keepsake-cream px-3 py-1 text-xs font-extrabold text-keepsake-muted">
                    {nodes.length}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {nodes.length ? (
                    nodes.map((node) => (
                      <button
                        className={[
                          'inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow',
                          getNodeTone(node.type),
                        ].join(' ')}
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNodeId(node.id)}
                      >
                        <Icon size={16} aria-hidden="true" />
                        {node.label}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-keepsake-muted">No {type} nodes yet.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="ks-card p-5 md:p-6">
            <h2 className="font-heading text-3xl font-bold text-keepsake-ink">
              {selectedNode ? selectedNode.label : 'Select a node'}
            </h2>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
              {selectedNode ? selectedNode.type : 'Connections'}
            </p>
            <div className="mt-5 grid gap-3">
              {connectedNodes.length ? (
                connectedNodes.map((node) => (
                  <button
                    className="rounded-2xl bg-keepsake-cream p-3 text-left text-sm font-bold text-keepsake-ink shadow-soft"
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    {node.label}
                    <span className="ml-2 text-xs uppercase text-keepsake-muted">{node.type}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm leading-6 text-keepsake-muted">
                  Choose a person, place, event, chapter, or keepsake to see graph-derived connections.
                </p>
              )}
            </div>
          </div>

          <div className="ks-card p-5 md:p-6">
            <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Auto chapters</h2>
            <div className="mt-4 grid gap-3">
              {graph.chapters.length ? (
                graph.chapters.slice(0, 5).map((chapter) => (
                  <article className="rounded-2xl bg-keepsake-cream p-4" key={chapter.node.id}>
                    <h3 className="font-heading text-2xl font-bold leading-none text-keepsake-ink">{chapter.node.label}</h3>
                    <p className="mt-2 text-sm font-semibold text-keepsake-muted">
                      {chapter.keepsakeIds.length} keepsakes in this chapter.
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm leading-6 text-keepsake-muted">Chapters appear once keepsakes have enough time and graph density.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
