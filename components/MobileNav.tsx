import { navItems } from './data';
import type { PageKey } from './types';

type MobileNavProps = {
  page: PageKey;
  onNavigate: (page: PageKey) => void;
};

export function MobileNav({ page, onNavigate }: MobileNavProps) {
  const items = navItems.filter((item) =>
    ['home', 'voting', 'schedule', 'achievements', 'updates'].includes(item.key),
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-[70px] items-center justify-around border-t border-[#dfd9eb] bg-[#fbfaff]/95 px-2 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onNavigate(key)}
          aria-current={page === key ? 'page' : undefined}
          className={`flex min-w-[56px] flex-col items-center gap-1.5 rounded-xl px-2 py-2 text-[9px] font-medium ${
            page === key ? 'text-[#644597]' : 'text-[#8a829c]'
          }`}
        >
          <Icon size={18} strokeWidth={page === key ? 2.2 : 1.7} />
          <span>{label === 'Briefing' ? 'Home' : label.split(' ')[0]}</span>
        </button>
      ))}
    </nav>
  );
}