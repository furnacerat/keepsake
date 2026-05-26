import { z } from 'zod';

export const memoryNodeTypeSchema = z.enum(['keepsake', 'person', 'event', 'place', 'timePeriod', 'tag', 'album']);
export const memoryEdgeTypeSchema = z.enum([
  'appearsIn',
  'happenedAt',
  'relatedTo',
  'partOf',
  'samePerson',
  'sameEvent',
]);

export const memoryNodeSchema = z.object({
  id: z.string(),
  type: memoryNodeTypeSchema,
  label: z.string(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const memoryEdgeSchema = z.object({
  id: z.string(),
  fromNodeId: z.string(),
  toNodeId: z.string(),
  type: memoryEdgeTypeSchema,
  weight: z.number().min(0).max(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MemoryNodeType = z.infer<typeof memoryNodeTypeSchema>;
export type MemoryEdgeType = z.infer<typeof memoryEdgeTypeSchema>;
export type MemoryNode = z.infer<typeof memoryNodeSchema>;
export type MemoryEdge = z.infer<typeof memoryEdgeSchema>;

export type ExtractedMemoryEntities = {
  people: string[];
  places: string[];
  events: string[];
  timePeriods: string[];
  tags: string[];
};

export type LifeChapter = {
  node: MemoryNode;
  keepsakeIds: string[];
  start: string;
  end: string;
  density: number;
};
