import type { CreateMemoryItemInput, MemoryItem, UpdateMemoryItemInput } from '../models/memory';
import type { Keepsake } from '../models/keepsake';
import { getKeepsakes } from './keepsakeStorage';

const STORAGE_KEY = 'keepsake.memoryBoxItems';

export type UnifiedTimelineItem =
  | {
      id: string;
      type: 'photo';
      date: string;
      memory: MemoryItem;
      people: string[];
      tags: string[];
      eventTag?: string;
      meaningful: boolean;
      favorite: boolean;
    }
  | {
      id: string;
      type: 'keepsake';
      date: string;
      keepsake: Keepsake;
      people: string[];
      tags: string[];
      eventTag?: string;
      meaningful: boolean;
      favorite: boolean;
    };

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readMemoryItems(): MemoryItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMemoryItems(items: MemoryItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function normalizeMemoryItem(item: MemoryItem): MemoryItem {
  return {
    ...item,
    tags: item.tags ?? [],
    people: item.people ?? [],
    notes: item.notes ?? '',
    meaningful: item.meaningful ?? false,
    favorite: item.favorite ?? false,
    eventTag: item.eventTag ?? '',
    isFiled: item.isFiled ?? false,
    isOnTimeline: item.isOnTimeline ?? false,
  };
}

export function getMemoryItems() {
  const rawItems = readMemoryItems();
  const normalizedItems = rawItems.map(normalizeMemoryItem);

  if (JSON.stringify(rawItems) !== JSON.stringify(normalizedItems)) {
    writeMemoryItems(normalizedItems);
  }

  return normalizedItems.sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}

export function getMemoryItem(id: string) {
  return getMemoryItems().find((item) => item.id === id);
}

export function createMemoryItem(input: CreateMemoryItemInput) {
  const item: MemoryItem = {
    ...input,
    id: createId(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    tags: input.tags ?? [],
    people: input.people ?? [],
    notes: input.notes ?? '',
    meaningful: input.meaningful ?? false,
    favorite: input.favorite ?? false,
    eventTag: input.eventTag ?? '',
    isFiled: input.isFiled ?? false,
    isOnTimeline: input.isOnTimeline ?? false,
  };

  writeMemoryItems([item, ...getMemoryItems()]);
  return item;
}

export function createMemoryItems(inputs: CreateMemoryItemInput[]) {
  const existing = getMemoryItems();
  const created = inputs.map((input) => ({
    ...input,
    id: createId(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    tags: input.tags ?? [],
    people: input.people ?? [],
    notes: input.notes ?? '',
    meaningful: input.meaningful ?? false,
    favorite: input.favorite ?? false,
    eventTag: input.eventTag ?? '',
    isFiled: input.isFiled ?? false,
    isOnTimeline: input.isOnTimeline ?? false,
  }));

  writeMemoryItems([...created, ...existing]);
  return created;
}

export function updateMemoryItem(id: string, input: UpdateMemoryItemInput) {
  let updatedItem: MemoryItem | undefined;
  const items = getMemoryItems().map((item) => {
    if (item.id !== id) {
      return item;
    }

    updatedItem = { ...item, ...input };
    return updatedItem;
  });

  writeMemoryItems(items);
  return updatedItem;
}

export function updateMultipleMemoryItems(
  ids: string[],
  input: UpdateMemoryItemInput | ((item: MemoryItem) => UpdateMemoryItemInput),
) {
  const idSet = new Set(ids);
  const updatedItems: MemoryItem[] = [];
  const items = getMemoryItems().map((item) => {
    if (!idSet.has(item.id)) {
      return item;
    }

    const updates = typeof input === 'function' ? input(item) : input;
    const updatedItem = { ...item, ...updates };
    updatedItems.push(updatedItem);
    return updatedItem;
  });

  writeMemoryItems(items);
  return updatedItems;
}

export function getTimelineItems() {
  const photoItems: UnifiedTimelineItem[] = getMemoryItems()
    .filter((item) => item.isOnTimeline)
    .map((memory) => ({
      id: `photo-${memory.id}`,
      type: 'photo',
      date: memory.createdAt,
      memory,
      people: memory.people,
      tags: memory.tags,
      eventTag: memory.eventTag,
      meaningful: memory.meaningful,
      favorite: memory.favorite,
    }));

  const keepsakeItems: UnifiedTimelineItem[] = getKeepsakes().map((keepsake) => ({
    id: `keepsake-${keepsake.id}`,
    type: 'keepsake',
    date: keepsake.createdAt,
    keepsake,
    people: [],
    tags: [keepsake.ideaType],
    eventTag: undefined,
    meaningful: false,
    favorite: false,
  }));

  return [...photoItems, ...keepsakeItems].sort(
    (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
  );
}
