import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, Check, ListFilter, Trophy, ArrowLeft, ExternalLink, Info } from 'lucide-react';
import { achievementItems as defaultAchievementItems } from '../components/data';
import { SectionHeading } from '../components/SectionHeading';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

type View = 'main' | 'archive' | 'detail';

function RenderContent({ item }: { item: any }) {
  if (item.contentBlocks && Array.isArray(item.contentBlocks)) {
    return (
      <div className="space-y-4">
        {item.contentBlocks.map((block: any, i: number) => {
          if (block.type === 'image') {
            return (
              <div key={i} className="overflow-hidden rounded-xl border border-[#eeeaf3]">
                <img src={block.url} alt="Achievement" style={{ width: `${block.width || 100}%`, transform: `rotate(${block.rotate || 0}deg)` }} className="mx-auto" />
                {block.caption && <p className="bg-[#faf8fd] px-3 py-2 text-[10px] text-[#9a8ea2]">{block.caption}</p>}
              </div>
            )
          }
          if (block.type === 'link') {
            return <a key={i} href={block.url} target="_blank" rel="noopener noreferrer" className="block text-[12px] text-[#3b82f6] underline break-all">{block.url}</a>
          }
          return <p key={i} className="text-[13px] leading-6 text-[#40334e] whitespace-pre-wrap">{block.content}</p>
        })}
      </div>
    )
  }
  if (item.fullInfo) return <p className="text-[13px] leading-6 text-[#40334e] whitespace-pre-wrap">{item.fullInfo}</p>
  return <p className="text-[13px] leading-6 text-[#40334e]">{item.subtitle || item.title}</p>
}

