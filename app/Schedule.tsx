import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronRight, ListFilter, Mic2, Radio, Clapperboard, RotateCcw, Crown, Globe, Info } from 'lucide-react';
import { scheduleItems as defaultScheduleItems } from '../components/data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MAP: any = {JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11};

// A-Z REGIONS WITH TIMEZONES
const REGIONS = [
  { name: "Auto (Your Location)", tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { name: "India (IST)", tz: "Asia/Kolkata" },
  { name: "Korea (KST)", tz: "Asia/Seoul" },
  { name: "Japan (JST)", tz: "Asia/Tokyo" },
  { name: "USA Eastern (EST)", tz: "America/New_York" },
  { name: "USA Central (CST)", tz: "America/Chicago" },
  { name: "USA Mountain (MST)", tz: "America/Denver" },
  { name: "USA Pacific (PST)", tz: "America/Los_Angeles" },
  { name: "UK (GMT)", tz: "Europe/London" },
  { name: "Germany (CET)", tz: "Europe/Berlin" },
  { name: "France (CET)", tz: "Europe/Paris" },
  { name: "Australia Sydney (AEDT)", tz: "Australia/Sydney" },
  { name: "Brazil (BRT)", tz: "America/Sao_Paulo" },
  { name: "UAE Dubai (GST)", tz: "Asia/Dubai" },
  { name: "Singapore (SGT)", tz: "Asia/Singapore" },
  { name: "Thailand (ICT)", tz: "Asia/Bangkok" },
  { name: "Philippines (PHT)", tz: "Asia/Manila" },
  { name: "Indonesia (WIB)", tz: "Asia/Jakarta" },
  { name: "Mexico (CST)", tz: "America/Mexico_City" },
  { name: "Canada Toronto (EST)", tz: "America/Toronto" },
];

function getDateInTimezone(tz: string){
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year:'numeric', month:'numeric', day:'numeric' });
  const parts = fmt.formatToParts(new Date());
  const y = parseInt(parts.find(p=>p.type==='year')!.value);
  const m = parseInt(parts.find(p=>p.type==='month')!.value)-1;
  const d = parseInt(parts.find(p=>p.type==='day')!.value);
  return new Date(y,m,d);
}
function getTimeInTimezone(tz: string, dateStr?: string){
  try{
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour:'numeric', minute:'2-digit', hour12: true }).format(dateStr? new Date(dateStr) : new Date());
  }catch{ return ""; }
}
function convertTimeFromKST(timeStr: string, targetTz: string, eventDate: Date){
  if(!timeStr ||!timeStr.includes(':')) return timeStr;
  try{
    const [h,m] = timeStr.split(':').map(n=>parseInt(n));
    if(isNaN(h)) return timeStr;
    // KST = UTC+9, so UTC = KST -9
    const utc = Date.UTC(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), h-9, m||0);
    const converted = new Intl.DateTimeFormat('en-US', { timeZone: targetTz, hour:'numeric', minute:'2-digit', hour12:true }).format(new Date(utc));
    return converted;
  }catch{ return timeStr; }
}

