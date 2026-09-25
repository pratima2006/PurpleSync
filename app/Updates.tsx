import { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, FileText, Radio } from 'lucide-react';
import { updates as defaultUpdates } from '../components/data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function Updates() {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState<number | null>(1);
  const [allUpdates, setAllUpdates] = useState(defaultUpdates);
  const filters = ['All', 'Notice', 'Release', 'Broadcast', 'Community'];

  // FIREBASE LIVE
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "updates"), (snap) => {
      const fb = snap.docs.map(d => ({
        id: d.id,
       ...d.data()
      } as any));
      if (fb.length > 0) {
        setAllUpdates([...fb,...defaultUpdates]);
      } else {
        setAllUpdates(defaultUpdates);
      }
    });
    return () => unsub();
  }, []);

  const filtered = allUpdates.filter(
    (item: any) => filter === 'All' || item.category === filter.toUpperCase(),
  );

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE NEWSROOM</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">
            Stay
            <br />
            <em className="text-[#704ca5]">current.</em>
          </h1>
        </div>
        <div className="flex max-w-[300px] items-center gap-2 text-[12px] leading-5 text-[#81758d]">
          <Radio size={17} className="shrink-0 text-[#8068a9]" />
          No algorithmic feed. Just the updates that deserve your attention.
        </div>
      </div>

      <div className="mt-10 flex gap-2 overflow-x-auto ps-scroll-hide">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-medium ${
              filter === item
              ? 'border-[#60438f] bg-[#60438f] text-white'
                : 'border-[#ded6e9] bg-white text-[#766a84]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="ps-panel mt-5 overflow-hidden rounded-2xl">
        {filtered.map((item: any, index: number) => (
          <article
            key={item.id || item.title}
            className={`${index!== filtered.length - 1? 'border-b border-[#eeeaf3]' : ''}`}
          >
            <button
              type="button"
              onClick={() =>
                setExpanded(expanded === item.id? null : item.id)
              }
              className="flex w-full items-start gap-4 px-5 py-5 text-left md:px-7"
              aria-expanded={expanded === item.id}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  item.accent === 'gold'
                  ? 'bg-[#f5ead1] text-[#96733a]'
                    : item.accent === 'blue'
                    ? 'bg-[#e3ebf3] text-[#5c7791]'
                      : item.accent === 'rose'
                      ? 'bg-[#f3e3e9] text-[#a06177]'
                        : 'bg-[#eee5f7] text-[#77599f]'
                }`}
              >
                <FileText size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className="ps-mono text-[8px] text-[#8d7da4]">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-[#aaa2b2]">·</span>
                  <span className="text-[10px] text-[#aaa2b2]">
                    {item.date}
                  </span>
                </div>
                <h2 className="mt-2 text-[14px] font-semibold leading-5 text-[#3d324b]">
                  {item.title}
                </h2>
                {expanded === item.id && (
                  <p className="mt-2 max-w-[700px] text-[12px] leading-5 text-[#887e91]">
                    {item.summary}
                  </p>
                )}
              </div>
              <ChevronDown
                size={16}
                className={`mt-2 shrink-0 text-[#aa9faf] transition-transform ${
                  expanded === item.id? 'rotate-180' : ''
                }`}
              />
            </button>
          </article>
        ))}
      </div>

      <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[#f0eaf7] px-5 py-4 text-[#64527d]">
        <BookOpen size={17} className="shrink-0" />
        <p className="text-[11px] leading-5">
          Updates are written as a briefing, not a feed. For the complete
          context, open the original notice from an official source.
        </p>
      </div>
    </div>
  );
}
