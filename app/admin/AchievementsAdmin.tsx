import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FullScreenEditor } from './Editor';
import { Pencil, Trash2, Eye, EyeOff, Plus, Save } from 'lucide-react';
import { achievementItems as defaults } from '../../components/data';

export function AchievementsAdmin(){
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ type:'RECORD', year:'2025', title:'', subtitle:'', fullInfo:'', date:'18 June 2025', link:'', contentBlocks:[], columns:1 });
  const [editingId, setEditingId] = useState<string|null>(null);
  const [isFull, setIsFull] = useState(false);

  useEffect(()=> onSnapshot(collection(db,"achievementItems"), s=> setItems(s.docs.map(d=>({id:d.id,...d.data()} as any)))), []);

  const save = async()=>{
    if(!form.title.trim()) return alert('Title required');
    if(editingId) await updateDoc(doc(db,"achievementItems",editingId), form as any);
    else await addDoc(collection(db,"achievementItems"), {...form, hidden:false, createdAt:new Date().toISOString()});
    setForm({ type:'RECORD', year:'2025', title:'', subtitle:'', fullInfo:'', date:'18 June 2025', link:'', contentBlocks:[], columns:1 });
    setEditingId(null); setIsFull(false);
  };

  if(isFull) return <FullScreenEditor form={form} setForm={setForm} onSave={save} onClose={()=>setIsFull(false)} isEditing={!!editingId}/>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h2 className="font-semibold">Achievements · {items.length+defaults.length}</h2><button onClick={()=>setIsFull(true)} className="bg-black text-white px-3 py-2 rounded-full text-[11px] flex gap-1"><Plus size={14}/> Add New</button></div>
      <div className="border p-3 rounded-xl bg-white space-y-2">
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title - BTS ranks..." className="w-full border p-2.5 rounded-xl text-[12px] font-santrio"/>
        <button onClick={()=>setIsFull(true)} className="w-full border border-black p-2.5 rounded-xl text-[12px]">Open Full Editor (pics/links)</button>
        <button onClick={save} className="w-full bg-black text-white p-2.5 rounded-xl text-[12px] flex justify-center gap-2"><Save size={14}/> Publish</button>
      </div>
      {items.map((a:any)=>(
        <div key={a.id} className="border p-3 rounded-xl bg-white flex justify-between">
          <p className="text-[12px] truncate w-[200px]">{a.title}</p>
          <div className="flex gap-1">
            <button onClick={()=>{setForm(a); setEditingId(a.id); setIsFull(true);}} className="h-8 w-8 bg-[#f5f0fb] rounded-full flex items-center justify-center"><Pencil size={12}/></button>
            <button onClick={async()=>await deleteDoc(doc(db,"achievementItems",a.id))} className="h-8 w-8 bg-[#ffe5e5] rounded-full flex items-center justify-center"><Trash2 size={12}/></button>
          </div>
        </div>
      ))}
    </div>
  );
}
