import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  action?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  action,
}: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="ps-mono text-[9px] text-[#8068a9]">{eyebrow}</p>
        <h2 className="ps-display mt-1 text-[27px] leading-none text-[#332840]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}