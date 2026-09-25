import { useState, useMemo } from 'react';
import { ChevronRight, ListFilter, Cake, Disc3, HeartCrack, Dog, Cat, Users, PartyPopper, Sparkles, PlayCircle, Trophy, Shield, X, ExternalLink } from 'lucide-react';

type EventType = 'birthday' | 'album' | 'pet' | 'army' | 'festa' | 'anniversary' | 'mv' | 'black' | 'award' | 'enlist';

type ArchiveEvent = {
  date: string;
  type: EventType;
  title: string;
  info: string;
  sourceUrl?: string;
  sourceName?: string;
  year?: string;
};

const events: ArchiveEvent[] = [
  { date: "02-18", type: "birthday", title: "J-Hope Birthday", info: "Jung Hoseok born 1994, the sunshine of BTS.", sourceUrl: "https://bts.ibighit.com", sourceName: "BigHit" },
  { date: "03-09", type: "birthday", title: "SUGA Birthday", info: "Min Yoongi, producer and rapper born 1993." },
  { date: "09-01", type: "birthday", title: "Jungkook Birthday", info: "Jeon Jungkook born 1997 - Golden Maknae.", year: "1997" },
  { date: "09-12", type: "birthday", title: "RM Birthday", info: "Kim Namjoon born 1994.", year: "1994" },
  { date: "10-13", type: "birthday", title: "Jimin Birthday", info: "Park Jimin born 1995." },
  { date: "12-04", type: "birthday", title: "Jin Birthday", info: "Kim Seokjin born 1992." },
  { date: "12-30", type: "birthday", title: "V Birthday", info: "Kim Taehyung born 1995." },
  { date: "06-13", type: "anniversary", title: "BTS Anniversary", info: "BTS debuted on 13 June 2013. 12+ years of legacy.", sourceUrl: "https://en.wikipedia.org/wiki/BTS", sourceName: "Wikipedia" },
  { date: "07-09", type: "army", title: "ARMY Day", info: "ARMY named on 9 July 2013.", sourceUrl: "https://bts.ibighit.com", sourceName: "BigHit" },
  { date: "06-01", type: "festa", title: "FESTA Begins", info: "Annual BTS FESTA celebration starts.", year: "Every June" },
  { date: "06-12", type: "album", title: "2 Cool 4 Skool Anniversary", info: "Debut album released 12 June 2013.", sourceUrl: "https://ibighit.com/bts/eng/discography/detail/2_cool_4_skool.html", sourceName: "BigHit Discography" },
  { date: "02-10", type: "album", title: "WINGS Anniversary", info: "WINGS era milestone.", year: "2016" },
  { date: "09-18", type: "album", title: "Love Yourself: Her", info: "Released 18 Sep 2017." },
  { date: "05-18", type: "mv", title: "Fake Love MV Anniv", info: "Fake Love reached milestones on this day.", sourceUrl: "https://www.youtube.com/c/BANGTANTV", sourceName: "BANGTANTV" },
  { date: "12-12", type: "pet", title: "Yeontan's Day", info: "V's beloved Yeontan's birth anniversary.", year: "2017" },
  { date: "12-02", type: "black", title: "Yeontan - Black Day", info: "We remember Yeontan, forever in ARMY hearts.", sourceUrl: "https://weverse.io", sourceName: "Weverse" },
  { date: "03-11", type: "pet", title: "Bam Birthday", info: "Jungkook's Doberman Bam." },
];

const typeConfig: Record<EventType, { color: string; bg: string; icon: any; label: string }> = {
  birthday: { color: "#ec4899", bg: "bg-[#fde2e8]", icon: Cake, label: "Birthday" },
  album: { color: "#d97706", bg: "bg-[#f5ead1]", icon: Disc3, label: "Album" },
  pet: { color: "#fb923c", bg: "bg-[#ffead6]", icon: Dog, label: "Pet" },
  army: { color: "#5e428f", bg: "bg-[#ede7f7]", icon: Users, label: "ARMY" },
  festa: { color: "#8b5cf6", bg: "bg-[#ede7f7]", icon: PartyPopper, label: "FESTA" },
  anniversary: { color: "#7c3aed", bg: "bg-[#e8ddf3]", icon: Sparkles, label: "Anniversary" },
  mv: { color: "#ef4444", bg: "bg-[#ffe2e2]", icon: PlayCircle, label: "MV Anniv" },
  black: { color: "#27272a", bg: "bg-[#e4e4e7]", icon: HeartCrack, label: "Black Day" },
  award: { color: "#a16207", bg: "bg-[#f5ead1]", icon: Trophy, label: "Award" },
  enlist: { color: "#65a30d", bg: "bg-[#ecfccb]", icon: Shield, label: "Enlist" },
};

const filters: { key: string; label: string; types: EventType[] }[] = [
  { key: "all", label: "All", types: [] },
  { key: "birthday", label: "Birthdays", types: ["birthday"] },
  { key: "album", label: "Albums", types: ["album", "mv"] },
  { key: "army", label: "ARMY & FESTA", types: ["army", "festa", "anniversary"] },
  { key: "pet", label: "Pets", types: ["pet"] },
  { key: "black", label: "Black Days", types: ["black"] },
];

