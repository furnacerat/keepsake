import { templateRegistry } from '../data/templates';
import type { Keepsake } from '../models/keepsake';
import type {
  ExtractedMemoryEntities,
  LifeChapter,
  MemoryEdge,
  MemoryEdgeType,
  MemoryNode,
  MemoryNodeType,
} from '../models/memoryGraph';
import { memoryEdgeSchema, memoryNodeSchema } from '../models/memoryGraph';
import { getKeepsake, getKeepsakes, updateKeepsake } from './keepsakeStorage';

const NODES_KEY = 'keepsake.memoryGraph.nodes';
const EDGES_KEY = 'keepsake.memoryGraph.edges';

const eventTerms = [
  'anniversary',
  'birthday',
  'college',
  'family reunion',
  'first apartment',
  'graduation',
  'memorial',
  'new home',
  'vacation',
  'wedding',
];

const placeHints = ['home', 'apartment', 'school', 'college', 'church', 'beach', 'park', 'hospital', 'lake'];
const stopNameWords = new Set(['Keepsake', 'Untitled', 'Birthday', 'Wedding', 'Graduation', 'Vacation', 'Anniversary']);

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeLabel(label: string) {
  return label.trim().replace(/\s+/g, ' ');
}

function slugify(value: string) {
  return normalizeLabel(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    return JSON.parse(window.localStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function parseNodes(items: unknown[]) {
  return items.map((item) => memoryNodeSchema.safeParse(item)).filter((result) => result.success).map((result) => result.data);
}

function parseEdges(items: unknown[]) {
  return items.map((item) => memoryEdgeSchema.safeParse(item)).filter((result) => result.success).map((result) => result.data);
}

function getNodeStorage() {
  return parseNodes(readJson<unknown[]>(NODES_KEY, []));
}

function writeNodeStorage(nodes: MemoryNode[]) {
  writeJson(NODES_KEY, nodes);
}

function getEdgeStorage() {
  return parseEdges(readJson<unknown[]>(EDGES_KEY, []));
}

function writeEdgeStorage(edges: MemoryEdge[]) {
  writeJson(EDGES_KEY, edges);
}

function getTextForKeepsake(keepsake: Keepsake) {
  return [
    keepsake.title,
    keepsake.ideaType,
    keepsake.message,
    keepsake.body,
    ...(keepsake.storySuggestions?.flatMap((suggestion) => [suggestion.title, suggestion.body]) ?? []),
  ]
    .filter(Boolean)
    .join(' ');
}

function getTimePeriodLabel(date: string, text: string) {
  const lower = text.toLowerCase();
  const year = new Date(date).getFullYear();
  const season = ['spring', 'summer', 'fall', 'autumn', 'winter'].find((item) => lower.includes(item));
  return season ? `${season[0].toUpperCase()}${season.slice(1)} ${year}` : `${year}`;
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(normalizeLabel).filter(Boolean)));
}

export function extractMemoryEntities(text: string, createdAt = new Date().toISOString()): ExtractedMemoryEntities {
  const cleanText = text.replace(/[“”]/g, '"');
  const lower = cleanText.toLowerCase();
  const people = unique(
    Array.from(cleanText.matchAll(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g))
      .map((match) => match[0])
      .filter((name) => !stopNameWords.has(name) && name.length > 2)
      .slice(0, 8),
  );
  const events = unique(eventTerms.filter((term) => lower.includes(term)).map((term) => term.replace(/\b\w/g, (letter) => letter.toUpperCase())));
  const places = unique([
    ...placeHints.filter((term) => lower.includes(term)).map((term) => term.replace(/\b\w/g, (letter) => letter.toUpperCase())),
    ...Array.from(cleanText.matchAll(/\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g)).map((match) => match[1]),
  ]);
  const explicitTimes = unique(
    Array.from(cleanText.matchAll(/\b(?:spring|summer|fall|autumn|winter)\s+\d{4}|\b\d{4}\b/gi)).map((match) => match[0]),
  );

  return {
    people,
    places,
    events,
    timePeriods: explicitTimes.length ? explicitTimes : [getTimePeriodLabel(createdAt, cleanText)],
    tags: unique(events.map((event) => event.toLowerCase())),
  };
}

export function getMemoryNodes() {
  return getNodeStorage();
}

export function getMemoryEdges() {
  return getEdgeStorage();
}

export function upsertMemoryNode(type: MemoryNodeType, label: string, metadata: Record<string, unknown> = {}) {
  const normalizedLabel = normalizeLabel(label);
  const nodes = getNodeStorage();
  const existing = nodes.find((node) => node.type === type && node.label.toLowerCase() === normalizedLabel.toLowerCase());
  const now = new Date().toISOString();

  if (existing) {
    const updatedNode = { ...existing, metadata: { ...existing.metadata, ...metadata }, updatedAt: now };
    writeNodeStorage(nodes.map((node) => (node.id === existing.id ? updatedNode : node)));
    return updatedNode;
  }

  const node: MemoryNode = {
    id: `node-${type}-${slugify(normalizedLabel) || createId(type)}`,
    type,
    label: normalizedLabel,
    metadata,
    createdAt: now,
    updatedAt: now,
  };
  writeNodeStorage([node, ...nodes]);
  return node;
}

export function upsertMemoryEdge(fromNodeId: string, toNodeId: string, type: MemoryEdgeType, weight = 0.86) {
  const edges = getEdgeStorage();
  const existing = edges.find((edge) => edge.fromNodeId === fromNodeId && edge.toNodeId === toNodeId && edge.type === type);
  const now = new Date().toISOString();

  if (existing) {
    const updatedEdge = { ...existing, weight: Math.max(existing.weight, weight), updatedAt: now };
    writeEdgeStorage(edges.map((edge) => (edge.id === existing.id ? updatedEdge : edge)));
    return updatedEdge;
  }

  const edge: MemoryEdge = {
    id: createId('edge'),
    fromNodeId,
    toNodeId,
    type,
    weight,
    createdAt: now,
    updatedAt: now,
  };
  writeEdgeStorage([edge, ...edges]);
  return edge;
}

function ensureKeepsakeNode(keepsake: Keepsake) {
  return upsertMemoryNode('keepsake', keepsake.title, {
    keepsakeId: keepsake.id,
    ideaType: keepsake.ideaType,
    createdAt: keepsake.createdAt,
  });
}

function linkKeepsakeToNode(keepsakeId: string, nodeId: string, edgeType: MemoryEdgeType, primaryField?: 'primaryEventId' | 'primaryPlaceId') {
  const keepsake = getKeepsake(keepsakeId);
  const targetNode = getNodeStorage().find((node) => node.id === nodeId);
  if (!keepsake || !targetNode) return undefined;

  const keepsakeNode = ensureKeepsakeNode(keepsake);
  const edge = upsertMemoryEdge(keepsakeNode.id, nodeId, edgeType);
  const linkedNodeIds = unique([...(keepsake.linkedNodeIds ?? []), keepsakeNode.id, nodeId]);
  updateKeepsake(keepsakeId, {
    linkedNodeIds,
    ...(primaryField ? { [primaryField]: nodeId } : {}),
  });
  return edge;
}

export function linkKeepsakeToEvent(keepsakeId: string, eventId: string) {
  return linkKeepsakeToNode(keepsakeId, eventId, 'appearsIn', 'primaryEventId');
}

export function linkKeepsakeToPerson(keepsakeId: string, personId: string) {
  const keepsake = getKeepsake(keepsakeId);
  const edge = linkKeepsakeToNode(keepsakeId, personId, 'appearsIn');
  if (keepsake && edge) {
    updateKeepsake(keepsakeId, {
      primaryPersonIds: unique([...(keepsake.primaryPersonIds ?? []), personId]),
    });
  }
  return edge;
}

export function linkKeepsakeToPlace(keepsakeId: string, placeId: string) {
  return linkKeepsakeToNode(keepsakeId, placeId, 'happenedAt', 'primaryPlaceId');
}

export function linkKeepsakeToTimePeriod(keepsakeId: string, timePeriodId: string) {
  return linkKeepsakeToNode(keepsakeId, timePeriodId, 'partOf');
}

export function syncKeepsakeToGraph(keepsake: Keepsake, source: 'explicit' | 'ai-suggested' = 'ai-suggested') {
  const keepsakeNode = ensureKeepsakeNode(keepsake);
  const entities = extractMemoryEntities(getTextForKeepsake(keepsake), keepsake.createdAt);
  const linkedNodeIds = new Set([...(keepsake.linkedNodeIds ?? []), keepsakeNode.id]);
  const primaryPersonIds = new Set(keepsake.primaryPersonIds ?? []);
  let primaryEventId = keepsake.primaryEventId;
  let primaryPlaceId = keepsake.primaryPlaceId;

  entities.people.forEach((person) => {
    const node = upsertMemoryNode('person', person, { source });
    upsertMemoryEdge(keepsakeNode.id, node.id, 'appearsIn', 0.72);
    linkedNodeIds.add(node.id);
    primaryPersonIds.add(node.id);
  });

  entities.events.forEach((event, index) => {
    const node = upsertMemoryNode('event', event, { source });
    upsertMemoryEdge(keepsakeNode.id, node.id, 'appearsIn', 0.78);
    linkedNodeIds.add(node.id);
    primaryEventId = primaryEventId ?? (index === 0 ? node.id : undefined);
  });

  entities.places.forEach((place, index) => {
    const node = upsertMemoryNode('place', place, { source });
    upsertMemoryEdge(keepsakeNode.id, node.id, 'happenedAt', 0.7);
    linkedNodeIds.add(node.id);
    primaryPlaceId = primaryPlaceId ?? (index === 0 ? node.id : undefined);
  });

  entities.timePeriods.forEach((timePeriod) => {
    const node = upsertMemoryNode('timePeriod', timePeriod, { source, year: new Date(keepsake.createdAt).getFullYear() });
    upsertMemoryEdge(keepsakeNode.id, node.id, 'partOf', 0.82);
    linkedNodeIds.add(node.id);
  });

  entities.tags.forEach((tag) => {
    const node = upsertMemoryNode('tag', tag, { source });
    upsertMemoryEdge(keepsakeNode.id, node.id, 'relatedTo', 0.54);
    linkedNodeIds.add(node.id);
  });

  updateKeepsake(keepsake.id, {
    linkedNodeIds: Array.from(linkedNodeIds),
    primaryEventId,
    primaryPersonIds: Array.from(primaryPersonIds),
    primaryPlaceId,
  });

  return { entities, keepsakeNodeId: keepsakeNode.id, linkedNodeIds: Array.from(linkedNodeIds) };
}

export function syncAllKeepsakesToGraph() {
  return getKeepsakes().map((keepsake) => syncKeepsakeToGraph(keepsake));
}

function getKeepsakeIdFromNode(node: MemoryNode) {
  return typeof node.metadata.keepsakeId === 'string' ? node.metadata.keepsakeId : undefined;
}

export function suggestRelatedKeepsakes(keepsakeId: string) {
  const keepsake = getKeepsake(keepsakeId);
  if (!keepsake) return [];

  syncKeepsakeToGraph(keepsake);
  const nodes = getNodeStorage();
  const edges = getEdgeStorage();
  const keepsakeNode = nodes.find((node) => node.type === 'keepsake' && node.metadata.keepsakeId === keepsakeId);
  if (!keepsakeNode) return [];

  const connectedNodeIds = new Set(edges.filter((edge) => edge.fromNodeId === keepsakeNode.id).map((edge) => edge.toNodeId));
  const scores = new Map<string, number>();

  edges.forEach((edge) => {
    if (!connectedNodeIds.has(edge.toNodeId) || edge.fromNodeId === keepsakeNode.id) return;

    const otherNode = nodes.find((node) => node.id === edge.fromNodeId && node.type === 'keepsake');
    const otherKeepsakeId = otherNode ? getKeepsakeIdFromNode(otherNode) : undefined;
    if (!otherKeepsakeId || otherKeepsakeId === keepsakeId) return;
    scores.set(otherKeepsakeId, (scores.get(otherKeepsakeId) ?? 0) + edge.weight);
  });

  return Array.from(scores.entries())
    .sort((first, second) => second[1] - first[1])
    .map(([relatedKeepsakeId, score]) => {
      const relatedKeepsake = getKeepsake(relatedKeepsakeId);
      return relatedKeepsake ? { keepsake: relatedKeepsake, score } : undefined;
    })
    .filter((item): item is { keepsake: Keepsake; score: number } => Boolean(item))
    .slice(0, 6);
}

export function getLifeChapterForTimeRange(_userId: string, start: string, end: string): LifeChapter[] {
  syncAllKeepsakesToGraph();
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const nodes = getNodeStorage();
  const edges = getEdgeStorage();
  const chapters = nodes.filter((node) => node.type === 'timePeriod');

  return chapters
    .map((node) => {
      const keepsakeIds = edges
        .filter((edge) => edge.toNodeId === node.id)
        .map((edge) => nodes.find((candidate) => candidate.id === edge.fromNodeId))
        .map((candidate) => (candidate ? getKeepsakeIdFromNode(candidate) : undefined))
        .filter((id): id is string => Boolean(id))
        .filter((id) => {
          const keepsake = getKeepsake(id);
          if (!keepsake) return false;
          const time = new Date(keepsake.createdAt).getTime();
          return time >= startTime && time <= endTime;
        });

      return {
        node,
        keepsakeIds,
        start,
        end,
        density: keepsakeIds.length,
      };
    })
    .filter((chapter) => chapter.keepsakeIds.length > 0)
    .sort((first, second) => second.density - first.density);
}

export function generateLifeChapters() {
  const keepsakes = getKeepsakes();
  if (!keepsakes.length) return [];
  const sorted = keepsakes.slice().sort((first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime());
  return getLifeChapterForTimeRange('local-user', sorted[0].createdAt, sorted[sorted.length - 1].createdAt);
}

export function searchMemoryGraph(query: string) {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  syncAllKeepsakesToGraph();
  const nodes = getNodeStorage();
  const edges = getEdgeStorage();
  const matchedNodes = nodes.filter(
    (node) =>
      node.label.toLowerCase().includes(normalizedQuery) ||
      node.type.toLowerCase().includes(normalizedQuery) ||
      JSON.stringify(node.metadata).toLowerCase().includes(normalizedQuery),
  );
  const matchedNodeIds = new Set(matchedNodes.map((node) => node.id));
  const expandedNodeIds = new Set(matchedNodeIds);

  edges.forEach((edge) => {
    if (matchedNodeIds.has(edge.fromNodeId)) expandedNodeIds.add(edge.toNodeId);
    if (matchedNodeIds.has(edge.toNodeId)) expandedNodeIds.add(edge.fromNodeId);
  });

  return nodes
    .filter((node) => expandedNodeIds.has(node.id))
    .map((node) => {
      const keepsakeId = node.type === 'keepsake' ? getKeepsakeIdFromNode(node) : undefined;
      return { node, keepsake: keepsakeId ? getKeepsake(keepsakeId) : undefined };
    });
}

export function recommendTemplatesForEvent(eventLabel: string) {
  const lower = eventLabel.toLowerCase();
  const category = lower.includes('wedding') || lower.includes('birthday') || lower.includes('graduation') ? 'scrapbook' : 'keepsake';
  return templateRegistry
    .filter((template) => template.category === category || template.description.toLowerCase().includes(lower))
    .slice(0, 4);
}
