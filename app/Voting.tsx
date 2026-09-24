import { useEffect, useState, useMemo } from 'react';
import {
  CircleCheck,
  Clock3,
  ExternalLink,
  Flag,
  ShieldCheck,
} from 'lucide-react';
import { votingItems as defaultVotingItems } from '../components/data';

type VotingItem = any;

function parseCloseDate(item: any): number | null {
  if (item.closeDate) {
    const t = new Date(item.closeDate).getTime();
    if (!isNaN(t)) return t;
  }
  return null;
}

// For voting cards - only 2 units like "3d 07h" / "2h 2m" / "45s"
function formatTwoUnits(item: any, tick: number) {
  const target = parseCloseDate(item);
  if (!target) return item.closes || 'Closes soon';
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

// For purple top box - 4 units like "25d 12h 23m 12s" but hide zero values
function formatFourUnits(item: any, tick: number) {
  const target = parseCloseDate(item);
  if (!target) return item.closes || '--';
  const diff = target - Date.now();
  if (diff <= 0) return 'Closed';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  let parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export function Voting() {
  const [filter, setFilter] = useState<'all' | 'open' | 'ended' | 'upcoming'>('all');
  const [ready, setReady] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [allItems, setAllItems] = useState<VotingItem[]>(() => {
    // Keep only upcoming one - "Opens 26 Jun" wala
    const keep = (defaultVotingItems as any[]).filter((i: any) => i.status === 'upcoming' || String(i.closes).toLowerCase().includes('opens'));
    return keep.length > 0? keep : (defaultVotingItems as any[]).slice(-1);
  });

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('ps_admin_votingItems') || '[]');
    if (admin.length > 0) {
      const keep = (defaultVotingItems as any[]).filter((i: any) => i.status === 'upcoming' || String(i.closes).toLowerCase().includes('opens'));
      setAllItems([...admin,...keep]);
    }
  }, []);

  const filtered = allItems.filter(
    (item) => filter === 'all' || item.status === filter,
  );

  // Closest to end for purple box
  const closest = useMemo(() => {
    const openItems = allItems.filter((i: any) => i.status === 'open' && parseCloseDate(i));
    if (openItems.length === 0) return allItems.find((i: any) => i.status === 'open') || allItems[0];
    openItems.sort((a: any, b: any) => (parseCloseDate(a) || 0) - (parseCloseDate(b) || 0));
    return openItems[0];
  }, [allItems, tick]);

  const handleOpen = (item: VotingItem, e: any) => {
    e.stopPropagation();
    if (item.status!== 'open' && item.status!== 'upcoming') return;
    const link = item.webLink || item.link;
    const playStore = item.playStoreLink;
    const type = item.voteType || 'website';
    if (!link) return;
    if (type === 'app') {
      window.open(link, '_blank');
      if (/Android/i.test(navigator.userAgent) && playStore) {
        setTimeout(() => { if (document.hasFocus()) window.location.href = playStore; }, 1200);
      }
    } else {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE VOTING DESK</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">
            Make the moment
            <br />
            <em className="text-[#704ca5]">count.</em>
          </h1>
          <p className="mt-5 max-w-[440px] text-[13px] leading-6 text-[#81758d]">
            A clear view of active windows, with the official destination always one click away.
          </p>
        </div>
        {/* PURPLE BOX - Closest to end */}
        <div className="rounded-2xl border border-[#e0d4ed] bg-[#f1e9f9] p-4 md:min-w-[260px]">
          <div className="flex items-center justify-between">
            <span className="ps-mono text-[9px] text-[#8068a9]">NEXT CLOSES IN</span>
            <Clock3 size={15} className="text-[#8068a9]" />
          </div>
          <p className="mt-3 font-mono text-[18px] font-medium tracking-[-.04em] text-[#4f3876]">
            {closest? formatFourUnits(closest, tick) : '--'}
          </p>
          <p className="mt-1 text-[10px] text-[#887b99] truncate">
            {closest? `${closest.title} · ${closest.platform}` : 'No active voting'}
          </p>
        </div>
      </div>

      <div className="mt-10 flex gap-2 overflow-x-auto ps-scroll-hide">
        {(['all', 'open', 'ended', 'upcoming'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full border px-4 py-2 text-[11px] font-medium capitalize ${
              filter === item
              ? 'border-[#60438f] bg-[#60438f] text-white'
                : 'border-[#ded6e9] bg-white text-[#766a84] hover:border-[#b9a5d7]'
            }`}
          >
            {item === 'all'? 'All windows' : item === 'open'? 'Open now' : item === 'ended'? 'Recently ended' : 'Upcoming'}
          </button>
        ))}
      </div>

      <div className="ps-stagger mt-5 grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => {
          const isExpanded = expanded === item.id;
          return (
            <article
              key={item.id}
              onClick={() => setExpanded(isExpanded? null : item.id)}
              className={`ps-panel ps-panel-hover rounded-2xl p-5 md:p-6 cursor-pointer ${isExpanded? 'ring-1 ring-[#d1c0ea] bg-[#fdfaff]' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.status === 'open'? 'bg-[#6aaf8f]' : item.status === 'ended'? 'bg-[#b3a9bc]' : 'bg-[#c3a968]'}`} />
                    <span className="ps-mono text-[9px] text-[#8e819c]">{item.platform}</span>
                  </div>
                  <h2 className="mt-3 text-[16px] font-semibold text-[#3d324b]">{item.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReady((cur) => cur.includes(item.id)? cur.filter((id) => id!== item.id) : [...cur, item.id]);
                  }}
                  className={`rounded-lg border p-2 ${ready.includes(item.id)? 'border-[#bca9d9] bg-[#f1eafb] text-[#704ca5]' : 'border-[#e1dbe9] text-[#988ca1] hover:text-[#704ca5]'}`}
                >
                  {ready.includes(item.id)? <CircleCheck size={16} /> : <Flag size={16} />}
                </button>
              </div>

              <div className="mt-7 flex items-end justify-between">
                <div>
                  <p className="ps-mono text-[9px] text-[#95899d]">STATUS</p>
                  <p className={`mt-1 text-[12px] font-medium ${item.status === 'open'? 'text-[#6b9c7e]' : 'text-[#8f8495]'}`}>
                    {formatTwoUnits(item, tick)}
                  </p>
                </div>
              </div>

              {/* Expand - same style as Daily votes available line */}
              {isExpanded && (
                <div className="mt-4">
                  <div className="h-px bg-[#ede4f7] mb-3" />
                  <p className="text-[11px] leading-[18px] text-[#958a9c]">{item.description || item.note || 'Vote once per day on the official platform.'}</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#958a9c] truncate max-w-[55%]">{isExpanded? 'Tap to collapse' : (item.note || item.description || 'Daily votes available')}</span>
                <button
                  type="button"
                  onClick={(e) => handleOpen(item, e)}
                  disabled={item.status === 'ended'}
                  className="flex items-center gap-1.5 rounded-lg bg-[#60438f] px-3 py-2 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#ddd7e4] disabled:text-[#918797] shrink-0"
                >
                  Open official page <ExternalLink size={13} />
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
