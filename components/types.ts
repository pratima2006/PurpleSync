import type { LucideIcon } from 'lucide-react';

export type PageKey = 'home' | 'voting' | 'schedule' | 'achievements' | 'updates' | 'links' | 'members' | 'admin' | 'userAddVoting' | 'settings' | 'faq' | 'help' | 'palette' | 'quiz' | 'profile';

export type NavItem = {
  key: PageKey;
  label: string;
  icon: LucideIcon;
};
