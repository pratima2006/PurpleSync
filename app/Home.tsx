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

    // window ke peeche bada world, par dikhega sirf window ke andar
    const WORLD_W = W * 1.6;
    const WORLD_H = H * 1.6;
    const OFFSET_X = -W * 0.3;
    const OFFSET_Y = -H * 0.3;

    const shapes = [
      '42% 58% 62% 38% / 45% 38% 62% 55%',
      '60% 40% 30% 70% / 60% 30% 70% 40%',
      '55% 45% 45% 55% / 50% 60% 40% 50%',
      '38% 62% 55% 45% / 40% 50% 50% 60%',
      '50% 50% 50% 50% / 50% 50% 50% 50%',
      '65% 35% 55% 45% / 35% 65% 35% 65%',
      '30% 70% 70% 30% / 30% 30% 70% 70%',
      '45% 55% 65% 35% / 65% 35% 45% 55%',
    ];

    const gradients = [
      'radial-gradient(75% 75% at 30% 20%, #7c4dff 0%, #3d1f8f 45%, #120a2a 100%)',
      'radial-gradient(75% 75% at 35% 25%, #8a5cff 0%, #4a2ab8 50%, #17103a 100%)',
      'radial-gradient(75% 75% at 30% 30%, #5e2eff 0%, #2a1660 60%, #0f0b26 100%)',
      'radial-gradient(75% 75% at 40% 20%, #a68cff 0%, #5e35d6 45%, #1c1540 100%)',
      'radial-gradient(75% 75% at 30% 20%, #6d3bff 0%, #2f1a6b 70%, #0e0a24 100%)',
    ];

    type B = { x:number; y:number; vx:number; vy:number; r:number; gradIdx:number; squash:number; el:HTMLElement };
    const bubbles: B[] = [];
    const els = Array.from(wrap.children).slice(0,8) as HTMLElement[];

    els.forEach((el, i) => {
      const r = 48 + Math.random()*85;
      el.style.width = r*2 + 'px';
      el.style.height = r*2 + 'px';
      el.style.borderRadius = shapes[i % shapes.length];
      bubbles.push({
        x: Math.random()*WORLD_W + OFFSET_X,
        y: Math.random()*WORLD_H + OFFSET_Y,
        vx: (Math.random()-0.5)*0.22,
        vy: (Math.random()-0.5)*0.22,
        r,
        gradIdx: i % gradients.length,
        squash: 0,
        el,
      });
      el.style.background = gradients[i % gradients.length];
    });

    const loop = () => {
      for(let i=0;i<bubbles.length;i++){
        const b = bubbles[i];
        b.x += b.vx;
        b.y += b.vy;

        // window ke andar hi wrap hoga - bahar page pe nahi jayega
        if(b.x < OFFSET_X - b.r) b.x = OFFSET_X + WORLD_W + b.r;
        if(b.x > OFFSET_X + WORLD_W + b.r) b.x = OFFSET_X - b.r;
        if(b.y < OFFSET_Y - b.r) b.y = OFFSET_Y + WORLD_H + b.r;
        if(b.y > OFFSET_Y + WORLD_H + b.r) b.y = OFFSET_Y - b.r;

        for(let j=i+1;j<bubbles.length;j++){
          const b2 = bubbles[j];
          const dx = b.x - b2.x;
          const dy = b.y - b2.y;
          const d = Math.hypot(dx,dy);
          if(d < b.r + b2.r - 8 && d>1){
            const tx = dx/d, ty = dy/d;
            const overlap = (b.r + b2.r - d) * 0.5;
            b.x += tx*overlap; b.y += ty*overlap;
            b2.x -= tx*overlap; b2.y -= ty*overlap;
            const dot = (b.vx-b2.vx)*tx + (b.vy-b2.vy)*ty;
            b.vx -= dot*tx*0.5; b.vy -= dot*ty*0.5;
            b2.vx += dot*tx*0.5; b2.vy += dot*ty*0.5;
            b.squash = 1; b2.squash = 1;
            b.gradIdx = (b.gradIdx+1)%gradients.length;
            b2.gradIdx = (b2.gradIdx+1)%gradients.length;
            b.el.style.background = gradients[b.gradIdx];
            b2.el.style.background = gradients[b2.gradIdx];
          }
        }

        b.vx = Math.max(-0.28,Math.min(0.28,b.vx));
        b.vy = Math.max(-0.28,Math.min(0.28,b.vy));
        if(b.squash>0) b.squash -= 0.035;
        const sx = b.squash>0? 1 - b.squash*0.35 : 1;
        const sy = b.squash>0? 1 + b.squash*0.45 : 1;

        b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) scaleX(${sx}) scaleY(${sy})`;
      }
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      <div className="absolute will-change-transform shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),0_0_40px_rgba(124,77,255,0.3)]" />
      <div className="absolute will-change-transform shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_0_35px_rgba(100,60,255,0.25)]" />
      <div className="absolute will-change-transform shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),0_0_50px_rgba(90,40,200,0.35)]" />
      <div className="absolute will-change-transform shadow-[inset_0_1px_2px_rgba(255,255,255,0.28),0_0_30px_rgba(140,100,255,0.2)]" />
      <div className="absolute will-change-transform shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_0_40px_rgba(110,70,255,0.25)]" />
      <div className="absolute will-change-transform shadow-[inset_0_1px_2px_rgba(255,255,255,0.28),0_0_25px_rgba(180,160,255,0.18)]" />
      <div className="absolute will-change-transform blur-[0.3px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_0_45px_rgba(70,30,170,0.35)]" />
      <div className="absolute will-change-transform shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_0_22px_rgba(200,180,255,0.15)]" />
      {/* light jo slowly ghumti hai window ke andar */}
      <div className="absolute w-[16px] h-[16px] rounded-full bg-[#d8c6ff] blur-[7px] opacity-50" style={{left:'22%', top:'30%'}} />
      <div className="absolute w-[10px] h-[10px] rounded-full bg-[#8b6cff] blur-[8px] opacity-40" style={{right:'28%', bottom:'30%'}} />
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
        <div className="relative overflow-hidden rounded-[20px] bg-[#0f0b24] p-6 text-white md:p-8 min-h-[240px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a1d4e] via-[#150e2f] to-[#0a0820]" />
          <div className="absolute inset-0 overflow-hidden">
            <PurpleBubbles />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b24]/80 via-transparent to-[#0f0b24]/20 pointer-events-none" />
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

export default Home;
