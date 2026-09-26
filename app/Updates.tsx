import { useState, useEffect, useMemo } from 'react';
import { BookOpen, ChevronDown, FileText, Radio, ArrowLeft, ExternalLink, Info, Music, Disc3, RadioTower, Users, Sparkles, Bell } from 'lucide-react';
import { updates as defaultUpdates } from '../components/data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const CopyrightNote = () => (
  <div className="mt-8 flex gap-3 rounded-xl bg-[#faf7ff] border border-[#ede6f8] p-4">
    <Info size={16} className="shrink-0 text-[#8b6fb0] mt-0.5" />
    <div>
      <p className="text-[10px] font-semibold tracking-wide text-[#6f5a8a]">SOURCE & DISCLAIMER</p>
      <p className="mt-1.5 text-[10px] leading-[1.6] text-[#8e819c]">
        This update is based on publicly available information from official sources including BigHit Music, HYBE Labels, and verified news reports. Content is rewritten for educational & fan-archival purposes under Fair Use. All images, trademarks, and official materials belong to their respective owners (BigHit Music / HYBE). This is a fan-made archive by ARMY, not affiliated with or endorsed by BTS or HYBE.
      </p>
    </div>
  </div>
);

function getCategoryConfig(category: string){
  const cat = (category||'').toUpperCase();
  if(cat==='RELEASE') return { bg:'bg-[#fef08a]', text:'text-[#854d0e]', icon: Disc3, solid:'#facc15' };
  if(cat==='BROADCAST') return { bg:'bg-[#bfdbfe]', text:'text-[#1e40af]', icon: RadioTower, solid:'#3b82f6' };
  if(cat==='COMMUNITY') return { bg:'bg-[#fecaca]', text:'text-[#991b1b]', icon: Users, solid:'#ef4444' };
  if(cat==='OTHER') return { bg:'bg-[#bbf7d0]', text:'text-[#14532d]', icon: Sparkles, solid:'#22c55e' };
  // NOTICE default - Purple
  return { bg:'bg-[#e9d5ff]', text:'text-[#6b21a8]', icon: Bell, solid:'#a855f7' };
}

