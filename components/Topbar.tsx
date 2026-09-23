import { Bell, Globe2, Menu, Search } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { navItems } from './data';
import type { PageKey } from './types';

type TopbarProps = {
  page: PageKey;
  onNavigate: (page: PageKey) => void;
  onSearch: () => void;
  onMenu: () => void;
};

export function Topbar({
  page,
  onNavigate,
  onSearch,
  onMenu,
}: TopbarProps) {
  const title = navItems.find((item) => item.key === page)?.label ?? 'Briefing';

  return (
    <header className="flex h-[82px] items-center justify-between border-b border-[#e8e3f0] px-5 md:px-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-lg p-2 text-[#81788f] hover:bg-[#f0edf6] md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={19} />
        </button>
        <div className="md:hidden">
          <BrandMark compact />
        </div>
        <div className="hidden items-center gap-2 text-[11px] text-[#948ca0] md:flex">
          <span>ARMY /</span>
          <span className="font-medium text-[#4c425c]">{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={onSearch}
          className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-[#81788f] hover:bg-[#f0edf6]"
          aria-label="Search the desk"
        >
          <Search size={17} />
          <span className="hidden text-[12px] md:inline">Search</span>
        </button>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#81788f] hover:bg-[#f0edf6]"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#aa8be8]" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('links')}
          className="hidden items-center gap-2 rounded-lg border border-[#dfd9eb] bg-white px-3 py-2 text-[11px] font-medium text-[#4c425c] hover:border-[#b7a4dc] sm:flex"
        >
          <Globe2 size={14} /> Official sources
        </button>
      </div>
    </header>
  );
}