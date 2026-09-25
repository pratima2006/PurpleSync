import { useState, useEffect } from 'react';
import { CalendarDays, ChevronRight, ListFilter } from 'lucide-react';
import { scheduleItems as defaultScheduleItems } from '../components/data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function Schedule() {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [allItems, setAllItems] = useState(defaultScheduleItems);

  // FIREBASE LIVE - ADMIN SE JO ADD KAREGI WO YAHAN LIVE
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "scheduleItems"), (snap) => {
      const fb = snap.docs.map(d => ({
        id: d.id,
       ...d.data()
      } as any));
      if (fb.length > 0) {
        setAllItems([...fb,...defaultScheduleItems]);
      } else {
        setAllItems(defaultScheduleItems);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE RUN OF SHOW</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">
            What’s
            <br />
            <em className="text-[#704ca5]">ahead.</em>
          </h1>
        </div>
        <div className="flex rounded-xl border border-[#ded7e9] bg-white p-1">
          <button
            type="button"
            onClick={() => setView('week')}
            className={`rounded-lg px-4 py-2 text-[11px] font-medium ${
              view === 'week'? 'bg-[#60438f] text-white' : 'text-[#887b92]'
            }`}
          >
            This week
          </button>
          <button
            type="button"
            onClick={() => setView('month')}
            className={`rounded-lg px-4 py-2 text-[11px] font-medium ${
              view === 'month'? 'bg-[#60438f] text-white' : 'text-[#887b92]'
            }`}
          >
            June 2025
          </button>
        </div>
      </div>

      {view === 'month'? (
        <div className="ps-panel mt-10 rounded-2xl p-5 md:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#3d324b]">
              June 2025
            </h2>
            <div className="flex gap-1">
              <button
                type="button"
                className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e]"
                aria-label="Previous month"
              >
                <ChevronRight size={15} className="rotate-180" />
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e]"
                aria-label="Next month"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[#998ea2]">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="py-2 ps-mono">
                {day}
              </div>
            ))}
            {Array.from({ length: 30 }, (_, index) => (
              <div
                key={index}
                className={`min-h-16 rounded-lg p-2 text-left text-[11px] ${
                  [20, 21, 22, 27].includes(index + 1)
                   ? 'bg-[#f0e9f7] font-semibold text-[#634493]'
                    : 'text-[#84798e]'
                }`}
              >
                {index + 1}
                {[20, 21, 22, 27].includes(index + 1) && (
                  <div className="mt-2 h-1.5 w-1.5 rounded-full bg-[#8d6bb7]" />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[12px] text-[#887b92]">19 — 25 June 2025 • {allItems.length} events</p>
            <button
              type="button"
              className="flex items-center gap-2 text-[11px] font-semibold text-[#704ca5]"
            >
              <ListFilter size={14} /> Filter
            </button>
          </div>
          <div className="ps-panel overflow-hidden rounded-2xl">
            {allItems.slice(0, 10).map((item: any, index: number) => (
              <article
                key={item.id || item.day + item.title}
                className={`flex gap-4 px-5 py-5 md:gap-7 md:px-7 ${
                  index!== allItems.slice(0, 10).length - 1? 'border-b border-[#eeeaf3]' : ''
                }`}
              >
                <div className="flex w-12 shrink-0 flex-col items-center">
                  <span className="ps-mono text-[9px] text-[#9a8ea2]">
                    {item.month}
                  </span>
                  <span className="mt-1 text-[27px] font-semibold leading-7 tracking-[-.06em] text-[#4b3b5e]">
                    {item.day}
                  </span>
                  <span className="mt-1 text-[9px] text-[#9a8ea2]">
                    {item.weekday}
                  </span>
                </div>
                <div className="min-w-0 flex-1 border-l border-[#e5dfea] pl-4 md:pl-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f0e9f7] px-2 py-1 text-[9px] font-semibold text-[#76579b]">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-[#9b90a1]">
                      {item.time}
                    </span>
                  </div>
                  <h2 className="mt-2 text-[14px] font-semibold leading-5 text-[#3d324b]">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-[11px] text-[#968a9e]">
                    {item.location}
                  </p>
                </div>
                <button
                  type="button"
                  className="self-center rounded-lg p-2 text-[#aaa0b0] hover:bg-[#f5f2f8] hover:text-[#704ca5]"
                  aria-label={`Add ${item.title} to calendar`}
                >
                  <CalendarDays size={16} />
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
