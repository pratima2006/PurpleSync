import { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Save, Pencil } from 'lucide-react';

export function VotingAdmin(){
  const [items,setItems]=useState<any[]>([]);
  const [form,setForm]=useState({ title:'', platform:'MNET PLUS', link:'', status:'active' });
  const [editId,setEditId]=useState<string|null>(null);

  useEffect(()=>{ const unsub=onSnapshot(collection(db,"votingItems"), s=> setItems(s.docs.map(d=>({id:d.id,...d.data()} as any)))); return ()=>unsub(); },[]);

  const save=async()=>{
    if(!form.title.trim()) return alert('Title required');
    if(editId) await updateDoc(doc(db,"votingItems",editId), form as any);
    else await addDoc(collection(db,"votingItems"), {...form, createdAt: new Date().toISOString()});
    setForm({ title:'', platform:'MNET PLUS', link:'', status:'active' }); setEditId(null);
  };

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-[14px]">Voting · {items.length}</h2>
      <div className="border p-3 rounded-xl bg-white space-y-2">
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Voting Title" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        <input value={form.platform} onChange={e=>setForm({...form, platform:e.target.value})} placeholder="MNET PLUS" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        <input value={form.link} onChange={e=>setForm({...form, link:e.target.value})} placeholder="Voting Link" className="w-full border p-2.5 rounded-xl text-[12px]"/>
        <button onClick={save} className="w-full bg-black text-white p-2.5 rounded-xl text-[12px]">{editId?'Update':'Publish'}</button>
      </div>
      {items.map((it:any)=>(
        <div key={it.id} className="border p-3 rounded-xl bg-white flex justify-between">
          <p className="text-[12px] truncate w-[200px]">{it.title} · {it.platform}</p>
          <div className="flex gap-1">
            <button onClick={()=>{setForm(it); setEditId(it.id);}} className="h-8 w-8 bg-[#f5f0fb] rounded-full flex items-center justify-center"><Pencil size={12}/></button>
            <button onClick={async()=>{if(confirm('Delete?')) await deleteDoc(doc(db,"votingItems",it.id))}} className="h-8 w-8 bg-[#ffe5e5] rounded-full flex items-center justify-center"><Trash2 size={12}/></button>
          </div>
        </div>
      ))}
    </div>
  );
}
