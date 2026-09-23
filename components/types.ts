import type { LucideIcon } from 'lucide-react';

export type PageKey =
  | 'home'
  | 'voting'
  | 'schedule'
  | 'achievements'
  | 'updates'
  | 'links'
  | 'members';

export type NavItem = {
  key: PageKey;
  label: string;
  icon: LucideIcon;
};