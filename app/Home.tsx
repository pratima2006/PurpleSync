import {
  ArrowUpRight,
  ChevronRight,
  FileText,
  Info,
  CalendarDays,
  X,
} from 'lucide-react';
import * as dataModule from '../components/data';
import { MetricCard } from '../components/MetricCard';
import { SectionHeading } from '../components/SectionHeading';
import type { PageKey } from '../components/types';
import { useEffect, useState, useMemo, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

type HomeProps = {
  onNavigate: (page: PageKey) => void;
  dismissed: boolean;
  onDismiss: () => void;
};

function getTargetTime(item: any): number | null {
  if (item?.closeDate) {
    const t = new Date(item.closeDate).getTime();
    if (!isNaN(t)) return t;
  }
  return null;
}

function formatFourUnits(item: any) {
  const target = getTargetTime(item);
  if (!target) return item?.closes || '--';
  const diff = target - Date.now();
  if (diff <= 0) return 'Closed';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function PurpleBubbles() {
  const ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    type B = { x:number; y:number; vx:number; vy:number; r:number; el:HTMLElement };
    const bubbles: B[] = [];

    const els = Array.from(wrap.children) as HTMLElement[];
    els.forEach((el, i) => {
      bubbles.push({
        x: Math.random()*W,
        y: Math.random()*H,
        vx: (Math.random()-0.5)*0.18,
        vy: (Math.random()-0.5)*0.18,
        r: parseInt(el.style.width)/2 || 60,
        el,
      });
    });

    const loop = () => {
      for(let i=0;i<bubbles.length;i++){
        const b = bubbles[i];
        b.x += b.vx;
        b.y += b.vy;
        if(b.x - b.r < -20 || b.x + b.r > W+20) b.vx *= -1;
        if(b.y - b.r < -20 || b.y + b.r > H+20) b.vy *= -1;
        // touch bounce
        for(let j=i+1;j<bubbles.length;j++){
          const b2 = bubbles[j];
          const dx = b.x - b2.x;
          const dy = b.y - b2.y;
          const d = Math.hypot(dx,dy);
          if(d < b.r + b2.r - 10 && d>0){
            const tx = dx/d, ty = dy/d;
            b.vx += tx*0.015; b.vy += ty*0.015;
            b2.vx -= tx*0.015; b2.vy -= ty*0.015;
          }
        }
        b.vx = Math.max(-0.3,Math.min(0.3,b.vx));
        b.vy = Math.max(-0.3,Math.min(0.3,b.vy));
        b.el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`;
      }
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {/* pic jaise bubbles - purple to dark purple */}
      <div className="absolute rounded-[40%_60%_60%_40%/60%_30%_70%_40%] blur-[0.5px]" style={{width:220,height:180,background:'radial-gradient(60% 60% at 30% 20%, #7b5cff 0%, #5a36d8 40%, #2f2450 100%)',opacity:0.9}} />
      <div className="absolute rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-[0.5px]" style={{width:160,height:140,background:'radial-gradient(60% 60% at 30% 30%, #a78bfa 0%, #6d4bd8 50%, #3a2d6b 100%)',opacity:0.85}} />
      <div className="absolute rounded-[50%_50%_40%_60%/50%_60%_40%_50%]" style={{width:260,height:220,background:'radial-gradient(70% 70% at 40% 30%, #9d7bff 0%, #5e3ab5 55%, #2a2250 100%)',opacity:0.9}} />
      <div className="absolute rounded-full" style={{width:110,height:110,background:'radial-gradient(circle at 30% 30%, #b8a0ff 0%, #6e52c8 100%)',opacity:0.7}} />
      <div className="absolute rounded-[40%_60%_70%_30%/40%_40%_60%_60%]" style={{width:190,height:160,background:'radial-gradient(60% 60% at 30% 30%, #8b6cff 0%, #4a2e9e 70%)',opacity:0.8}} />
      <div className="absolute rounded-full" style={{width:90,height:90,background:'radial-gradient(circle at 30% 30%, #c4b5fd 0%, #7c5cbf 100%)',opacity:0.6}} />
      {/* dotted pattern jaise 2nd pic me hai */}
      <div className="absolute rounded-full opacity-30" style={{width:70,height:70,left:'20%',top:'35%',backgroundImage:'radial-gradient(#c4b5fd 1.5px, transparent 1.5px)',backgroundSize:'8px 8px'}} />
      <div className="absolute rounded-full opacity-20" style={{width:100,height:100,right:'5%',top:'5%',backgroundImage:'radial-gradient(#a78bfa 1.5px, transparent 1.5px)',backgroundSize:'10px 10px'}} />
    </div>
  );
}

export function Home({ onNavigate, dismissed, onDismiss }: HomeProps) {
  const updates: any[] = (dataModule as any).updates || [];
  const achievements: any[] = (dataModule as any).achievements || (dataModule as any).archive || [];
  const votingDesks: any[] = (dataModule as any).votingDesks || (dataModule as any).votings || (dataModule as any).voting || [];
  const scheduleItems: any[] = (dataModule as any).scheduleItems || (dataModule as any).schedules || (dataModule as any).events || [];

  const liveVotingCount = votingDesks.length > 0? votingDesks.length.toString().padStart(2, '0') : "02";
  const nextSchedule = scheduleItems[0];
  const thisMonthValue = updates.length > 0? updates.length.toString().padStart(2, '0') : "08";
  const archiveCount = achievements.length > 0? achievements.length.toString() : "147";
  const recentUpdates = updates.slice(0, 3);
  const calendarEvent = nextSchedule;
  const latestArchive = achievements[0];

  const [allVotingItems, setAllVotingItems] = useState<any[]>(votingDesks);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    const unsub = onSnapshot(collection(db, "votingItems"), (snap) => {
      const firestoreItems = snap.docs.map(d => ({ id: d.id,...d.data() } as any));
      const defaults = (dataModule as any).votingItems || votingDesks;
      if (firestoreItems.length > 0) {
        setAllVotingItems([...firestoreItems,...defaults]);
      } else {
        setAllVotingItems(defaults);
      }
    });
    return () => { clearInterval(t); unsub(); };
  }, []);

  const closestVoting = useMemo(() => {
    const openWithDate = allVotingItems.filter((i: any) => i.status === 'open' && getTargetTime(i));
    if (openWithDate.length > 0) {
      openWithDate.sort((a: any, b: any) => (getTargetTime(a) || 0) - (getTargetTime(b) || 0));
      return openWithDate[0];
    }
    return allVotingItems.find((i: any) => i.status === 'open') || allVotingItems[0];
  }, [allVotingItems, tick]);

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <section className="ps-hero-glow ps-paper-grid relative overflow-hidden rounded-[26px] border border-[#e0d8ed] bg-[#f5f0fb] px-6 py-8 md:px-10 md:py-11">
        <div className="relative max-w-[650px]">
          <div className="flex items-center gap-2 text-[#8068a9]">
            <span className="ps-dot" />
            <span className="ps-mono text-[9px]">THURSDAY · 19 JUNE 2025</span>
          </div>
          <h1 className="ps-display mt-6 max-w-[550px] text-[48px] leading-[.92] tracking-[-.035em] text-[#332840] md:text-[72px]">
            Keep the signal
            <br />
            <em className="text-[#704ca5]">close.</em>
          </h1>
          <p className="mt-6 max-w-[450px] text-[14px] leading-6 text-[#70657f]">
            The day’s essential BTS briefing, arranged with care. Voting
            windows, the next note, and the moments worth holding onto.
          </p>
          <button type="button" onClick={() => onNavigate('voting')} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#5e428f] px-4 py-3 text-[12px] font-semibold text-white shadow-[0_8px_18px_hsl(258_51%_42%/.18)] transition-transform hover:-translate-y-0.5">
            Open voting desk <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="absolute -right-5 -top-5 hidden h-56 w-56 rounded-full border border-[#cbb9e6] md:block" />
        <div className="absolute right-12 top-16 hidden h-36 w-36 rounded-full border border-[#d4c5e9] md:block" />
        <div className="absolute bottom-7 right-10 hidden max-w-[150px] text-right md:block">
          <p className="ps-mono text-[9px] text-[#8b73ae]">THE DESK NOTE</p>
          <p className="mt-2 text-[12px] leading-5 text-[#756886]">“The best kind of current is calm.”</p>
        </div>
      </section>

      <div className="ps-stagger mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="LIVE VOTING" value={closestVoting? formatFourUnits(closestVoting) : liveVotingCount} detail="windows need your attention" />
        <MetricCard label="NEXT UP" value={calendarEvent?.dayLabel || calendarEvent?.dateShort || "20 JUN"} detail={calendarEvent?.title? `${calendarEvent.title} · ${calendarEvent.time || '19:00 KST'}` : "press conference · 19:00 KST"} />
        <MetricCard label="THIS MONTH" value={thisMonthValue} detail="official updates logged" />
        <MetricCard label="ON RECORD" value={archiveCount} detail="achievements in the archive" />
      </div>

      {!dismissed && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#e2d7f1] bg-[#eee6f8] px-4 py-3.5 text-[#594879]">
          <Info size={16} className="mt-0.5 shrink-0 text-[#7958aa]" />
          <p className="flex-1 text-[12px] leading-5"><span className="font-semibold">A small desk note:</span> PurpleSync is a presentation of official sources — always follow through at the source before taking action.</p>
          <button type="button" onClick={onDismiss} className="rounded p-1 text-[#826fa1] hover:bg-[#e2d6ef]"><X size={15} /></button>
        </div>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.16fr_.84fr]">
        <section>
          <SectionHeading eyebrow="RECENTLY ON THE DESK" title="The short read" action={<button type="button" onClick={() => onNavigate('updates')} className="flex items-center gap-1 text-[11px] font-semibold text-[#704ca5]">All updates <ChevronRight size={14} /></button>} />
          <div className="ps-panel overflow-hidden rounded-2xl">
            {recentUpdates.map((item, index) => (
              <article key={item.id} className={`group flex gap-4 px-5 py-5 ${index!== 2? 'border-b border-[#eeeaf3]' : ''}`}>
                <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.accent === 'gold'? 'bg-[#f5ead1] text-[#96733a]' : item.accent === 'blue'? 'bg-[#e3ebf3] text-[#5c7791]' : 'bg-[#eee5f7] text-[#77599f]'}`}><FileText size={16} strokeWidth={1.6} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="ps-mono text-[8px] text-[#8d7da4]">{item.category}</span><span className="text-[10px] text-[#aaa2b2]">·</span><span className="text-[10px] text-[#aaa2b2]">{item.date}</span></div>
                  <h3 className="mt-1.5 text-[13px] font-semibold leading-5 text-[#3c324a] group-hover:text-[#704ca5]">{item.title}</h3>
                  <p className="mt-1.5 line-clamp-1 text-[11px] leading-5 text-[#887e91]">{item.summary}</p>
                </div>
                <ChevronRight size={16} className="mt-5 shrink-0 text-[#b7adbf] transition-transform group-hover:translate-x-1" />
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="NEXT ON THE CALENDAR" title="Keep close" action={<button type="button" onClick={() => onNavigate('schedule')} className="flex items-center gap-1 text-[11px] font-semibold text-[#704ca5]">Full schedule <ChevronRight size={14} /></button>} />
          <div className="ps-panel rounded-2xl p-5">
            <div className="flex items-center gap-4">
              {/* SQUARE FIX - ab perfect square */}
              <div className="flex h-14 w-14 shrink-0 aspect-square flex-col items-center justify-center rounded-[14px] bg-[#60438f] text-white">
                <span className="ps-mono text-[9px] text-[#d4c2ef] leading-none">{calendarEvent?.month || "JUN"}</span>
                <span className="text-[22px] font-semibold leading-none mt-1">{calendarEvent?.day || "20"}</span>
              </div>
              <div>
                <p className="ps-mono text-[9px] text-[#907aa9]">{calendarEvent?.fullDate || "FRIDAY · 19:00 KST"}</p>
                <h3 className="mt-1 text-[14px] font-semibold leading-5 text-[#3c324a]">{calendarEvent?.title || "Press conference"}</h3>
                <p className="mt-1 text-[11px] text-[#958a9c]">{calendarEvent?.subtitle || 'BTS WORLD TOUR “ARIRANG”'}</p>
              </div>
            </div>
            <div className="my-5 ps-rule" />
            <div className="flex items-center justify-between text-[11px]"><span className="text-[#887e91]">Time until start</span><span className="ps-mono text-[10px] text-[#704ca5]">01D : 04H : 18M</span></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eeeaf4]"><div className="h-full w-[58%] rounded-full bg-[#a586d3]" /></div>
            <button type="button" onClick={() => onNavigate('schedule')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e1d9ec] py-2.5 text-[11px] font-semibold text-[#665575] hover:bg-[#f8f5fb]">View calendar <CalendarDays size={14} /></button>
          </div>
        </section>
      </div>

      <section className="mt-12">
        <SectionHeading eyebrow="A QUIET MOMENT IN THE ARCHIVE" title="On record" action={<button type="button" onClick={() => onNavigate('achievements')} className="flex items-center gap-1 text-[11px] font-semibold text-[#704ca5]">Open archive <ChevronRight size={14} /></button>} />
        <div className="relative overflow-hidden rounded-[20px] bg-[#2f2450] p-6 text-white md:p-8 min-h-[220px]">
          {/* BG gradient - dark purple */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3d2e6e] via-[#2f2450] to-[#1e1740]" />
          <PurpleBubbles />
          {/* subtle top fade taki text clear rahe */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2f2450]/70 via-transparent to-transparent pointer-events-none" />

          <div className="relative max-w-[640px]">
            <p className="ps-mono text-[9px] text-[#bda9df]">{latestArchive? `${latestArchive.date} · ACHIEVEMENT ${latestArchive.id}` : "18 JUNE 2025 · ACHIEVEMENT 147"}</p>
            <p className="ps-display mt-5 text-[29px] leading-[1.05] md:text-[38px]">{latestArchive? `“${latestArchive.title}”` : "“The first group to place three albums at No. 1 across three different decades.”"}</p>
            <p className="mt-5 text-[11px] leading-5 text-[#c0b5d2]">A growing archive of the milestones that keep changing the shape of the room.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
