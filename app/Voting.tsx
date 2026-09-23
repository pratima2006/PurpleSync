import { useEffect, useState } from 'react';
import {
  CircleCheck,
  Clock3,
  ExternalLink,
  Flag,
  ShieldCheck,
} from 'lucide-react';
import { votingItems } from '../components/data';

export function Voting() {
  const [filter, setFilter] = useState<'all' | 'open' | 'ended'>('all');
  const [ready, setReady] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(18 * 3600 + 42 * 60 + 9);
  const filtered = votingItems.filter(
    (item) => filter === 'all' || item.status === filter,
  );

  useEffect(() => {
    const timer = window.setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  const countdown = `${String(Math.floor(seconds / 3600)).padStart(2, '0')}h ${String(
    Math.floor((seconds % 3600) / 60),
  ).padStart(2, '0')}m ${String(seconds % 60).padStart(2, '0')}s`;

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
            A clear view of active windows, with the official destination
            always one click away.
          </p>
        </div>
        <div className="rounded-2xl border border-[#e0d4ed] bg-[#f1e9f9] p-4 md:min-w-[225px]">
          <div className="flex items-center justify-between">
            <span className="ps-mono text-[9px] text-[#8068a9]">
              NEXT CLOSES IN
            </span>
            <Clock3 size={15} className="text-[#8068a9]" />
          </div>
          <p className="mt-3 font-mono text-[20px] font-medium tracking-[-.04em] text-[#4f3876]">
            {countdown}
          </p>
          <p className="mt-1 text-[10px] text-[#887b99]">
            Global Fan Choice · Mnet Plus
          </p>
        </div>
      </div>

      <div className="mt-10 flex gap-2 overflow-x-auto ps-scroll-hide">
        {(['all', 'open', 'ended'] as const).map((item) => (
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
            {item === 'all'
              ? 'All windows'
              : item === 'open'
                ? 'Open now'
                : 'Recently ended'}
          </button>
        ))}
      </div>

      <div className="ps-stagger mt-5 grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="ps-panel ps-panel-hover rounded-2xl p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.status === 'open'
                        ? 'bg-[#6aaf8f]'
                        : item.status === 'ended'
                          ? 'bg-[#b3a9bc]'
                          : 'bg-[#c3a968]'
                    }`}
                  />
                  <span className="ps-mono text-[9px] text-[#8e819c]">
                    {item.platform}
                  </span>
                </div>
                <h2 className="mt-3 text-[16px] font-semibold text-[#3d324b]">
                  {item.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setReady((current) =>
                    current.includes(item.id)
                      ? current.filter((id) => id !== item.id)
                      : [...current, item.id],
                  )
                }
                className={`rounded-lg border p-2 ${
                  ready.includes(item.id)
                    ? 'border-[#bca9d9] bg-[#f1eafb] text-[#704ca5]'
                    : 'border-[#e1dbe9] text-[#988ca1] hover:text-[#704ca5]'
                }`}
                aria-label={
                  ready.includes(item.id)
                    ? 'Remove from desk'
                    : 'Mark for later'
                }
              >
                {ready.includes(item.id) ? (
                  <CircleCheck size={16} />
                ) : (
                  <Flag size={16} />
                )}
              </button>
            </div>
            <div className="mt-7 flex items-end justify-between">
              <div>
                <p className="ps-mono text-[9px] text-[#95899d]">STATUS</p>
                <p
                  className={`mt-1 text-[12px] font-medium ${
                    item.status === 'open'
                      ? 'text-[#6b9c7e]'
                      : 'text-[#8f8495]'
                  }`}
                >
                  {item.closes}
                </p>
              </div>
              <p className="font-mono text-[18px] text-[#4f3a70]">
                {item.progress}%
              </p>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-[#eeeaf3]">
              <div
                className={`h-full rounded-full ${
                  item.status === 'ended' ? 'bg-[#bdb4c7]' : 'bg-[#9b79c7]'
                }`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#958a9c]">{item.note}</span>
              <button
                type="button"
                disabled={item.status !== 'open'}
                className="flex items-center gap-1.5 rounded-lg bg-[#60438f] px-3 py-2 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#ddd7e4] disabled:text-[#918797]"
              >
                Open official page <ExternalLink size={13} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#e7e1ed] bg-white px-5 py-4">
        <ShieldCheck size={17} className="shrink-0 text-[#8068a9]" />
        <p className="text-[11px] leading-5 text-[#81768e]">
          PurpleSync does not process votes or ask for credentials. Use the
          official platform to participate.
        </p>
      </div>
    </div>
  );
}