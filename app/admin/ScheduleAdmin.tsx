import { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Pencil } from 'lucide-react';

export function ScheduleAdmin(){
  const [items,setItems]=useState<any[]>([]);
  const [form,setForm]=useState({ day:'20', month:'JUN', weekday:'FRI', type:'Broadcast', time:'19:00 KST', title:'', location:'' });
  const [editId,setEditId]=useState<string|null>(null);

  useEffect(()=>{ const unsub=onSnapshot(collection(db,"scheduleItems"), s=> setItems(s.docs.map(d=>({id:d.id,...d.data()} as any)))); return ()=>unsub(); },[]);

  const save=async()=>{
    if(!form.title.trim()) return alert('Title required');
    if(editId) await updateDoc(doc(db,"scheduleItems",editId), form as any);
    else await addDoc(collection(db,"scheduleItems"), {...form, createdAt: new Date().toISOString()});
    setForm({ day:'20', month:'JUN', weekday:'FRI', type:'Broadcast', time:'19:00 KST', title:'', location:'' }); setEditId(null);
  };

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-[14px]">Schedule · {items.length}</h2>
      <div className="border p-3 rounded-xl bg-white space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <input value={form.day} onChange={e=>setForm({...form, day:e.target.value})} placeholder="20" className="border p-2.5 rounded-xl text-[12px]"/>
          <input value={form.month} onChange={e=>setForm({...form, month:e.target.value})} placeholder="JUN" className="border p-2.5 rounded-xl text-[12px]"/>
          <input value={form.weekday} onChange={e=>setForm({...form, weekday:e.target.value})} placeholder="FRI" className="border p-2.5 rounded-xl text-[12px]"/>
        </div>
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        <input value={form.location} onChange={e=>setForm({...form, location:e.target.value})} placeholder="Location" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        <button onClick={save} className="w-full bg-black text-white p-2.5 rounded-xl text-[12px]">{editId?'Update':'Publish'}</button>
      </div>
      {items.map((it:any)=>(
        <div key={it.id} className="border p-3 rounded-xl bg-white flex justify-between">
          <p className="text-[12px] truncate w-[200px]">{it.title} · {it.day} {it.month}</p>
          <div className="flex gap-1">
            <button onClick={()=>{setForm(it); setEditId(it.id);}} className="h-8 w-8 bg-[#f5f0fb] rounded-full flex items-center justify-center"><Pencil size={12}/></button>
            <button onClick={async()=>{if(confirm('Delete?')) await deleteDoc(doc(db,"scheduleItems",it.id))}} className="h-8 w-8 bg-[#ffe5e5] rounded-full flex items-center justify-center"><Trash2 size={12}/></button>
          </div>
        </div>
      ))}
    </div>
  );
}
