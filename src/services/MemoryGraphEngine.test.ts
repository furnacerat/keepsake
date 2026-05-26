import { beforeEach, describe, expect, it } from 'vitest';
import { createKeepsake } from './keepsakeStorage';
import {
  extractMemoryEntities,
  getMemoryEdges,
  getMemoryNodes,
  searchMemoryGraph,
  suggestRelatedKeepsakes,
  syncKeepsakeToGraph,
  upsertMemoryNode,
  linkKeepsakeToPerson,
} from './MemoryGraphEngine';

beforeEach(() => {
  window.localStorage.clear();
});

describe('MemoryGraphEngine', () => {
  it('extracts people, places, events, and time periods from keepsake text', () => {
    const entities = extractMemoryEntities('Grandma Rose visited the apartment in Boston for graduation in summer 2019.');

    expect(entities.people).toContain('Grandma Rose');
    expect(entities.places).toContain('Boston');
    expect(entities.events).toContain('Graduation');
    expect(entities.timePeriods).toContain('summer 2019');
  });

  it('syncs a keepsake into graph nodes and edges', () => {
    const keepsake = createKeepsake({
      ideaType: 'letter',
      recipientType: 'Myself',
      title: 'Grandma Wedding Memory',
      message: 'Grandma shared a story from the wedding at home.',
      unlockType: 'none',
    });

    syncKeepsakeToGraph(keepsake);

    expect(getMemoryNodes().some((node) => node.type === 'keepsake' && node.label === keepsake.title)).toBe(true);
    expect(getMemoryNodes().some((node) => node.type === 'event' && node.label === 'Wedding')).toBe(true);
    expect(getMemoryEdges().length).toBeGreaterThan(0);
  });

  it('suggests related keepsakes through shared graph nodes', () => {
    const first = createKeepsake({
      ideaType: 'letter',
      recipientType: 'Myself',
      title: 'Grandma Birthday',
      message: 'Grandma was there for the birthday.',
      unlockType: 'none',
    });
    const second = createKeepsake({
      ideaType: 'letter',
      recipientType: 'Myself',
      title: 'Grandma Vacation',
      message: 'Grandma joined us for vacation.',
      unlockType: 'none',
    });

    syncKeepsakeToGraph(first);
    syncKeepsakeToGraph(second);

    expect(suggestRelatedKeepsakes(first.id).map((item) => item.keepsake.id)).toContain(second.id);
  });

  it('supports explicit person links', () => {
    const keepsake = createKeepsake({
      ideaType: 'letter',
      recipientType: 'Myself',
      title: 'Family Note',
      message: 'A note for later.',
      unlockType: 'none',
    });
    const person = upsertMemoryNode('person', 'Emma');

    const edge = linkKeepsakeToPerson(keepsake.id, person.id);

    expect(edge?.toNodeId).toBe(person.id);
    expect(searchMemoryGraph('Emma').some((result) => result.node.id === person.id)).toBe(true);
  });
});
