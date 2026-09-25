import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Cake, Disc3, HeartCrack, Dog, Cat, Users, PartyPopper, Sparkles, PlayCircle, Trophy, Shield, X, ExternalLink, CalendarDays, ListFilter } from 'lucide-react';

type EventType = 'birthday' | 'album' | 'pet' | 'army' | 'festa' | 'anniversary' | 'mv' | 'black' | 'award' | 'enlist';

type ArchiveEvent = {
  date: string; // MM-DD
  type: EventType;
  title: string;
  info: string;
  sourceUrl?: string;
  sourceName?: string;
  year?: string;
};

const defaultEvents: ArchiveEvent[] = [
  { date: "02-18", type: "birthday", title: "J-Hope Birthday", info: "Jung Hoseok born 1994, the sunshine of BTS.", sourceUrl: "https://bts.ibighit.com", sourceName: "BigHit" },
  { date: "03-09", type: "birthday", title: "SUGA Birthday", info: "Min Yoongi, producer and rapper born 1993." },
  { date: "09-01", type: "birthday", title: "Jungkook Birthday", info: "Jeon Jungkook born 1997 - Golden Maknae.", year: "1997" },
  { date: "09-12", type: "birthday", title: "RM Birthday", info: "Kim Namjoon born 1994.", year: "1994" },
  { date: "10-13", type: "birthday", title: "Jimin Birthday", info: "Park Jimin born 1995." },
  { date: "12-04", type: "birthday", title: "Jin Birthday", info: "Kim Seokjin born 1992." },
  { date: "12-30", type: "birthday", title: "V Birthday", info: "Kim Taehyung born 1995." },
  { date: "06-13", type: "anniversary", title: "BTS Anniversary", info: "BTS debuted on 13 June 2013. 12+ years of legacy.", sourceUrl: "https://en.wikipedia.org/wiki/BTS", sourceName: "Wikipedia" },
  { date: "07-09", type: "army", title: "ARMY Day", info: "ARMY named on 9 July 2013." },
  { date: "06-01", type: "festa", title: "FESTA Begins", info: "Annual BTS FESTA celebration starts.", year: "Every June" },
  { date: "06-12", type: "album", title: "2 Cool 4 Skool Anniversary", info: "Debut album released 12 June 2013." },
  { date: "05-18", type: "mv", title: "Fake Love MV Anniv", info: "Fake Love MV milestone.", sourceUrl: "https://www.youtube.com/c/BANGTANTV", sourceName: "BANGTANTV" },
  { date: "12-12", type: "pet", title: "Yeontan's Day", info: "V's beloved Yeontan's birth anniversary.", year: "2017" },
  { date: "12-02", type: "black", title: "Yeontan - Black Day", info: "We remember Yeontan, forever in ARMY hearts." },
];

const typeConfig: Record<EventType, { color: string; bg: string; bgSoft: string; icon: any; label: string; emoji: string }> = {
  birthday: { color: "#ec4899", bg: "bg-[#fde2e8]", bgSoft: "bg-[#fff1f5]", icon: Cake, label: "Birthday", emoji: "🎂" },
  album: { color: "#d97706", bg: "bg-[#f5ead1]", bgSoft: "bg-[#fff8ec]", icon: Disc3, label: "Album", emoji: "💿" },
  pet: { color: "#fb923c", bg: "bg-[#ffead6]", bgSoft: "bg-[#fff4e8]", icon: Cat, label: "Pet", emoji: "🐾" },
  army: { color: "#5e428f", bg: "bg-[#ede7f7]", bgSoft: "bg-[#f5f0ff]", icon: Users, label: "ARMY", emoji: "💜" },
  festa: { color: "#8b5cf6", bg: "bg-[#ede7f7]", bgSoft: "bg-[#f5f0ff]", icon: PartyPopper, label: "FESTA", emoji: "🎉" },
  anniversary: { color: "#7c3aed", bg: "bg-[#e8ddf3]", bgSoft: "bg-[#f3eeff]", icon: Sparkles, label: "Anniversary", emoji: "✨" },
  mv: { color: "#ef4444", bg: "bg-[#ffe2e2]", bgSoft: "bg-[#fff1f1]", icon: PlayCircle, label: "MV Anniv", emoji: "▶️" },
  black: { color: "#27272a", bg: "bg-[#e4e4e7]", bgSoft: "bg-[#f4f4f5]", icon: HeartCrack, label: "Black Day", emoji: "🖤" },
  award: { color: "#a16207", bg: "bg-[#f5ead1]", bgSoft: "bg-[#fff8ec]", icon: Trophy, label: "Award", emoji: "🏆" },
  enlist: { color: "#65a30d", bg: "bg-[#ecfccb]", bgSoft: "bg-[#f5ffe8]", icon: Shield, label: "Enlist", emoji: "🛡️" },
};

