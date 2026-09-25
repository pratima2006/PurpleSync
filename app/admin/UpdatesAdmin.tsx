import { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Save, Pencil } from 'lucide-react';

export function UpdatesAdmin(){
  const [items,setItems]=useState<any[]>([]);
  const [form,setForm]=useState({ category:'NOTICE', title:'', summary:'', date:'Today', accent:'purple', link:'' });
  const [editId,setEditId]=useState<string|null>(null);

  useEffect(()=>{ const unsub=onSnapshot(collection(db,"updates"), s=> setItems(s.docs.map(d=>({id:d.id,...d.data()} as any)))); return ()=>unsub(); },[]);

  const save=async()=>{
    if(!form.title.trim()) return alert('Title required');
    if(editId) await updateDoc(doc(db,"updates",editId), form as any);
    else await addDoc(collection(db,"updates"), {...form, createdAt: new Date().toISOString()});
    setForm({ category:'NOTICE', title:'', summary:'', date:'Today', accent:'purple', link:'' }); setEditId(null);
  };

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-[14px]">Updates · {items.length}</h2>
      <div className="border p-3 rounded-xl bg-white space-y-2">
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        <textarea value={form.summary} onChange={e=>setForm({...form, summary:e.target.value})} placeholder="Summary" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[60px]"/>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.category} onChange={e=>setForm({...form, category:e.target.value})} placeholder="NOTICE" className="border p-2.5 rounded-xl text-[12px]"/>
          <input value={form.date} onChange={e=>setForm({...form, date:e.target.value})} placeholder="Today" className="border p-2.5 rounded-xl text-[12px]"/>
        </div>
        <input value={form.link} onChange={e=>setForm({...form, link:e.target.value})} placeholder="Link" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        <button onClick={save} className="w-full bg-black text-white p-2.5 rounded-xl text-[12px]"><Save size={14} className="inline mr-1"/> {editId?'Update':'Publish'}</button>
      </div>
      {items.map((it:any)=>(
        <div key={it.id} className="border p-3 rounded-xl bg-white flex justify-between">
          <p className="text-[12px] truncate w-[200px]">{it.title}</p>
          <div className="flex gap-1">
            <button onClick={()=>{setForm(it); setEditId(it.id);}} className="h-8 w-8 bg-[#f5f0fb] rounded-full flex items-center justify-center"><Pencil size={12}/></button>
            <button onClick={async()=>{if(confirm('Delete?')) await deleteDoc(doc(db,"updates",it.id))}} className="h-8 w-8 bg-[#ffe5e5] rounded-full flex items-center justify-center"><Trash2 size={12}/></button>
          </div>
        </div>
      ))}
    </div>
  );
}
