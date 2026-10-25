import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronRight, ListFilter, Mic2, Radio, Clapperboard, RotateCcw, Crown, Globe, Info } from 'lucide-react';
import { scheduleItems as defaultScheduleItems } from '../components/data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MAP: any = {JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11};

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
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year:'numeric', month:'numeric', day:'numeric' });
    const parts = fmt.formatToParts(new Date());
    const y = parseInt(parts.find(p=>p.type==='year')!.value);
    const m = parseInt(parts.find(p=>p.type==='month')!.value)-1;
    const d = parseInt(parts.find(p=>p.type==='day')!.value);
    return new Date(y,m,d);
  } catch {
    return new Date();
  }
}
function getTimeInTimezone(tz: string, dateStr?: string){
  try{
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour:'numeric', minute:'2-digit', hour12: true }).format(dateStr? new Date(dateStr) : new Date());
  }catch{ return ""; }
}
function convertTimeFromKST(timeStr: string, targetTz: string, eventDate: Date){
  if(!timeStr || !timeStr.includes(':')) return timeStr;
  try{
    const [h,m] = timeStr.split(':').map(n=>parseInt(n));
    if(isNaN(h)) return timeStr;
    const utc = Date.UTC(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), h-9, m||0);
    const converted = new Intl.DateTimeFormat('en-US', { timeZone: targetTz, hour:'numeric', minute:'2-digit', hour12:true }).format(new Date(utc));
    return converted;
  }catch{ return timeStr; }
}

