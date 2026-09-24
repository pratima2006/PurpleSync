import { navItems } from './data';
import type { PageKey } from './types';

type MobileNavProps = {
  page: PageKey;
  onNavigate: (page: PageKey) => void;
};

function shortLabel(label: string) {
  if (label === 'Briefing') return 'Home';
  if (label.toLowerCase().includes('voting')) return 'Voting';
  if (label.toLowerCase().includes('official')) return 'Official links';
  return label.split(' ')[0];
}

export function MobileNav({ page, onNavigate }: MobileNavProps) {
  const mobileItems = navItems.filter((item) =>
    ['home', 'voting', 'schedule', 'achievements', 'updates'].includes(item.key),
  );
  const desktopItems = navItems;

  return (
    <nav className="fixed bottom-5 inset-x-0 z-40 mx-auto flex h-[64px] w-[92%] max-w-[380px] md:w-auto md:max-w-[780px] md:h-[62px] items-center justify-around rounded-full border border-white/40 bg-[#eef2ff]/70 px-2 shadow-[0_8px_32px_rgba(31,38,135,0.15),inset_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="flex w-full items-center justify-around md:hidden">
        {mobileItems.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => onNavigate(key)} className={`flex min-w-[56px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[9px] font-medium transition-all ${page === key? 'bg-white text-[#644597] shadow-sm' : 'text-[#7a708f]'}`}>
            <Icon size={18} strokeWidth={page === key? 2.2 : 1.7} />
            <span>{shortLabel(label)}</span>
          </button>
        ))}
      </div>

      <div className="hidden w-full items-center justify-center gap-1 md:flex px-2">
        {desktopItems.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => onNavigate(key)} className={`flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[11px] font-medium whitespace-nowrap transition-all ${page === key? 'bg-white text-[#644597] shadow-sm' : 'text-[#6e6582] hover:bg-white/60'}`}>
            <Icon size={16} strokeWidth={page === key? 2.2 : 1.7} />
            <span>{shortLabel(label)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
