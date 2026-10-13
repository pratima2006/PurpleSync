import { useEffect, useState, useMemo } from 'react';
import {
  CircleCheck,
  Clock3,
  ExternalLink,
  Flag,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

type VotingItem = any;

function getTargetTime(item: any): number | null {
  if (item.endAt) {
    const t = new Date(item.endAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (item.closeDate) {
    const t = new Date(item.closeDate).getTime();
    if (!isNaN(t)) return t;
  }
  if (item.votingDate) {
    const t = new Date(item.votingDate).getTime();
    if (!isNaN(t)) return t;
  }
  return null;
}

function isEndingSoon(item: any): boolean {
  const target = getTargetTime(item);
  if (!target) return false;
  const diff = target - Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  return diff > 0 && diff <= threeDays;
}

function formatTwoUnits(item: any) {
  const target = getTargetTime(item);
  if (!target) return item.closes || 'TBD';
  const diff = target - Date.now();
  if (diff <= 0) return 'Closed';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  if (d > 0) return `Closes in ${d}d ${String(h).padStart(2,'0')}h`;
  if (h > 0) return `Closes in ${h}h ${String(m).padStart(2,'0')}m`;
  if (m > 0) return `Closes in ${m}m ${String(s).padStart(2,'0')}s`;
  return `Closes in ${s}s`;
}

function formatFourUnits(item: any) {
  const target = getTargetTime(item);
  if (!target) return item.closes || '--';
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

export function Voting() {
  const [filter, setFilter] = useState<'all' | 'open' | 'ended' | 'upcoming' | 'endingSoon'>('all');
  const [ready, setReady] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<any>(null);
  const [seconds, setSeconds] = useState(18 * 3600 + 42 * 60 + 9);
  const [allItems, setAllItems] = useState<VotingItem[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    const unsub = onSnapshot(collection(db, "votingItems"), (snap) => {
      const firestoreItems = snap.docs.map(d => ({ id: d.id,...d.data() } as any))
        // DELETE DEMO BOXES PERMANENTLY
       .filter((it:any)=>{
          const title = (it.title || '').toLowerCase();
          return!title.includes('global fan choice') &&!title.includes('artist of the summer');
        });
      setAllItems(firestoreItems);
    });
    return () => {
      clearInterval(t);
      unsub();
    };
  }, []);

  const sortedItems = useMemo(() => {
    return [...allItems].sort((a: any, b: any) => {
      const ta = getTargetTime(a);
      const tb = getTargetTime(b);
      if (ta && tb) return ta - tb;
      if (ta &&!tb) return -1;
      if (!ta && tb) return 1;
      return 0;
    });
  }, [allItems, tick]);

  const endingSoonItems = useMemo(() => sortedItems.filter(isEndingSoon), [sortedItems, tick]);

  const filtered = sortedItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'endingSoon') return isEndingSoon(item);
    const s = (item.status || '').toLowerCase();
    if(filter==='open') return s==='open' || s==='active' || s==='live';
    return s===filter;
  });

  const closest = useMemo(() => {
    const openWithDate = allItems.filter((i: any) => {
      const s = (i.status||'').toLowerCase();
      return (s === 'open' || s==='active' || s==='live') && getTargetTime(i);
    });
    if (openWithDate.length > 0) {
      openWithDate.sort((a: any, b: any) => (getTargetTime(a) || 0) - (getTargetTime(b) || 0));
      return openWithDate[0];
    }
    return allItems.find((i: any) => {
      const s=(i.status||'').toLowerCase();
      return s==='open' || s==='active' || s==='live';
    }) || allItems[0];
  }, [allItems, tick]);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    if (closest && getTargetTime(closest)) return formatFourUnits(closest);
    return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}h ${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}m ${String(seconds % 60).padStart(2, '0')}s`;
  }, [closest, seconds, tick]);

  const handleOpen = (item: VotingItem, e: any) => {
    e.stopPropagation();
    const isLive = ['open','active','live'].includes((item.status||'').toLowerCase());
    if (!isLive) return;
    const link = item.webLink || item.link;
    const playStore = item.playStoreLink;
    const appStore = item.appStoreLink;
    const type = item.voteType || 'website';
    if (!link) {
      alert('Is voting ka link Admin ne nahi dala');
      return;
    }
    if (type === 'app') {
      window.open(link, '_blank');
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isAndroid && playStore) {
        setTimeout(() => { if (document.hasFocus()) window.location.href = playStore; }, 1200);
      } else if (isIOS && appStore) {
        setTimeout(() => { window.location.href = appStore; }, 1200);
      } else if (playStore) {
        setTimeout(() => { window.location.href = playStore; }, 1500);
      }
    } else {
      window.open(link, '_blank');
    }
  };

  const getCardStyle = (item:any, isExpanded:boolean, endingSoon:boolean)=>{
    const status = (item.status||'').toLowerCase();
    let base = 'ps-panel ps-panel-hover rounded-2xl p-5 md:p-6 cursor-pointer ';
    if(isExpanded) base += 'ring-1 ring-[#d1c0ea] ';
    if(endingSoon) return base + 'border-red-200 bg-[#fff5f5]';
    if(status==='ended' || status==='closed') return base + 'bg-[#f6f5f7] border-[#e8e4ec] opacity-[0.92]'; // halka gray
    if(status==='upcoming') return base + 'bg-[#fefce8] border-[#f5e7a0]'; // fika yellow
    if(status==='open' || status==='active' || status==='live') return base + 'bg-[#f0f9ff] border-[#bae6fd]'; // halka sky blue
    return base + 'bg-white';
  }

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE VOTING DESK</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">Make the moment<br /><em className="text-[#704ca5]">count.</em></h1>
          <p className="mt-5 max-w-[440px] text-[13px] leading-6 text-[#81758d]">A clear view of active windows, with the official destination always one click away.</p>
        </div>
        <div className="rounded-2xl border border-[#e0d4ed] bg-[#f1e9f9] p-4 md:min-w-[225px]">
          <div className="flex items-center justify-between">
            <span className="ps-mono text-[9px] text-[#8068a9]">NEXT CLOSES IN</span>
            <Clock3 size={15} className="text-[#8068a9]" />
          </div>
          <p className="mt-3 font-mono text-[20px] font-medium tracking-[-.04em] text-[#4f3876]">{countdown}</p>
          <p className="mt-1 text-[10px] text-[#887b99] truncate">{closest? `${closest.title} · ${closest.platform}` : 'No active voting'}</p>
        </div>
      </div>

      {endingSoonItems.length > 0 && (
        <button onClick={()=>setFilter(filter==='endingSoon'?'all':'endingSoon')} className={`mt-6 w-full flex items-center justify-between rounded-2xl border p-4 text-left transition ${filter==='endingSoon'?'bg-[#fef2f2] border-red-200':'bg-[#fff7ed] border-orange-200 hover:border-orange-300'}`}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center text-red-600"><AlertTriangle size={18}/></div>
            <div>
              <p className="text-[13px] font-semibold text-[#7c2d12]">{endingSoonItems.length} votings ending soon!</p>
              <p className="text-[11px] text-[#9a6a4a]">Click to see all votings that will end within 3 days</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#9a6a4a]">{filter==='endingSoon'?'Show All':'View →'}</span>
        </button>
      )}

      <div className="mt-10 flex gap-3 overflow-x-auto ps-scroll-hide whitespace-nowrap pb-2 -mx-1 px-1">
        {(['all', 'open', 'ended', 'upcoming', 'endingSoon'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`shrink-0 rounded-full border px-6 py-2.5 text-[13px] font-medium capitalize transition-colors ${
              filter === item? 'border-[#60438f] bg-[#60438f] text-white' : 'border-[#ded6e9] bg-white text-[#766a84] hover:border-[#b9a5d7]'
            }`}
          >
            {item === 'all'? 'All Windows' : item === 'open'? 'Open Now' : item === 'ended'? 'Recently Ended' : item === 'endingSoon'? `Ending Soon (${endingSoonItems.length})` : 'Upcoming'}
          </button>
        ))}
      </div>

      <div className="ps-stagger mt-5 grid gap-4 lg:grid-cols-2">
        {filtered.length===0 && <p className="text-[12px] text-gray-400 py-10 col-span-2 text-center">No votings found. Add from Admin Panel.</p>}
        {filtered.map((item) => {
          const isExpanded = expanded === item.id;
          const endingSoon = isEndingSoon(item);
          const isLive = ['open','active','live'].includes((item.status||'').toLowerCase());
          return (
            <article key={item.id} onClick={() => setExpanded(isExpanded? null : item.id)} className={getCardStyle(item,isExpanded,endingSoon)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isLive? 'bg-[#38bdf8]' : (item.status==='ended' || item.status==='closed')? 'bg-[#b3a9bc]' : 'bg-[#eab308]'}`} />
                    <span className="ps-mono text-[9px] text-[#8e819c]">{item.platform}</span>
                    {endingSoon && <span className="ps-mono text-[8px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ENDING SOON</span>}
                  </div>
                  <h2 className={`mt-3 font-semibold text-[#3d324b] ${isExpanded? 'text-[13px] opacity-80' : 'text-[16px]'}`}>{item.title}</h2>
                  {item.votingDate && <p className="text-[10px] text-gray-400 mt-1">📅 {item.votingDate}</p>}
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setReady((current) => current.includes(item.id)? current.filter((id) => id!== item.id) : [...current, item.id]); }} className={`rounded-lg border p-2 ${ready.includes(item.id)? 'border-[#bca9d9] bg-[#f1eafb] text-[#704ca5]' : 'border-[#e1dbe9] text-[#988ca1] hover:text-[#704ca5]'}`}>
                  {ready.includes(item.id)? <CircleCheck size={16} /> : <Flag size={16} />}
                </button>
              </div>
              <div className="mt-7">
                <p className="ps-mono text-[9px] text-[#95899d]">STATUS</p>
                <p className={`mt-1 text-[13px] font-medium ${endingSoon? 'text-red-600' : isLive? 'text-[#0ea5e9]' : 'text-[#8f8495]'}`}>{formatTwoUnits(item)}</p>
              </div>
              {isExpanded && (
                <div className="mt-4 rounded-[16px] bg-[#f6f0fd] border border-[#e9dff6] p-4">
                  <p className="ps-mono text-[10px] tracking-[0.12em] text-[#9a8aac]">DESCRIPTION</p>
                  <p className="mt-3 text-[13px] leading-6 text-[#4e415f]">{item.description || item.note || 'Daily votes available.'}</p>
                  {(item.startAt || item.endAt) && (
                    <div className="mt-3 text-[11px] text-[#7a6e8a] space-y-1 border-t border-[#e9dff6] pt-3">
                      <p>Start: {item.startAt? new Date(item.startAt).toLocaleString() : 'Not Confirmed'}</p>
                      <p>End: {item.endAt? new Date(item.endAt).toLocaleString() : 'Not Confirmed'}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#958a9c] truncate">{isExpanded? 'Tap to collapse' : item.note || item.description?.slice(0,40) || 'Tap to see details'}</span>
                <button type="button" onClick={(e) => handleOpen(item, e)} disabled={!isLive} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-semibold transition ${isLive? 'bg-[#60438f] text-white hover:bg-[#4f3876]' : 'bg-[#ddd7e4] text-[#918797] cursor-not-allowed'}`}>
                  {isLive? 'Vote Now' : item.status==='upcoming'? 'Upcoming' : 'Closed'} <ExternalLink size={14} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#e7e1ed] bg-white px-5 py-4">
        <ShieldCheck size={17} className="shrink-0 text-[#8068a9]" />
        <p className="text-[11px] leading-5 text-[#81768e]">PurpleSync does not process votes or ask for credentials. Use the official platform to participate.</p>
      </div>
    </div>
  );
}
