import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Palette, CalendarDays, ExternalLink, Trash2, Save, Eye } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

const PASSWORD = "borahae13";

type ArchiveEvent = {
  id?: string;
  date: string;
  type: 'birthday' | 'album' | 'pet' | 'army' | 'festa' | 'anniversary' | 'mv' | 'black' | 'award' | 'enlist';
  title: string;
  info: string;
  sourceUrl?: string;
  sourceName?: string;
  year?: string;
  time?: string;
  location?: string;
};

type VotingItem = {
  id?: string;
  title: string;
  platform: string;
  closes: string;
  closeDate?: string;
  note: string;
  description: string;
  status: 'open' | 'ended' | 'upcoming';
  voteType: 'app' | 'website';
  webLink: string;
  playStoreLink?: string;
};

function formatTwoUnits(dateStr?: string, fallback?: string) {
  if (!dateStr) return fallback || 'Closes soon';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Closed';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  if (d > 0) return `Closes in ${d}d ${String(h).padStart(2,'0')}h`;
  const m = Math.floor((diff / (1000 * 60)) % 60);
  return `Closes in ${d>0? d+'d '+h+'h' : h+'h '+m+'m'}`;
}

export function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [type, setType] = useState<'palette'|'votingItems'|'updates'|'scheduleItems'|'achievementItems'>('palette');

  // Common
  const today = new Date();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // Palette
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [paletteEvents, setPaletteEvents] = useState<ArchiveEvent[]>([]);
  const [paletteForm, setPaletteForm] = useState<ArchiveEvent>({ date: `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`, type: 'birthday', title: '', info: '', sourceUrl: '', sourceName: 'BigHit', year: '', time: '', location: '' });

  // Voting
  const [votingItems, setVotingItems] = useState<VotingItem[]>([]);
  const [votingForm, setVotingForm] = useState<any>({ title: '', platform: 'MNET PLUS', voteType: 'app', webLink: '', playStoreLink: '', closeDate: '', note: 'Daily votes available', description: 'Vote once per day on the official platform.', status: 'open' });

  // Updates / Schedule / Achievements
  const [updates, setUpdates] = useState<any[]>([]);
  const [updateForm, setUpdateForm] = useState({ category: 'NOTICE', title: '', summary: '', date: 'Today', accent: 'purple' });

  const [schedules, setSchedules] = useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ day: '20', month: 'JUN', weekday: 'FRI', type: 'Broadcast', time: '19:00 KST', title: '', location: '' });

  const [achievements, setAchievements] = useState<any[]>([]);
  const [achieveForm, setAchieveForm] = useState({ type: 'RECORD', year: '2025', title: '' });

  const daysInMonth = new Date(2025, currentMonth + 1, 0).getDate();

  // FIREBASE LIVE LOAD
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

  const getEventsForDay = (day: number) => {
    const mmdd = `${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return paletteEvents.filter(e => e.date === mmdd);
  };
  const selectedDayEvents = useMemo(()=> getEventsForDay(selectedDate), [selectedDate, currentMonth, paletteEvents]);

  // SAVE FUNCTIONS
  const savePalette = async () => {
    if(!paletteForm.title.trim() ||!paletteForm.info.trim()) return alert('Title/Info required');
    const dateStr = `${String(currentMonth+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;
    await addDoc(collection(db, "paletteEvents"), {...paletteForm, date: dateStr, createdAt: new Date().toISOString()});
    setPaletteForm({ date: dateStr, type: 'birthday', title: '', info: '', sourceUrl: '', sourceName: 'BigHit', year: '', time: '', location: '' });
    alert('Palette live 🔥');
  };
  const saveVoting = async () => {
    if(!votingForm.title.trim() ||!votingForm.webLink.trim() ||!votingForm.closeDate) return alert('Title/Link/Date required');
    await addDoc(collection(db, "votingItems"), {...votingForm, closes: formatTwoUnits(votingForm.closeDate), createdAt: new Date().toISOString()});
    setVotingForm({...votingForm, title: '', webLink: '', closeDate: ''});
    alert('Voting live 🔥');
  };
  const saveUpdate = async () => {
    if(!updateForm.title.trim()) return alert('Title required');
    await addDoc(collection(db, "updates"), {...updateForm, id: Date.now(), createdAt: new Date().toISOString()});
    setUpdateForm({...updateForm, title: '', summary: ''});
    alert('Update live 🔥');
  };
  const saveSchedule = async () => {
    if(!scheduleForm.title.trim()) return alert('Title required');
    await addDoc(collection(db, "scheduleItems"), {...scheduleForm, id: Date.now(), createdAt: new Date().toISOString()});
    setScheduleForm({...scheduleForm, title: '', location: ''});
    alert('Schedule live 🔥');
  };
  const saveAchievement = async () => {
    if(!achieveForm.title.trim()) return alert('Title required');
    await addDoc(collection(db, "achievementItems"), {...achieveForm, id: Date.now(), createdAt: new Date().toISOString()});
    setAchieveForm({...achieveForm, title: ''});
    alert('Achievement live 🔥');
  };

  const deleteDocById = async (col: string, id: string) => {
    if(!confirm('Delete?')) return;
    await deleteDoc(doc(db, col, id));
  };

  if (!auth) return (
    <div className="p-10 max-w-sm mx-auto">
      <h1 className="font-semibold text-[18px]">Admin Access</h1>
      <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full border border-[#e0d4ed] p-3 rounded-xl mt-4 outline-none focus:border-[#60438f]" />
      <button onClick={()=> pass===PASSWORD? setAuth(true): alert('Incorrect password')} className="w-full bg-[#60438f] text-white p-3 rounded-xl mt-3 font-medium">Continue</button>
    </div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto pb-24">
      <h1 className="text-[20px] font-semibold tracking-tight">Admin Panel</h1>
      <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full border border-[#e0d4ed] p-3 rounded-xl mt-5 bg-white text-[13px] font-medium">
        <option value="palette">🎨 Palette of Memories - Calendar</option>
        <option value="votingItems">🗳️ Voting - Boxes</option>
        <option value="updates">📰 Updates - Newsroom</option>
        <option value="scheduleItems">📅 Schedule - What's Ahead</option>
        <option value="achievementItems">🏆 Achievements - Archive</option>
      </select>

      {/* PALETTE */}
      {type==='palette' && (
        <>
          <div className="mt-6 flex items-center justify-between"><h2 className="text-[14px] font-semibold flex items-center gap-2"><Palette size={16}/> {monthNames[currentMonth]} - {paletteEvents.length} total</h2><span className="text-[10px] text-[#9a8ea2] flex items-center gap-1"><Eye size={12}/> Preview same as app</span></div>
          <div className="mt-4 ps-panel rounded-2xl p-4 bg-white border border-[#ece6f3]">
            <div className="flex items-center justify-between mb-4"><span className="text-[13px] font-semibold">{monthNames[currentMonth]} 2025</span><div className="flex gap-1"><button onClick={()=>setCurrentMonth(m=>m>0?m-1:11)} className="rounded-lg border p-1.5">‹</button><button onClick={()=>setCurrentMonth(m=>m<11?m+1:0)} className="rounded-lg border p-1.5">›</button></div></div>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[#998ea2]">{['S','M','T','W','T','F','S'].map(d=> <div key={d} className="py-1">{d}</div>)}{Array.from({length: daysInMonth}, (_,i)=>{const day=i+1;const evs=getEventsForDay(day);const isSel=selectedDate===day;return (<button key={i} onClick={()=>setSelectedDate(day)} className={`min-h-[48px] rounded-lg text-[11px] border ${isSel?'bg-[#5e428f] text-white border-[#5e428f]':'bg-[#fdfcff] border-[#f0e6f8]'} ${evs.length>0 &&!isSel?'bg-[#f0e9f7]':''}`}>{day}{evs.length>0 && <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-[#8d6bb7]"/>}</button>)})}</div>
          </div>
          <div className="mt-4 border border-[#e0d4ed] rounded-2xl p-4 bg-[#fdfaff] space-y-3">
            <p className="text-[12px] font-semibold">Add for {monthNames[currentMonth]} {selectedDate}</p>
            <select value={paletteForm.type} onChange={e=>setPaletteForm({...paletteForm, type: e.target.value as any})} className="w-full border p-2.5 rounded-xl text-[12px] bg-white"><option value="birthday">🎂 Birthday</option><option value="album">💿 Album</option><option value="mv">▶️ MV</option><option value="army">💜 ARMY</option><option value="festa">🎉 FESTA</option><option value="anniversary">✨ Anniversary</option><option value="pet">🐾 Pet</option><option value="black">🖤 Black Day</option></select>
            <input value={paletteForm.title} onChange={e=>setPaletteForm({...paletteForm, title: e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px]" />
            <textarea value={paletteForm.info} onChange={e=>setPaletteForm({...paletteForm, info: e.target.value})} placeholder="Info" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[60px]" />
            <div className="grid grid-cols-2 gap-2"><input value={paletteForm.time||''} onChange={e=>setPaletteForm({...paletteForm, time: e.target.value})} placeholder="19:00 KST" className="w-full border p-2.5 rounded-xl text-[12px]" /><input value={paletteForm.location||''} onChange={e=>setPaletteForm({...paletteForm, location: e.target.value})} placeholder="Location" className="w-full border p-2.5 rounded-xl text-[12px]" /></div>
            <input value={paletteForm.sourceUrl||''} onChange={e=>setPaletteForm({...paletteForm, sourceUrl: e.target.value})} placeholder="Link https://..." className="w-full border p-2.5 rounded-xl text-[12px]" />
            <button onClick={savePalette} className="w-full bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"><Save size={14}/> Save to Firebase</button>
          </div>
          <div className="mt-6 rounded-2xl bg-white border border-[#ece6f3] p-4">
            <h3 className="text-[13px] font-semibold">{monthNames[currentMonth]} {selectedDate} - {selectedDayEvents.length} Memories</h3>
            <div className="mt-4 grid gap-3">{selectedDayEvents.map((ev,idx)=>{const colors:any={birthday:"#ec4899",album:"#d97706",pet:"#fb923c",army:"#5e428f",festa:"#8b5cf6",anniversary:"#7c3aed",mv:"#ef4444",black:"#27272a"};const bg=colors[ev.type]||"#5e428f";return (<div key={ev.id||idx} className="flex gap-3 rounded-xl border p-3.5" style={{borderColor:`${bg}20`,backgroundColor:`${bg}0D`}}><div className="flex-1"><span className="rounded-full px-2 py-0.5 text-[8px] font-bold text-white" style={{background:bg}}>{ev.type.toUpperCase()}</span><h4 className="mt-1 text-[12px] font-semibold">{ev.title}</h4><p className="text-[10px] text-[#7b6a93]">{ev.info}</p></div><button onClick={()=>deleteDocById('paletteEvents', ev.id!)} className="h-8 w-8 rounded-full bg-[#ffe5e5] text-[#ff4d4f] flex items-center justify-center"><Trash2 size={12}/></button></div>)})}</div>
          </div>
        </>
      )}

      {/* VOTING */}
      {type==='votingItems' && (
        <>
          <div className="mt-6"><p className="ps-mono text-[9px] text-[#8068a9] mb-2">PREVIEW - EXACT APP CARD</p><article className="ps-panel rounded-2xl p-5 border border-[#e0d4ed] bg-white"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${votingForm.status==='open'?'bg-[#6aaf8f]':'bg-[#b3a9bc]'}`} /><span className="ps-mono text-[9px] text-[#8e819c]">{votingForm.platform}</span></div><h2 className="mt-3 text-[16px] font-semibold text-[#3d324b]">{votingForm.title||'Title'}</h2><div className="mt-6"><p className="ps-mono text-[9px] text-[#95899d]">STATUS</p><p className="mt-1 text-[12px] font-medium text-[#6b9c7e]">{formatTwoUnits(votingForm.closeDate)}</p></div><div className="mt-4 flex items-center justify-between gap-3"><span className="text-[11px] text-[#958a9c]">{votingForm.note}</span><span className="rounded-lg bg-[#60438f] px-3 py-2 text-[11px] font-semibold text-white">Open official page</span></div></article></div>
          <div className="mt-8 space-y-3"><input value={votingForm.title} onChange={e=>setVotingForm({...votingForm, title: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px]" placeholder="Title" /><input value={votingForm.platform} onChange={e=>setVotingForm({...votingForm, platform: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px]" placeholder="Platform" /><select value={votingForm.status} onChange={e=>setVotingForm({...votingForm, status: e.target.value})} className="w-full border p-3 rounded-xl bg-white text-[13px]"><option value="open">Open</option><option value="upcoming">Upcoming</option><option value="ended">Ended</option></select><div className="border rounded-xl p-3 bg-[#fdfaff]"><label className="ps-mono text-[9px] text-[#8068a9]">CLOSE DATE</label><input type="datetime-local" value={votingForm.closeDate} onChange={e=>setVotingForm({...votingForm, closeDate: e.target.value})} className="w-full mt-2 border p-2.5 rounded-lg text-[13px]" /></div><input value={votingForm.description} onChange={e=>setVotingForm({...votingForm, description: e.target.value})} className="w-full border p-3 rounded-xl text-[13px]" placeholder="Description" /><input value={votingForm.note} onChange={e=>setVotingForm({...votingForm, note: e.target.value})} className="w-full border p-3 rounded-xl text-[13px]" placeholder="Short note" /><select value={votingForm.voteType} onChange={e=>setVotingForm({...votingForm, voteType: e.target.value})} className="w-full border p-3 rounded-xl bg-white text-[13px]"><option value="app">App Voting</option><option value="website">Website Voting</option></select><input placeholder="Voting Link" value={votingForm.webLink} onChange={e=>setVotingForm({...votingForm, webLink: e.target.value})} className="w-full border p-3 rounded-xl text-[13px]" /><input placeholder="Play Store Link" value={votingForm.playStoreLink} onChange={e=>setVotingForm({...votingForm, playStoreLink: e.target.value})} className="w-full border p-3 rounded-xl text-[13px]" /><button onClick={saveVoting} className="w-full bg-[#60438f] text-white p-3 rounded-xl mt-2 font-medium text-[13px]">Publish to Voting Page</button></div>
          <div className="mt-8 space-y-3">{votingItems.map(it=> (<div key={it.id} className="flex items-center gap-3 border rounded-xl p-3 bg-white"><div className="flex-1 min-w-0"><p className="text-[13px] font-medium truncate">{it.title}</p><p className="text-[10px] text-[#8e819c] truncate">{it.platform} • {it.closes}</p></div><button onClick={()=>deleteDocById('votingItems', it.id!)} className="h-8 w-8 rounded-full bg-[#ffe5e5] text-[#ff4d4f] flex items-center justify-center"><X size={14}/></button></div>))}</div>
        </>
      )}

      {/* UPDATES */}
      {type==='updates' && (
        <>
          <div className="mt-6 border rounded-2xl p-4 bg-[#fdfaff] space-y-3">
            <select value={updateForm.category} onChange={e=>setUpdateForm({...updateForm, category: e.target.value})} className="w-full border p-2.5 rounded-xl text-[12px] bg-white"><option>NOTICE</option><option>RELEASE</option><option>BROADCAST</option><option>COMMUNITY</option></select>
            <input value={updateForm.title} onChange={e=>setUpdateForm({...updateForm, title: e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px]" />
            <textarea value={updateForm.summary} onChange={e=>setUpdateForm({...updateForm, summary: e.target.value})} placeholder="Summary" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[80px]" />
            <button onClick={saveUpdate} className="w-full bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px]">Publish to Updates</button>
          </div>
          <div className="mt-6 space-y-2">{updates.map((u:any)=> <div key={u.id} className="flex items-center gap-3 border rounded-xl p-3 bg-white"><div className="flex-1"><p className="text-[12px] font-medium">{u.title}</p><p className="text-[10px] text-[#8e819c]">{u.category}</p></div><button onClick={()=>deleteDocById('updates', u.id)} className="h-8 w-8 rounded-full bg-[#ffe5e5] text-[#ff4d4f] flex items-center justify-center"><X size={12}/></button></div>)}</div>
        </>
      )}

      {/* SCHEDULE */}
      {type==='scheduleItems' && (
        <>
          <div className="mt-6 border rounded-2xl p-4 bg-[#fdfaff] space-y-3">
            <div className="grid grid-cols-4 gap-2"><input value={scheduleForm.day} onChange={e=>setScheduleForm({...scheduleForm, day: e.target.value})} placeholder="20" className="border p-2.5 rounded-xl text-[12px]" /><input value={scheduleForm.month} onChange={e=>setScheduleForm({...scheduleForm, month: e.target.value})} placeholder="JUN" className="border p-2.5 rounded-xl text-[12px]" /><input value={scheduleForm.weekday} onChange={e=>setScheduleForm({...scheduleForm, weekday: e.target.value})} placeholder="FRI" className="border p-2.5 rounded-xl text-[12px]" /><input value={scheduleForm.time} onChange={e=>setScheduleForm({...scheduleForm, time: e.target.value})} placeholder="19:00" className="border p-2.5 rounded-xl text-[12px]" /></div>
            <input value={scheduleForm.title} onChange={e=>setScheduleForm({...scheduleForm, title: e.target.value})} placeholder="Title - BTS WORLD TOUR..." className="w-full border p-2.5 rounded-xl text-[12px]" />
            <input value={scheduleForm.location} onChange={e=>setScheduleForm({...scheduleForm, location: e.target.value})} placeholder="Location - Goyang Stadium" className="w-full border p-2.5 rounded-xl text-[12px]" />
            <button onClick={saveSchedule} className="w-full bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px]">Publish to Schedule</button>
          </div>
          <div className="mt-6 space-y-2">{schedules.map((s:any)=> <div key={s.id} className="flex items-center gap-3 border rounded-xl p-3 bg-white"><div className="flex-1"><p className="text-[12px] font-medium">{s.day} {s.month} - {s.title}</p></div><button onClick={()=>deleteDocById('scheduleItems', s.id)} className="h-8 w-8 rounded-full bg-[#ffe5e5] text-[#ff4d4f] flex items-center justify-center"><X size={12}/></button></div>)}</div>
        </>
      )}

      {/* ACHIEVEMENTS */}
      {type==='achievementItems' && (
        <>
          <div className="mt-6 border rounded-2xl p-4 bg-[#fdfaff] space-y-3">
            <div className="grid grid-cols-2 gap-2"><input value={achieveForm.type} onChange={e=>setAchieveForm({...achieveForm, type: e.target.value})} placeholder="Type - RECORD" className="border p-2.5 rounded-xl text-[12px]" /><input value={achieveForm.year} onChange={e=>setAchieveForm({...achieveForm, year: e.target.value})} placeholder="Year - 2025" className="border p-2.5 rounded-xl text-[12px]" /></div>
            <input value={achieveForm.title} onChange={e=>setAchieveForm({...achieveForm, title: e.target.value})} placeholder="Title - First group to..." className="w-full border p-2.5 rounded-xl text-[12px]" />
            <button onClick={saveAchievement} className="w-full bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px]">Publish to Achievements</button>
          </div>
          <div className="mt-6 space-y-2">{achievements.map((a:any)=> <div key={a.id} className="flex items-center gap-3 border rounded-xl p-3 bg-white"><div className="flex-1"><p className="text-[12px] font-medium">{a.title}</p><p className="text-[10px] text-[#8e819c]">{a.type} • {a.year}</p></div><button onClick={()=>deleteDocById('achievementItems', a.id)} className="h-8 w-8 rounded-full bg-[#ffe5e5] text-[#ff4d4f] flex items-center justify-center"><X size={12}/></button></div>)}</div>
        </>
      )}
    </div>
  );
}
