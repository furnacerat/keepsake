import { categories } from './categories';

export type SectionPath = '/yourself' | '/someone' | '/moments' | '/creative' | '/unlockables';

export type Idea = {
  type: string;
  title: string;
  description: string;
  tag: string;
};

export type Catalog = {
  path: SectionPath;
  eyebrow: string;
  title: string;
  description: string;
  ideas: Idea[];
};

export const catalogs: Catalog[] = [
  {
    path: '/yourself',
    eyebrow: 'For Yourself',
    title: 'Letters and capsules for your future self.',
    description: 'Private keepsakes for reflection, growth, and remembering who you are becoming.',
    ideas: [
      {
        type: 'future-self-letter',
        title: 'Future Self Letter',
        description: 'Write a letter to open months or years from now. Capture hopes, worries, promises, and the season you are living through.',
        tag: 'For You',
      },
      {
        type: 'year-in-my-life',
        title: 'A Year in My Life',
        description: 'Gather small moments, lessons, favorites, and photos into a personal time capsule for this chapter.',
        tag: 'For You',
      },
      {
        type: 'healing-note',
        title: 'A Gentle Healing Note',
        description: 'Create a soft place for encouragement, forgiveness, or words you need when life feels tender.',
        tag: 'Reflection',
      },
      {
        type: 'dream-list',
        title: 'Dream List Capsule',
        description: 'Save the places, projects, rituals, and brave little dreams you want to return to later.',
        tag: 'For You',
      },
    ],
  },
  {
    path: '/someone',
    eyebrow: 'For Someone You Love',
    title: 'Tender keepsakes for people who matter.',
    description: 'Giftable memories, letters, and prompts for making someone feel deeply seen.',
    ideas: [
      {
        type: 'open-when-letter',
        title: 'Open When Letters',
        description: 'Create a set of letters for moments like missing you, needing courage, or celebrating a tiny win.',
        tag: 'For Them',
      },
      {
        type: 'why-i-love-you',
        title: 'Why I Love You',
        description: 'Collect specific memories, qualities, and everyday details that explain what makes them irreplaceable.',
        tag: 'For Them',
      },
      {
        type: 'shared-memory-box',
        title: 'Shared Memory Box',
        description: 'Bundle favorite photos, inside jokes, songs, and places into one heartfelt digital keepsake.',
        tag: 'Together',
      },
      {
        type: 'parent-grandparent-story',
        title: 'Family Story Prompt',
        description: 'Invite a parent, grandparent, or elder to preserve stories, advice, and memories in their own voice.',
        tag: 'Family',
      },
      {
        type: 'just-because-note',
        title: 'Just Because Note',
        description: 'Send a simple, beautiful message that makes an ordinary day feel remembered.',
        tag: 'For Them',
      },
    ],
  },
  {
    path: '/moments',
    eyebrow: 'Special Moments',
    title: 'Mark a milestone with meaning.',
    description: 'Keepsake ideas for birthdays, anniversaries, new chapters, and days worth holding onto.',
    ideas: [
      {
        type: 'birthday-time-capsule',
        title: 'Birthday Time Capsule',
        description: 'Capture wishes, photos, favorite things, and messages from loved ones for a birthday they can revisit.',
        tag: 'Milestone',
      },
      {
        type: 'wedding-memory-vault',
        title: 'Wedding Memory Vault',
        description: 'Preserve vows, guest notes, music, and tiny behind-the-scenes details from the celebration.',
        tag: 'Love',
      },
      {
        type: 'new-baby-letter',
        title: 'New Baby Letter',
        description: 'Write a welcome letter filled with hopes, family stories, and the first details of a new life.',
        tag: 'Family',
      },
      {
        type: 'graduation-capsule',
        title: 'Graduation Capsule',
        description: 'Collect advice, memories, proud moments, and dreams for the next chapter.',
        tag: 'Milestone',
      },
      {
        type: 'anniversary-keepsake',
        title: 'Anniversary Keepsake',
        description: 'Create a living record of what changed, what endured, and what still feels like home.',
        tag: 'Love',
      },
    ],
  },
  {
    path: '/creative',
    eyebrow: 'Creative Keepsakes',
    title: 'Make the memory feel unmistakably yours.',
    description: 'More expressive formats for turning memories into rituals, collections, and small works of art.',
    ideas: [
      {
        type: 'memory-playlist',
        title: 'Memory Playlist',
        description: 'Pair songs with notes about what they mean, who they remind you of, and where they take you back.',
        tag: 'Creative',
      },
      {
        type: 'places-weve-been',
        title: 'Places We Have Been',
        description: 'Map meaningful locations with photos, short captions, and the stories that live there.',
        tag: 'Together',
      },
      {
        type: 'recipe-story-card',
        title: 'Recipe Story Card',
        description: 'Save a beloved recipe alongside the person, kitchen, holiday, or memory that made it matter.',
        tag: 'Family',
      },
      {
        type: 'tiny-ritual-book',
        title: 'Tiny Ritual Book',
        description: 'Collect the small traditions, routines, and gestures that make a relationship or season feel sacred.',
        tag: 'Creative',
      },
    ],
  },
  {
    path: '/unlockables',
    eyebrow: 'Unlockables',
    title: 'Let a memory open when the moment is right.',
    description: 'Time-release keepsakes for surprise, anticipation, and future moments of connection.',
    ideas: [
      {
        type: 'date-locked-letter',
        title: 'Date-Locked Letter',
        description: 'Write something now and choose the exact day it becomes available to you or someone else.',
        tag: 'Timed',
      },
      {
        type: 'milestone-unlock',
        title: 'Milestone Unlock',
        description: 'Create a keepsake that opens after a graduation, move, recovery moment, or personal goal.',
        tag: 'Milestone',
      },
      {
        type: 'countdown-capsule',
        title: 'Countdown Capsule',
        description: 'Build a sequence of small notes that unlock one by one before a trip, wedding, or reunion.',
        tag: 'Surprise',
      },
      {
        type: 'future-family-message',
        title: 'Future Family Message',
        description: 'Preserve words, stories, or blessings for a child, sibling, or loved one to receive later.',
        tag: 'Family',
      },
    ],
  },
];

export function getCatalog(path: SectionPath) {
  return catalogs.find((catalog) => catalog.path === path);
}

export function getCategoryTitle(path: SectionPath) {
  return categories.find((category) => category.to === path)?.title ?? 'Keepsake';
}