function getDateFromItem(it:any): Date | null {
  if(it?.date){ const d=new Date(it.date); if(!isNaN(d.getTime())) return d; }
  if(it?.day && it?.month){
    const m = SHORT_MAP[it.month?.toUpperCase()];
    if(m!==undefined){
      const y = it.year || new Date().getFullYear();
      const d = new Date(y, m, parseInt(it.day));
      if(!isNaN(d.getTime())) return d;
    }
  }
  return null;
}
function isSameDay(a:Date,b:Date){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

export function Schedule() {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [allItems, setAllItems] = useState(defaultScheduleItems);
  const [selectedRegion, setSelectedRegion] = useState(()=> REGIONS[0]);
  const [currentMonth, setCurrentMonth] = useState(()=> getDateInTimezone(REGIONS[0].tz));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [tempYear, setTempYear] = useState(()=> getDateInTimezone(REGIONS[0].tz).getFullYear());
  const [tempMonth, setTempMonth] = useState(()=> getDateInTimezone(REGIONS[0].tz).getMonth());

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "scheduleItems"), (snap) => {
      const fb = snap.docs.map(d => ({ id: d.id,...d.data() } as any)).filter((x:any)=>!x.hidden);
      if (fb.length > 0) setAllItems([...fb,...defaultScheduleItems]);
      else setAllItems(defaultScheduleItems);
    });
    return () => unsub();
  }, []);

  // Jab region change ho to calendar us region ke aaj ke date pe jaye
  useEffect(()=>{
    const zonedNow = getDateInTimezone(selectedRegion.tz);
    setCurrentMonth(new Date(zonedNow.getFullYear(), zonedNow.getMonth(), 1));
    setTempYear(zonedNow.getFullYear());
    setTempMonth(zonedNow.getMonth());
  },[selectedRegion.tz]);

  const today = getDateInTimezone(selectedRegion.tz);
  const isNotTodayMonth = currentMonth.getMonth()!==today.getMonth() || currentMonth.getFullYear()!==today.getFullYear();
  const monthLabel = `${MONTHS_FULL[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  const monthEvents = useMemo(()=>{
    return allItems.map(it=>({it, d:getDateFromItem(it)})).filter(x=> x.d && x.d.getMonth()===currentMonth.getMonth() && x.d.getFullYear()===currentMonth.getFullYear());
  },[allItems, currentMonth]);

  const selectedDayEvents = useMemo(()=>{
    if(!selectedDate) return [];
    return allItems.filter(it=>{ const d=getDateFromItem(it); return d && isSameDay(d, selectedDate); });
  },[allItems, selectedDate]);

  const weekEvents = useMemo(()=>{
    const start = new Date(today); start.setDate(today.getDate()-today.getDay());
    const end = new Date(start); end.setDate(start.getDate()+6);
    return allItems.filter(it=>{ const d=getDateFromItem(it); return d && d>=start && d<=end; }).slice(0,10);
  },[allItems, today]);

  const getTypeStyle = (type:string)=>{
    const t = (type||'').toLowerCase();
    if(t.includes('perform')) return { bg:'#fee2e2', text:'#dc2626', dot:'#ef4444', icon: Mic2 };
    if(t.includes('broadcast')) return { bg:'#f3e8ff', text:'#7c3aed', dot:'#8b5cf6', icon: Radio };
    return { bg:'#dbeafe', text:'#2563eb', dot:'#3b82f6', icon: Clapperboard };
  };
  const getGoldenStyle = ()=> ({ bg:'#fef9c3', text:'#a16207', dot:'#ca8a04', icon: Crown });

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(),1).getDay();

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE RUN OF SHOW</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">What’s<br/><em className="text-[#704ca5]">ahead.</em></h1>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-[#ded7e9] bg-white p-1">
              <button type="button" onClick={() => setView('week')} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${view === 'week'? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>This week</button>
              <button type="button" onClick={() => setView('month')} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${view === 'month'? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>{MONTHS_FULL[today.getMonth()].slice(0,3)} {today.getFullYear()}</button>
              {view==='month' && (
                <button type="button" onClick={()=>{setTempYear(currentMonth.getFullYear()); setTempMonth(currentMonth.getMonth()); setAdjustOpen(!adjustOpen)}} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${adjustOpen? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>Adjust</button>
              )}
            </div>
          </div>
          {/* REGION DROPDOWN */}
          <div className="flex items-center gap-2 rounded-xl border border-[#ded7e9] bg-white px-3 py-2">
            <Globe size={14} className="text-[#8068a9]"/>
            <select value={selectedRegion.tz} onChange={e=>{const r=REGIONS.find(x=>x.tz===e.target.value); if(r) setSelectedRegion(r)}} className="w-full bg-transparent text-[11px] font-medium text-[#3d324b] outline-none">
              {REGIONS.map(r=><option key={r.tz+r.name} value={r.tz}>{r.name} — {getTimeInTimezone(r.tz)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {adjustOpen && view==='month' && (
        <div className="ps-panel mt-4 flex gap-3 rounded-2xl p-4">
          <select value={tempYear} onChange={e=>setTempYear(parseInt(e.target.value))} className="w-full rounded-xl border border-[#e3dce9] p-2.5 text-[13px]">
            {Array.from({length:18},(_,i)=>2013+i).map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <select value={tempMonth} onChange={e=>setTempMonth(parseInt(e.target.value))} className="w-full rounded-xl border border-[#e3dce9] p-2.5 text-[13px]">
            {MONTHS_FULL.map((m,i)=><option key={m} value={i}>{m}</option>)}
          </select>
          <button onClick={()=>{setCurrentMonth(new Date(tempYear,tempMonth,1)); setAdjustOpen(false); setSelectedDate(null);}} className="rounded-xl bg-[#60438f] px-6 text-[12px] text-white">Go</button>
        </div>
      )}

      {view === 'month'? (
        <>
          <div className="ps-panel mt-10 rounded-2xl p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#3d324b]">{monthLabel} <span className="ml-2 text-[11px] font-normal text-[#9a8ea2]">({selectedRegion.name})</span></h2>
              <div className="flex items-center gap-1">
                {isNotTodayMonth && <button onClick={()=>{setCurrentMonth(new Date(today.getFullYear(), today.getMonth(),1)); setSelectedDate(null);}} className="mr-2 flex items-center gap-1 rounded-lg border border-[#e3dce9] px-3 py-2 text-[11px] font-semibold text-[#60438f]"><RotateCcw size={12}/>Reset</button>}
                <button type="button" onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1,1))} className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e]"><ChevronRight size={15} className="rotate-180" /></button>
                <button type="button" onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,1))} className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e]"><ChevronRight size={15} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[#998ea2]">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="py-2 ps-mono">{day}</div>
              ))}
              {Array.from({length:startDay}).map((_,i)=><div key={'e'+i}/>)}
              {Array.from({ length: daysInMonth }, (_, idx) => {
                const dayNum = idx+1;
                const thisDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
                const evs = monthEvents.filter(x=> x.d && x.d.getDate()===dayNum);
                const isMulti = evs.length > 1;
                const cfg = isMulti? getGoldenStyle() : evs[0]? getTypeStyle(evs[0].it.type) : null;
                const isSelected = selectedDate && isSameDay(thisDate, selectedDate);
                const isToday = isSameDay(thisDate, today);
                const hasEvent = evs.length > 0;
                return (
                  <button
                    key={dayNum}
                    onClick={()=>setSelectedDate(thisDate)}
                    className={`flex min-h-16 flex-col items-center justify-between rounded-lg p-2 text-[11px] border ${isSelected?'border-[#60438f] bg-white shadow-sm': isToday?'border-[#8b5cf6] bg-[#f8f5ff]':'border-transparent'} ${hasEvent? 'font-semibold' : 'text-[#84798e] hover:bg-[#f8f5fb]'}`}
                    style={{background: hasEvent && cfg? cfg.bg : undefined, color: hasEvent && cfg? cfg.text : undefined}}
                  >
                    <span className="h-[12px] flex items-center justify-center">{hasEvent && cfg? <cfg.icon size={12} strokeWidth={2}/> : <span className="h-[12px] w-[12px]"></span>}</span>
                    <span className="text-[13px]">{dayNum}</span>
                    <span className="h-[6px] flex items-center justify-center">{hasEvent? <span className="block h-1.5 w-1.5 rounded-full" style={{background: cfg?.dot}}/> : <span className="h-1.5 w-1.5"></span>}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="ps-panel mt-6 overflow-hidden rounded-2xl">
              <div className="border-b border-[#eeeaf3] px-5 py-4 md:px-7 flex justify-between items-center">
                <p className="text-[13px] font-semibold text-[#3d324b]">{selectedDate.getDate()} {MONTHS_FULL[selectedDate.getMonth()]} {selectedDate.getFullYear()} — Events: {selectedDayEvents.length} • {selectedRegion.name}</p>
                <button onClick={()=>setSelectedDate(null)} className="text-[11px] text-[#9a8ea2]">Close</button>
              </div>
              {selectedDayEvents.length===0? <p className="p-6 text-center text-[12px] text-[#9a8ea2]">No events on this day 💜 — Events: 0</p> : selectedDayEvents.map((item:any, index:number)=>{
                const evDate = getDateFromItem(item) || selectedDate;
                const displayTime = convertTimeFromKST(item.time, selectedRegion.tz, evDate);
                return (
                <article key={item.id||index} className={`flex gap-4 bg-white px-5 py-5 md:gap-7 md:px-7 ${index!==selectedDayEvents.length-1?'border-b border-[#eeeaf3]':''}`}>
                  <div className="flex w-12 shrink-0 flex-col items-center"><span className="ps-mono text-[9px] text-[#9a8ea2]">{item.month || MONTHS_FULL[selectedDate.getMonth()].slice(0,3).toUpperCase()}</span><span className="mt-1 text-[27px] font-semibold leading-7 tracking-[-.06em] text-[#4b3b5e]">{item.day || selectedDate.getDate()}</span><span className="mt-1 text-[9px] text-[#9a8ea2]">{item.weekday || selectedDate.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()}</span></div>
                  <div className="min-w-0 flex-1 border-l border-[#e5dfea] pl-4 md:pl-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full px-2 py-1 text-[9px] font-semibold" style={{background: getTypeStyle(item.type).bg, color: getTypeStyle(item.type).text}}>{item.type}</span>
                      <span className="text-[10px] text-[#9b90a1]">{displayTime} ({selectedRegion.tz.split('/').pop()})</span>
                    </div>
                    <h2 className="mt-2 text-[14px] font-semibold leading-5 text-[#3d324b]">{item.title}</h2>
                    <p className="mt-1.5 text-[11px] text-[#968a9e]">{item.location}</p>
                    {item.links?.[0] && <a href={item.links[0]} target="_blank" className="mt-2 inline-flex text-[11px] font-bold text-[#2563eb]">view official info ↝</a>}
                  </div>
                </article>
              )})}
            </div>
          )}

          {/* CONFIRMATION BOX LIKE ACHIEVEMENTS PAGE */}
          <div className="ps-panel mt-6 flex gap-3 rounded-2xl bg-[#fffbeb] p-4 md:p-5 border border-[#fde68a]">
            <Info size={16} className="mt-0.5 shrink-0 text-[#d97706]"/>
            <div>
              <p className="text-[12px] font-semibold text-[#92400e]">Schedule Information</p>
              <p className="mt-1 text-[11px] leading-5 text-[#a16207]">Timings are converted from KST to your selected timezone ({selectedRegion.name}). Some content may be delayed or changed by official sources. Please verify on official channels. This week & calendar automatically adjust based on your region — Korea is 3.5 hrs ahead of India, USA is behind. If you see incorrect info, contact admin.</p>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[12px] text-[#887b92]">{today.getDate()} {MONTHS_FULL[today.getMonth()]} {today.getFullYear()} • {weekEvents.length} events • {selectedRegion.name} • {getTimeInTimezone(selectedRegion.tz)}</p>
            <button type="button" className="flex items-center gap-2 text-[11px] font-semibold text-[#704ca5]"><ListFilter size={14} /> Filter</button>
          </div>
          <div className="ps-panel overflow-hidden rounded-2xl">
            {weekEvents.length===0? <p className="p-6 text-center text-[12px] text-[#9a8ea2]">No events this week in {selectedRegion.name} 💜</p> : weekEvents.map((item: any, index: number, arr:any[]) => {
              const sty = getTypeStyle(item.type);
              const evDate = getDateFromItem(item) || today;
              const displayTime = convertTimeFromKST(item.time, selectedRegion.tz, evDate);
              return (
              <article key={item.id || item.day + item.title} className={`flex gap-4 px-5 py-5 md:gap-7 md:px-7 ${index!== arr.length - 1? 'border-b border-[#eeeaf3]' : ''}`}>
                <div className="flex w-12 shrink-0 flex-col items-center">
                  <span className="ps-mono text-[9px] text-[#9a8ea2]">{item.month}</span>
                  <span className="mt-1 text-[27px] font-semibold leading-7 tracking-[-.06em] text-[#4b3b5e]">{item.day}</span>
                  <span className="mt-1 text-[9px] text-[#9a8ea2]">{item.weekday}</span>
                </div>
                <div className="min-w-0 flex-1 border-l border-[#e5dfea] pl-4 md:pl-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2 py-1 text-[9px] font-semibold" style={{background: sty.bg, color: sty.text}}>{item.type}</span>
                    <span className="text-[10px] text-[#9b90a1]">{displayTime}</span>
                  </div>
                  <h2 className="mt-2 text-[14px] font-semibold leading-5 text-[#3d324b]">{item.title}</h2>
                  <p className="mt-1.5 text-[11px] text-[#968a9e]">{item.location} • {selectedRegion.tz.split('/').pop()}</p>
                </div>
                <button type="button" className="self-center rounded-lg p-2 text-[#aaa0b0] hover:bg-[#f5f2f8] hover:text-[#704ca5]"><CalendarDays size={16} /></button>
              </article>
            )})}
          </div>

          <div className="ps-panel mt-6 flex gap-3 rounded-2xl bg-[#fffbeb] p-4 md:p-5 border border-[#fde68a]">
            <Info size={16} className="mt-0.5 shrink-0 text-[#d97706]"/>
            <div>
              <p className="text-[12px] font-semibold text-[#92400e]">Region Based Timing</p>
              <p className="mt-1 text-[11px] leading-5 text-[#a16207]">This week view auto-updates based on {selectedRegion.name} ({selectedRegion.tz}). KST {getTimeInTimezone('Asia/Seoul')} = {selectedRegion.name} {getTimeInTimezone(selectedRegion.tz)}. Events are converted automatically.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
