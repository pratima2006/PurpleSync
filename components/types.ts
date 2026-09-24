import type { LucideIcon } from 'lucide-react';

export type PageKey = 'home' | 'voting' | 'schedule' | 'achievements' | 'updates' | 'members' | 'links' | 'admin';

export type NavItem = {
  key: PageKey;
  label: string;
  icon: LucideIcon;
};
