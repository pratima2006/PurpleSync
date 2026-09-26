import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronRight, ListFilter, Mic, Radio, FileText, Sparkles, RotateCcw } from 'lucide-react';
import { scheduleItems as defaultScheduleItems } from '../components/data';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

type EventType = 'Performance' | 'Broadcast' | 'Content' | 'Others';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS: any = {JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11};

function parseItemDate(item:any): Date | null {
  if(item.date){
    const d = new Date(item.date);
    if(!isNaN(d.getTime())) return d;
  }
  if(item.day && item.month){
    let m = SHORT_MONTHS[item.month?.toUpperCase()];
    if(m===undefined) m = new Date().getMonth();
    const y = item.year || 2026;
    const d = new Date(y, m, parseInt(item.day));
    if(!isNaN(d.getTime())) return d;
  }
  return null;
}

function isSameDay(a:Date,b:Date){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

export function Schedule() {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [allItems, setAllItems] = useState<any[]>(defaultScheduleItems);
  const [currentMonth, setCurrentMonth] = useState(()=> new Date(2026,5,1)); // June 2026
  const [selectedDate, setSelectedDate] = useState<Date>(()=> new Date());
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [tempYear, setTempYear] = useState(2026);
  const [tempMonth, setTempMonth] = useState(5);

  useEffect(()=>{
    const unsub = onSnapshot(collection(db, "scheduleItems"), (snap) => {
      const fb = snap.docs.map(d => ({ id: d.id,...d.data() } as any)).filter((x:any)=>!x.hidden);
      setAllItems(fb.length>0? [...fb,...defaultScheduleItems] : defaultScheduleItems);
    });
    return ()=>unsub();
  }, []);

  const today = new Date();
  const isNotTodayMonth = currentMonth.getMonth()!==today.getMonth() || currentMonth.getFullYear()!==today.getFullYear();

  const monthItems = useMemo(()=>{
    return allItems.map(it=>({it, d: parseItemDate(it)})).filter(x=>x.d && x.d.getMonth()===currentMonth.getMonth() && x.d.getFullYear()===currentMonth.getFullYear());
  },[allItems, currentMonth]);

  const weekItems = useMemo(()=>{
    const base = selectedDate || today;
    const start = new Date(base); start.setDate(base.getDate()-start.getDay());
    const end = new Date(start); end.setDate(start.getDate()+6);
    return allItems.map(it=>({it, d: parseItemDate(it)})).filter(x=> x.d && x.d>=start && x.d<=end).sort((a,b)=>a.d!.getTime()-b.d!.getTime());
  },[allItems, selectedDate]);

  const selectedDayItems = useMemo(()=>{
    if(!selectedDate) return [];
    return allItems.filter(it=>{
      const d = parseItemDate(it);
      return d && isSameDay(d, selectedDate);
    });
  },[allItems, selectedDate]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(),1).getDay();

  const getTypeStyle = (type:string)=>{
    const t = type?.toLowerCase();
    if(t?.includes('perform')) return { bg:'bg-[#ede4ff]', text:'text-[#6d38c2]', dot:'bg-[#8b5cf6]', icon: Mic, bright:'#8b5cf6' };
    if(t?.includes('broadcast')) return { bg:'bg-[#dbeafe]', text:'text-[#1d4ed8]', dot:'bg-[#3b82f6]', icon: Radio, bright:'#3b82f6' };
    return { bg:'bg-[#e0f2fe]', text:'text-[#0369a1]', dot:'bg-[#0ea5e9]', icon: Sparkles, bright:'#0ea5e9' };
  };

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      <style>{`
        @keyframes mic-tilt { 0%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} 100%{transform:rotate(-8deg)} }
       .mic-animate{ animation: mic-tilt 1.8s ease-in-out infinite; }
      `}</style>

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="ps-mono text-[9px] text-[#8068a9]">THE RUN OF SHOW</p>
          <h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">What’s<br/><em className="text-[#704ca5]">ahead.</em></h1>
        </div>
        <div className="flex rounded-xl border border-[#ded7e9] bg-white p-1">
          <button onClick={()=>setView('week')} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${view==='week'?'bg-[#60438f] text-white':'text-[#887b92]'}`}>This week</button>
          <button onClick={()=>setView('month')} className={`rounded-lg px-4 py-2 text-[11px] font-medium ${view==='month'?'bg-[#60438f] text-white':'text-[#887b92]'}`}>{MONTHS[currentMonth.getMonth()].slice(0,3)} {currentMonth.getFullYear()}</button>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="ps-panel mt-10 rounded-2xl p-5 md:p-7">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-[#3d324b] capitalize">{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
            <button onClick={()=>{setTempYear(currentMonth.getFullYear()); setTempMonth(currentMonth.getMonth()); setAdjustOpen(!adjustOpen)}} className="ml-2 rounded-lg bg-[#eef4ff] px-3 py-1 text-[11px] font-semibold text-[#2563eb]">Adjust</button>
          </div>
          <div className="flex items-center gap-1">
            {isNotTodayMonth && (
              <button onClick={()=>{setCurrentMonth(new Date(today.getFullYear(), today.getMonth(),1)); setSelectedDate(today)}} className="mr-2 flex items-center gap-1 rounded-lg border border-[#e3dce9] px-2 py-1.5 text-[10px] text-[#704ca5]"><RotateCcw size={12}/>Reset</button>
            )}
            <button onClick={()=> setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1,1))} className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e]"><ChevronRight size={15} className="rotate-180"/></button>
            <button onClick={()=> setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,1))} className="rounded-lg border border-[#e3dce9] p-2 text-[#82758e]"><ChevronRight size={15}/></button>
          </div>
        </div>

        {adjustOpen && (
          <div className="mb-5 flex gap-3 rounded-xl border border-[#e0d8ed] bg-[#f8f5ff] p-4">
            <div className="flex-1">
              <p className="ps-mono text-[9px]">YEAR</p>
              <select value={tempYear} onChange={e=>setTempYear(parseInt(e.target.value))} className="mt-1 w-full rounded-lg border p-2 text-[13px]">
                {Array.from({length:18},(_,i)=>2013+i).map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <p className="ps-mono text-[9px]">MONTH</p>
              <select value={tempMonth} onChange={e=>setTempMonth(parseInt(e.target.value))} className="mt-1 w-full rounded-lg border p-2 text-[13px]">
                {MONTHS.map((m,i)=><option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <button onClick={()=>{setCurrentMonth(new Date(tempYear,tempMonth,1)); setSelectedDate(new Date(tempYear,tempMonth,1)); setAdjustOpen(false)}} className="self-end rounded-lg bg-[#60438f] px-4 py-2 text-[12px] text-white">Go</button>
          </div>
        )}

        <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[#998ea2]">
          {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=><div key={d} className="py-2 ps-mono">{d}</div>)}
          {Array.from({length:startDay}).map((_,i)=><div key={'e'+i}/>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const dateNum = i+1;
            const thisDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dateNum);
            const dayEvents = monthItems.filter(x=> x.d && x.d.getDate()===dateNum);
            const isSelected = selectedDate && isSameDay(thisDate, selectedDate);
            const isToday = isSameDay(thisDate, today);
            const hasPerf = dayEvents.some(x=> x.it.type?.toLowerCase().includes('perform'));
            const hasBroad = dayEvents.some(x=> x.it.type?.toLowerCase().includes('broadcast'));
            return (
              <button key={dateNum} onClick={()=>setSelectedDate(thisDate)} className={`min-h-16 rounded-lg p-2 text-left text-[11px] border transition-all ${isSelected?'border-[#60438f] bg-[#f5f0ff]':'border-transparent'} ${isToday?'ring-1 ring-[#8b5cf6]':''} ${dayEvents.length>0? (hasPerf?'bg-[#f0e9f7] font-semibold text-[#634493]':'bg-[#dbeafe] text-[#1e40af]') : 'text-[#84798e] hover:bg-[#f8f5fb]'}`}>
                <span className="flex justify-between">{dateNum} {dayEvents.length>0 && <span className={`h-1.5 w-1.5 rounded-full ${hasPerf?'bg-[#8b5cf6]': hasBroad?'bg-[#3b82f6]':'bg-[#0ea5e9]'}`}/>}</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {dayEvents.slice(0,2).map((ev,k)=>{
                    const st = getTypeStyle(ev.it.type);
                    return <st.icon key={k} size={10} className={`${st.text} ${st.icon===Mic?'mic-animate':''}`}/>;
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* THIS WEEK / SELECTED DATE BOX */}
      <div className="mt-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[12px] text-[#887b92]">
            {selectedDate &&!isSameDay(selectedDate, today)? `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()].slice(0,3)} ${selectedDate.getFullYear()} · ${selectedDayItems.length} events` : `${new Date().toLocaleDateString()} • This Week · ${weekItems.length} events`}
          </p>
          <button className="flex items-center gap-2 text-[11px] font-semibold text-[#704ca5]"><ListFilter size={14}/>Filter</button>
        </div>
        <div className="ps-panel overflow-hidden rounded-2xl">
          {(selectedDate &&!isSameDay(selectedDate, today)? selectedDayItems : weekItems.map(x=>x.it)).length===0? (
            <p className="p-6 text-center text-[12px] text-[#9a8ea2]">No events this week 💜</p>
          ) : (
            (selectedDate &&!isSameDay(selectedDate, today)? selectedDayItems : weekItems.map(x=>x.it)).map((item:any, index:number, arr:any[])=>{
              const st = getTypeStyle(item.type);
              const Icon = st.icon;
              return (
                <article key={item.id || index} className={`flex gap-4 px-5 py-5 md:gap-7 md:px-7 ${index!==arr.length-1?'border-b border-[#eeeaf3]':''}`}>
                  <div className="flex w-12 shrink-0 flex-col items-center">
                    <span className="ps-mono text-[9px] text-[#9a8ea2]">{item.month || MONTHS[parseItemDate(item)?.getMonth()||0]?.slice(0,3).toUpperCase()}</span>
                    <span className="mt-1 text-[27px] font-semibold leading-7 tracking-[-.06em] text-[#4b3b5e]">{item.day || parseItemDate(item)?.getDate()}</span>
                    <span className="mt-1 text-[9px] text-[#9a8ea2]">{item.weekday || ''}</span>
                  </div>
                  <div className="min-w-0 flex-1 border-l border-[#e5dfea] pl-4 md:pl-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${st.bg} ${st.text}`}><Icon size={10} className={Icon===Mic?'mic-animate':''}/>{item.type}</span>
                      <span className="text-[10px] text-[#9b90a1]">{item.time}</span>
                    </div>
                    <h2 className="mt-2 text-[14px] font-semibold leading-5 text-[#3d324b]">{item.title}</h2>
                    <p className="mt-1.5 text-[11px] text-[#968a9e]">{item.location}</p>
                    {selectedDate && item.links?.[0] && (
                      <a href={item.links[0]} target="_blank" className="mt-2 inline-flex text-[11px] font-semibold text-[#2563eb]">view official info ↝</a>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
