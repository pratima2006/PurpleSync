import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, Check, ListFilter, Trophy, ArrowLeft, ExternalLink } from 'lucide-react';
import { achievementItems as defaultAchievementItems } from '../components/data';
import { SectionHeading } from '../components/SectionHeading';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

type View = 'main' | 'archive' | 'detail';

export function Achievements() {
  const [allItems, setAllItems] = useState(defaultAchievementItems);
  const [view, setView] = useState<View>('main');
  const [archiveFilter, setArchiveFilter] = useState<'total'|'no1'>('total');
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "achievementItems"), (snap) => {
      const fbItems = snap.docs.map(d => {
        const data = d.data() as any;
        if(data.hidden) return null;
        return { id: d.id,...data };
      }).filter(Boolean) as any[];
      if (fbItems.length > 0) {
        setAllItems([...fbItems,...defaultAchievementItems]);
      } else {
        setAllItems(defaultAchievementItems);
      }
    });
    return () => unsub();
  }, []);

  const no1Items = useMemo(()=> allItems.filter((i:any)=> {
    const t = `${i.title} ${i.subtitle||''} ${i.type||''}`.toLowerCase();
    return t.includes('no.1') || t.includes('no. 1') || t.includes('number 1') || t.includes('#1');
  }), [allItems]);

  const latest = useMemo(()=> allItems[0], [allItems]);

  const archiveList = archiveFilter==='no1'? no1Items : allItems;

  // DETAIL VIEW
  if(view==='detail' && selected){
    return (
      <div className="ps-page-enter ps-content py-8 md:py-12">
        <button onClick={()=>setView('archive')} className="flex items-center gap-2 text-[11px] font-semibold text-[#704ca5] mb-6"><ArrowLeft size={14}/> Back to archive</button>
        <p className="ps-mono text-[9px] text-[#8068a9]">{selected.type} • {selected.year}</p>
        <h1 className="ps-display mt-3 text-[36px] leading-[1.02] tracking-[-.03em] text-[#332840] max-w-[700px]">{selected.title}</h1>
        {selected.subtitle && <p className="mt-4 max-w-[600px] text-[14px] leading-6 text-[#81758d]">{selected.subtitle}</p>}
        <div className="mt-6 flex items-center gap-3">
          <span className="text-[11px] text-[#9b8fa2]">{selected.date||'18 June 2025'}</span>
          {selected.link && <a href={selected.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f0fb] px-3 py-1 text-[11px] font-medium text-[#5e428f] hover:bg-[#ede7f7]">Official source <ExternalLink size={12}/></a>}
        </div>
        <div className="ps-panel mt-8 rounded-2xl p-6 md:p-8">
          <p className="ps-mono text-[9px] text-[#907fa0]">VERIFIED RECORD</p>
          <p className="mt-4 text-[13px] leading-6 text-[#40334e]">{selected.subtitle||selected.title} - This achievement is archived as part of BTS history. The milestones are proof of distance travelled, kept in one place.</p>
          <div className="mt-6 flex items-center justify-between border-t border-[#eeeaf3] pt-4"><span className="text-[10px] text-[#9b8fa2]">Verified record</span><Check size={15} className="text-[#7c5da5]" /></div>
        </div>
      </div>
    )
  }

  // ARCHIVE VIEW
  if(view==='archive'){
    return (
      <div className="ps-page-enter ps-content py-8 md:py-12">
        <button onClick={()=>setView('main')} className="flex items-center gap-2 text-[11px] font-semibold text-[#704ca5] mb-6"><ArrowLeft size={14}/> Back to archive home</button>
        <div className="flex items-center justify-between">
          <h1 className="ps-display text-[32px] text-[#332840]">Full archive.</h1>
          <div className="flex gap-2">
            <button onClick={()=>setArchiveFilter('total')} className={`rounded-full px-4 py-2 text-[11px] font-medium border ${archiveFilter==='total'?'bg-[#60438f] text-white border-[#60438f]':'bg-white text-[#766a84] border-[#ded6e9]'}`}>Total · {allItems.length}</button>
            <button onClick={()=>setArchiveFilter('no1')} className={`rounded-full px-4 py-2 text-[11px] font-medium border ${archiveFilter==='no1'?'bg-[#60438f] text-white border-[#60438f]':'bg-white text-[#766a84] border-[#ded6e9]'}`}>No.1 · {no1Items.length}</button>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archiveList.map((item:any)=>(
            <article key={item.id||item.title} onClick={()=>{setSelected(item); setView('detail')}} className="ps-panel ps-panel-hover rounded-2xl p-5 cursor-pointer">
              <div className="flex items-center justify-between"><span className="ps-mono text-[9px] text-[#907fa0]">{item.type}</span><span className="font-mono text-[12px] text-[#aa8be8]">{item.year}</span></div>
              <h3 className="mt-8 text-[15px] font-semibold leading-5 text-[#40334e]">{item.title}</h3>
              {item.subtitle && <p className="mt-2 text-[11px] text-[#9b8fa2] line-clamp-2">{item.subtitle}</p>}
              <div className="mt-8 flex items-center justify-between border-t border-[#eeeaf3] pt-3"><span className="text-[10px] text-[#9b8fa2]">Tap to read</span><ArrowUpRight size={14} className="text-[#7c5da5]"/></div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  // MAIN VIEW - TERI ORIGINAL UI SAME TO SAME
  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div>
        <p className="ps-mono text-[9px] text-[#8068a9]">THE ARCHIVE</p>
        <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">
          A body of
          <br />
          <em className="text-[#704ca5]">work.</em>
        </h1>
        <p className="mt-5 max-w-[440px] text-[13px] leading-6 text-[#81758d]">
          The milestones are not just numbers. They are proof of distance
          travelled, kept in one place.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-[1.2fr_.8fr]">
        <div className="relative overflow-hidden rounded-2xl bg-[#60438f] p-7 text-white md:p-9">
          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-[#876bb0]" />
          <p className="relative ps-mono text-[9px] text-[#d0beea]">
            LATEST ENTRY · {allItems.length}
          </p>
          <h2 className="ps-display relative mt-8 max-w-[500px] text-[32px] leading-[1.02] md:text-[42px]">
            {latest?.title?.split('.').slice(0,2).join('.') || "Three decades.\nOne name at the centre."}
          </h2>
          <p className="relative mt-7 max-w-[410px] text-[12px] leading-5 text-[#d5c9e5]">
            {latest?.subtitle || "The first group to place three albums at No. 1 across three different decades."}
          </p>
          <div className="relative mt-9 flex items-end justify-between border-t border-[#8c72b2] pt-4">
            <span className="text-[11px] text-[#d5c9e5]">{latest?.date||"18 June 2025"}</span>
            <Trophy size={20} className="text-[#d7c4ee]" />
          </div>
        </div>

        <div className="ps-panel rounded-2xl p-6">
          <p className="ps-mono text-[9px] text-[#907fa0]">THE NUMBERS</p>
          <div className="mt-7 space-y-6">
            {[
              [String(allItems.length), 'archived achievements'],
              [String(no1Items.length), 'territories with a No. 1'],
              [String(new Set(allItems.map((i:any)=>i.year)).size), 'years of shared history'],
            ].map(([number, label]) => (
              <div
                key={label}
                className="flex items-end justify-between border-b border-[#eeeaf3] pb-4"
              >
                <span className="text-[31px] font-semibold tracking-[-.07em] text-[#4f3b63]">
                  {number}
                </span>
                <span className="max-w-[115px] text-right text-[11px] leading-4 text-[#968a9f]">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={()=>setView('archive')}
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e1d9ec] py-2.5 text-[11px] font-semibold text-[#665575] hover:bg-[#f8f5fb]"
          >
            Browse full archive <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading
          eyebrow="SELECTED RECORDS"
          title="Worth keeping"
          action={
            <button
              type="button"
              onClick={()=>setView('archive')}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#704ca5]"
            >
              Filter archive <ListFilter size={14} />
            </button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allItems.slice(0,6).map((item: any) => (
            <article
              key={item.id || item.title}
              onClick={()=>{setSelected(item); setView('detail')}}
              className="ps-panel ps-panel-hover rounded-2xl p-5 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="ps-mono text-[9px] text-[#907fa0]">
                  {item.type}
                </span>
                <span className="font-mono text-[12px] text-[#aa8be8]">
                  {item.year}
                </span>
              </div>
              <h3 className="mt-8 text-[15px] font-semibold leading-5 text-[#40334e]">
                {item.title}
              </h3>
              <div className="mt-8 flex items-center justify-between border-t border-[#eeeaf3] pt-3">
                <span className="text-[10px] text-[#9b8fa2]">
                  Verified record
                </span>
                <Check size={15} className="text-[#7c5da5]" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
