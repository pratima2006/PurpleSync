import { navItems } from './data';
import type { PageKey } from './types';

type MobileNavProps = {
  page: PageKey;
  onNavigate: (page: PageKey) => void;
};

export function MobileNav({ page, onNavigate }: MobileNavProps) {
  const mobileItems = navItems.filter((item) =>
    ['home', 'voting', 'schedule', 'achievements', 'updates'].includes(item.key),
  );
  const desktopItems = navItems;

  return (
    <nav className="fixed bottom-5 inset-x-0 z-40 mx-auto flex h-[64px] w-[92%] max-w-[380px] md:max-w-[720px] md:h-[68px] items-center justify-around rounded-full border border-white/40 bg-[#eef2ff]/70 px-2 shadow-[0_8px_32px_rgba(31,38,135,0.15),inset_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-150">
      {/* MOBILE - 5 items hi */}
      <div className="flex w-full items-center justify-around md:hidden">
        {mobileItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate(key)}
            aria-current={page === key? 'page' : undefined}
            className={`flex min-w-[56px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[9px] font-medium transition-all ${page === key? 'bg-white text-[#644597] shadow-sm' : 'text-[#7a708f]'}`}
          >
            <Icon size={18} strokeWidth={page === key? 2.2 : 1.7} />
            <span>{label === 'Briefing'? 'Home' : label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* DESKTOP - expand hoke saare items including members */}
      <div className="hidden w-full items-center justify-between md:flex px-1">
        {desktopItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate(key)}
            aria-current={page === key? 'page' : undefined}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-medium transition-all ${page === key? 'bg-white text-[#644597] shadow-sm' : 'text-[#6e6582] hover:bg-white/60 hover:text-[#4f3876]'}`}
          >
            <Icon size={18} strokeWidth={page === key? 2.2 : 1.7} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