const CopyrightNote = () => (
  <div className="mt-8 flex gap-3 rounded-xl bg-[#faf7ff] border border-[#ede6f8] p-4">
    <Info size={16} className="shrink-0 text-[#8b6fb0] mt-0.5" />
    <div>
      <p className="text-[10px] font-semibold tracking-wide text-[#6f5a8a]">SOURCE & DISCLAIMER</p>
      <p className="mt-1.5 text-[10px] leading-[1.6] text-[#8e819c]">
        Based on public info from BigHit Music, HYBE Labels and verified news. Rewritten for fan-archival under Fair Use. All images and trademarks belong to BigHit / HYBE. Fan-made archive by ARMY, not affiliated with BTS or HYBE.
      </p>
    </div>
  </div>
);

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
      if (fbItems.length > 0) setAllItems([...fbItems,...defaultAchievementItems]);
      else setAllItems(defaultAchievementItems);
    });
    return () => unsub();
  }, []);

  const no1Items = useMemo(()=> allItems.filter((i:any)=> {
    const t = `${i.title} ${i.subtitle||''} ${i.type||''}`.toLowerCase();
    return t.includes('no.1') || t.includes('no. 1') || t.includes('number 1') || t.includes('#1');
  }), [allItems]);

  const latest = useMemo(()=> allItems[0], [allItems]);
  const archiveList = archiveFilter==='no1'? no1Items : allItems;

  if(view==='detail' && selected){
    return (
      <div className="ps-page-enter bg-[#fbf8ff] min-h-screen">
        {/* TOP PURPLE HEADER - EXACT LIKE PIC 1 PROFILE HEADER, APP PURPLE #60438f */}
        <div className="sticky top-0 z-30">
          <div className="relative bg-[#60438f] px-5 pt-6 pb-10 md:px-8 md:pt-8 md:pb-12 overflow-hidden">
            <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full border border-[#8c72b2]/40" />
            <div className="absolute -left-16 -bottom-24 h-52 w-52 rounded-full border border-[#8c72b2]/20" />

            {/* Back button like Pic 1 header */}
            <button onClick={()=>setView('archive')} className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium text-[#e9dff6] hover:bg-white/20 backdrop-blur">
              <ArrowLeft size={14}/> Back to archive
            </button>

            <div className="relative z-10 mt-6">
              <p className="ps-mono text-[9px] tracking-[0.18em] text-[#d0beea]">{selected.type} • {selected.year}</p>
              <h1 className="ps-display mt-3 max-w-[720px] text-[30px] leading-[0.98] text-white md:text-[42px] tracking-[-.02em]">
                {selected.title}
              </h1>
              {selected.subtitle && <p className="mt-4 max-w-[620px] text-[13px] leading-6 text-[#d5c9e5]">{selected.subtitle}</p>}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-[11px] text-[#cbbad9]">{selected.date||'24 Sept 2026'}</span>
                {selected.link && <a href={selected.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#60438f]">Official <ExternalLink size={11}/></a>}
              </div>
            </div>
          </div>
          {/* LINE BELOW PURPLE - JO HEADER LINE SE TOUCH HOGI ON SCROLL */}
          <div className="h-[1px] w-full bg-[#e9dff6] shadow-[0_2px_8px_rgba(96,67,143,0.12)]" />
        </div>

        {/* BIG WHITE BOX - SAME AS PIC 2, AB PURPLE KE NICHE SE SCROLL HOGA */}
        <div className="px-4 md:px-6 -mt-6 relative z-20 pb-10">
          <div className="mx-auto max-w-3xl">
            <div className="ps-panel rounded-[20px] p-6 md:p-8 shadow-[0_8px_30px_rgba(96,67,143,0.08)] border border-[#ede6f8] bg-white">
              <p className="ps-mono text-[9px] tracking-[0.16em] text-[#907fa0]">VERIFIED RECORD - FULL STORY</p>

              {/* LINE INSIDE BIG BOX - LIKE PIC 1 HEADER LINE */}
              <div className="mt-3 h-[1px] w-full bg-[#f0e6f8]" />

              <div className="mt-6"><RenderContent item={selected} /></div>

              <div className="mt-8 flex items-center justify-between border-t border-[#f0e6f8] pt-4">
                <span className="text-[10px] text-[#9b8fa2]">Verified record</span>
                <Check size={16} className="text-[#7c5da5]" />
              </div>

              <CopyrightNote />
            </div>
          </div>
        </div>
      </div>
    )
  }

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
        <CopyrightNote />
      </div>
    )
  }

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div>
        <p className="ps-mono text-[9px] text-[#8068a9]">THE ARCHIVE</p>
        <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">A body of<br /><em className="text-[#704ca5]">work.</em></h1>
        <p className="mt-5 max-w-[440px] text-[13px] leading-6 text-[#81758d]">The milestones are not just numbers. They are proof of distance travelled, kept in one place.</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-[1.2fr_.8fr]">
        <div className="relative overflow-hidden rounded-2xl bg-[#60438f] p-7 text-white md:p-9">
          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-[#876bb0]" />
          <p className="relative ps-mono text-[9px] text-[#d0beea]">LATEST ENTRY · {allItems.length}</p>
          <h2 className="ps-display relative mt-8 max-w-[500px] text-[32px] leading-[1.02] md:text-[42px]">{latest?.title?.split('.').slice(0,2).join('.') || "Three decades.\nOne name at the centre."}</h2>
          <p className="relative mt-7 max-w-[410px] text-[12px] leading-5 text-[#d5c9e5]">{latest?.subtitle || "The first group to place three albums at No. 1 across three different decades."}</p>
          <div className="relative mt-9 flex items-end justify-between border-t border-[#8c72b2] pt-4"><span className="text-[11px] text-[#d5c9e5]">{latest?.date||"18 June 2025"}</span><Trophy size={20} className="text-[#d7c4ee]" /></div>
        </div>
        <div className="ps-panel rounded-2xl p-6">
          <p className="ps-mono text-[9px] text-[#907fa0]">THE NUMBERS</p>
          <div className="mt-7 space-y-6">
            {[[String(allItems.length), 'archived achievements'],[String(no1Items.length), 'territories with a No. 1'],[String(new Set(allItems.map((i:any)=>i.year)).size), 'years of shared history']].map(([number, label]) => (
              <div key={label} className="flex items-end justify-between border-b border-[#eeeaf3] pb-4"><span className="text-[31px] font-semibold tracking-[-.07em] text-[#4f3b63]">{number}</span><span className="max-w-[115px] text-right text-[11px] leading-4 text-[#968a9f]">{label}</span></div>
            ))}
          </div>
          <button onClick={()=>setView('archive')} type="button" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e1d9ec] py-2.5 text-[11px] font-semibold text-[#665575] hover:bg-[#f8f5fb]">Browse full archive <ArrowUpRight size={14} /></button>
        </div>
      </div>
      <div className="mt-10">
        <SectionHeading eyebrow="SELECTED RECORDS" title="Worth keeping" action={<button type="button" onClick={()=>setView('archive')} className="flex items-center gap-1 text-[11px] font-semibold text-[#704ca5]">Filter archive <ListFilter size={14} /></button>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allItems.slice(0,6).map((item: any) => (
            <article key={item.id || item.title} onClick={()=>{setSelected(item); setView('detail')}} className="ps-panel ps-panel-hover rounded-2xl p-5 cursor-pointer">
              <div className="flex items-center justify-between"><span className="ps-mono text-[9px] text-[#907fa0]">{item.type}</span><span className="font-mono text-[12px] text-[#aa8be8]">{item.year}</span></div>
              <h3 className="mt-8 text-[15px] font-semibold leading-5 text-[#40334e]">{item.title}</h3>
              <div className="mt-8 flex items-center justify-between border-t border-[#eeeaf3] pt-3"><span className="text-[10px] text-[#9b8fa2]">Verified record</span><Check size={15} className="text-[#7c5da5]" /></div>
            </article>
          ))}
        </div>
      </div>
      <CopyrightNote />
    </div>
  );
}
