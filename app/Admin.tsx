import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Palette, CalendarDays, ExternalLink, Trash2, Save } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

const PASSWORD = "borahae13";

type ArchiveEvent = {
  id?: string;
  date: string;
  type: 'birthday' | 'album' | 'pet' | 'army' | 'festa' | 'anniversary' | 'mv' | 'black' | 'award' | 'enlist';
  title: string;
  info: string;
  sourceUrl?: string;
  sourceName?: string;
  year?: string;
};

export function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [type, setType] = useState<'votingItems'|'palette'>('palette');

  // Palette States
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [paletteEvents, setPaletteEvents] = useState<ArchiveEvent[]>([]);
  const [form, setForm] = useState<ArchiveEvent>({ date: `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`, type: 'birthday', title: '', info: '', sourceUrl: '', sourceName: 'BigHit', year: '' });
  const [showAdd, setShowAdd] = useState(false);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(2025, currentMonth + 1, 0).getDate();

  useEffect(()=>{
    const saved = JSON.parse(localStorage.getItem('ps_admin_paletteEvents')||'[]');
    setPaletteEvents(saved);
  },[auth]);

  const getEventsForDay = (day: number) => {
    const mmdd = `${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return paletteEvents.filter(e => e.date === mmdd);
  };

  const selectedDayEvents = useMemo(()=> getEventsForDay(selectedDate), [selectedDate, currentMonth, paletteEvents]);

  const savePaletteEvent = () => {
    if(!form.title.trim() ||!form.info.trim()) return alert('Title and Info required');
    const newEvent = {...form, id: Date.now().toString(), date: `${String(currentMonth+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}` };
    const updated = [newEvent,...paletteEvents];
    localStorage.setItem('ps_admin_paletteEvents', JSON.stringify(updated));
    setPaletteEvents(updated);
    setForm({ date: newEvent.date, type: 'birthday', title: '', info: '', sourceUrl: '', sourceName: 'BigHit', year: '' });
    setShowAdd(false);
    alert(`Added for ${monthNames[currentMonth]} ${selectedDate} 🔥`);
  };

  const deletePaletteEvent = (id: string) => {
    if(!confirm('Delete this memory?')) return;
    const updated = paletteEvents.filter(e=> e.id!==id);
    localStorage.setItem('ps_admin_paletteEvents', JSON.stringify(updated));
    setPaletteEvents(updated);
  };

  if (!auth) return (
    <div className="p-10 max-w-sm mx-auto">
      <h1 className="font-semibold text-[18px]">Admin Access</h1>
      <p className="text-[12px] text-[#8e819c] mt-1">Restricted</p>
      <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full border border-[#e0d4ed] p-3 rounded-xl mt-4 outline-none focus:border-[#60438f]" />
      <button onClick={()=> pass===PASSWORD? setAuth(true): alert('Incorrect password')} className="w-full bg-[#60438f] text-white p-3 rounded-xl mt-3 font-medium">Continue</button>
    </div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold tracking-tight">Admin Panel</h1>
      </div>

      <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full border border-[#e0d4ed] p-3 rounded-xl mt-5 bg-white text-[13px]">
        <option value="palette">Palette of Memories 🎨</option>
        <option value="votingItems">Voting</option>
      </select>

      {type==='palette' && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#3d324b] flex items-center gap-2"><Palette size={16}/> Palette of Memories - {monthNames[currentMonth]}</h2>
            <button onClick={()=>setShowAdd(!showAdd)} className="flex items-center gap-1.5 bg-[#5e428f] text-white px-3.5 py-2 rounded-full text-[11px] font-medium"><Plus size={14}/> Add Memory</button>
          </div>

          {/* Calendar - Same style as app */}
          <div className="mt-4 ps-panel rounded-2xl p-4 bg-white border border-[#ece6f3]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold">{monthNames[currentMonth]} 2025</span>
              <div className="flex gap-1">
                <button onClick={()=>setCurrentMonth(m=>m>0?m-1:11)} className="rounded-lg border p-1.5">‹</button>
                <button onClick={()=>setCurrentMonth(m=>m<11?m+1:0)} className="rounded-lg border p-1.5">›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[#998ea2]">
              {['S','M','T','W','T','F','S'].map(d=> <div key={d} className="py-1">{d}</div>)}
              {Array.from({length: daysInMonth}, (_,i)=>{
                const day=i+1;
                const evs=getEventsForDay(day);
                const isSel=selectedDate===day;
                return (
                  <button key={i} onClick={()=>setSelectedDate(day)} className={`min-h-[48px] rounded-lg text-[11px] border ${isSel?'bg-[#5e428f] text-white border-[#5e428f]':'bg-[#fdfcff] border-[#f0e6f8] hover:bg-[#f5f0fb]'} ${evs.length>0 &&!isSel?'bg-[#f0e9f7]':''}`}>
                    {day}{evs.length>0 && <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-[#8d6bb7]"/>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Add Form */}
          {showAdd && (
            <div className="mt-4 border border-[#e0d4ed] rounded-2xl p-4 bg-[#fdfaff] space-y-3">
              <p className="text-[12px] font-semibold">Add Memory for {monthNames[currentMonth]} {selectedDate}</p>
              <select value={form.type} onChange={e=>setForm({...form, type: e.target.value as any})} className="w-full border p-2.5 rounded-xl text-[12px] bg-white">
                <option value="birthday">🎂 Birthday</option>
                <option value="album">💿 Album Anniversary</option>
                <option value="mv">▶️ MV Anniversary</option>
                <option value="army">💜 ARMY Day</option>
                <option value="festa">🎉 FESTA</option>
                <option value="anniversary">✨ BTS Anniversary</option>
                <option value="pet">🐾 Pet Birthday</option>
                <option value="black">🖤 Black Day</option>
              </select>
              <input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Title - ex: Jungkook Birthday" className="w-full border p-2.5 rounded-xl text-[12px]" />
              <textarea value={form.info} onChange={e=>setForm({...form, info: e.target.value})} placeholder="Short info - ex: Born 1997, Golden Maknae" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[70px]" />
              <div className="grid grid-cols-2 gap-2">
                <input value={form.year||''} onChange={e=>setForm({...form, year: e.target.value})} placeholder="Year - 1997 (optional)" className="w-full border p-2.5 rounded-xl text-[12px]" />
                <input value={form.sourceName||''} onChange={e=>setForm({...form, sourceName: e.target.value})} placeholder="Source Name - BigHit" className="w-full border p-2.5 rounded-xl text-[12px]" />
              </div>
              <input value={form.sourceUrl||''} onChange={e=>setForm({...form, sourceUrl: e.target.value})} placeholder="Official Link - https://... (optional)" className="w-full border p-2.5 rounded-xl text-[12px]" />
              <button onClick={savePaletteEvent} className="w-full bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"><Save size={14}/> Save Memory</button>
            </div>
          )}

          {/* Selected Date List - 3rd pic jaisa White box + memory boxes */}
          <div className="mt-6">
            <div className="rounded-2xl bg-white border border-[#ece6f3] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f0fb] text-[#5e428f] font-bold text-[13px]">{selectedDate}</div>
                <div>
                  <h3 className="text-[13px] font-semibold">{monthNames[currentMonth]} {selectedDate} - {selectedDayEvents.length} {selectedDayEvents.length===1?'Memory':'Memories'}</h3>
                  <p className="text-[10px] text-[#9a8ea2]">{selectedDayEvents.length===0?'No memories yet - add one!':`${selectedDayEvents.length} events on this day`}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {selectedDayEvents.length===0 && <p className="text-[11px] text-[#b8aec7] text-center py-4">Is date pe abhi koi memory nahi hai. Add Memory se jod de.</p>}
                {selectedDayEvents.map((ev,idx)=>{
                  const colors: any = { birthday: "#ec4899", album: "#d97706", pet: "#fb923c", army: "#5e428f", festa: "#8b5cf6", anniversary: "#7c3aed", mv: "#ef4444", black: "#27272a" };
                  const bg = colors[ev.type]||"#5e428f";
                  return (
                    <div key={ev.id||idx} className="flex gap-3 rounded-xl border p-3.5 bg-[#fdfcff]" style={{borderColor: `${bg}20`, backgroundColor: `${bg}0D`}}>
                      <div className="flex-1 min-w-0">
                        <span className="rounded-full px-2 py-0.5 text-[8px] font-bold text-white" style={{background: bg}}>{ev.type.toUpperCase()}</span>
                        <h4 className="mt-1 text-[12px] font-semibold">{ev.title}</h4>
                        <p className="text-[10px] text-[#7b6a93] mt-0.5">{ev.info}</p>
                        {ev.sourceUrl && <a href={ev.sourceUrl} target="_blank" className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#5e428f]">Read more on {ev.sourceName} <ExternalLink size={10}/></a>}
                      </div>
                      <button onClick={()=>deletePaletteEvent(ev.id!)} className="h-8 w-8 rounded-full bg-[#ffe5e5] text-[#ff4d4f] flex items-center justify-center shrink-0"><Trash2 size={12}/></button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#f8f5ff] p-3 text-[10px] text-[#7b6a93]">
            <p className="font-semibold">Multi-Event Colour Rule:</p>
            <p className="mt-1">• 1-4 events = har icon ka apna colour tint rahega</p>
            <p>• 5+ events = box ka colour <span className="font-bold text-[#5e428f]">Purple gradient + +N circle</span> hoga - premium lagega aur list neeche khulegi</p>
          </div>
        </>
      )}
    </div>
  );
}
