import { Bell, Globe2, Menu, Search, Settings, FileQuestion, HelpCircle, X, Map, ChevronRight } from 'lucide-react';
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

const tourSteps = [
  { key: 'home', title: 'Briefing - Home', desc: 'Yaha daily updates, important notices aayenge. Tera main desk hai.' },
  { key: 'voting', title: 'Voting Hub', desc: 'Yaha comeback, MV goals pe vote hota hai. Sabse important section.' },
  { key: 'schedule', title: 'Schedule', desc: 'BTS ka pura calendar - releases, lives, birthdays.' },
  { key: 'links', title: 'Official Sources', desc: 'Fake news se bachne ke liye direct HYBE/BigHit links.' },
  { key: 'search', title: 'Search & Nav', desc: 'Upar search se kuch bhi dhundh, neeche pill nav se sab pages. Ho gaya tour!' },
];

export function Topbar({ page, onNavigate, onSearch, onMenu }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const title = navItems.find((item) => item.key === page)?.label?? page.charAt(0).toUpperCase() + page.slice(1);

  const toggleMenu = () => {
    const next =!menuOpen;
    setMenuOpen(next);
    if (next) onMenu();
  };

  const startTour = () => {
    setMenuOpen(false);
    setTourStep(0);
    setTourActive(true);
    onNavigate('home' as PageKey);
  };

  const nextTour = () => {
    const next = tourStep + 1;
    if (next >= tourSteps.length) {
      setTourActive(false);
      return;
    }
    setTourStep(next);
    const stepKey = tourSteps[next].key;
    if (stepKey === 'search') {
      onSearch();
    } else {
      onNavigate(stepKey as PageKey);
    }
  };

  return (
    <>
      <header className="flex h-[72px] items-center justify-between border-b border-[#e8e3f0] bg-white/70 px-5 md:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className={`grid place-items-center rounded-full bg-[#f1eafb] p-2 text-[#644597] transition-all duration-300 ${menuOpen? 'rotate-0 opacity-100 w-9 h-9' : '-rotate-90 opacity-0 w-0 h-0 p-0 pointer-events-none'}`}
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

        <div className="flex items-center gap-1 md:gap-2">
          <button type="button" onClick={onSearch} className="flex h-9 w-9 items-center justify-center rounded-full text-[#81788f] hover:bg-[#f0edf6]"><Search size={17} /></button>
          <button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#81788f] hover:bg-[#f0edf6]"><Bell size={17} /><span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#aa8be8]" /></button>
          <button type="button" onClick={() => onNavigate('links')} className="hidden sm:flex h-9 items-center gap-2 rounded-full border border-[#dfd9eb] bg-white px-3 text-[11px] font-medium"><Globe2 size={14} /> Official</button>
          <button type="button" onClick={toggleMenu} className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${menuOpen? 'bg-[#644597] text-white border-[#644597] rotate-90' : 'bg-[#f1eafb] text-[#644597] border-white/60'}`}><Menu size={18} /></button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-5 top-[88px] z-50 w-[310px] rounded-[22px] border border-white/40 bg-[#eef2ff]/85 p-3 shadow-[0_16px_40px_rgba(31,38,135,0.18)] backdrop-blur-2xl">
            <button onClick={startTour} className="flex w-full items-center gap-3 rounded-xl bg-[#644597] px-4 py-3 text-left text-[13px] font-medium text-white shadow-sm hover:bg-[#563a84] transition-colors">
              <Map size={16} /> Take a Tour <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">NEW</span>
            </button>
            <div className="my-3 h-px w-full bg-white/60" />
            <button onClick={() => { onNavigate('settings' as PageKey); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-[#f1eafb]"><Settings size={16} /> Settings</button>
            <button onClick={() => { onNavigate('faq' as PageKey); setMenuOpen(false); }} className="mt-2 flex w-full items-center gap-3 rounded-xl bg-white/60 px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-white"><FileQuestion size={16} /> FAQ</button>
            <button onClick={() => { onNavigate('help' as PageKey); setMenuOpen(false); }} className="mt-2 flex w-full items-center gap-3 rounded-xl bg-white/60 px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-white"><HelpCircle size={16} /> Help</button>
          </div>
        </>
      )}

      {/* TOUR OVERLAY - non-cringe, glass */}
      {tourActive && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-5 md:items-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[360px] rounded-[20px] border border-white/40 bg-[#fdfcff]/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest text-[#9d8fb3]">STEP {tourStep + 1} / {tourSteps.length}</span>
              <button onClick={() => setTourActive(false)} className="text-[#8a829c]"><X size={16} /></button>
            </div>
            <h3 className="mt-2 text-[16px] font-semibold text-[#2f2640]">{tourSteps[tourStep].title}</h3>
            <p className="mt-1 text-[13px] leading-5 text-[#6e6582]">{tourSteps[tourStep].desc}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setTourActive(false)} className="flex-1 rounded-full bg-[#f1eafb] py-2.5 text-[12px] font-medium text-[#644597]">Skip</button>
              <button onClick={nextTour} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#644597] py-2.5 text-[12px] font-medium text-white">{tourStep === tourSteps.length - 1? 'Done' : 'Next'} <ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
