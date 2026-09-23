import { useState } from 'react';
import { Check, ExternalLink, Globe2, ShieldCheck } from 'lucide-react';
import { linkGroups } from '../components/data';

export function Links() {
  const [opened, setOpened] = useState<string | null>(null);

  const openLink = (name: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpened(name);
    window.setTimeout(() => setOpened(null), 1600);
  };

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div>
        <p className="ps-mono text-[9px] text-[#8068a9]">THE SOURCE LIST</p>
        <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">
          Go to the
          <br />
          <em className="text-[#704ca5]">source.</em>
        </h1>
        <p className="mt-5 max-w-[450px] text-[13px] leading-6 text-[#81758d]">
          The official places, collected without detours. When something
          matters, this is where to begin.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        {linkGroups.map((group) => (
          <section key={group.label}>
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-[#40334e]">
                  {group.label}
                </h2>
                <p className="mt-1 text-[11px] text-[#958a9c]">
                  {group.description}
                </p>
              </div>
              <span className="ps-mono text-[9px] text-[#aa9eac]">
                {group.links.length} destinations
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {group.links.map((link) => (
                <button
                  type="button"
                  key={link.name}
                  onClick={() => openLink(link.name, link.url)}
                  className="ps-panel ps-panel-hover group flex items-center gap-4 rounded-2xl p-4 text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0e9f7] text-[#7759a0]">
                    <Globe2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-semibold text-[#43364f]">
                      {link.name}
                    </h3>
                    <p className="mt-1 truncate text-[10px] text-[#9a8ea0]">
                      {link.detail}
                    </p>
                  </div>
                  {opened === link.name ? (
                    <Check size={15} className="text-[#6e9d7d]" />
                  ) : (
                    <ExternalLink
                      size={15}
                      className="text-[#b0a4b4] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-[#e0d6ec] bg-[#f3ecfa] p-5 md:p-6">
        <div className="flex gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#7759a0]" />
          <div>
            <h2 className="text-[13px] font-semibold text-[#514064]">
              A note on trust
            </h2>
            <p className="mt-2 max-w-[650px] text-[11px] leading-5 text-[#7c6c8e]">
              PurpleSync only links to known official destinations in this
              presentation. Never share a password, payment information, or
              verification code through an unofficial page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}