function getDateFromItem(it:any): Date | null {
  if(it?.date){
    const parts = it.date.split('-');
    if(parts.length === 3){
      const d = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
      if(!isNaN(d.getTime())) return d;
    }
    const d=new Date(it.date); if(!isNaN(d.getTime())) return d;
  }
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
  const [view, setView] = useState<'week' | 'month'>('month');
  const [allItems, setAllItems] = useState(defaultScheduleItems);
  const [selectedRegion, setSelectedRegion] = useState(()=> REGIONS[0]);
  const [currentMonth, setCurrentMonth] = useState(()=> getDateInTimezone(REGIONS[0].tz));
  const [selectedDate, setSelectedDate] = useState<Date | null>(()=> getDateInTimezone(REGIONS[0].tz));
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [tempYear, setTempYear] = useState(()=> getDateInTimezone(REGIONS[0].tz).getFullYear());
  const [tempMonth, setTempMonth] = useState(()=> getDateInTimezone(REGIONS[0].tz).getMonth());

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "scheduleItems"), (snap) => {
      const fb = snap.docs.map(d => ({ id: d.id,...d.data() } as any)).filter((x:any)=>!x.hidden);
      if (fb.length > 0) setAllItems([...fb,...defaultScheduleItems]);
      else setAllItems(defaultScheduleItems);
    });
    return () => unsub();
  }, []);

  useEffect(()=>{
    const zonedNow = getDateInTimezone(selectedRegion.tz);
    setCurrentMonth(new Date(zonedNow.getFullYear(), zonedNow.getMonth(), 1));
    setSelectedDate(zonedNow);
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
    if(t.includes('perform')) return { bg:'#fee2e2', text:'#dc2626', dot:'#ef4444', icon: Mic2, hexBg: '#7c3aed' };
    if(t.includes('broadcast')) return { bg:'#f3e8ff', text:'#7c3aed', dot:'#8b5cf6', icon: Radio, hexBg: '#2563eb' };
    if(t.includes('content')) return { bg:'#dcfce7', text:'#16a34a', dot:'#22c55e', icon: Clapperboard, hexBg: '#16a34a' };
    return { bg:'#fef9c3', text:'#a16207', dot:'#ca8a04', icon: Crown, hexBg: '#d97706' };
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(),1).getDay();

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12 max-w-7xl mx-auto px-4">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end mb-8">
        <div>
          <p className="ps-mono text-[10px] tracking-[3px] font-bold text-[#7c3aed]">CALENDAR & SCHEDULE</p>
          <h1 className="ps-display mt-2 text-[42px] md:text-[48px] leading-[.95] font-bold text-[#332840]">Stay updated<br/><em className="text-[#704ca5]">with BTS events.</em></h1>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-[#ded7e9] bg-white p-1 shadow-sm">
              <button type="button" onClick={() => setView('month')} className={`rounded-lg px-4 py-2 text-[11px] font-bold ${view === 'month'? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>Calendar</button>
              <button type="button" onClick={() => setView('week')} className={`rounded-lg px-4 py-2 text-[11px] font-bold ${view === 'week'? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>Upcoming</button>
              {view==='month' && (
                <button type="button" onClick={()=>{setTempYear(currentMonth.getFullYear()); setTempMonth(currentMonth.getMonth()); setAdjustOpen(!adjustOpen)}} className={`rounded-lg px-3.5 py-2 text-[11px] font-bold ${adjustOpen? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>Adjust</button>
              )}
            </div>
          </div>
          {/* TIMEZONE SELECTOR */}
          <div className="flex items-center gap-2 rounded-xl border border-[#ded7e9] bg-white px-3.5 py-2.5 shadow-sm">
            <Globe size={14} className="text-[#8068a9] shrink-0"/>
            <span className="text-[11px] text-[#887b92] shrink-0">Times shown in</span>
            <select value={selectedRegion.tz} onChange={e=>{const r=REGIONS.find(x=>x.tz===e.target.value); if(r) setSelectedRegion(r)}} className="w-full bg-transparent text-[11px] font-bold text-[#3d324b] outline-none cursor-pointer">
              {REGIONS.map(r=><option key={r.tz+r.name} value={r.tz}>{r.name} ({getTimeInTimezone(r.tz)})</option>)}
            </select>
          </div>
        </div>
      </div>

      {adjustOpen && view==='month' && (
        <div className="ps-panel mb-6 flex gap-3 rounded-2xl p-4 bg-white border shadow-sm">
          <select value={tempYear} onChange={e=>setTempYear(parseInt(e.target.value))} className="w-full rounded-xl border border-[#e3dce9] p-2.5 text-[13px]">
            {Array.from({length:18},(_,i)=>2013+i).map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <select value={tempMonth} onChange={e=>setTempMonth(parseInt(e.target.value))} className="w-full rounded-xl border border-[#e3dce9] p-2.5 text-[13px]">
            {MONTHS_FULL.map((m,i)=><option key={m} value={i}>{m}</option>)}
          </select>
          <button onClick={()=>{setCurrentMonth(new Date(tempYear,tempMonth,1)); setAdjustOpen(false);}} className="rounded-xl bg-[#60438f] px-6 text-[12px] text-white font-bold">Go</button>
        </div>
      )}

      {view === 'month'? (
        <>
          <div className="ps-panel rounded-2xl p-5 md:p-8 bg-white border shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#3d324b]">{monthLabel} <span className="ml-2 text-[12px] font-normal text-[#9a8ea2]">({selectedRegion.name})</span></h2>
              <div className="flex items-center gap-1.5">
                {isNotTodayMonth && <button onClick={()=>{setCurrentMonth(new Date(today.getFullYear(), today.getMonth(),1)); setSelectedDate(today);}} className="mr-2 flex items-center gap-1 rounded-lg border border-[#e3dce9] px-3 py-2 text-[11px] font-semibold text-[#60438f]"><RotateCcw size={12}/>Reset</button>}
                <button type="button" onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1,1))} className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e] hover:bg-gray-50"><ChevronRight size={16} className="rotate-180" /></button>
                <button type="button" onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,1))} className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e] hover:bg-gray-50"><ChevronRight size={16} /></button>
              </div>
            </div>

            {/* DESKTOP & MOBILE CALENDAR GRID */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-2 text-center text-[11px] font-bold text-[#887b92] border-b">{day}</div>
              ))}
              {Array.from({length:startDay}).map((_,i)=><div key={'e'+i} className="min-h-[100px] bg-gray-50/50 rounded-xl"/>)}
              {Array.from({ length: daysInMonth }, (_, idx) => {
                const dayNum = idx+1;
                const thisDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
                const evs = monthEvents.filter(x=> x.d && x.d.getDate()===dayNum);
                const isSelected = selectedDate && isSameDay(thisDate, selectedDate);
                const isToday = isSameDay(thisDate, today);

                return (
                  <div
                    key={dayNum}
                    onClick={()=>setSelectedDate(thisDate)}
                    className={`min-h-[110px] flex flex-col rounded-xl p-2.5 text-[11px] border cursor-pointer transition ${
                      isSelected ? 'border-[#7c3aed] ring-2 ring-[#7c3aed]/20 bg-white shadow-sm' : 
                      isToday ? 'border-[#8b5cf6] bg-[#f8f5ff]' : 'border-[#eeeaf3] bg-white hover:border-[#d8b4fe]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`font-bold text-[12px] ${isToday ? 'text-[#7c3aed] bg-[#ede4ff] w-6 h-6 rounded-full flex items-center justify-center' : 'text-[#3d324b]'}`}>{dayNum}</span>
                    </div>

                    {/* EVENT PILLS FOR BIG SCREENS / DESKTOP GRID */}
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
                      {evs.map((e:any, ei:number)=>{
                        const st = getTypeStyle(e.it.type);
                        return (
                          <div 
                            key={ei} 
                            className="text-[9.5px] font-bold px-1.5 py-0.5 rounded truncate shadow-xs text-white"
                            style={{backgroundColor: st.hexBg}}
                            title={e.it.title}
                          >
                            {e.it.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SELECTED DAY EVENTS DETAILS PANEL */}
          {selectedDate && (
            <div className="ps-panel mt-6 overflow-hidden rounded-2xl bg-white border shadow-sm">
              <div className="border-b border-[#eeeaf3] px-5 py-4 md:px-7 flex justify-between items-center bg-[#faf8ff]">
                <p className="text-[13px] font-bold text-[#3d324b]">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — Events: {selectedDayEvents.length} • {selectedRegion.name}
                </p>
                <button onClick={()=>setSelectedDate(null)} className="text-[11px] text-[#9a8ea2] font-semibold hover:text-black">Close</button>
              </div>
              {selectedDayEvents.length===0? (
                <p className="p-8 text-center text-[12px] text-[#9a8ea2]">No events on this day 💜</p>
              ) : (
                selectedDayEvents.map((item:any, index:number)=>{
                  const evDate = getDateFromItem(item) || selectedDate;
                  const displayTime = convertTimeFromKST(item.time, selectedRegion.tz, evDate);
                  const sty = getTypeStyle(item.type);
                  return (
                    <article key={item.id||index} className={`flex gap-4 bg-white px-5 py-5 md:gap-7 md:px-7 items-center ${index!==selectedDayEvents.length-1?'border-b border-[#eeeaf3]':''}`}>
                      <div className="flex w-14 shrink-0 flex-col items-center bg-[#f8f5ff] p-2 rounded-xl border border-[#ede9fe]">
                        <span className="ps-mono text-[9px] font-bold text-[#7c3aed]">{item.month || MONTHS_FULL[selectedDate.getMonth()].slice(0,3).toUpperCase()}</span>
                        <span className="text-[24px] font-bold leading-none text-[#3d324b] mt-0.5">{item.day || selectedDate.getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1 border-l border-[#e5dfea] pl-4 md:pl-7">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full px-2.5 py-0.5 text-[9.5px] font-bold text-white" style={{backgroundColor: sty.hexBg}}>{item.type}</span>
                          <span className="text-[11px] font-semibold text-[#6b7280]">{displayTime} ({selectedRegion.tz.split('/').pop()})</span>
                        </div>
                        <h2 className="mt-1.5 text-[15px] font-bold leading-snug text-[#3d324b]">{item.title}</h2>
                        {item.location && <p className="mt-1 text-[11.5px] text-[#6b7280]">{item.location}</p>}
                        {item.links?.[0] && <a href={item.links[0]} target="_blank" className="mt-2 inline-flex text-[11px] font-bold text-[#7c3aed] hover:underline">view official info ↝</a>}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </>
      ) : (
        <div className="mt-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[12px] font-bold text-[#887b92]">{today.getDate()} {MONTHS_FULL[today.getMonth()]} {today.getFullYear()} • {weekEvents.length} events • {selectedRegion.name}</p>
          </div>
          <div className="ps-panel overflow-hidden rounded-2xl bg-white border shadow-sm">
            {weekEvents.length===0? <p className="p-8 text-center text-[12px] text-[#9a8ea2]">No events this week in {selectedRegion.name} 💜</p> : weekEvents.map((item: any, index: number, arr:any[]) => {
              const sty = getTypeStyle(item.type);
              const evDate = getDateFromItem(item) || today;
              const displayTime = convertTimeFromKST(item.time, selectedRegion.tz, evDate);
              return (
              <article key={item.id || item.day + item.title} className={`flex gap-4 px-5 py-5 md:gap-7 md:px-7 items-center ${index!== arr.length - 1? 'border-b border-[#eeeaf3]' : ''}`}>
                <div className="flex w-14 shrink-0 flex-col items-center bg-[#f8f5ff] p-2 rounded-xl border border-[#ede9fe]">
                  <span className="ps-mono text-[9px] font-bold text-[#7c3aed]">{item.month}</span>
                  <span className="text-[24px] font-bold leading-none text-[#3d324b] mt-0.5">{item.day}</span>
                </div>
                <div className="min-w-0 flex-1 border-l border-[#e5dfea] pl-4 md:pl-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2.5 py-0.5 text-[9.5px] font-bold text-white" style={{backgroundColor: sty.hexBg}}>{item.type}</span>
                    <span className="text-[11px] font-semibold text-[#6b7280]">{displayTime}</span>
                  </div>
                  <h2 className="mt-1.5 text-[15px] font-bold leading-snug text-[#3d324b]">{item.title}</h2>
                  {item.location && <p className="mt-1 text-[11.5px] text-[#6b7280]">{item.location} • {selectedRegion.tz.split('/').pop()}</p>}
                </div>
              </article>
            )})}
          </div>
        </div>
      )}
    </div>
  );
}
