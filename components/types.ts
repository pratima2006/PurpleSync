import type { LucideIcon } from 'lucide-react';

export type PageKey = 
  | 'home' 
  | 'voting' 
  | 'schedule' 
  | 'achievements' 
  | 'updates' 
  | 'links' 
  | 'members' 
  | 'admin' 
  | 'settings' 
  | 'faq' 
  | 'help' 
  | 'palette' 
  | 'profile'
  | 'quiz';

export type NavItem = {
  key: PageKey;
  label: string;
  icon: LucideIcon;
};
