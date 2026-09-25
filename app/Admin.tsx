import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Plus, Palette, Trash2, Save, Eye, EyeOff, Pencil, Image as ImageIcon, Link2, RotateCw, Move, Check } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { achievementItems as defaultAchievements } from '../components/data';

const PASSWORD = "borahae13";

type Block = {
  id: string;
  type: 'text'|'image'|'link';
  content?: string;
  url?: string;
  width?: number;
  rotate?: number;
  caption?: string;
  x?: number; y?: number;
  settled?: boolean;
  isMoving?: boolean;
};

function FullScreenAchievementEditor({
  form, setForm, onSave, onClose, isEditing
}: {
  form: any; setForm: (f:any)=>void; onSave: ()=>void; onClose: ()=>void; isEditing: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [linkInput, setLinkInput] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [dragId, setDragId] = useState<string|null>(null);

  const blocks: Block[] = form.contentBlocks || [];

  const addRandomPos = () => ({
    x: Math.floor(15 + Math.random() * 50),
    y: Math.floor(20 + Math.random() * 40),
  });

  const addImageFromFile = (e: any) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const pos = addRandomPos();
      const newBlock: Block = { id: Date.now().toString(), type: 'image', url: reader.result as string, width: 60, rotate: 0, caption: '',...pos, settled: false, isMoving: false };
      setForm({...form, contentBlocks: [...blocks, newBlock] });
    };
    reader.readAsDataURL(file);
  };

  const addLink = () => {
    if(!linkInput.trim()) return;
    const pos = addRandomPos();
    const newBlock: Block = { id: Date.now().toString(), type: 'link', url: linkInput, content: linkInput,...pos, settled: false, isMoving: false };
    setForm({...form, contentBlocks: [...blocks, newBlock] });
    setLinkInput(''); setShowLink(false);
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setForm({...form, contentBlocks: blocks.map((b:Block)=> b.id===id? {...b,...patch} : b) });
  };
  const removeBlock = (id: string) => {
    if(!confirm('Delete this box?')) return;
    setForm({...form, contentBlocks: blocks.filter((b:Block)=> b.id!==id) });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#fbf8ff] overflow-y-auto">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#e0d4ed] p-3 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border"><X size={14}/> Close</button>
        <p className="ps-mono text-[9px] text-[#8068a9]">EDITING · {isEditing? 'UPDATE MODE' : 'NEW ARCHIVE'} · FULL SCREEN</p>
        <button onClick={onSave} className="bg-[#5e428f] text-white px-4 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-1"><Save size={12}/> {isEditing? 'Update' : 'Publish'}</button>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24">
        {/* +ADD PICS +LINKS BUTTONS - UPAR */}
        <div className="flex gap-2 mb-4">
          <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-1.5 bg-white border border-[#e0d4ed] px-4 py-2 rounded-full text-[11px] font-medium shadow-sm hover:bg-[#fdfaff]"><ImageIcon size={14}/> +Add pics</button>
          <button onClick={()=>setShowLink(!showLink)} className="flex items-center gap-1.5 bg-white border border-[#e0d4ed] px-4 py-2 rounded-full text-[11px] font-medium shadow-sm hover:bg-[#fdfaff]"><Link2 size={14}/> +Add links</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addImageFromFile} />
        </div>
        {showLink && (
          <div className="flex gap-2 mb-4 bg-white p-2 rounded-xl border">
            <input value={linkInput} onChange={e=>setLinkInput(e.target.value)} placeholder="Paste link https://..." className="flex-1 border p-2 rounded-xl text-[11px]" />
            <button onClick={addLink} className="bg-[#5e428f] text-white px-4 rounded-xl text-[11px]">Add</button>
          </div>
        )}

        {/* TITLE / SUBTITLE / RECORD BOXES - SAME TO SAME */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <input value={form.type} onChange={e=>setForm({...form, type: e.target.value})} placeholder="Type - RECORD" className="border p-3 rounded-xl text-[12px] bg-white" />
          <input value={form.year} onChange={e=>setForm({...form, year: e.target.value})} placeholder="Year - 2026" className="border p-3 rounded-xl text-[12px] bg-white" />
        </div>
        <input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Title" className="w-full border p-3 rounded-xl text-[13px] font-medium bg-white mb-2" />
        <textarea value={form.subtitle} onChange={e=>setForm({...form, subtitle: e.target.value})} placeholder="Subtitle" className="w-full border p-3 rounded-xl text-[12px] min-h-[70px] bg-white mb-3" />
        <div className="grid grid-cols-2 gap-2 mb-6">
          <input value={form.date} onChange={e=>setForm({...form, date: e.target.value})} placeholder="Date" className="border p-3 rounded-xl text-[12px] bg-white" />
          <input value={form.link} onChange={e=>setForm({...form, link: e.target.value})} placeholder="Official Link" className="border p-3 rounded-xl text-[12px] bg-white" />
        </div>

        {/* BIG INFO BOX - WORD LINES + RANDOM BOXES INSIDE */}
        <div className="relative rounded-2xl border border-[#e0d4ed] bg-white min-h-[500px] overflow-hidden" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #f3eef9 28px)', backgroundSize: '100% 28px' }}>
          <p className="ps-mono text-[9px] text-[#b5a5c8] p-3 border-b border-dashed">BIG INFO BOX - yahan text likh, pic/link randomly beech me ayenge, move button se drag kar</p>

          {/* MAIN TEXT EDITABLE */}
          <textarea
            value={form.fullInfo}
            onChange={e=>setForm({...form, fullInfo: e.target.value})}
            placeholder="Yahan full story likh, paste kar... Jaise Word me likhti hai..."
            className="w-full min-h-[400px] bg-transparent p-4 outline-none text-[13px] leading-7 resize-none"
          />

          {/* FLOATING PIC/LINK BOXES - RANDOM POSITION */}
          {blocks.map((b:Block)=>(
            <div
              key={b.id}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                position: 'absolute',
                width: b.type==='image'? `${b.width}%` : 'auto',
                transform: `rotate(${b.rotate||0}deg) ${b.isMoving? 'scale(1.05)' : ''}`,
                cursor: b.isMoving? 'grabbing' : b.settled? 'default' : 'grab',
                zIndex: b.isMoving? 20 : 10
              }}
              className={`rounded-xl p-2 shadow-lg border-2 ${b.type==='image'? 'border-[#8b5cf6] bg-white' : 'border-[#3b82f6] bg-[#eff6ff]'} ${!b.settled? 'animate-pulse' : ''}`}
              onMouseDown={(e)=>{
                if(!b.isMoving) return;
                setDragId(b.id);
              }}
              onMouseMove={(e)=>{
                if(dragId!==b.id ||!b.isMoving) return;
                const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                const newX = ((e.clientX - rect.left) / rect.width) * 100 - 10;
                const newY = ((e.clientY - rect.top) / rect.height) * 100 - 5;
                updateBlock(b.id, { x: Math.max(0, Math.min(80, newX)), y: Math.max(0, Math.min(85, newY)) });
              }}
              onMouseUp={()=>setDragId(null)}
            >
              {/* CONTROLS - RED X LEFT, ORANGE MOVE MIDDLE, GREEN TICK RIGHT */}
              <div className="flex items-center justify-between mb-1.5 gap-1">
                <button onClick={()=>removeBlock(b.id)} className="h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={12}/></button>
                <button
                  onClick={()=>updateBlock(b.id, { isMoving:!b.isMoving })}
                  className={`h-6 w-6 rounded-full flex items-center justify-center ${b.isMoving? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 border border-orange-300'}`}
                >
                  <Move size={12}/>
                </button>
                <button onClick={()=>updateBlock(b.id, { settled: true, isMoving: false })} className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center"><Check size={12}/></button>
              </div>

              {b.type==='image'? (
                <div>
                  <img src={b.url} className="rounded-lg max-h-[180px] object-contain mx-auto" />
                  <div className="mt-2 flex gap-1">
                    <input type="range" min={30} max={100} value={b.width||60} onChange={e=>updateBlock(b.id, {width: Number(e.target.value)})} className="flex-1 h-1" />
                    <input type="range" min={-45} max={45} value={b.rotate||0} onChange={e=>updateBlock(b.id, {rotate: Number(e.target.value)})} className="flex-1 h-1" />
                  </div>
                </div>
              ) : (
                <a href={b.url} target="_blank" className="text-[11px] text-blue-600 underline break-all">{b.url}</a>
              )}
              {!b.settled && <p className="text-[8px] text-[#9a8ea2] mt-1 text-center">Move karke sahi jagah pe laga, phir ✓ dabaa</p>}
            </div>
          ))}
        </div>

        <p className="text-[10px] text-[#9a8ea2] mt-3 text-center">Pic ka border purple hoga, link ka blue. Random beech me ayega. Move (orange) dabake drag kar, ✓ dabake lock kar. X se delete.</p>
      </div>
    </div>
  );
}

