import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronRight, ListFilter, Mic2, Radio, Clapperboard, RotateCcw } from 'lucide-react';
import { scheduleItems as defaultScheduleItems } from '../components/data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MAP: any = {JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11};

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
  const [currentMonth, setCurrentMonth] = useState(()=> new Date()); // September 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [tempYear, setTempYear] = useState(()=> new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(()=> new Date().getMonth());

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "scheduleItems"), (snap) => {
      const fb = snap.docs.map(d => ({ id: d.id,...d.data() } as any)).filter((x:any)=>!x.hidden);
      if (fb.length > 0) setAllItems([...fb,...defaultScheduleItems]);
      else setAllItems(defaultScheduleItems);
    });
    return () => unsub();
  }, []);

  const today = new Date();
  const isNotTodayMonth = currentMonth.getMonth()!==today.getMonth() || currentMonth.getFullYear()!==today.getFullYear();
  const monthLabel = `${MONTHS_FULL[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  const monthEvents = useMemo(()=>{
    return allItems.map(it=>({it, d:getDateFromItem(it)})).filter(x=> x.d && x.d.getMonth()===currentMonth.getMonth() && x.d.getFullYear()===currentMonth.getFullYear());
  },[allItems, currentMonth]);

  const selectedDayEvents = useMemo(()=>{
    if(!selectedDate) return [];
    return allItems.filter(it=>{ const d=getDateFromItem(it); return d && isSameDay(d, selectedDate); });
  },[allItems, selectedDate]);

  const getTypeStyle = (type:string)=>{
    const t = (type||'').toLowerCase();
    if(t.includes('perform')){
      return { bg:'#fee2e2', text:'#dc2626', dot:'#ef4444', icon: Mic2 }; // RED
    }
    if(t.includes('broadcast')){
      return { bg:'#f3e8ff', text:'#7c3aed', dot:'#8b5cf6', icon: Radio }; // PURPLE
    }
    return { bg:'#dbeafe', text:'#2563eb', dot:'#3b82f6', icon: Clapperboard }; // BLUE for Content
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(),1).getDay();

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE RUN OF SHOW</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">What’s<br/><em className="text-[#704ca5]">ahead.</em></h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-[#ded7e9] bg-white p-1">
            <button type="button" onClick={() => setView('week')} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${view === 'week'? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>This week</button>
            <button type="button" onClick={() => setView('month')} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${view === 'month'? 'bg-[#60438f] text-white' : 'text-[#887b92]'}`}>{MONTHS_FULL[currentMonth.getMonth()].slice(0,3)} {currentMonth.getFullYear()}</button>
          </div>
          <button onClick={()=>{setTempYear(currentMonth.getFullYear()); setTempMonth(currentMonth.getMonth()); setAdjustOpen(!adjustOpen)}} className="rounded-xl bg-[#eef4ff] px-4 py-2 text-[11px] font-bold text-[#2563eb]">Adjust</button>
        </div>
      </div>

      {adjustOpen && (
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
        <div className="ps-panel mt-10 rounded-2xl p-5 md:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#3d324b]">{monthLabel}</h2>
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
              const cfg = evs[0]? getTypeStyle(evs[0].it.type) : null;
              const isSelected = selectedDate && isSameDay(thisDate, selectedDate);
              const isToday = isSameDay(thisDate, today);
              return (
                <button
                  key={dayNum}
                  onClick={()=>setSelectedDate(thisDate)}
                  className={`flex min-h-16 flex-col items-center justify-between rounded-lg p-2 text-[11px] border ${isSelected?'border-[#60438f] bg-white shadow-sm': isToday?'border-[#8b5cf6]':'border-transparent'} ${evs.length? 'font-semibold' : 'text-[#84798e] hover:bg-[#f8f5fb]'}`}
                  style={{background: evs.length && cfg? cfg.bg : undefined, color: evs.length && cfg? cfg.text : undefined}}
                >
                  <span className="h-[12px] flex items-center justify-center">{evs.length && cfg? <cfg.icon size={12} strokeWidth={2}/> : null}</span>
                  <span className="text-[13px]">{dayNum}</span>
                  <span className="h-[6px] flex items-center justify-center">{evs.length && <span className="block h-1.5 w-1.5 rounded-full" style={{background: cfg?.dot}}/>}</span>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-6">
              <p className="mb-3 text-[12px] text-[#887b92]">{selectedDate.getDate()} {MONTHS_FULL[selectedDate.getMonth()]} {selectedDate.getFullYear()} • {selectedDayEvents.length} events</p>
              <div className="overflow-hidden rounded-2xl border border-[#eeeaf3]">
                {selectedDayEvents.length===0? <p className="p-4 text-center text-[12px] text-[#9a8ea2]">No events on this day 💜</p> : selectedDayEvents.map((item:any, index:number)=>(
                  <article key={item.id||index} className={`flex gap-4 bg-white px-5 py-5 md:gap-7 md:px-7 ${index!==selectedDayEvents.length-1?'border-b border-[#eeeaf3]':''}`}>
                    <div className="flex w-12 shrink-0 flex-col items-center"><span className="ps-mono text-[9px] text-[#9a8ea2]">{item.month || MONTHS_FULL[selectedDate.getMonth()].slice(0,3).toUpperCase()}</span><span className="mt-1 text-[27px] font-semibold leading-7 tracking-[-.06em] text-[#4b3b5e]">{item.day || selectedDate.getDate()}</span><span className="mt-1 text-[9px] text-[#9a8ea2]">{item.weekday || selectedDate.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase()}</span></div>
                    <div className="min-w-0 flex-1 border-l border-[#e5dfea] pl-4 md:pl-7">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full px-2 py-1 text-[9px] font-semibold" style={{background: getTypeStyle(item.type).bg, color: getTypeStyle(item.type).text}}>{item.type}</span>
                        <span className="text-[10px] text-[#9b90a1]">{item.time}</span>
                      </div>
                      <h2 className="mt-2 text-[14px] font-semibold leading-5 text-[#3d324b]">{item.title}</h2>
                      <p className="mt-1.5 text-[11px] text-[#968a9e]">{item.location}</p>
                      {item.links?.[0] && <a href={item.links[0]} target="_blank" className="mt-2 inline-flex text-[11px] font-bold text-[#2563eb]">view official info ↝</a>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[12px] text-[#887b92]">{selectedDate? `${selectedDate.getDate()} ${MONTHS_FULL[selectedDate.getMonth()].slice(0,3)} ${selectedDate.getFullYear()} • ${selectedDayEvents.length} events` : `19 — 25 June 2025 • ${allItems.length} events`}</p>
            <button type="button" className="flex items-center gap-2 text-[11px] font-semibold text-[#704ca5]"><ListFilter size={14} /> Filter</button>
          </div>
          <div className="ps-panel overflow-hidden rounded-2xl">
            {(selectedDate? selectedDayEvents : allItems.slice(0, 10)).map((item: any, index: number, arr:any[]) => {
              const sty = getTypeStyle(item.type);
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
                    <span className="text-[10px] text-[#9b90a1]">{item.time}</span>
                  </div>
                  <h2 className="mt-2 text-[14px] font-semibold leading-5 text-[#3d324b]">{item.title}</h2>
                  <p className="mt-1.5 text-[11px] text-[#968a9e]">{item.location}</p>
                </div>
                <button type="button" className="self-center rounded-lg p-2 text-[#aaa0b0] hover:bg-[#f5f2f8] hover:text-[#704ca5]"><CalendarDays size={16} /></button>
              </article>
            )})}
          </div>
        </div>
      )}
    </div>
  );
}