const filters = [
  { key: "all", label: "All", types: [] as EventType[] },
  { key: "birthday", label: "Birthdays", types: ["birthday"] as EventType[] },
  { key: "album", label: "Albums", types: ["album","mv"] as EventType[] },
  { key: "army", label: "ARMY & FESTA", types: ["army","festa","anniversary"] as EventType[] },
  { key: "pet", label: "Pets", types: ["pet"] as EventType[] },
  { key: "black", label: "Black Days", types: ["black"] as EventType[] },
];

function getWeekDates(base: Date) {
  const day = base.getDay();
  const start = new Date(base);
  start.setDate(base.getDate() - day);
  return Array.from({length:7}, (_,i)=>{const d=new Date(start); d.setDate(start.getDate()+i); return d;});
}

export function PaletteOfMemories() {
  const today = new Date();
  const [view, setView] = useState<'week' | 'month'>('week');
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number>(today.getDate());
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState<ArchiveEvent[]>(defaultEvents);

  useEffect(()=>{
    const saved = JSON.parse(localStorage.getItem('ps_admin_paletteEvents')||'[]');
    if(saved.length>0) setEvents([...defaultEvents,...saved]);
  },[]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const weekDates = useMemo(()=> getWeekDates(today), []);

  const getEventsForDay = (day: number, month: number) => {
    const mmdd = `${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    let ev = events.filter(e => e.date === mmdd);
    if(filter!== "all" && view==='month'){
      const f = filters.find(f=>f.key===filter);
      if(f) ev = ev.filter(e=> f.types.includes(e.type));
    }
    return ev;
  };

  const selectedEvents = useMemo(() => selectedDate? getEventsForDay(selectedDate, currentMonth) : [], [selectedDate, filter, currentMonth, events]);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">A CANVAS OF YOUTH</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">Palette of<br /><em className="text-[#704ca5]">Memories.</em></h1>
          <p className="mt-3 text-[12px] text-[#887b92] max-w-[340px] leading-5">Youth ke saare rangon se bani hui yaadon ka canvas.</p>
        </div>
        <div className="flex rounded-xl border border-[#ded7e9] bg-white p-1">
          <button type="button" onClick={() => setView('week')} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${view === 'week'? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>This week</button>
          <button type="button" onClick={() => setView('month')} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${view === 'month'? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>{monthNames[currentMonth]} {currentYear}</button>
        </div>
      </div>

      {view==='week'? (
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[12px] text-[#887b92]">{weekStart.toLocaleDateString('en-US',{day:'numeric', month:'short'})} — {weekEnd.toLocaleDateString('en-US',{day:'numeric', month:'short', year:'numeric'})}</p>
          </div>
          <div className="ps-panel overflow-hidden rounded-2xl bg-white border border-[#ece6f3]">
            {weekDates.map((d, index)=>{
              const day = d.getDate();
              const month = d.getMonth();
              const evs = getEventsForDay(day, month);
              const isToday = d.toDateString()===today.toDateString();
              return (
                <article key={index} className={`flex gap-4 px-5 py-5 md:gap-7 md:px-7 ${index!== 6? 'border-b border-[#f0e6f8]' : ''} ${isToday?'bg-[#fdfcff]':''}`}>
                  <div className="flex w-12 shrink-0 flex-col items-center">
                    <span className="ps-mono text-[9px] text-[#9a8ea2]">{monthNames[month].slice(0,3).toUpperCase()}</span>
                    <span className={`mt-1 text-[27px] font-semibold leading-7 tracking-[-.06em] ${isToday?'text-[#5e428f]':'text-[#4b3b5e]'}`}>{day}</span>
                    <span className="mt-1 text-[9px] text-[#9a8ea2]">{d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1 border-l border-[#f0e6f8] pl-4 md:pl-7">
                    {evs.length===0? (
                      <p className="text-[12px] text-[#b8aec7] mt-2">No memories this day</p>
                    ) : (
                      <div className="space-y-3">
                        {evs.map((ev, i)=>{
                          const cfg = typeConfig[ev.type];
                          return (
                            <div key={i} className={`rounded-xl p-3 border ${cfg.bgSoft} border-[#f0e6f8]`} style={{backgroundColor: `${cfg.color}0D`}}>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wide" style={{background: `${cfg.color}18`, color: cfg.color}}>{cfg.emoji} {cfg.label.toUpperCase()}</span>
                                <span className="text-[10px] text-[#9b90a1]">{ev.year||''}</span>
                              </div>
                              <h2 className="mt-2 text-[14px] font-semibold leading-5 text-[#3d324b]">{ev.title}</h2>
                              <p className="mt-1 text-[11px] text-[#7b6a93] leading-4">{ev.info}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={()=>{setCurrentMonth(month); setCurrentYear(d.getFullYear()); setSelectedDate(day); setView('month');}} className="self-center rounded-lg p-2 text-[#aaa0b0] hover:bg-[#f5f2f8] hover:text-[#704ca5]"><CalendarDays size={16} /></button>
                </article>
              )
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {filters.map(f => (
              <button key={f.key} onClick={()=>setFilter(f.key)} className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-medium ${filter===f.key? 'bg-[#5e428f] border-[#5e428f] text-white' : 'bg-white border-[#e8e0f2] text-[#7b6a93]'}`}>{f.label}</button>
            ))}
          </div>

          <div className="ps-panel mt-6 rounded-2xl p-5 md:p-7 bg-white border border-[#ece6f3]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#3d324b]">{monthNames[currentMonth]} {currentYear}</h2>
              <div className="flex gap-1">
                <button type="button" onClick={()=>{const m=currentMonth-1; if(m<0){setCurrentMonth(11); setCurrentYear(y=>y-1);}else setCurrentMonth(m);}} className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e]"><ChevronRight size={15} className="rotate-180" /></button>
                <button type="button" onClick={()=>{const m=currentMonth+1; if(m>11){setCurrentMonth(0); setCurrentYear(y=>y+1);}else setCurrentMonth(m);}} className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e]"><ChevronRight size={15} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] text-[#998ea2]">
              {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=> <div key={d} className="py-2 ps-mono">{d}</div>)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i+1;
                const evs = getEventsForDay(day, currentMonth);
                const isSelected = selectedDate===day;
                const isMulti = evs.length>4;
                const firstCfg = evs[0]? typeConfig[evs[0].type] : null;
                const bgTint = evs.length===0? '' : firstCfg? `${firstCfg.color}14` : '';
                const isToday = day===today.getDate() && currentMonth===today.getMonth() && currentYear===today.getFullYear();
                return (
                  <button key={i} onClick={()=>setSelectedDate(day)} style={{backgroundColor: evs.length>0 &&!isSelected &&!isMulti? bgTint : undefined}} className={`relative min-h-[72px] rounded-xl p-2 text-left text-[11px] border transition-all ${isSelected? 'border-[#5e428f] bg-[#f5f0fb]! z-10 scale-[1.03] shadow-[0_4px_12px_rgba(94,66,143,0.15)]' : evs.length>0? 'border-[#f0e6f8] hover:bg-[#f5f0fb]' : 'border-transparent text-[#84798e] hover:bg-[#f8f5fb]'} ${isMulti? 'bg-gradient-to-br from-[#e8ddf3] to-[#fde2e8]! border-[#c9b6e4]!':''} ${isToday &&!isSelected?'ring-1 ring-[#5e428f]/20':''}`}>
                    <span className={`font-semibold ${isSelected?'text-[#5e428f]': isToday?'text-[#5e428f]':''}`}>{day}</span>
                    {!isMulti? (
                      <div className="absolute inset-1.5 pointer-events-none">
                        {evs.slice(0,4).map((ev, idx)=>{
                          const cfg = typeConfig[ev.type];
                          const Icon = cfg.icon;
                          const pos = ["top-0 left-0","top-0 right-0","bottom-0 left-0","bottom-0 right-0"][idx];
                          return <span key={idx} className={`absolute ${pos} flex h-[18px] w-[18px] items-center justify-center rounded-full ${cfg.bg}`} style={{color: cfg.color}}><Icon size={11} className={ev.type==='album'?'animate-[spin_3s_linear_infinite]':''} /></span>
                        })}
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><div className="h-7 w-7 rounded-full bg-[#5e428f] text-white flex items-center justify-center text-[10px] font-bold">+{evs.length}</div></div>
                    )}
                    {evs.length>0 &&!isMulti && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">{evs.slice(0,3).map((ev,idx)=>{const c=typeConfig[ev.type]; return <div key={idx} className="h-1 w-1 rounded-full" style={{background: c.color}}/>})}</div>}
                  </button>
                )
              })}
            </div>
          </div>

          {selectedDate && selectedEvents.length>0 && (
            <div className="mt-6 ps-panel rounded-2xl p-5 md:p-6 bg-white border border-[#ece6f3]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f0fb] text-[#5e428f] font-bold">{selectedDate}</div>
                  <h3 className="text-[14px] font-semibold text-[#3d324b]">{monthNames[currentMonth]} {selectedDate} - {selectedEvents.length} {selectedEvents.length===1?'Memory':'Memories'}</h3>
                </div>
                <button onClick={()=>setSelectedDate(today.getDate())} className="rounded-full bg-[#f8f5ff] p-1.5 text-[#7b6a93]"><X size={14}/></button>
              </div>
              <div className="mt-4 grid gap-3">
                {selectedEvents.map((ev,idx)=>{
                  const cfg = typeConfig[ev.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={idx} className="flex gap-3 rounded-xl border p-4" style={{backgroundColor: `${cfg.color}0D`, borderColor: `${cfg.color}20`}}>
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${cfg.bg}`} style={{color: cfg.color}}><Icon size={20} className={ev.type==='album'?'animate-[spin_3s_linear_infinite]':''}/></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white tracking-wide" style={{background: cfg.color}}>{cfg.emoji} {cfg.label.toUpperCase()}</span>{ev.year && <span className="text-[10px] text-[#b8aec7]">{ev.year}</span>}</div>
                        <h4 className="mt-1.5 text-[13px] font-semibold text-[#3d324b]">{ev.title}</h4>
                        <p className="mt-1 text-[11px] leading-4 text-[#7b6a93]">{ev.info}</p>
                        {ev.sourceUrl && <a href={ev.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white border border-[#ece6f3] px-3 py-1 text-[11px] font-medium text-[#5e428f] hover:bg-[#f5f0fb]">Read more on {ev.sourceName} <ExternalLink size={12}/></a>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default PaletteOfMemories;
