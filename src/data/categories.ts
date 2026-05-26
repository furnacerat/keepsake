import {
  CalendarHeart,
  Heart,
  LockKeyhole,
  Palette,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Category = {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  accent: 'rose' | 'gold' | 'sage' | 'violet';
};

export const categories: Category[] = [
  {
    title: 'For Yourself',
    description: 'Private letters, reflection prompts, and time capsules for the person you are becoming.',
    to: '/yourself',
    icon: UserRound,
    accent: 'rose',
  },
  {
    title: 'For Someone You Love',
    description: 'Heartfelt notes and memory bundles for someone who deserves to feel remembered.',
    to: '/someone',
    icon: Heart,
    accent: 'rose',
  },
  {
    title: 'For Special Moments',
    description: 'Birthday wishes, wedding notes, anniversaries, and milestones held with care.',
    to: '/moments',
    icon: CalendarHeart,
    accent: 'gold',
  },
  {
    title: 'Creative Keepsakes',
    description: 'Playlists, tiny rituals, memory maps, and expressive keepsakes with a personal touch.',
    to: '/creative',
    icon: Palette,
    accent: 'sage',
  },
  {
    title: 'Unlockables',
    description: 'Messages and keepsakes that open on a date, after a milestone, or at just the right time.',
    to: '/unlockables',
    icon: LockKeyhole,
    accent: 'violet',
  },
];
