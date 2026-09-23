import { Activity } from 'lucide-react';

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'plain' | 'purple';
};

export function MetricCard({
  label,
  value,
  detail,
  tone = 'plain',
}: MetricCardProps) {
  const purple = tone === 'purple';

  return (
    <div
      className={`ps-panel ps-panel-hover rounded-2xl p-5 ${
        purple ? 'border-[#68499b] bg-[#5e428f] text-white' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <p
          className={`ps-mono text-[9px] ${
            purple ? 'text-[#d9c9f1]' : 'text-[#958aa4]'
          }`}
        >
          {label}
        </p>
        <Activity
          size={15}
          className={purple ? 'text-[#ceb9ed]' : 'text-[#aa8be8]'}
        />
      </div>
      <p className="mt-5 text-[29px] font-semibold tracking-[-0.06em]">
        {value}
      </p>
      <p
        className={`mt-1 text-[11px] ${
          purple ? 'text-[#d9c9f1]' : 'text-[#958aa4]'
        }`}
      >
        {detail}
      </p>
    </div>
  );
}