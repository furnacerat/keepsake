# AI Memory Graph

Phase 11 adds a local graph layer that connects keepsakes to people, places, events, tags, albums, and time periods.

## Data Model

`MemoryNode`

- `id`
- `type`: `keepsake`, `person`, `event`, `place`, `timePeriod`, `tag`, or `album`
- `label`
- `metadata`
- `createdAt`
- `updatedAt`

`MemoryEdge`

- `id`
- `fromNodeId`
- `toNodeId`
- `type`: `appearsIn`, `happenedAt`, `relatedTo`, `partOf`, `samePerson`, or `sameEvent`
- `weight`
- `createdAt`
- `updatedAt`

Keepsakes now also support graph references:

- `linkedNodeIds`
- `primaryEventId`
- `primaryPersonIds`
- `primaryPlaceId`

## Engine

`src/services/MemoryGraphEngine.ts` provides:

- Explicit link helpers for person, place, event, and time period nodes.
- AI-style entity extraction from title, message, body text, and story suggestions.
- Graph sync for a single keepsake or all keepsakes.
- Related keepsake recommendations based on shared graph nodes.
- Life chapter generation from time-period density.
- Graph-expanded search for person, place, event, tag, chapter, and keepsake queries.
- Template recommendations based on event type.

## Entity Extraction

The current phase uses deterministic local heuristics:

- Capitalized phrases become person candidates.
- Known event words such as wedding, birthday, graduation, vacation, and memorial become event nodes.
- Place hints and `in Place` phrases become place nodes.
- Years and season/year phrases become time-period nodes.

This is intentionally shaped like an AI pipeline so a model-backed extractor can replace the local heuristic later.

## UI

- `/memory-map` visualizes people, events, places, life chapters, and keepsakes.
- The Memory Map includes graph-expanded search.
- Keepsake details include `RelatedKeepsakesPanel`, powered by `suggestRelatedKeepsakes`.
- The Keepsakes library links to the Memory Map.

## Future Backend Mapping

The current localStorage collections can become database tables without changing the UI contract:

- `MemoryNode`
- `MemoryEdge`

The extraction pipeline can move server-side, store confidence scores in edge weights, and mark node metadata with extraction source, model version, and review state.
