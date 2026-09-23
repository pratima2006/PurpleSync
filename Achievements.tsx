import { ArrowUpRight, Check, ListFilter, Trophy } from 'lucide-react';
import { achievementItems } from '../components/data';
import { SectionHeading } from '../components/SectionHeading';

export function Achievements() {
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
            LATEST ENTRY · 147
          </p>
          <h2 className="ps-display relative mt-8 max-w-[500px] text-[32px] leading-[1.02] md:text-[42px]">
            Three decades.
            <br />
            One name at the centre.
          </h2>
          <p className="relative mt-7 max-w-[410px] text-[12px] leading-5 text-[#d5c9e5]">
            The first group to place three albums at No. 1 across three
            different decades.
          </p>
          <div className="relative mt-9 flex items-end justify-between border-t border-[#8c72b2] pt-4">
            <span className="text-[11px] text-[#d5c9e5]">18 June 2025</span>
            <Trophy size={20} className="text-[#d7c4ee]" />
          </div>
        </div>

        <div className="ps-panel rounded-2xl p-6">
          <p className="ps-mono text-[9px] text-[#907fa0]">THE NUMBERS</p>
          <div className="mt-7 space-y-6">
            {[
              ['147', 'archived achievements'],
              ['21', 'territories with a No. 1'],
              ['09', 'years of shared history'],
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
              className="flex items-center gap-1 text-[11px] font-semibold text-[#704ca5]"
            >
              Filter archive <ListFilter size={14} />
            </button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievementItems.map((item) => (
            <article
              key={item.title}
              className="ps-panel ps-panel-hover rounded-2xl p-5"
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