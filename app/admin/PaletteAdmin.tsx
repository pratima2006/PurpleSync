import { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Plus, Save, Pencil } from 'lucide-react';

export function PaletteAdmin(){
  const [items,setItems]=useState<any[]>([]);
  const [form,setForm]=useState({ date:'', type:'birthday', title:'', info:'', month: new Date().getMonth() });
  const [editId,setEditId]=useState<string|null>(null);

  useEffect(()=>{ const unsub=onSnapshot(collection(db,"paletteEvents"), s=> setItems(s.docs.map(d=>({id:d.id,...d.data()} as any)))); return ()=>unsub(); },[]);

  const save=async()=>{
    if(!form.title.trim()) return alert('Title required');
    if(editId) await updateDoc(doc(db,"paletteEvents",editId), form as any);
    else await addDoc(collection(db,"paletteEvents"), {...form, createdAt: new Date().toISOString()});
    setForm({ date:'', type:'birthday', title:'', info:'', month: new Date().getMonth() }); setEditId(null);
  };

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-[14px]">Palette of Memories · {items.length}</h2>
      <div className="border p-3 rounded-xl bg-white space-y-2">
        <input value={form.date} onChange={e=>setForm({...form, date:e.target.value})} placeholder="Date - 2025-09-12" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} className="w-full border p-2.5 rounded-xl text-[12px]"><option value="birthday">birthday</option><option value="anniversary">anniversary</option><option value="release">release</option><option value="event">event</option></select>
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        <textarea value={form.info} onChange={e=>setForm({...form, info:e.target.value})} placeholder="Info" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[60px]"/>
        <button onClick={save} className="w-full bg-black text-white p-2.5 rounded-xl text-[12px] flex justify-center gap-2"><Save size={14}/> {editId?'Update':'Publish'}</button>
      </div>
      <div className="space-y-2">
        {items.map((it:any)=>(
          <div key={it.id} className="border p-3 rounded-xl bg-white flex justify-between items-center">
            <div><p className="text-[12px] font-medium">{it.title}</p><p className="text-[10px] text-[#8e819c]">{it.date} · {it.type}</p></div>
            <div className="flex gap-1">
              <button onClick={()=>{setForm(it); setEditId(it.id);}} className="h-8 w-8 bg-[#f5f0fb] rounded-full flex items-center justify-center"><Pencil size={12}/></button>
              <button onClick={async()=>{if(confirm('Delete?')) await deleteDoc(doc(db,"paletteEvents",it.id))}} className="h-8 w-8 bg-[#ffe5e5] rounded-full flex items-center justify-center"><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