export function Updates() {
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | number | null>(null);
  const [allUpdates, setAllUpdates] = useState<any[]>(defaultUpdates);
  const [view, setView] = useState<'list'|'detail'>('list');
  const [selected, setSelected] = useState<any>(null);
  const filters = ['All', 'Notice', 'Release', 'Broadcast', 'Community', 'Other'];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "updates"), (snap) => {
      const fb = snap.docs.map(d => ({ id: d.id,...d.data() } as any)).filter((x:any)=>!x.hidden);
      fb.sort((a:any,b:any)=> new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
      if (fb.length > 0) {
        const merged = [...fb,...defaultUpdates.filter((d:any)=>!fb.find((f:any)=>f.title===d.title))];
        setAllUpdates(merged);
      } else {
        setAllUpdates(defaultUpdates);
      }
    });
    return () => unsub();
  }, []);

  const sortedAll = useMemo(()=>{
    return [...allUpdates].sort((a:any,b:any)=> new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  }, [allUpdates]);

  const filtered = useMemo(()=>{
    return sortedAll.filter((item: any) => filter === 'All' || (item.category||'').toUpperCase() === filter.toUpperCase());
  }, [sortedAll, filter]);

  const nextUpdate = useMemo(()=>{
    if(!selected) return null;
    const idx = sortedAll.findIndex((u:any)=>u.id===selected.id);
    if(idx===-1) return sortedAll[0];
    return sortedAll[idx+1] || sortedAll[0];
  }, [selected, sortedAll]);

  const openDetail = (item:any)=>{
    setSelected(item);
    setView('detail');
    window.scrollTo(0,0);
  };

  if(view==='detail' && selected){
    const cfg = getCategoryConfig(selected.category);
    const Icon = cfg.icon;
    return (
      <div className="ps-page-enter ps-content py-8 md:py-12">
        <button onClick={()=>setView('list')} className="flex items-center gap-2 text-[11px] font-semibold text-[#704ca5] mb-6"><ArrowLeft size={14}/> Back to updates</button>

        {/* FULL BOX WITH TITLE, SUBTITLE, DATE INSIDE */}
        <div className="ps-panel rounded-2xl p-6 md:p-8 bg-white border border-[#eeeaf3] overflow-hidden">
          <div className="flex items-start gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.text}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 items-center">
                <span className="ps-mono text-[9px] text-[#8d7da4] uppercase">{selected.category}</span>
                <span className="text-[10px] text-[#aaa2b2]">·</span>
                <span className="text-[10px] text-[#aaa2b2]">{selected.date}</span>
              </div>
              <h1 className="mt-2 text-[22px] md:text-[28px] leading-[1.15] tracking-[-.02em] text-[#332840] font-semibold">{selected.title}</h1>
              {selected.summary && <p className="mt-3 text-[13px] leading-6 text-[#81758d]">{selected.summary}</p>}
            </div>
          </div>

          {/* FADE PURPLE LINE */}
          <div className="my-6 h-[1px] w-full bg-gradient-to-r from-[#a855f7]/40 via-[#a855f7]/10 to-transparent" />

          <div>
            <p className="ps-mono text-[9px] text-[#907fa0]">FULL STORY • VERIFIED UPDATE</p>
            <p className="mt-4 text-[13px] leading-7 text-[#40334e] whitespace-pre-wrap">{selected.fullInfo || selected.summary}</p>

            {(selected.links?.length>0 || selected.link) && (
              <div className="mt-8 space-y-3 border-t border-[#f3eef9] pt-5">
                <p className="ps-mono text-[9px] text-[#8e819c]">OFFICIAL LINKS</p>
                {(selected.links || [selected.link]).filter(Boolean).map((l:string, i:number)=>(
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-[11px] font-semibold text-[#6f5a8a] shrink-0">link :</span>
                    <a href={l} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#5e428f] underline break-all flex items-center gap-1">{l} <ExternalLink size={12}/></a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <CopyrightNote />
        </div>

        {nextUpdate && nextUpdate.id!==selected.id && (
          <div className="mt-6">
            <button onClick={()=>{setSelected(nextUpdate); window.scrollTo(0,0);}} className="text-left w-full rounded-2xl bg-white border border-[#e0d4ed] p-5 hover:bg-[#faf8ff] transition-colors">
              <p className="text-[10px] text-[#3c82f6] font-medium">More updates ↝</p>
              <p className="mt-1 text-[13px] font-medium text-[#3c82f6] line-clamp-1">{nextUpdate.title}</p>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE NEWSROOM</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">Stay<br /><em className="text-[#704ca5]">current.</em></h1>
        </div>
        <div className="flex max-w-[300px] items-center gap-2 text-[12px] leading-5 text-[#81758d]">
          <Radio size={17} className="shrink-0 text-[#8068a9]" />No algorithmic feed. Just the updates that deserve your attention.
        </div>
      </div>

      <div className="mt-10 flex gap-2 overflow-x-auto ps-scroll-hide">
        {filters.map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-medium ${filter === item? 'border-[#60438f] bg-[#60438f] text-white' : 'border-[#ded6e9] bg-white text-[#766a84]'}`}>{item}</button>
        ))}
      </div>

      <div className="ps-panel mt-5 overflow-hidden rounded-2xl bg-white">
        {filtered.map((item: any, index: number) => {
          const cfg = getCategoryConfig(item.category);
          const Icon = cfg.icon;
          return (
            <article key={item.id || item.title} className={`${index!== filtered.length - 1? 'border-b border-[#eeeaf3]' : ''}`}>
              <button type="button" onClick={() => setExpanded(expanded === item.id? null : item.id)} className="flex w-full items-start gap-4 px-5 py-5 text-left md:px-7" aria-expanded={expanded === item.id}>
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.text} shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]`}>
                  <Icon size={16} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2"><span className="ps-mono text-[8px] text-[#8d7da4] uppercase">{item.category}</span><span className="text-[10px] text-[#aaa2b2]">·</span><span className="text-[10px] text-[#aaa2b2]">{item.date}</span></div>
                  <h2 className="mt-2 text-[14px] font-semibold leading-5 text-[#3d324b]">{item.title}</h2>
                  {expanded === item.id && (
                    <div className="mt-2">
                      <p className="max-w-[700px] text-[12px] leading-5 text-[#887e91]">{item.summary}</p>
                      <button onClick={(e)=>{e.stopPropagation(); openDetail(item);}} className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5e428f] hover:underline">View more ↝</button>
                    </div>
                  )}
                </div>
                <ChevronDown size={16} className={`mt-2 shrink-0 text-[#aa9faf] transition-transform ${expanded === item.id? 'rotate-180' : ''}`} />
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[#f0eaf7] px-5 py-4 text-[#64527d]">
        <BookOpen size={17} className="shrink-0" />
        <p className="text-[11px] leading-5">Updates are written as a briefing, not a feed. For the complete context, open the original notice from an official source.</p>
      </div>
    </div>
  );
}
