import { Bell, Globe2, Menu, Search, Settings, FileQuestion, HelpCircle, X } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { navItems } from './data';
import type { PageKey } from './types';
import { useState } from 'react';

type TopbarProps = {
  page: PageKey;
  onNavigate: (page: PageKey) => void;
  onSearch: () => void;
  onMenu: () => void;
};

export function Topbar({ page, onNavigate, onSearch, onMenu }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const title = navItems.find((item) => item.key === page)?.label?? page.charAt(0).toUpperCase() + page.slice(1);

  const toggleMenu = () => {
    const next =!menuOpen;
    setMenuOpen(next);
    if (next) onMenu();
  };

  return (
    <>
      <header className="flex h-[72px] items-center justify-between border-b border-[#e8e3f0] bg-white/70 px-5 md:px-8 backdrop-blur-md">
        {/* LEFT - App icon hamesha same, X tilt animation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className={`grid place-items-center rounded-full bg-[#f1eafb] p-2 text-[#644597] transition-all duration-300 ${menuOpen? 'rotate-0 opacity-100 w-9 h-9' : '-rotate-90 opacity-0 w-0 h-0 p-0 pointer-events-none'}`}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>

          <div className={`flex items-center gap-2 transition-all duration-300 ${menuOpen? 'translate-x-1' : 'translate-x-0'}`}>
            <BrandMark compact={false} />
            <div className="flex items-center gap-2 text-[11px] text-[#948ca0]">
              <span className="hidden sm:inline">ARMY /</span>
              <span className="font-medium text-[#4c425c]">{title}</span>
            </div>
          </div>
        </div>

        {/* RIGHT - Mobile & Laptop same */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            type="button"
            onClick={onSearch}
            className="flex h-9 items-center justify-center rounded-full px-3 text-[#81788f] hover:bg-[#f0edf6]"
          >
            <Search size={17} />
            <span className="hidden md:inline ml-1 text-[12px]">Search</span>
          </button>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#81788f] hover:bg-[#f0edf6]"
          >
            <Bell size={17} />
            <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#aa8be8]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('links')}
            className="hidden sm:flex items-center gap-2 rounded-full border border-[#dfd9eb] bg-white px-3 py-2 text-[11px] font-medium text-[#4c425c]"
          >
            <Globe2 size={14} /> Official
          </button>

          {/* Bell ke right side wala menu button */}
          <button
            type="button"
            onClick={toggleMenu}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${menuOpen? 'bg-[#644597] text-white border-[#644597] rotate-90' : 'bg-[#f1eafb] text-[#644597] border-white/60 hover:bg-white'}`}
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-5 top-[88px] z-50 w-[300px] rounded-[20px] border border-white/40 bg-[#eef2ff]/80 p-3 shadow-[0_16px_40px_rgba(31,38,135,0.18)] backdrop-blur-2xl">
            <button onClick={() => { onNavigate('settings' as PageKey); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left text-[13px] font-medium text-[#4c425c] hover:bg-[#f1eafb]">
              <Settings size={16} /> Settings
            </button>
            <button onClick={() => { onNavigate('faq' as PageKey); setMenuOpen(false); }} className="mt-2 flex w-full items-center gap-3 rounded-xl bg-white/60 px-4 py-3 text-left text-[13px] font-medium text-[#4c425c] hover:bg-white">
              <FileQuestion size={16} /> FAQ
            </button>
            <button onClick={() => { onNavigate('help' as PageKey); setMenuOpen(false); }} className="mt-2 flex w-full items-center gap-3 rounded-xl bg-white/60 px-4 py-3 text-left text-[13px] font-medium text-[#4c425c] hover:bg-white">
              <HelpCircle size={16} /> Help
            </button>
            <p className="mt-3 px-2 text-[10px] text-[#9d8fb3]">PURPLESYNC • Pages alag files me hai</p>
          </div>
        </>
      )}
    </>
  );
}
