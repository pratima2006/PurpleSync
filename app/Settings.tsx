import { useState } from 'react';
const settings = [
  { q: "Notifications", a: "Comeback, voting deadlines aur schedule updates ke liye notifications on/off kar sakte ho. Abhi in-app only." },
  { q: "Appearance", a: "App ka theme abhi light purple hi hai, dark mode jald ayega. Accent colour app ke brand ke hisaab se fixed hai." },
  { q: "Data & Privacy", a: "Hum koi personal data store nahi karte. Cache clear karna hai to browser cache clear karo, app apne aap reset ho jayega." },
  { q: "About PurpleSync", a: "Version 1.0 - Built for ARMY by ARMY. All sources verified. No ads." },
];
export function Settings() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="relative min-h-[80vh] overflow-hidden p-6 md:p-10">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f8f5ff] via-[#f0edff] to-[#eef2ff]">
        <div className="absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#c4b5fd]/40 blur-[80px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute top-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#a78bfa]/30 blur-[90px] animate-[float_10s_ease-in-out_infinite_reverse]" />
      </div>
      <h1 className="text-[22px] font-semibold text-[#2f2640]">Settings</h1>
      <div className="mx-auto mt-8 max-w-[640px] flex flex-col gap-4">
        {settings.map((s,i) => {
          const isOpen = open===i;
          return (
            <button key={i} onClick={()=>setOpen(isOpen?null:i)} className={`w-full text-left rounded-[12px] px-5 py-4 transition-all ${isOpen?'bg-white shadow-[0_10px_30px_rgba(96,67,143,0.12)]':'bg-[#e9e2ff]/70 backdrop-blur-md'}`}>
              <div className="flex items-center gap-3"><span className="text-[18px] text-[#644597]">{isOpen?'−':'+'}</span><span className="h-[6px] w-full max-w-[320px] rounded-full bg-gradient-to-r from-[#644597] to-[#c4b5fd]/50" /></div>
              <p className="mt-2 text-[14px] font-semibold text-[#3d2d5a]">{s.q}</p>
              {isOpen && <p className="mt-3 text-[13px] leading-6 text-[#6e6582]">{s.a}</p>}
            </button>
          )
        })}
      </div>
      <style>{`@keyframes float { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }`}</style>
    </div>
  );
}
