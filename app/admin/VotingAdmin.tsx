import { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Pencil, Eye, X } from 'lucide-react';

export function VotingAdmin(){
  const [items,setItems]=useState<any[]>([]);
  const [adminFilter, setAdminFilter] = useState<'all' | 'open' | 'ended' | 'upcoming'>('all');
  const [preview, setPreview] = useState<any | null>(null);
  const [form,setForm]=useState({
    title:'',
    platform:'MNET PLUS',
    link:'',
    status:'active',
    votingDate: new Date().toISOString().split('T')[0],
    startAt: '',
    endAt: '',
    description: '',
    webLink: '',
    playStoreLink: '',
    appStoreLink: '',
    voteType: 'website' as 'website' | 'app'
  });
  const [editId,setEditId]=useState<string|null>(null);

  useEffect(()=>{ const unsub=onSnapshot(collection(db,"votingItems"), s=> setItems(s.docs.map(d=>({id:d.id,...d.data()} as any)))); return ()=>unsub(); },[]);

  const save=async()=>{
    if(!form.title.trim()) return alert('Title required');
    if(!form.votingDate) return alert('Date required');
    if(editId) await updateDoc(doc(db,"votingItems",editId), form as any);
    else await addDoc(collection(db,"votingItems"), {...form, createdAt: new Date().toISOString()});
    setForm({ title:'', platform:'MNET PLUS', link:'', status:'active', votingDate: new Date().toISOString().split('T')[0], startAt: '', endAt: '', description: '', webLink: '', playStoreLink: '', appStoreLink: '', voteType: 'website' });
    setEditId(null);
  };

  const filteredAdmin = items.filter((it:any)=>{
    if(adminFilter==='all') return true;
    const s = it.status || 'active';
    if(adminFilter==='open') return s==='open' || s==='active';
    return s===adminFilter;
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-[14px]">Voting · {items.length} total</h2>
        <div className="flex gap-1">
          {(['all','open','upcoming','ended'] as const).map(f=>(
            <button key={f} onClick={()=>setAdminFilter(f)} className={`px-3 py-1 rounded-full text-[10px] capitalize border ${adminFilter===f?'bg-black text-white border-black':'bg-white border-[#e3dced] text-gray-500'}`}>{f==='open'?'Live':f}</button>
          ))}
        </div>
      </div>

      {/* DESKTOP SIDE BY SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 items-start">
        {/* LEFT - ADDING BOX */}
        <div className="border p-3 rounded-xl bg-white space-y-2 lg:sticky lg:top-4">
          <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Voting Title" className="w-full border p-2.5 rounded-xl text-[12px]"/>
          <input type="date" value={form.votingDate} onChange={e=>setForm({...form, votingDate:e.target.value})} className="w-full border p-2.5 rounded-xl text-[12px] bg-[#fafafd]"/>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-500">Start</label>
              <input type="datetime-local" value={form.startAt} onChange={e=>setForm({...form, startAt:e.target.value})} className="w-full border p-2.5 rounded-xl text-[12px]"/>
              {!form.startAt && <p className="text-[10px] text-gray-400 italic mt-1">Not Confirmed</p>}
            </div>
            <div>
              <label className="text-[10px] text-gray-500">Ends</label>
              <input type="datetime-local" value={form.endAt} onChange={e=>setForm({...form, endAt:e.target.value})} className="w-full border p-2.5 rounded-xl text-[12px]"/>
              {!form.endAt && <p className="text-[10px] text-gray-400 italic mt-1">Not Confirmed</p>}
            </div>
          </div>
          <input value={form.platform} onChange={e=>setForm({...form, platform:e.target.value})} placeholder="MNET PLUS" className="w-full border p-2.5 rounded-xl text-[12px]"/>
          <input value={form.link} onChange={e=>setForm({...form, link:e.target.value})} placeholder="Voting Link (Web Link)" className="w-full border p-2.5 rounded-xl text-[12px]"/>

          {/* NEW - Description box near Update button */}
          <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description - voting ke liye info (e.g. Daily votes, 20x at 10PM IST)" rows={3} className="w-full border p-2.5 rounded-xl text-[12px] resize-none"/>

          {/* App linking fields */}
          <div className="grid grid-cols-2 gap-2">
            <select value={form.voteType} onChange={e=>setForm({...form, voteType:e.target.value as any})} className="border p-2.5 rounded-xl text-[12px] bg-white">
              <option value="website">Website Vote</option>
              <option value="app">App Vote</option>
            </select>
            <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="border p-2.5 rounded-xl text-[12px] bg-white">
              <option value="active">active (open)</option>
              <option value="open">open</option>
              <option value="upcoming">upcoming</option>
              <option value="ended">ended</option>
            </select>
          </div>
          {form.voteType==='app' && (
            <>
              <input value={form.playStoreLink} onChange={e=>setForm({...form, playStoreLink:e.target.value})} placeholder="Play Store Link" className="w-full border p-2.5 rounded-xl text-[11px]"/>
              <input value={form.appStoreLink} onChange={e=>setForm({...form, appStoreLink:e.target.value})} placeholder="App Store Link (iOS)" className="w-full border p-2.5 rounded-xl text-[11px]"/>
            </>
          )}

          <button onClick={save} className="w-full bg-black text-white p-2.5 rounded-xl text-[12px]">{editId?'Update':'Publish'}</button>
        </div>

        {/* RIGHT - LIST WITH LIVE/UPCOMING */}
        <div className="space-y-2">
          {filteredAdmin.map((it:any)=>(
            <div key={it.id} className="border p-3 rounded-xl bg-white">
              <div className="flex justify-between">
                <p className="text-[12px] truncate w-[180px] font-medium">{it.title} · {it.platform}</p>
                <div className="flex gap-1">
                  <button onClick={()=>setPreview(it)} className="h-8 w-8 bg-[#eef2ff] rounded-full flex items-center justify-center"><Eye size={12}/></button>
                  <button onClick={()=>{setForm({
                    title: it.title || '',
                    platform: it.platform || 'MNET PLUS',
                    link: it.link || it.webLink || '',
                    status: it.status || 'active',
                    votingDate: it.votingDate || new Date().toISOString().split('T')[0],
                    startAt: it.startAt || '',
                    endAt: it.endAt || '',
                    description: it.description || '',
                    webLink: it.webLink || it.link || '',
                    playStoreLink: it.playStoreLink || '',
                    appStoreLink: it.appStoreLink || '',
                    voteType: it.voteType || 'website'
                  }); setEditId(it.id); window.scrollTo({top:0, behavior:'smooth'})}} className="h-8 w-8 bg-[#f5f0fb] rounded-full flex items-center justify-center"><Pencil size={12}/></button>
                  <button onClick={async()=>{if(confirm('Delete?')) await deleteDoc(doc(db,"votingItems",it.id))}} className="h-8 w-8 bg-[#ffe5e5] rounded-full flex items-center justify-center"><Trash2 size={12}/></button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-gray-500">
                <span>📅 {it.votingDate || 'TBD'}</span>
                <span className={`px-2 py-0.5 rounded-full ${it.status==='open' || it.status==='active'? 'bg-green-50 text-green-600' : it.status==='upcoming'? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100'}`}>{it.status}</span>
                <span>Start: {it.startAt? new Date(it.startAt).toLocaleString() : 'Not Confirmed'}</span>
                <span>End: {it.endAt? new Date(it.endAt).toLocaleString() : 'Not Confirmed'}</span>
              </div>
              {it.description && <p className="text-[11px] text-[#6b5d7d] mt-2 line-clamp-2">{it.description}</p>}
            </div>
          ))}
          {filteredAdmin.length===0 && <p className="text-[11px] text-gray-400 text-center py-10">No {adminFilter} votings</p>}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={()=>setPreview(null)}>
          <div className="bg-white rounded-2xl p-5 max-w-[420px] w-full" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-[13px]">Preview</p>
              <button onClick={()=>setPreview(null)} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button>
            </div>
            <h3 className="font-semibold text-[14px]">{preview.title}</h3>
            <p className="text-[11px] text-gray-500 mt-1">{preview.platform} · {preview.votingDate}</p>
            <p className="text-[12px] mt-3 leading-5">{preview.description || 'No description'}</p>
            <div className="mt-3 text-[10px] text-gray-500 space-y-1">
              <p>Start: {preview.startAt || 'Not Confirmed'}</p>
              <p>End: {preview.endAt || 'Not Confirmed'}</p>
              <p>Link: {preview.link || preview.webLink}</p>
              <p>Type: {preview.voteType} | Status: {preview.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
