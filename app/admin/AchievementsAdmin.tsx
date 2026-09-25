import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FullScreenEditor } from './Editor';
import { Pencil, Trash2, Eye, EyeOff, Plus, Save } from 'lucide-react';
import { achievementItems as defaults } from '../../components/data';

export function AchievementsAdmin(){
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    type:'RECORD',
    year:'2025',
    title:'',
    subtitle:'',
    fullInfo:'',
    date:'18 June 2025',
    link:'',
    contentBlocks:[] as any[],
    columns:1
  });
  const [editingId, setEditingId] = useState<string|null>(null);
  const [isFull, setIsFull] = useState(false);

  useEffect(()=> {
    const unsub = onSnapshot(collection(db,"achievementItems"), s=> setItems(s.docs.map(d=>({id:d.id,...d.data()} as any))));
    return ()=> unsub();
  }, []);

  const save = async()=>{
    if(!form.title.trim()) return alert('Title required');
    if(editingId){
      await updateDoc(doc(db,"achievementItems",editingId), form as any);
    } else {
      await addDoc(collection(db,"achievementItems"), {...form, hidden:false, createdAt:new Date().toISOString()});
    }
    setForm({ type:'RECORD', year:'2025', title:'', subtitle:'', fullInfo:'', date:'18 June 2025', link:'', contentBlocks:[], columns:1 });
    setEditingId(null);
    setIsFull(false);
  };

  const toggleHide = async(item:any)=>{
    await updateDoc(doc(db,"achievementItems", item.id), { hidden:!item.hidden });
  };

  if(isFull) return <FullScreenEditor form={form} setForm={setForm} onSave={save} onClose={()=>{ setIsFull(false); setEditingId(null); }} isEditing={!!editingId}/>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-[14px]">Achievements · {items.length+defaults.length} total</h2>
        <button onClick={()=>setIsFull(true)} className="bg-black text-white px-3 py-2 rounded-full text-[11px] flex gap-1.5 items-center"><Plus size={14}/> Add New Archive</button>
      </div>

      <div className="border p-3 rounded-xl bg-white space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input value={form.type} onChange={e=>setForm({...form, type:e.target.value})} placeholder="Type - RECORD" className="w-full border p-2.5 rounded-xl text-[12px]" />
          <input value={form.year} onChange={e=>setForm({...form, year:e.target.value})} placeholder="Year - 2025" className="w-full border p-2.5 rounded-xl text-[12px]" />
        </div>
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title - BTS ranks No. 1 in tour revenue with ARIRANG." className="w-full border p-2.5 rounded-xl text-[12px] font-santrio font-medium" />
        <textarea value={form.subtitle} onChange={e=>setForm({...form, subtitle:e.target.value})} placeholder="Subtitle" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[60px]" />
        <div className="grid grid-cols-2 gap-2">
          <input value={form.date} onChange={e=>setForm({...form, date:e.target.value})} placeholder="Date - 18 June 2025" className="border p-2.5 rounded-xl text-[12px]" />
          <input value={form.link} onChange={e=>setForm({...form, link:e.target.value})} placeholder="Official Link" className="border p-2.5 rounded-xl text-[12px]" />
        </div>
        <button onClick={()=>setIsFull(true)} className="w-full border border-black p-2.5 rounded-xl text-[12px] font-medium">Open Full Screen Editor for Pics & Links (Desktop Full Box)</button>
        <button onClick={save} className="w-full bg-black text-white p-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"><Save size={14}/> {editingId?'Update':'Publish'}</button>
      </div>

      <div className="space-y-2">
        {items.map((a:any)=>(
          <div key={a.id} className={`flex gap-3 border rounded-xl p-3 bg-white ${a.hidden?'opacity-50':''}`}>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate">{a.title}</p>
              <p className="text-[10px] text-[#8e819c] truncate">{a.subtitle}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={()=>{setForm(a); setEditingId(a.id); setIsFull(true);}} className="h-8 w-8 rounded-full bg-[#f5f0fb] flex items-center justify-center"><Pencil size={12}/></button>
              <button onClick={()=>toggleHide(a)} className="h-8 w-8 rounded-full bg-[#f5f0fb] flex items-center justify-center">{a.hidden?<EyeOff size={12}/>:<Eye size={12}/>}</button>
              <button onClick={async()=>{ if(confirm('Delete?')) await deleteDoc(doc(db,"achievementItems",a.id)) }} className="h-8 w-8 rounded-full bg-[#ffe5e5] flex items-center justify-center"><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
