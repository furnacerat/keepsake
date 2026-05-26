export type MemoryItem = {
  id: string;
  src: string;
  createdAt: string;
  location?: string;
  tags: string[];
  people: string[];
  notes: string;
  meaningful: boolean;
  favorite: boolean;
  eventTag?: string;
  isFiled: boolean;
  isOnTimeline: boolean;
};

export type CreateMemoryItemInput = Omit<
  MemoryItem,
  'id' | 'createdAt' | 'notes' | 'meaningful' | 'favorite' | 'eventTag'
> &
  Partial<Pick<MemoryItem, 'notes' | 'meaningful' | 'favorite' | 'eventTag'>> & {
  createdAt?: string;
};

export type UpdateMemoryItemInput = Partial<Omit<MemoryItem, 'id'>>;
