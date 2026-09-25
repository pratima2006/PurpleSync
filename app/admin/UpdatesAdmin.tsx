import { useEffect, useState, useMemo } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Save, Pencil, Eye, EyeOff, Plus, Link2, X } from 'lucide-react';

type UpdateCategory = 'NOTICE' | 'RELEASE' | 'BROADCAST' | 'COMMUNITY';
const CATS: UpdateCategory[] = ['NOTICE','RELEASE','BROADCAST','COMMUNITY'];
const ALL_TABS = ['All',...CATS] as const;

export function UpdatesAdmin(){
  const [items,setItems]=useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<typeof ALL_TABS[number]>('All');
  const [form,setForm]=useState({
    category:'NOTICE' as UpdateCategory,
    title:'',
    summary:'',
    fullInfo:'',
    date: new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase(),
    accent:'purple',
    links:[''] as string[],
    hidden:false
  });
  const [editId,setEditId]=useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"updates"), s=> setItems(s.docs.map(d=>({id:d.id,...d.data()} as any))));
    return ()=>unsub();
  },[]);

  // DATE KE HISAB SE SORTING - dono admin & app me same
  const sortedItems = useMemo(()=>{
    return [...items].sort((a,b)=>{
      const da = new Date(a.date || a.createdAt).getTime();
      const db2 = new Date(b.date || b.createdAt).getTime();
      return db2 - da;
    });
  }, [items]);

  const filteredItems = useMemo(()=>{
    if(activeTab==='All') return sortedItems;
    return sortedItems.filter((it:any)=> (it.category||'').toUpperCase()===activeTab);
  }, [sortedItems, activeTab]);

  const save=async()=>{
    if(!form.title.trim()) return alert('Title required');
    const dataToSave = {
      category: form.category,
      title: form.title,
      summary: form.summary,
      fullInfo: form.fullInfo,
      date: form.date,
      accent: form.accent,
      link: form.links[0] || '', // backward compat
      links: form.links.filter(l=>l.trim()!==''),
      hidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if(editId) await updateDoc(doc(db,"updates",editId), dataToSave as any);
    else await addDoc(collection(db,"updates"), dataToSave as any);

    setForm({ category: activeTab==='All'?'NOTICE':activeTab as UpdateCategory, title:'', summary:'', fullInfo:'', date: new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase(), accent:'purple', links:[''], hidden:false });
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (it:any)=>{
    setForm({
      category: (it.category||'NOTICE').toUpperCase(),
      title: it.title||'',
      summary: it.summary||'',
      fullInfo: it.fullInfo||it.summary||'',
      date: it.date||'',
      accent: it.accent||'purple',
      links: it.links?.length? it.links : [it.link||''],
      hidden: it.hidden||false
    });
    setEditId(it.id);
    setActiveTab((it.category||'NOTICE').toUpperCase() as any);
    setShowForm(true);
  };

  const handleTabClick = (tab: typeof ALL_TABS[number])=>{
    setActiveTab(tab);
    if(tab!=='All'){
      setForm(prev=>({...prev, category: tab as UpdateCategory}));
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  };

  const updateLink = (idx:number, val:string)=>{
    const newLinks = [...form.links];
    newLinks[idx]=val;
    // agar last box me likha to naya khali box add karo - jaise tune bola
    if(idx===newLinks.length-1 && val.trim()!==''){
      newLinks.push('');
    }
    setForm({...form, links: newLinks});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-[14px]">Updates · {items.length} total</h2>
        <p className="text-[10px] text-[#8e819c]">Top 3 All ke home.tsx pe dikhenge</p>
      </div>

      {/* TABS - PIC JAISA */}
      <div className="flex gap-2 flex-wrap">
        {ALL_TABS.map(tab=>(
          <button
            key={tab}
            onClick={()=>handleTabClick(tab)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium border transition-all ${activeTab===tab?'bg-black text-white border-black':'bg-white text-[#6b5a7e] border-[#e0d4ed] hover:bg-[#f5f0fb]'}`}
          >
            {tab==='All'?'All': tab.charAt(0)+tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* FORM + PREVIEW - jab Notice/Release etc pe click hoga */}
      {showForm && activeTab!=='All' && (
        <div className="space-y-3">
          {/* LIVE PREVIEW - JAISA APP ME DIKHEGA */}
          <div>
            <p className="ps-mono text-[9px] text-[#8068a9] mb-2">LIVE PREVIEW · EXACT APP JAISA</p>
            <div className="rounded-2xl bg-white border border-[#e0d4ed] p-4 shadow-sm">
              <div className="flex gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[12px] ${form.category==='NOTICE'?'bg-[#e9e2f8]': form.category==='RELEASE'?'bg-[#fff0c6]': form.category==='BROADCAST'?'bg-[#dbeafe]':'bg-[#fce7f3]'}`}>📄</div>
                <div className="flex-1 min-w-0">
                  <p className="ps-mono text-[9px] text-[#8e819c] uppercase">{form.category} · {form.date || 'Today'}</p>
                  <p className="text-[13px] font-semibold leading-[1.3] mt-1">{form.title || 'BTS WORLD TOUR “ARIRANG” — notice on ticketing details'}</p>
                  <p className="text-[11px] text-[#6b5a7e] mt-1 line-clamp-2">{form.summary || 'BIGHIT MUSIC has shared the first set of ticketing information...'}</p>
                  {form.links.filter(l=>l.trim()).length>0 && <p className="text-[10px] text-blue-600 mt-2 underline truncate">{form.links.filter(l=>l.trim())[0]}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* WHITE BOX - TITLE, DATE, BRIEF, INFO, LINKS */}
          <div className="border p-4 rounded-2xl bg-white space-y-3 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-[12px] font-semibold">Add {activeTab} · Info Box</h3>
              <button onClick={()=>{setShowForm(false); setEditId(null);}} className="h-6 w-6 bg-black text-white rounded-full flex items-center justify-center"><X size={12}/></button>
            </div>

            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title - BTS WORLD TOUR ARIRANG..." className="w-full border border-[#e0d4ed] p-2.5 rounded-xl text-[12px] font-medium" />

            <div className="grid grid-cols-2 gap-2">
              <input value={form.date} onChange={e=>setForm({...form, date:e.target.value})} placeholder="Date - 18 JUN 2025" className="border border-[#e0d4ed] p-2.5 rounded-xl text-[12px]" />
              <select value={form.category} onChange={e=>setForm({...form, category:e.target.value as any})} className="border border-[#e0d4ed] p-2.5 rounded-xl text-[12px] bg-white">
                {CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#8e819c]">Brief Content (card pe dikhega)</label>
              <textarea value={form.summary} onChange={e=>setForm({...form, summary:e.target.value})} placeholder="Brief - BIGHIT MUSIC has shared..." className="w-full border border-[#e0d4ed] p-2.5 rounded-xl text-[12px] min-h-[60px] mt-1" />
            </div>

            <div>
              <label className="text-[10px] text-[#8e819c]">Full Info (andar open hone pe)</label>
              <textarea value={form.fullInfo} onChange={e=>setForm({...form, fullInfo:e.target.value})} placeholder="Full story yahan likh..." className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[12px] min-h-[140px] mt-1 leading-6" />
            </div>

            <div>
              <label className="text-[10px] text-[#8e819c] flex items-center gap-1"><Link2 size={10}/> Attach Links (MV release link etc)</label>
              <div className="space-y-2 mt-1">
                {form.links.map((lnk, idx)=>(
                  <div key={idx} className="flex gap-2">
                    <input value={lnk} onChange={e=>updateLink(idx, e.target.value)} placeholder={idx===0?"https://youtube.com/watch?v=... (MV Link)":"Add more link..."} className="flex-1 border border-[#e0d4ed] p-2.5 rounded-xl text-[11px]" />
                    {form.links.length>1 && <button onClick={()=>setForm({...form, links: form.links.filter((_,i)=>i!==idx)})} className="h-9 w-9 bg-[#ffe5e5] rounded-xl flex items-center justify-center"><Trash2 size={12}/></button>}
                  </div>
                ))}
                <p className="text-[9px] text-[#9a8ea2]">Ek link dalte hi neeche naya box auto ayega</p>
              </div>
            </div>

            <button onClick={save} className="w-full bg-black text-white p-3 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"><Save size={14}/> {editId?`Update ${activeTab}`:`Publish ${activeTab}`}</button>
          </div>
        </div>
      )}

      {/* LIST - PIC JAISA BOXES - DATE KE HISAB SE */}
      <div className="rounded-2xl bg-white border border-[#e0d4ed] overflow-hidden">
        {filteredItems.length===0? <p className="p-6 text-[12px] text-[#8e819c] text-center">No {activeTab} updates yet</p> :
          filteredItems.map((it:any)=>(
            <div key={it.id} className={`flex gap-3 p-4 border-b border-[#f3eef9] last:border-0 bg-white ${it.hidden?'opacity-50':''}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[11px] ${it.category==='NOTICE'?'bg-[#e9e2f8]': it.category==='RELEASE'?'bg-[#fff0c6]': it.category==='BROADCAST'?'bg-[#dbeafe]':'bg-[#fce7f3]'}`}>📄</div>
              <div className="flex-1 min-w-0">
                <p className="ps-mono text-[8px] text-[#8e819c] uppercase">{it.category} · {it.date}</p>
                <p className="text-[12px] font-medium leading-[1.3] mt-1 truncate">{it.title}</p>
                <p className="text-[11px] text-[#6b5a7e] truncate">{it.summary}</p>
                {it.links?.[0] && <a href={it.links[0]} target="_blank" className="text-[10px] text-blue-600 underline truncate block mt-1">{it.links[0]}</a>}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={()=>startEdit(it)} className="h-7 w-7 bg-[#f5f0fb] rounded-full flex items-center justify-center"><Pencil size={11}/></button>
                <button onClick={async()=>{
                  if(it.hidden!==undefined){
                    await updateDoc(doc(db,"updates",it.id), { hidden:!it.hidden });
                  } else {
                    await updateDoc(doc(db,"updates",it.id), { hidden:true });
                  }
                }} className="h-7 w-7 bg-[#f5f0fb] rounded-full flex items-center justify-center">{it.hidden?<EyeOff size={11}/>:<Eye size={11}/>}</button>
                <button onClick={async()=>{if(confirm('Delete this update?')) await deleteDoc(doc(db,"updates",it.id))}} className="h-7 w-7 bg-[#ffe5e5] rounded-full flex items-center justify-center"><Trash2 size={11}/></button>
              </div>
            </div>
          ))
        }
      </div>

      {activeTab==='All' && (
        <div className="bg-[#f5f0fb] border border-[#e0d4ed] rounded-xl p-3">
          <p className="text-[10px] text-[#6b5a7e]">ℹ️ All me top 3 boxes home.tsx ke "The short read" me auto dikhenge - date ke hisab se latest 3.</p>
        </div>
      )}
    </div>
  );
}
