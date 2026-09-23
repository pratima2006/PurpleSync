type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#aa8be8] text-[#2b1f4c]">
        <div className="h-4 w-4 rotate-45 border-[1.5px] border-[#2b1f4c]" />
        <div className="absolute h-2 w-2 rounded-full bg-[#2b1f4c]" />
      </div>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.03em]">
          PurpleSync
        </span>
      )}
    </div>
  );
}