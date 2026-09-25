import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Plus, Palette, Trash2, Save, Eye, EyeOff, Pencil, Image as ImageIcon, Link2, RotateCw, Move } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { achievementItems as defaultAchievements } from '../components/data';

const PASSWORD = "borahae13";

type Block = { id: string; type: 'text'|'image'; content?: string; url?: string; width?: number; rotate?: number; caption?: string; alt?: string; fit?: string; };

function RichEditor({ blocks, setBlocks }: { blocks: Block[]; setBlocks: (b: Block[])=>void }){
  const fileRef = useRef<HTMLInputElement>(null);
  const [linkInput, setLinkInput] = useState('');
  const [showLink, setShowLink] = useState(false);

  const addText = () => setBlocks([...blocks, { id: Date.now().toString(), type: 'text', content: '' }]);

  const addImageFromFile = (e: any) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBlocks([...blocks, { id: Date.now().toString(), type: 'image', url: reader.result as string, width: 100, rotate: 0, caption: '', alt: file.name }]);
    };
    reader.readAsDataURL(file);
  };

  const addImageFromLink = () => {
    if(!linkInput.trim()) return;
    setBlocks([...blocks, { id: Date.now().toString(), type: 'image', url: linkInput, width: 100, rotate: 0, caption: 'Source: Official' }]);
    setLinkInput(''); setShowLink(false);
  };

  const updateBlock = (id: string, patch: Partial<Block>) => setBlocks(blocks.map(b=> b.id===id? {...b,...patch}: b));
  const removeBlock = (id: string) => setBlocks(blocks.filter(b=> b.id!==id));

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={addText} className="flex items-center gap-1 border border-[#e0d4ed] px-3 py-1.5 rounded-full text-[10px] bg-white">+ Text</button>
        <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-1 border border-[#e0d4ed] px-3 py-1.5 rounded-full text-[10px] bg-white"><ImageIcon size={12}/> Gallery</button>
        <button onClick={()=>setShowLink(!showLink)} className="flex items-center gap-1 border border-[#e0d4ed] px-3 py-1.5 rounded-full text-[10px] bg-white"><Link2 size={12}/> Link Paste</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addImageFromFile} />
      </div>
      {showLink && (
        <div className="flex gap-2">
          <input value={linkInput} onChange={e=>setLinkInput(e.target.value)} placeholder="Paste image link https://..." className="flex-1 border p-2 rounded-xl text-[11px]" />
          <button onClick={addImageFromLink} className="bg-[#5e428f] text-white px-3 rounded-xl text-[11px]">Add</button>
        </div>
      )}

      {/* WORD LIKE LINED PAPER */}
      <div className="rounded-xl border border-[#e0d4ed] bg-white overflow-hidden" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #f3eef9 24px)', backgroundSize: '100% 24px' }}>
        {blocks.length===0 && <p className="p-4 text-[11px] text-[#b5a5c8]">Yahan text aur pics add karo. Lines se samajh ayega kahan likhna hai - jaise Word / PowerPoint.</p>}
        <div className="p-3 space-y-3">
          {blocks.map((b, idx)=>(
            <div key={b.id} className="relative group border border-dashed border-[#e9dff6] rounded-xl p-2 bg-[#fdfcff]">
              <div className="absolute -top-2 left-2 bg-[#f5f0fb] px-2 text-[8px] text-[#8a7a9e] rounded-full">{idx+1} · {b.type.toUpperCase()}</div>
              <button onClick={()=>removeBlock(b.id)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[#ffe5e5] flex items-center justify-center"><X size={10}/></button>
              {b.type==='text'? (
                <textarea value={b.content} onChange={e=>updateBlock(b.id, {content: e.target.value})} placeholder={`Line ${idx+1}: Yahan story likho...`} className="w-full min-h-[60px] bg-transparent outline-none text-[12px] leading-6 resize-none" />
              ): (
                <div className="space-y-2">
                  <img src={b.url} alt="preview" style={{ width: `${b.width}%`, transform: `rotate(${b.rotate}deg)` }} className="rounded-lg mx-auto max-h-[300px] object-contain" />
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="flex items-center gap-1 text-[9px]"><Move size={10}/> Width</span>
                    <input type="range" min={30} max={100} value={b.width||100} onChange={e=>updateBlock(b.id, {width: Number(e.target.value)})} className="flex-1" />
                    <span className="flex items-center gap-1 text-[9px]"><RotateCw size={10}/> Rotate</span>
                    <input type="range" min={-180} max={180} value={b.rotate||0} onChange={e=>updateBlock(b.id, {rotate: Number(e.target.value)})} className="flex-1" />
                  </div>
                  <input value={b.caption||''} onChange={e=>updateBlock(b.id, {caption: e.target.value})} placeholder="Caption - optional, source credit" className="w-full border p-1.5 rounded-lg text-[10px]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [type, setType] = useState<'palette'|'votingItems'|'updates'|'scheduleItems'|'achievementItems'>('achievementItems');

  const today = new Date();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [paletteEvents, setPaletteEvents] = useState<any[]>([]);
  const [paletteForm, setPaletteForm] = useState<any>({ date: '', type: 'birthday', title: '', info: '' });

  const [votingItems, setVotingItems] = useState<any[]>([]);
  const [votingForm, setVotingForm] = useState<any>({ title: '', platform: 'MNET PLUS' });

  const [updates, setUpdates] = useState<any[]>([]);
  const [updateForm, setUpdateForm] = useState({ category: 'NOTICE', title: '', summary: '', date: 'Today', accent: 'purple', link: '', contentBlocks: [] as Block[] });

  const [schedules, setSchedules] = useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ day: '20', month: 'JUN', weekday: 'FRI', type: 'Broadcast', time: '19:00 KST', title: '', location: '' });

  const [achievements, setAchievements] = useState<any[]>([]);
  const [achieveForm, setAchieveForm] = useState({ type: 'RECORD', year: '2025', title: '', subtitle: '', fullInfo: '', date: '18 June 2025', link: '', contentBlocks: [] as Block[] });
  const [editingId, setEditingId] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);

  const allAchForCount = [...achievements,...defaultAchievements];

  useEffect(()=>{
    if(!auth) return;
    const unsubs = [
      onSnapshot(collection(db, "paletteEvents"), s=> setPaletteEvents(s.docs.map(d=>({id:d.id,...d.data()} as any)))),
      onSnapshot(collection(db, "votingItems"), s=> setVotingItems(s.docs.map(d=>({id:d.id,...d.data()} as any)))),
      onSnapshot(collection(db, "updates"), s=> setUpdates(s.docs.map(d=>({id:d.id,...d.data()} as any)))),
      onSnapshot(collection(db, "scheduleItems"), s=> setSchedules(s.docs.map(d=>({id:d.id,...d.data()} as any)))),
      onSnapshot(collection(db, "achievementItems"), s=> setAchievements(s.docs.map(d=>({id:d.id,...d.data()} as any)))),
    ];
    return ()=> unsubs.forEach(u=>u());
  },[auth]);

  const saveAchievement = async () => {
    if(!achieveForm.title.trim()) return alert('Title required');
    const dataToSave = {...achieveForm, contentBlocks: achieveForm.contentBlocks.length? achieveForm.contentBlocks : [{id:'1', type:'text', content: achieveForm.fullInfo}]};
    if(editingId){ await updateDoc(doc(db, "achievementItems", editingId), dataToSave as any); setEditingId(null); }
    else { await addDoc(collection(db, "achievementItems"), {...dataToSave, hidden: false, createdAt: new Date().toISOString()}); }
    setAchieveForm({ type: 'RECORD', year: '2025', title: '', subtitle: '', fullInfo: '', date: '18 June 2025', link: '', contentBlocks: [] }); setShowForm(false); alert('Published');
  };
  const saveUpdate = async () => {
    const dataToSave = {...updateForm, contentBlocks: updateForm.contentBlocks.length? updateForm.contentBlocks : [{id:'1', type:'text', content: updateForm.summary}]};
    await addDoc(collection(db, "updates"), {...dataToSave, createdAt: new Date().toISOString()});
    setUpdateForm({ category: 'NOTICE', title: '', summary: '', date: 'Today', accent: 'purple', link: '', contentBlocks: [] }); alert('Update live');
  };

  const deleteDocById = async (col: string, id: string) => { if(!confirm('Delete?')) return; await deleteDoc(doc(db, col, id)); };
  const toggleHide = async (item: any) => { await updateDoc(doc(db, "achievementItems", item.id), { hidden:!item.hidden }); };
  const startEdit = (item: any) => {
    setAchieveForm({ type: item.type||'RECORD', year: item.year||'2025', title: item.title||'', subtitle: item.subtitle||'', fullInfo: item.fullInfo||'', date: item.date||'18 June 2025', link: item.link||'', contentBlocks: item.contentBlocks||[] });
    setEditingId(item.id); setShowForm(true); window.scrollTo({top:0, behavior:'smooth'});
  };

  if (!auth) return (<div className="p-10 max-w-sm mx-auto"><h1 className="font-semibold text-[18px]">Admin Access</h1><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full border p-3 rounded-xl mt-4" /><button onClick={()=> pass===PASSWORD? setAuth(true): alert('Incorrect')} className="w-full bg-[#60438f] text-white p-3 rounded-xl mt-3">Continue</button></div>);

  return (
    <div className="p-6 max-w-xl mx-auto pb-24">
      <h1 className="text-[20px] font-semibold">Admin Panel</h1>
      <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full border p-3 rounded-xl mt-5 bg-white text-[13px] font-medium">
        <option value="palette">🎨 Palette</option>
        <option value="votingItems">🗳️ Voting</option>
        <option value="updates">📰 Updates - Rich Editor + Copyright</option>
        <option value="scheduleItems">📅 Schedule</option>
        <option value="achievementItems">🏆 Achievements - Rich Editor + Copyright</option>
      </select>

      {type==='achievementItems' && (
        <>
          <div className="mt-6">
            <p className="ps-mono text-[9px] text-[#8068a9] mb-2">LIVE PREVIEW - EXACT APP PURPLE BOX</p>
            <div className="relative overflow-hidden rounded-2xl bg-[#60438f] p-7 text-white">
              <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-[#876bb0]" />
              <p className="relative ps-mono text-[9px] text-[#d0beea]">LATEST ENTRY · {allAchForCount.length + 1}</p>
              <h2 className="ps-display relative mt-8 text-[28px] leading-[1.02]">{achieveForm.title||"Three decades.\nOne name at the centre."}</h2>
              <p className="relative mt-5 text-[12px] leading-5 text-[#d5c9e5]">{achieveForm.subtitle||"The first group to place three albums at No. 1..."}</p>
              <div className="relative mt-6 flex items-end justify-between border-t border-[#8c72b2] pt-4"><span className="text-[11px] text-[#d5c9e5]">{achieveForm.date}</span><span className="text-[10px] text-[#d5c9e5]">{achieveForm.type} · {achieveForm.year}</span></div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold">Achievements · {allAchForCount.length} total</h2>
            <button onClick={()=>{setShowForm(!showForm); setEditingId(null); setAchieveForm({ type: 'RECORD', year: '2025', title: '', subtitle: '', fullInfo: '', date: '18 June 2025', link: '', contentBlocks: [] })}} className="flex items-center gap-1.5 bg-[#5e428f] text-white px-3.5 py-2 rounded-full text-[11px] font-medium"><Plus size={14}/> {showForm?'Close':'Add New Archive'}</button>
          </div>

          {showForm && (
            <div className="mt-4 border border-[#e0d4ed] rounded-2xl p-4 bg-[#fdfaff] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input value={achieveForm.type} onChange={e=>setAchieveForm({...achieveForm, type: e.target.value})} placeholder="Type" className="border p-2.5 rounded-xl text-[12px]" />
                <input value={achieveForm.year} onChange={e=>setAchieveForm({...achieveForm, year: e.target.value})} placeholder="Year" className="border p-2.5 rounded-xl text-[12px]" />
              </div>
              <input value={achieveForm.title} onChange={e=>setAchieveForm({...achieveForm, title: e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px] font-medium" />
              <textarea value={achieveForm.subtitle} onChange={e=>setAchieveForm({...achieveForm, subtitle: e.target.value})} placeholder="Subtitle" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[60px]" />

              <div>
                <label className="ps-mono text-[9px] text-[#8068a9] ml-1">FULL INFORMATION - RICH EDITOR WITH PICS + WORD LINES</label>
                <RichEditor blocks={achieveForm.contentBlocks} setBlocks={(b)=>setAchieveForm({...achieveForm, contentBlocks: b, fullInfo: b.filter(x=>x.type==='text').map(x=>x.content).join('\n')})} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input value={achieveForm.date} onChange={e=>setAchieveForm({...achieveForm, date: e.target.value})} placeholder="Date" className="border p-2.5 rounded-xl text-[12px]" />
                <input value={achieveForm.link} onChange={e=>setAchieveForm({...achieveForm, link: e.target.value})} placeholder="Link optional" className="border p-2.5 rounded-xl text-[12px]" />
              </div>
              <button onClick={saveAchievement} className="w-full bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"><Save size={14}/> {editingId?'Update':'Publish'}</button>
            </div>
          )}

          <div className="mt-6 space-y-2">
            {achievements.map((a:any)=> (
              <div key={a.id} className={`flex gap-3 border rounded-xl p-3 bg-white ${a.hidden?'opacity-50':''}`}>
                <div className="flex-1 min-w-0"><p className="text-[12px] font-medium truncate">{a.title}</p><p className="text-[10px] text-[#8e819c] truncate">{a.subtitle}</p></div>
                <div className="flex gap-1">
                  <button onClick={()=>startEdit(a)} className="h-8 w-8 rounded-full bg-[#f5f0fb] flex items-center justify-center"><Pencil size={12}/></button>
                  <button onClick={()=>toggleHide(a)} className="h-8 w-8 rounded-full bg-[#f5f0fb] flex items-center justify-center">{a.hidden?<EyeOff size={12}/>:<Eye size={12}/>}</button>
                  <button onClick={()=>deleteDocById('achievementItems', a.id)} className="h-8 w-8 rounded-full bg-[#ffe5e5] flex items-center justify-center"><Trash2 size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {type==='updates' && (
        <div className="mt-6 border rounded-2xl p-4 bg-[#fdfaff] space-y-3">
          <input value={updateForm.title} onChange={e=>setUpdateForm({...updateForm, title: e.target.value})} placeholder="Update Title" className="w-full border p-2.5 rounded-xl text-[12px]" />
          <div>
            <label className="ps-mono text-[9px] text-[#8068a9]">RICH CONTENT WITH PICS - Same as Achievements</label>
            <RichEditor blocks={updateForm.contentBlocks} setBlocks={(b)=>setUpdateForm({...updateForm, contentBlocks: b, summary: b.filter(x=>x.type==='text').map(x=>x.content).join('\n')})} />
          </div>
          <input value={updateForm.link} onChange={e=>setUpdateForm({...updateForm, link: e.target.value})} placeholder="Official link optional" className="w-full border p-2.5 rounded-xl text-[12px]" />
          <button onClick={saveUpdate} className="w-full bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px]">Publish Update + Copyright Footer Auto</button>
          <p className="text-[9px] text-[#9a8ea2] text-center">Har update ke niche auto disclaimer lagega - strike se safe</p>
        </div>
      )}

      {type==='palette' && <div className="mt-6">Palette - same as before</div>}
      {type==='votingItems' && <div className="mt-6">Voting - same</div>}
      {type==='scheduleItems' && <div className="mt-6">Schedule - same</div>}
    </div>
  );
}
