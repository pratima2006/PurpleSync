import { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Pencil, Mic, Radio, Sparkles, EyeOff } from 'lucide-react';

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function toDateStr(y:number,m:number,d:number){ return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

export function ScheduleAdmin(){
  const [items,setItems]=useState<any[]>([]);
  const [currentMonth,setCurrentMonth]=useState(()=> new Date());
  const [selectedDate,setSelectedDate]=useState<Date>(()=> new Date());
  const [form,setForm]=useState({ title:'', type:'Performance', time:'19:00 KST', location:'', links:[''], date: toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) });
  const [editId,setEditId]=useState<string|null>(null);

  useEffect(()=>{ const unsub=onSnapshot(collection(db,"scheduleItems"), s=> setItems(s.docs.map(d=>({id:d.id,...d.data()} as any)))); return ()=>unsub(); },[]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(),1).getDay();
  const dayEvents = (date:Date)=> items.filter(it=> it.date===toDateStr(date.getFullYear(), date.getMonth(), date.getDate()));

  const save=async()=>{
    if(!form.title.trim()) return alert('Title required');
    const payload = {...form, day: String(new Date(form.date).getDate()), month: SHORT[new Date(form.date).getMonth()], weekday: ["SUN","MON","TUE","WED","THU","FRI","SAT"][new Date(form.date).getDay()], year: new Date(form.date).getFullYear(), links: form.links.filter(Boolean), createdAt: new Date().toISOString() };
    if(editId) await updateDoc(doc(db,"scheduleItems",editId), payload as any);
    else await addDoc(collection(db,"scheduleItems"), payload as any);
    setForm({ title:'', type:'Performance', time:'19:00 KST', location:'', links:[''], date: form.date }); setEditId(null);
  };

  const selectedList = dayEvents(selectedDate);

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-[14px]">Schedule · {items.length} · Calendar View</h2>

      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 flex justify-between"><h3 className="font-semibold">{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3><div className="flex gap-1"><button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1,1))} className="rounded border px-2">{"<"}</button><button onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1,1))} className="rounded border px-2">{">"}</button></div></div>
        <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
          {['S','M','T','W','T','F','S'].map(d=><div key={d} className="py-1">{d}</div>)}
          {Array.from({length:startDay}).map((_,i)=><div key={'e'+i}/>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i+1);
            const ev = dayEvents(d);
            const isSel = d.toDateString()===selectedDate.toDateString();
            return <button key={i} onClick={()=>{setSelectedDate(d); setForm(f=>({...f, date: toDateStr(d.getFullYear(), d.getMonth(), d.getDate())}))}} className={`h-10 rounded-lg ${isSel?'bg-black text-white': ev.length?'bg-[#ede4ff] text-[#6d38c2]':'bg-[#f5f5f5]'}`}>{i+1}{ev.length>0 && <div className="mx-auto mt-0.5 h-1 w-1 rounded-full bg-[#8b5cf6]"/>}</button>
          })}
        </div>
      </div>

      <div className="border p-4 rounded-xl bg-white space-y-3">
        <p className="text-[12px] font-semibold">Add / Edit for {form.date} {editId && '(Editing)'}</p>
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title - e.g. BTS ARIRANG Live Viewing" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        <div className="grid grid-cols-2 gap-2">
          <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} className="border p-2.5 rounded-xl text-[12px]"><option>Performance</option><option>Broadcast</option><option>Content</option><option>Others</option></select>
          <input value={form.time} onChange={e=>setForm({...form, time:e.target.value})} placeholder="19:00 KST" className="border p-2.5 rounded-xl text-[12px]"/>
        </div>
        <input value={form.location} onChange={e=>setForm({...form, location:e.target.value})} placeholder="Location - e.g. Worldwide Cinemas" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        {form.links.map((l,i)=><input key={i} value={l} onChange={e=>{ const nl=[...form.links]; nl[i]=e.target.value; if(i===nl.length-1 && e.target.value) nl.push(''); setForm({...form, links:nl}); }} placeholder="https://official link" className="w-full border p-2.5 rounded-xl text-[12px]"/>)}
        <button onClick={save} className="w-full bg-black text-white p-2.5 rounded-xl text-[12px]">{editId?'Update Event':'Publish to Calendar'}</button>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] text-[#887b92]">Events on {selectedDate.toDateString()} - Click date to add</p>
        {selectedList.map((it:any)=>(
          <div key={it.id} className="border p-3 rounded-xl bg-white flex justify-between items-start">
            <div><p className="text-[12px] font-semibold">{it.title}</p><p className="text-[10px] text-[#888]">{it.type} · {it.time} {it.hidden?'(Hidden)':''}</p>{it.links?.[0] && <a href={it.links[0]} target="_blank" className="text-[11px] text-blue-600">view official info ↝</a>}</div>
            <div className="flex gap-1">
              <button onClick={()=>{setForm({title:it.title, type:it.type, time:it.time, location:it.location||'', links: it.links?.length? [...it.links,''] : [''], date: it.date}); setEditId(it.id);}} className="h-8 w-8 bg-[#f5f0fb] rounded-full flex items-center justify-center"><Pencil size={12}/></button>
              <button onClick={async()=>{await updateDoc(doc(db,"scheduleItems",it.id), {hidden:!it.hidden} as any)}} className="h-8 w-8 bg-[#eef4ff] rounded-full flex items-center justify-center"><EyeOff size={12}/></button>
              <button onClick={async()=>{if(confirm('Delete?')) await deleteDoc(doc(db,"scheduleItems",it.id))}} className="h-8 w-8 bg-[#ffe5e5] rounded-full flex items-center justify-center"><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
