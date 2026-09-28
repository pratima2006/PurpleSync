import type { LucideIcon } from 'lucide-react';

export type PageKey = 'home' | 'voting' | 'schedule' | 'achievements' | 'updates' | 'links' | 'members' | 'admin' | 'settings' | 'faq' | 'help' | 'palette' | 'profile';

export type NavItem = {
  key: PageKey;
  label: string;
  icon: LucideIcon;
};
