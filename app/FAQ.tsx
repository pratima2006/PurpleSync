import { useState } from 'react';

const faqs = [
  { q: "PurpleSync actually kya hai?", a: "PurpleSync ek ARMY-managed desk hai. Yaha saare official schedules, voting links aur updates ek jagah verified source ke saath milte hai, bina kisi fake news ke." },
  { q: "Voting data verified kaise hota hai?", a: "Hum sirf official sources - HYBE, BigHit, MAMA, Billboard ke links use karte hai. Koi fan-made poll count nahi hota. Har link check karke hi add hota hai." },
  { q: "Kya mera data safe hai?", a: "Haan. Hum koi personal login, password ya tracking nahi karte. Firebase sirf public data ke liye use hota hai. No ads, no data selling." },
  { q: "Main content me kaise help kar sakta hu?", a: "Agar tumhe koi official schedule ya update mile jo desk pe nahi hai, to Links page pe jaake source ke saath submit kar sakte ho. Team verify karke add kar degi." },
  { q: "Notifications kaise kaam karte hai?", a: "Abhi notifications sirf in-app hai. Future me comeback ya voting deadline ke liye push notifications ka option Settings me ayega." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <div className="relative min-h-[80vh] overflow-hidden p-6 md:p-10">
      {/* LIVE BG - fika purple, animated */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f8f5ff] via-[#f0edff] to-[#eef2ff]">
        <div className="absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#c4b5fd]/40 blur-[80px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute top-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#a78bfa]/30 blur-[90px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-0 left-20 h-[300px] w-[300px] rounded-full bg-[#ddd6fe]/50 blur-[70px] animate-[float_12s_ease-in-out_infinite]" />
      </div>

      <h1 className="text-[22px] font-semibold text-[#2f2640]">FAQ</h1>
      <p className="mt-1 text-[13px] text-[#8a829c]">Common doubts, clear answers.</p>

      <div className="mx-auto mt-8 flex max-w-[640px] flex-col gap-4">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <button
              key={i}
              onClick={() => setOpen(isOpen? null : i)}
              className={`w-full text-left rounded-[12px] px-5 py-4 transition-all duration-300 ${isOpen? 'bg-white shadow-[0_10px_30px_rgba(96,67,143,0.12)]' : 'bg-[#e9e2ff]/70 backdrop-blur-md hover:bg-[#e1d8ff]/80'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-[18px] leading-none ${isOpen? 'text-[#644597]' : 'text-[#7c5cbf]'}`}>{isOpen? '−' : '+'}</span>
                <span className="h-[6px] w-full max-w-[320px] rounded-full bg-gradient-to-r from-[#644597] to-[#c4b5fd]/50" style={{ opacity: isOpen? 1 : 0.8 }} />
              </div>
              <div className="mt-2">
                <p className={`text-[14px] font-semibold ${isOpen? 'text-[#3d2d5a]' : 'text-[#4a3d67]'}`}>{item.q}</p>
                {isOpen && <p className="mt-3 text-[13px] leading-6 text-[#6e6582]">{item.a}</p>}
                {isOpen && <div className="mt-3 h-[6px] w-3/4 rounded-full bg-[#e9e2ff]" />}
                {isOpen && <div className="mt-2 h-[6px] w-1/2 rounded-full bg-[#e9e2ff]" />}
              </div>
            </button>
          );
        })}
      </div>

      <style>{`@keyframes float { 0%,100% { transform: translate(0,0) } 50% { transform: translate(20px, -20px) } }`}</style>
    </div>
  );
}
