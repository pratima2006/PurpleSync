import { useEffect } from 'react';
import { MoreHorizontal, ShieldCheck, X } from 'lucide-react';
import { navItems } from './data';
import { BrandMark } from './BrandMark';
import type { PageKey } from './types';

type SidebarProps = {
  page: PageKey;
  mobileOpen: boolean;
  onNavigate: (page: PageKey) => void;
  onClose: () => void;
};

export function Sidebar({
  page,
  mobileOpen,
  onNavigate,
  onClose,
}: SidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen, onClose]);

  const handleNavigate = (nextPage: PageKey) => {
    onNavigate(nextPage);
    onClose();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-20 bg-[#241936]/45 transition-opacity duration-200 md:hidden ${
          mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        aria-label="PurpleSync navigation"
        className={`ps-sidebar fixed inset-y-0 left-0 z-30 flex w-[258px] flex-col px-5 py-7 transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-3">
          <BrandMark />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#b9add0] hover:bg-[#3b2f56] md:hidden"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-14 px-3">
          <p className="ps-mono text-[9px] text-[#aa9fc8]">Your daily desk</p>
          <p className="mt-2 text-[13px] leading-5 text-[#d1cbe3]">
            A quieter way to stay close
            <br />
            to what matters.
          </p>
        </div>

        <nav className="mt-10 flex-1 space-y-1" aria-label="Main navigation">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleNavigate(key)}
              aria-current={page === key ? 'page' : undefined}
              className={`ps-nav-item flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium ${
                page === key ? 'active' : 'text-[#a59cbc]'
              }`}
            >
              <Icon size={17} strokeWidth={1.7} />
              <span>{label}</span>
              {key === 'voting' && (
                <span className="ml-auto rounded-full bg-[#aa8be8] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[#2b1f4c]">
                  2
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-[#4c4068] bg-[#312651] p-4">
          <div className="flex items-center gap-2 text-[#dcd5ed]">
            <ShieldCheck size={15} />
            <span className="text-[11px] font-medium">Source-first by design</span>
          </div>
          <p className="mt-2 text-[11px] leading-4 text-[#a59cbc]">
            We point you to official sources. No noise, no guesswork.
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-[#3c3157] pt-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7561a0] text-[11px] font-semibold text-white">
            A
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#eeeaf5]">My desk</p>
            <p className="text-[10px] text-[#988ead]">Local view · private</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-md p-1 text-[#988ead] hover:bg-[#3b2f56]"
            aria-label="More account options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}