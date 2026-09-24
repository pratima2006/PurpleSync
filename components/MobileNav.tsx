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
    <>
      {/* MOBILE - Bottom Pill Glass - Same as 1st pic */}
      <nav
        className="fixed inset-x-0 bottom-5 z-40 mx-auto flex h-[64px] max-w-[92%] items-center justify-around rounded-full border border-white/60 bg-[#fdfcff]/75 px-2 shadow-xl backdrop-blur-xl md:hidden"
        aria-label="Mobile navigation"
      >
        {mobileItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate(key)}
            aria-current={page === key? 'page' : undefined}
            className={`flex min-w-[56px] flex-col items-center gap-1 rounded-full px-3 py-2 text-[9px] font-medium transition-all ${
              page === key? 'bg-[#f1eafb] text-[#644597]' : 'text-[#8a829c]'
            }`}
          >
            <Icon size={18} strokeWidth={page === key? 2.2 : 1.7} />
            <span>{label === 'Briefing'? 'Home' : label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>

      {/* LAPTOP - Side Expand Glass Pill */}
      <nav
        className="hidden md:flex group fixed left-5 top-5 bottom-5 z-40 w-[78px] hover:w-[220px] flex-col justify-between rounded-[28px] border border-white/60 bg-[#fdfcff]/70 py-6 shadow-xl backdrop-blur-xl transition-all duration-300 ease-out overflow-hidden"
        aria-label="Desktop navigation"
      >
        <div className="flex flex-col gap-1 px-2">
          {desktopItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              aria-current={page === key? 'page' : undefined}
              className={`flex items-center gap-3 rounded-full px-3 py-3 text-[13px] font-medium transition-all whitespace-nowrap ${
                page === key
                 ? 'bg-[#f1eafb] text-[#644597]'
                  : 'text-[#6e6280] hover:bg-white/60 hover:text-[#4f3876]'
              }`}
            >
              <Icon size={20} strokeWidth={page === key? 2.2 : 1.7} className="shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">{label}</span>
            </button>
          ))}
        </div>

        <div className="px-3 pb-2">
          <div className="h-px w-full bg-[#e8e0f2] mb-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="ps-mono text-[8px] text-[#9d8fb3] px-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">PURPLESYNC</p>
        </div>
      </nav>
    </>
  );
}
