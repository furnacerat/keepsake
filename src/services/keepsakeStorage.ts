import { keepsakeSchema } from '../models/keepsake';
import type { CreateKeepsakeInput, Keepsake, UpdateKeepsakeInput } from '../models/keepsake';

const STORAGE_KEY = 'keepsake.savedKeepsakes';

function isUnlockedByDate(keepsake: Keepsake) {
  if (keepsake.unlockType !== 'date' || !keepsake.unlockDate) {
    return true;
  }

  const today = new Date().toISOString().slice(0, 10);
  return today >= keepsake.unlockDate;
}

function applyUnlockStatus(keepsake: Keepsake): Keepsake {
  return {
    ...keepsake,
    status: isUnlockedByDate(keepsake) ? 'unlocked' : 'locked',
  };
}

function readRawKeepsakes(): Keepsake[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => keepsakeSchema.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data);
  } catch {
    return [];
  }
}

function writeKeepsakes(keepsakes: Keepsake[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keepsakes));
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getKeepsakes() {
  const rawKeepsakes = readRawKeepsakes();
  const keepsakes = rawKeepsakes.map(applyUnlockStatus);

  if (JSON.stringify(rawKeepsakes) !== JSON.stringify(keepsakes)) {
    writeKeepsakes(keepsakes);
  }

  return keepsakes.sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}

export function createKeepsake(input: CreateKeepsakeInput) {
  const keepsake = applyUnlockStatus({
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
    status: 'locked',
  });

  writeKeepsakes([keepsake, ...getKeepsakes()]);
  return keepsake;
}

export function updateKeepsake(id: string, input: UpdateKeepsakeInput) {
  let updatedKeepsake: Keepsake | undefined;
  const keepsakes = getKeepsakes().map((keepsake) => {
    if (keepsake.id !== id) {
      return keepsake;
    }

    updatedKeepsake = applyUnlockStatus({ ...keepsake, ...input });
    return updatedKeepsake;
  });

  writeKeepsakes(keepsakes);
  return updatedKeepsake;
}

export function getKeepsake(id: string) {
  return getKeepsakes().find((keepsake) => keepsake.id === id);
}
