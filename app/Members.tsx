import { ArrowUpRight, Music2 } from 'lucide-react';
import { memberItems } from '../components/data';
import { SectionHeading } from '../components/SectionHeading';

const toneClasses: Record<string, string> = {
  lavender: 'bg-[#eee5f7] text-[#73539a]',
  peach: 'bg-[#f5e8dd] text-[#996d4d]',
  blue: 'bg-[#e4edf4] text-[#59728a]',
  gold: 'bg-[#f5ead1] text-[#96733a]',
  rose: 'bg-[#f3e3e9] text-[#a06177]',
  mint: 'bg-[#e2f0ea] text-[#5f8c76]',
  plum: 'bg-[#e4dff1] text-[#654d8e]',
};

export function Members() {
  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE LINEUP</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">
            Seven voices.
            <br />
            <em className="text-[#704ca5]">One signal.</em>
          </h1>
          <p className="mt-5 max-w-[470px] text-[13px] leading-6 text-[#81758d]">
            A simple reference page for the people at the center of the
            music, the performances, and the shared history.
          </p>
        </div>
        <div className="rounded-2xl border border-[#e0d4ed] bg-[#f1e9f9] p-4 md:max-w-[230px]">
          <Music2 size={18} className="text-[#8068a9]" />
          <p className="mt-3 text-[12px] leading-5 text-[#6d5a82]">
            Different tones, one body of work, and a room large enough for
            every chapter.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {memberItems.map((member, index) => (
          <article
            key={member.name}
            className={`ps-panel ps-panel-hover rounded-2xl p-5 ${
              index === memberItems.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-[18px] font-semibold ${toneClasses[member.tone]}`}
              >
                {member.name.slice(0, 1)}
              </div>
              <span className="ps-mono text-[9px] text-[#aa9eac]">
                0{index + 1}
              </span>
            </div>
            <h2 className="mt-8 text-[18px] font-semibold text-[#40334e]">
              {member.name}
            </h2>
            <p className="mt-1 ps-mono text-[9px] text-[#8068a9]">
              {member.role}
            </p>
            <p className="mt-5 min-h-10 text-[12px] leading-5 text-[#81758d]">
              {member.detail}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-[#eeeaf3] pt-3">
              <span className="text-[10px] text-[#9b8fa2]">Member note</span>
              <ArrowUpRight size={15} className="text-[#aa8be8]" />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12">
        <SectionHeading
          eyebrow="THE GROUP"
          title="Together, in motion"
          action={
            <span className="ps-mono text-[9px] text-[#aa9eac]">BTS · ARMY</span>
          }
        />
        <div className="relative overflow-hidden rounded-2xl bg-[#2f2450] p-6 text-white md:p-8">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-[#695887]" />
          <div className="absolute right-12 top-16 h-28 w-28 rounded-full border border-[#695887]" />
          <p className="relative max-w-[660px] ps-display text-[30px] leading-[1.05] md:text-[42px]">
            “The music gets bigger when everyone has somewhere to stand.”
          </p>
          <p className="relative mt-5 text-[11px] text-[#c0b5d2]">
            PurpleSync · a reference desk for staying close
          </p>
        </div>
      </div>
    </div>
  );
}