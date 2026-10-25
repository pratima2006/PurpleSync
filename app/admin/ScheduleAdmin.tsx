import { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Pencil, EyeOff, Clock, Calendar as CalendarIcon } from 'lucide-react';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function toDateStr(y:number,m:number,d:number){ return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

export function ScheduleAdmin(){
  const [items,setItems]=useState<any[]>([]);
  const [currentMonth,setCurrentMonth]=useState(()=> new Date());
  const [selectedDate,setSelectedDate]=useState<Date>(()=> new Date());
  const [form,setForm]=useState({ title:'', type:'Performance', time:'19:00 KST', location:'', links:[''], date: toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) });
  const [editId,setEditId]=useState<string|null>(null);

  const [seoulTime, setSeoulTime] = useState('');

  useEffect(()=>{ 
    const unsub=onSnapshot(collection(db,"scheduleItems"), s=> setItems(s.docs.map(d=>({id:d.id,...d.data()} as any)))); 
    return ()=>unsub(); 
  },[]);

  useEffect(() => {
    const updateSeoulClock = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Seoul',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).format(new Date());
        setSeoulTime(timeStr);
      } catch {
        setSeoulTime('');
      }
    };
    updateSeoulClock();
    const interval = setInterval(updateSeoulClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(),1).getDay();
  const dayEvents = (date:Date)=> items.filter(it=> it.date===toDateStr(date.getFullYear(), date.getMonth(), date.getDate()));

  const save = async () => {
    if(!form.title.trim()) return alert('Title required');
    try {
      const parts = form.date.split('-');
      const evYear = parseInt(parts[0]) || new Date().getFullYear();
      const evMonthIdx = (parseInt(parts[1])-1) || new Date().getMonth();
      const evDayNum = parseInt(parts[2]) || new Date().getDate();
      const evDateObj = new Date(evYear, evMonthIdx, evDayNum);

      const payload = {
        title: form.title,
        type: form.type,
        time: form.time,
        location: form.location,
        date: form.date,
        day: String(evDayNum),
        month: SHORT[evMonthIdx],
        weekday: ["SUN","MON","TUE","WED","THU","FRI","SAT"][evDateObj.getDay()],
        year: evYear,
        links: form.links.filter(Boolean),
        createdAt: new Date().toISOString(),
        hidden: false
      };

      if(editId) {
        await updateDoc(doc(db,"scheduleItems",editId), payload);
      } else {
        await addDoc(collection(db,"scheduleItems"), payload);
      }
      
      setForm({ title:'', type:'Performance', time:'19:00 KST', location:'', links:[''], date: form.date }); 
      setEditId(null);
      alert('Successfully published to Calendar!');
    } catch (err) {
      console.error(err);
      alert('Failed to publish. Check console.');
    }
  };

  const selectedList = dayEvents(selectedDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="font-bold text-[18px] text-[#3d324b]">Schedule Admin · {items.length} Events</h2>
          <p className="text-[11px] text-[#887b92]">Manage global BTS schedule and calendar sync</p>
        </div>
        <div className="flex items-center gap-2 bg-[#f8f5ff] border border-[#ded7e9] px-3.5 py-2 rounded-xl text-[12px] font-medium text-[#60438f] shadow-sm">
          <Clock size={14} className="text-[#8b5cf6]" />
          <span>Seoul (KST) Live: <strong className="font-bold">{seoulTime || 'Loading...'}</strong></span>
        </div>
      </div>

      {/* Main Grid Layout: Left Calendar, Right Form & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Calendar Picker */}
        <div className="lg:col-span-5 rounded-2xl border border-[#ded7e9] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-[14px] text-[#3d324b] flex items-center gap-2">
              <CalendarIcon size={16} className="text-[#7c3aed]"/>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex gap-1">
              <button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1,1))} className="rounded-lg border border-[#e3dce9] px-2.5 py-1 text-[12px] hover:bg-gray-50">{"<"}</button>
              <button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,1))} className="rounded-lg border border-[#e3dce9] px-2.5 py-1 text-[12px] hover:bg-gray-50">{">"}</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-[11px] text-center font-bold text-[#887b92] mb-1">
            {['S','M','T','W','T','F','S'].map(d=><div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-[12px]">
            {Array.from({length:startDay}).map((_,i)=><div key={'e'+i}/>)}
            {Array.from({length:daysInMonth},(_,i)=>{
              const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i+1);
              const ev = dayEvents(d);
              const isSel = d.toDateString()===selectedDate.toDateString();
              return (
                <button 
                  key={i} 
                  onClick={()=>{
                    setSelectedDate(d); 
                    setForm(f=>({...f, date: toDateStr(d.getFullYear(), d.getMonth(), d.getDate())}))
                  }} 
                  className={`h-11 rounded-xl flex flex-col items-center justify-center transition font-medium ${
                    isSel ? 'bg-[#7c3aed] text-white shadow-md' : 
                    ev.length ? 'bg-[#ede4ff] text-[#6d38c2] border border-[#d8b4fe]' : 'bg-[#f9f9fb] text-[#4b3b5e] hover:bg-[#f0eaf8]'
                  }`}
                >
                  <span>{i+1}</span>
                  {ev.length>0 && <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#7c3aed]"/>}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t text-[11px] text-[#887b92]">
            Selected Date: <strong className="text-[#3d324b]">{form.date}</strong>
          </div>
        </div>

        {/* RIGHT COLUMN: Add/Edit Form & Day Events List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-[#ded7e9] p-5 rounded-2xl bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-[13px] text-[#3d324b]">
                {editId ? 'Edit Event' : 'Add New Event'} <span className="text-[#7c3aed] font-normal">({form.date})</span>
              </h3>
              {editId && (
                <button onClick={()=>{setEditId(null); setForm({ title:'', type:'Performance', time:'19:00 KST', location:'', links:[''], date: form.date });}} className="text-[11px] text-red-500 font-semibold">Cancel Edit</button>
              )}
            </div>

            <input 
              value={form.title} 
              onChange={e=>setForm({...form, title:e.target.value})} 
              placeholder="Title - e.g. BTS ARIRANG Live Viewing" 
              className="w-full border border-[#ded7e9] p-3 rounded-xl text-[12px] outline-none focus:border-[#7c3aed]"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select 
                value={form.type} 
                onChange={e=>setForm({...form, type:e.target.value})} 
                className="border border-[#ded7e9] p-3 rounded-xl text-[12px] outline-none focus:border-[#7c3aed] bg-white"
              >
                <option value="Performance">Performance</option>
                <option value="Broadcast">Broadcast</option>
                <option value="Content">Content</option>
                <option value="Others">Others</option>
              </select>
              <input 
                value={form.time} 
                onChange={e=>setForm({...form, time:e.target.value})} 
                placeholder="19:00 KST" 
                className="border border-[#ded7e9] p-3 rounded-xl text-[12px] outline-none focus:border-[#7c3aed]"
              />
            </div>

            <input 
              value={form.location} 
              onChange={e=>setForm({...form, location:e.target.value})} 
              placeholder="Location - e.g. Estadio Único de La Plata [America/Argentina]" 
              className="w-full border border-[#ded7e9] p-3 rounded-xl text-[12px] outline-none focus:border-[#7c3aed]"
            />

            {form.links.map((l,i)=>(
              <input 
                key={i} 
                value={l} 
                onChange={e=>{ 
                  const nl=[...form.links]; 
                  nl[i]=e.target.value; 
                  if(i===nl.length-1 && e.target.value) nl.push(''); 
                  setForm({...form, links:nl}); 
                }} 
                placeholder="https://official link" 
                className="w-full border border-[#ded7e9] p-3 rounded-xl text-[12px] outline-none focus:border-[#7c3aed]"
              />
            ))}

            <button 
              onClick={save} 
              className="w-full bg-[#7c3aed] hover:bg-[#6d38c2] text-white p-3 rounded-xl font-bold text-[12px] transition shadow-sm"
            >
              {editId ? 'Update Event in Calendar' : 'Publish to Calendar'}
            </button>
          </div>

          {/* Events on Selected Date */}
          <div className="border border-[#ded7e9] p-5 rounded-2xl bg-white shadow-sm space-y-3">
            <p className="text-[12px] font-bold text-[#3d324b]">Events on {selectedDate.toDateString()} ({selectedList.length})</p>
            {selectedList.length === 0 ? (
              <p className="text-[11px] text-[#887b92] py-4 text-center">No events scheduled for this date.</p>
            ) : (
              selectedList.map((it:any)=>(
                <div key={it.id} className="border border-[#eeeaf3] p-3.5 rounded-xl bg-[#faf8ff] flex justify-between items-start">
                  <div>
                    <p className="text-[12px] font-bold text-[#3d324b]">{it.title}</p>
                    <p className="text-[10px] text-[#7c3aed] font-semibold mt-0.5">{it.type} · {it.time} {it.hidden?'(Hidden)':''}</p>
                    {it.location && <p className="text-[10px] text-gray-500 mt-0.5">{it.location}</p>}
                    {it.links?.[0] && <a href={it.links[0]} target="_blank" className="text-[11px] text-blue-600 font-medium inline-block mt-1">view official info ↝</a>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={()=>{setForm({title:it.title, type:it.type, time:it.time, location:it.location||'', links: it.links?.length? [...it.links,''] : [''], date: it.date}); setEditId(it.id);}} className="h-8 w-8 bg-white border rounded-lg flex items-center justify-center text-[#7c3aed] hover:bg-[#f5f0fb]"><Pencil size={12}/></button>
                    <button onClick={async()=>{await updateDoc(doc(db,"scheduleItems",it.id), {hidden:!it.hidden} as any)}} className="h-8 w-8 bg-white border rounded-lg flex items-center justify-center text-blue-600 hover:bg-[#eef4ff]"><EyeOff size={12}/></button>
                    <button onClick={async()=>{if(confirm('Delete event?')) await deleteDoc(doc(db,"scheduleItems",it.id))}} className="h-8 w-8 bg-white border rounded-lg flex items-center justify-center text-red-600 hover:bg-[#ffe5e5]"><Trash2 size={12}/></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
