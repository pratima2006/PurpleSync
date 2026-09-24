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
  { key: 'search', title: 'Search & Nav', desc: 'Upar search se kuch bhi dhundh, neeche pill nav se sab pages.' },
];

export function Topbar({ page, onNavigate, onSearch, onMenu }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const title = navItems.find((item) => item.key === page)?.label?? page;

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
    if (next >= tourSteps.length) { setTourActive(false); return; }
    setTourStep(next);
    const k = tourSteps[next].key;
    if (k === 'search') onSearch(); else onNavigate(k as PageKey);
  };

  return (
    <>
      <header className="flex h-[64px] items-center justify-between rounded-full border border-white/40 bg-[#eef2ff]/70 px-3 md:px-4 shadow-[0_8px_32px_rgba(31,38,135,0.12),inset_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-150 mt-3 mx-3 md:mx-4">
        {/* LEFT - logo thoda left khiska, name hata diya */}
        <div className="flex items-center gap-2">
          <BrandMark compact />
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#948ca0] ml-1">
            <span>ARMY /</span>
            <span className="font-medium text-[#4c425c]">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button type="button" onClick={onSearch} className="flex h-9 w-9 items-center justify-center rounded-full text-[#81788f] hover:bg-white/60"><Search size={17} /></button>
          <button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#81788f] hover:bg-white/60"><Bell size={17} /><span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#aa8be8]" /></button>
          <button type="button" onClick={() => onNavigate('links')} className="hidden sm:flex h-9 items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 text-[11px] font-medium text-[#4c425c] whitespace-nowrap"><Globe2 size={14} /> Official</button>

          {/* SAME JAGAH TRANSFORM - Menu -> X */}
          <button type="button" onClick={toggleMenu} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white text-[#644597] transition-all duration-300">
            <span className={`transition-all duration-300 ${menuOpen? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
              {menuOpen? <X size={18} /> : <Menu size={18} />}
            </span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="absolute right-4 top-[78px] z-50 w-[310px] rounded-[22px] border border-white/40 bg-[#fdfcff]/80 p-3 shadow-[0_16px_40px_rgba(31,38,135,0.18)] backdrop-blur-2xl backdrop-saturate-150 animate-in fade-in slide-in-from-top-2 duration-300">
          <button onClick={startTour} className="flex w-full items-center gap-3 rounded-xl bg-[#644597] px-4 py-3 text-left text-[13px] font-medium text-white hover:bg-[#563a84]">
            <Map size={16} /> Take a Tour <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">NEW</span>
          </button>
          <div className="my-3 h-px w-full bg-[#e8e0f2]" />
          <button onClick={() => { onNavigate('settings' as PageKey); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-[#f1eafb]"><Settings size={16} /> Settings</button>
          <button onClick={() => { onNavigate('faq' as PageKey); setMenuOpen(false); }} className="mt-2 flex w-full items-center gap-3 rounded-xl bg-white/60 px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-white"><FileQuestion size={16} /> FAQ</button>
          <button onClick={() => { onNavigate('help' as PageKey); setMenuOpen(false); }} className="mt-2 flex w-full items-center gap-3 rounded-xl bg-white/60 px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-white"><HelpCircle size={16} /> Help</button>
          <p className="mt-3 px-2 text-[9px] text-[#9d8fb3]">X pe click karke band karo</p>
        </div>
      )}

      {tourActive && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-5 md:items-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[360px] rounded-[20px] border border-white/40 bg-[#fdfcff]/90 p-5 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center justify-between"><span className="text-[10px] tracking-widest text-[#9d8fb3]">STEP {tourStep+1}/{tourSteps.length}</span><button onClick={()=>setTourActive(false)}><X size={16}/></button></div>
            <h3 className="mt-2 text-[16px] font-semibold text-[#2f2640]">{tourSteps[tourStep].title}</h3>
            <p className="mt-1 text-[13px] text-[#6e6582]">{tourSteps[tourStep].desc}</p>
            <div className="mt-4 flex gap-2"><button onClick={()=>setTourActive(false)} className="flex-1 rounded-full bg-[#f1eafb] py-2.5 text-[12px]">Skip</button><button onClick={nextTour} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#644597] py-2.5 text-[12px] text-white">{tourStep===tourSteps.length-1?'Done':'Next'} <ChevronRight size={14}/></button></div>
          </div>
        </div>
      )}
    </>
  );
}