export function PaletteOfMemories() {
  const [view, setView] = useState<'week' | 'month'>('month');
  const [currentMonth, setCurrentMonth] = useState(5);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<number | null>(27);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(2025, currentMonth + 1, 0).getDate();

  const getEventsForDay = (day: number) => {
    const mmdd = `${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    let ev = events.filter(e => e.date === mmdd);
    if(filter!== "all"){
      const f = filters.find(f=>f.key===filter);
      if(f) ev = ev.filter(e=> f.types.includes(e.type));
    }
    return ev;
  };

  const selectedEvents = useMemo(() => selectedDate? getEventsForDay(selectedDate) : [], [selectedDate, filter, currentMonth]);

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">A CANVAS OF YOUTH</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">
            Palette of
            <br />
            <em className="text-[#704ca5]">Memories.</em>
          </h1>
          <p className="mt-3 text-[12px] text-[#887b92] max-w-[340px] leading-5">Youth ke saare rangon se bani hui yaadon ka canvas. Birthdays, albums, ARMY days, pets & black days.</p>
        </div>
        <div className="flex rounded-xl border border-[#ded7e9] bg-white p-1">
          <button type="button" onClick={() => setView('week')} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${view === 'week'? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>This week</button>
          <button type="button" onClick={() => setView('month')} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${view === 'month'? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>{monthNames[currentMonth]} 2025</button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(f => (
            <button key={f.key} onClick={()=>setFilter(f.key)} className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-all ${filter===f.key? 'bg-[#5e428f] border-[#5e428f] text-white shadow-[0_4px_12px_rgba(94,66,143,0.2)]' : 'bg-white border-[#e8e0f2] text-[#7b6a93] hover:bg-[#f5f0fb]'}`}>{f.label}</button>
          ))}
        </div>
        <button type="button" className="hidden md:flex items-center gap-2 text-[11px] font-semibold text-[#704ca5]"><ListFilter size={14} /> Filter</button>
      </div>

      <div className="ps-panel mt-6 rounded-2xl p-5 md:p-7 bg-white border border-[#ece6f3]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#3d324b]">{monthNames[currentMonth]} 2025</h2>
          <div className="flex gap-1">
            <button type="button" onClick={()=>setCurrentMonth(m=> m>0?m-1:11)} className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e] hover:bg-[#f8f5ff]"><ChevronRight size={15} className="rotate-180" /></button>
            <button type="button" onClick={()=>setCurrentMonth(m=> m<11?m+1:0)} className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e] hover:bg-[#f8f5ff]"><ChevronRight size={15} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] text-[#998ea2]">
          {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=> <div key={d} className="py-2 ps-mono">{d}</div>)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i+1;
            const evs = getEventsForDay(day);
            const isSelected = selectedDate===day;
            const isMulti = evs.length>4;
            return (
              <button key={i} onClick={()=>setSelectedDate(day)} className={`relative min-h-[72px] rounded-xl p-2 text-left text-[11px] transition-all border ${isSelected? 'border-[#5e428f] bg-[#f5f0fb] z-10 scale-[1.03] shadow-[0_4px_12px_rgba(94,66,143,0.15)]' : evs.length>0? 'border-[#f0e6f8] bg-[#fdfcff] hover:bg-[#f5f0fb] hover:border-[#e8ddf3]' : 'border-transparent text-[#84798e] hover:bg-[#f8f5fb]' } ${isMulti? 'bg-gradient-to-br from-[#e8ddf3] to-[#fde2e8]!border-[#c9b6e4]' : ''}`}>
                <span className={`font-semibold ${isSelected?'text-[#5e428f]':''}`}>{day}</span>
                {!isMulti? (
                  <div className="absolute inset-1.5 pointer-events-none">
                    {evs.slice(0,4).map((ev, idx)=>{
                      const cfg = typeConfig[ev.type];
                      const Icon = ev.type==='pet' && ev.title.includes('Bam')? Dog : ev.type==='pet'? Cat : cfg.icon;
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
          <div className="flex items-center justify-between"><h3 className="text-[14px] font-semibold text-[#3d324b]">{monthNames[currentMonth]} {selectedDate} - {selectedEvents.length} Memories</h3><button onClick={()=>setSelectedDate(null)} className="rounded-full bg-[#f8f5ff] p-1.5 text-[#7b6a93] hover:bg-[#f0e9f7]"><X size={14}/></button></div>
          <div className="mt-4 grid gap-3">
            {selectedEvents.map((ev,idx)=>{
              const cfg = typeConfig[ev.type];
              const Icon = ev.type==='pet' && ev.title.includes('Bam')? Dog : ev.type==='pet'? Cat : cfg.icon;
              return (
                <div key={idx} className="flex gap-3 rounded-xl border border-[#f0e6f8] bg-[#fdfcff] p-4 hover:bg-[#f8f5ff] transition-colors">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${cfg.bg}`} style={{color: cfg.color}}><Icon size={20} className={ev.type==='album'?'animate-[spin_3s_linear_infinite]':''}/></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white tracking-wide" style={{background: cfg.color}}>{cfg.label.toUpperCase()}</span>{ev.year && <span className="text-[10px] text-[#b8aec7]">{ev.year}</span>}</div>
                    <h4 className="mt-1.5 text-[13px] font-semibold text-[#3d324b]">{ev.title}</h4>
                    <p className="mt-1 text-[11px] leading-4 text-[#7b6a93]">{ev.info}</p>
                    {ev.sourceUrl && <a href={ev.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#f5f0fb] px-3 py-1 text-[11px] font-medium text-[#5e428f] hover:bg-[#ede7f7]">Read more on {ev.sourceName} <ExternalLink size={12}/></a>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3 text-[10px] text-[#b8aec7]"><span className="ps-mono font-semibold">LEGEND:</span>{Object.entries(typeConfig).slice(0,6).map(([k,v])=> <span key={k} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{background:v.color}}/> {v.label}</span>)}</div>
    </div>
  );
}

export default PaletteOfMemories;