export function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [type, setType] = useState<'palette'|'votingItems'|'updates'|'scheduleItems'|'achievementItems'>('achievementItems');

  const [paletteEvents, setPaletteEvents] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
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
  const [isFullEdit, setIsFullEdit] = useState(false);

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
    const dataToSave = {...achieveForm};
    if(editingId){ await updateDoc(doc(db, "achievementItems", editingId), dataToSave as any); setEditingId(null); }
    else { await addDoc(collection(db, "achievementItems"), {...dataToSave, hidden: false, createdAt: new Date().toISOString()}); }
    setAchieveForm({ type: 'RECORD', year: '2025', title: '', subtitle: '', fullInfo: '', date: '18 June 2025', link: '', contentBlocks: [] });
    setShowForm(false); setIsFullEdit(false); alert('Published');
  };

  const deleteDocById = async (col: string, id: string) => { if(!confirm('Delete?')) return; await deleteDoc(doc(db, col, id)); };
  const toggleHide = async (item: any) => { await updateDoc(doc(db, "achievementItems", item.id), { hidden:!item.hidden }); };
  const startEdit = (item: any) => {
    setAchieveForm({ type: item.type||'RECORD', year: item.year||'2025', title: item.title||'', subtitle: item.subtitle||'', fullInfo: item.fullInfo||'', date: item.date||'18 June 2025', link: item.link||'', contentBlocks: item.contentBlocks||[] });
    setEditingId(item.id); setIsFullEdit(true);
  };

  if (!auth) return (<div className="p-10 max-w-sm mx-auto"><h1 className="font-semibold text-[18px]">Admin Access</h1><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full border p-3 rounded-xl mt-4" /><button onClick={()=> pass===PASSWORD? setAuth(true): alert('Incorrect')} className="w-full bg-[#60438f] text-white p-3 rounded-xl mt-3">Continue</button></div>);

  // FULL SCREEN EDITOR OPEN
  if(isFullEdit){
    return <FullScreenAchievementEditor form={achieveForm} setForm={setAchieveForm} onSave={saveAchievement} onClose={()=>{setIsFullEdit(false); setEditingId(null); setAchieveForm({ type: 'RECORD', year: '2025', title: '', subtitle: '', fullInfo: '', date: '18 June 2025', link: '', contentBlocks: [] })}} isEditing={!!editingId} />
  }

  return (
    <div className="p-6 max-w-xl mx-auto pb-24">
      <h1 className="text-[20px] font-semibold">Admin Panel</h1>
      <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full border p-3 rounded-xl mt-5 bg-white text-[13px] font-medium">
        <option value="palette">🎨 Palette</option>
        <option value="votingItems">🗳️ Voting</option>
        <option value="updates">📰 Updates</option>
        <option value="scheduleItems">📅 Schedule</option>
        <option value="achievementItems">🏆 Achievements</option>
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
            <div className="mt-4 border rounded-2xl p-4 bg-[#fdfaff] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input value={achieveForm.type} onChange={e=>setAchieveForm({...achieveForm, type: e.target.value})} placeholder="Type" className="border p-2.5 rounded-xl text-[12px]" />
                <input value={achieveForm.year} onChange={e=>setAchieveForm({...achieveForm, year: e.target.value})} placeholder="Year" className="border p-2.5 rounded-xl text-[12px]" />
              </div>
              <input value={achieveForm.title} onChange={e=>setAchieveForm({...achieveForm, title: e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px] font-medium" />
              <textarea value={achieveForm.subtitle} onChange={e=>setAchieveForm({...achieveForm, subtitle: e.target.value})} placeholder="Subtitle" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[60px]" />
              <div className="grid grid-cols-2 gap-2">
                <input value={achieveForm.date} onChange={e=>setAchieveForm({...achieveForm, date: e.target.value})} placeholder="Date" className="border p-2.5 rounded-xl text-[12px]" />
                <input value={achieveForm.link} onChange={e=>setAchieveForm({...achieveForm, link: e.target.value})} placeholder="Link" className="border p-2.5 rounded-xl text-[12px]" />
              </div>
              <button onClick={()=>{setShowForm(false); setIsFullEdit(true);}} className="w-full bg-white border border-[#5e428f] text-[#5e428f] p-2.5 rounded-xl text-[12px] font-medium">Open Full Screen Editor for Pics & Links</button>
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

      {type==='palette' && <div className="mt-6">Palette - same as before</div>}
      {type==='votingItems' && <div className="mt-6">Voting - same</div>}
      {type==='updates' && <div className="mt-6">Updates - same</div>}
      {type==='scheduleItems' && <div className="mt-6">Schedule - same</div>}
    </div>
  );
}
