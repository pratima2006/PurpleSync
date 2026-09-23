import {
  CalendarDays,
  FileText,
  Home,
  Link2,
  Users,
  Trophy,
  Vote,
} from 'lucide-react';
import type { NavItem } from './types';

export const navItems: NavItem[] = [
  { key: 'home', label: 'Briefing', icon: Home },
  { key: 'voting', label: 'Voting desk', icon: Vote },
  { key: 'schedule', label: 'Schedule', icon: CalendarDays },
  { key: 'achievements', label: 'Achievements', icon: Trophy },
  { key: 'updates', label: 'Updates', icon: FileText },
  { key: 'members', label: 'Members', icon: Users },
  { key: 'links', label: 'Official links', icon: Link2 },
];

export const updates = [
  {
    id: 1,
    category: 'NOTICE',
    date: '18 JUN 2025',
    title: 'BTS WORLD TOUR “ARIRANG” — notice on ticketing details',
    summary:
      'BIGHIT MUSIC has shared the first set of ticketing information for the Seoul dates. Keep the official notice close; details may update by region.',
    accent: 'plum',
  },
  {
    id: 2,
    category: 'RELEASE',
    date: '17 JUN 2025',
    title: '“Echoes of Tomorrow” enters its third week on the global chart',
    summary:
      'The new single holds its position across 21 territories. A quiet, extraordinary run — and a reason to keep the signal clear.',
    accent: 'gold',
  },
  {
    id: 3,
    category: 'BROADCAST',
    date: '16 JUN 2025',
    title: 'BTS on KBS News 9: full interview now available',
    summary:
      'A conversation on making music together again, the shape of the next chapter, and what home sounds like after time apart.',
    accent: 'blue',
  },
  {
    id: 4,
    category: 'COMMUNITY',
    date: '14 JUN 2025',
    title: 'The June “Purple Ribbon” project is now open for notes',
    summary:
      'A global ARMY-led project collecting messages for the tour opening night. Participation details and deadlines are in the community brief.',
    accent: 'rose',
  },
] as const;

export const votingItems = [
  {
    id: 1,
    title: 'Global Fan Choice — June round',
    platform: 'Mnet Plus',
    closes: 'Closes in 18h 42m',
    progress: 68,
    note: 'Daily votes available',
    status: 'open',
  },
  {
    id: 2,
    title: 'Artist of the Summer 2025',
    platform: 'The Fandom',
    closes: 'Closes in 3d 07h',
    progress: 43,
    note: 'One vote per account',
    status: 'open',
  },
  {
    id: 3,
    title: 'Best Group — quarterly poll',
    platform: 'K-Chart',
    closes: 'Ended 12 JUN',
    progress: 100,
    note: 'Results pending',
    status: 'ended',
  },
  {
    id: 4,
    title: 'Global Streaming Awards',
    platform: 'Streamy',
    closes: 'Opens 26 JUN',
    progress: 0,
    note: 'Watch for opening notice',
    status: 'upcoming',
  },
] as const;

export const scheduleItems = [
  {
    day: '20',
    month: 'JUN',
    weekday: 'FRI',
    title: 'BTS WORLD TOUR “ARIRANG” — press conference',
    type: 'Broadcast',
    time: '19:00 KST',
    location: 'Official YouTube',
  },
  {
    day: '21',
    month: 'JUN',
    weekday: 'SAT',
    title: 'BTS WORLD TOUR “ARIRANG” — Seoul · night one',
    type: 'Performance',
    time: '18:00 KST',
    location: 'Goyang Stadium',
  },
  {
    day: '22',
    month: 'JUN',
    weekday: 'SUN',
    title: 'BTS WORLD TOUR “ARIRANG” — Seoul · night two',
    type: 'Performance',
    time: '18:00 KST',
    location: 'Goyang Stadium',
  },
  {
    day: '27',
    month: 'JUN',
    weekday: 'FRI',
    title: '“Echoes of Tomorrow” — behind the track',
    type: 'Content',
    time: '18:00 KST',
    location: 'BANGTANTV',
  },
] as const;

export const achievementItems = [
  {
    year: '2025',
    title: 'First K-pop group to headline a festival at Glastonbury',
    type: 'MILESTONE',
  },
  {
    year: '2024',
    title: 'Seven consecutive weeks at No. 1 with “Dynamite”',
    type: 'CHARTS',
  },
  {
    year: '2023',
    title: 'The most streamed group in global platform history',
    type: 'STREAMING',
  },
] as const;

export const memberItems = [
  {
    name: 'RM',
    role: 'Leader · Rapper',
    detail: 'Thoughtful, articulate, and always looking for the next idea.',
    tone: 'lavender',
  },
  {
    name: 'Jin',
    role: 'Vocalist',
    detail: 'A steady voice, a bright sense of humor, and a generous stage presence.',
    tone: 'peach',
  },
  {
    name: 'SUGA',
    role: 'Rapper · Producer',
    detail: 'Precise in the studio and quietly direct about the work.',
    tone: 'blue',
  },
  {
    name: 'j-hope',
    role: 'Rapper · Dancer',
    detail: 'An instinct for movement, rhythm, and making a room feel lighter.',
    tone: 'gold',
  },
  {
    name: 'Jimin',
    role: 'Vocalist · Dancer',
    detail: 'A refined performer with a voice that carries close to the heart.',
    tone: 'rose',
  },
  {
    name: 'V',
    role: 'Vocalist',
    detail: 'A distinctive tone and a point of view that never feels borrowed.',
    tone: 'mint',
  },
  {
    name: 'Jung Kook',
    role: 'Vocalist',
    detail: 'A focused all-rounder with an instinct for the big moment.',
    tone: 'plum',
  },
] as const;

export const linkGroups = [
  {
    label: 'The official desk',
    description: 'Primary sources, always.',
    links: [
      {
        name: 'BTS Official',
        detail: 'bts.ibighit.com',
        url: 'https://ibighit.com/bts/eng/',
      },
      { name: 'BIGHIT MUSIC', detail: 'ibighit.com', url: 'https://ibighit.com' },
      { name: 'BTS on Weverse', detail: 'weverse.io/bts', url: 'https://weverse.io/bts' },
    ],
  },
  {
    label: 'Listen & watch',
    description: 'The places the music lives.',
    links: [
      { name: 'BANGTANTV', detail: 'youtube.com/@BTS', url: 'https://www.youtube.com/@BTS' },
      {
        name: 'BTS on Spotify',
        detail: 'open.spotify.com/artist',
        url: 'https://open.spotify.com/artist/3Nrfpe0tUJi4K4DXYWgMUX',
      },
      {
        name: 'BTS on Apple Music',
        detail: 'music.apple.com',
        url: 'https://music.apple.com/us/artist/bts/883131348',
      },
    ],
  },
] as const;