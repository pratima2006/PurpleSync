import { useEffect, useState } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { navItems } from './data';
import type { PageKey } from './types';

type SearchPanelProps = {
  onClose: () => void;
  onNavigate: (page: PageKey) => void;
};

export function SearchPanel({ onClose, onNavigate }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const results = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#2b2040]/30 px-4 pt-[14vh] backdrop-blur-sm"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-[#e0d7ec] bg-white shadow-[0_25px_80px_hsl(258_51%_25%/.18)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#eee9f2] px-5 py-4">
          <Search size={17} className="text-[#9b8da3]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the desk..."
            className="flex-1 bg-transparent text-[13px] text-[#453650] outline-none placeholder:text-[#aaa1af]"
            aria-label="Search PurpleSync pages"
          />
          <button type="button" onClick={onClose} aria-label="Close search">
            <X size={17} className="text-[#9b8da3]" />
          </button>
        </div>
        <div className="p-2">
          {results.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onNavigate(key);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12px] text-[#5b4d67] hover:bg-[#f5f1f9]"
            >
              <Icon size={16} className="text-[#8068a9]" />
              {label}
              <ChevronRight size={14} className="ml-auto text-[#b0a5b4]" />
            </button>
          ))}
          {results.length === 0 && (
            <p className="px-3 py-5 text-center text-[12px] text-[#958a9e]">
              No desk pages match that search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}