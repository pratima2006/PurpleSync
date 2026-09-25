import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Palette, Trash2, Save, Eye, EyeOff, Pencil, ExternalLink } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { achievementItems as defaultAchievements } from '../components/data';

const PASSWORD = "borahae13";

export function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [type, setType] = useState<'palette'|'votingItems'|'updates'|'scheduleItems'|'achievementItems'>('achievementItems');

  const today = new Date();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  // PALETTE
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [paletteEvents, setPaletteEvents] = useState<any[]>([]);
  const [paletteForm, setPaletteForm] = useState<any>({ date: `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`, type: 'birthday', title: '', info: '', sourceUrl: '', sourceName: 'BigHit', year: '', time: '', location: '' });

  // VOTING
  const [votingItems, setVotingItems] = useState<any[]>([]);
  const [votingForm, setVotingForm] = useState<any>({ title: '', platform: 'MNET PLUS', voteType: 'app', webLink: '', playStoreLink: '', closeDate: '', note: 'Daily votes available', description: 'Vote once per day.', status: 'open' });

  // OTHER
  const [updates, setUpdates] = useState<any[]>([]);
  const [updateForm, setUpdateForm] = useState({ category: 'NOTICE', title: '', summary: '', date: 'Today', accent: 'purple' });
  const [schedules, setSchedules] = useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ day: '20', month: 'JUN', weekday: 'FRI', type: 'Broadcast', time: '19:00 KST', title: '', location: '' });

  // ACHIEVEMENTS - PRO
  const [achievements, setAchievements] = useState<any[]>([]);
  const [achieveForm, setAchieveForm] = useState({ type: 'RECORD', year: '2025', title: '', subtitle: '', date: '18 June 2025', link: '' });
  const [editingId, setEditingId] = useState<string|null>(null);
  const [showForm, setShowForm] = useState(false);

  const daysInMonth = new Date(2025, currentMonth + 1, 0).getDate();
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

  const getEventsForDay = (day: number) => {
    const mmdd = `${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return paletteEvents.filter(e => e.date === mmdd);
  };
  const selectedDayEvents = useMemo(()=> getEventsForDay(selectedDate), [selectedDate, currentMonth, paletteEvents]);

  const savePalette = async () => {
    if(!paletteForm.title.trim()) return alert('Title required');
    const dateStr = `${String(currentMonth+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;
    await addDoc(collection(db, "paletteEvents"), {...paletteForm, date: dateStr, createdAt: new Date().toISOString()});
    setPaletteForm({ date: dateStr, type: 'birthday', title: '', info: '', sourceUrl: '', sourceName: 'BigHit', year: '', time: '', location: '' });
    alert('Palette live');
  };
  const saveVoting = async () => {
    await addDoc(collection(db, "votingItems"), {...votingForm, closes: 'Closes soon', createdAt: new Date().toISOString()});
    alert('Voting live');
  };
  const saveUpdate = async () => {
    await addDoc(collection(db, "updates"), {...updateForm, createdAt: new Date().toISOString()});
    alert('Update live');
  };
  const saveSchedule = async () => {
    await addDoc(collection(db, "scheduleItems"), {...scheduleForm, createdAt: new Date().toISOString()});
    alert('Schedule live');
  };

  // ACHIEVEMENT SAVE/EDIT/HIDE/DELETE
  const saveAchievement = async () => {
    if(!achieveForm.title.trim()) return alert('Title required');
    if(editingId){
      await updateDoc(doc(db, "achievementItems", editingId), {...achieveForm});
      setEditingId(null);
    } else {
      await addDoc(collection(db, "achievementItems"), {...achieveForm, hidden: false, createdAt: new Date().toISOString()});
    }
    setAchieveForm({ type: 'RECORD', year: '2025', title: '', subtitle: '', date: '18 June 2025', link: '' });
    setShowForm(false);
    alert(editingId?'Updated':'Published');
  };
  const deleteDocById = async (col: string, id: string) => {
    if(!confirm('Delete?')) return;
    await deleteDoc(doc(db, col, id));
  };
  const toggleHide = async (item: any) => {
    await updateDoc(doc(db, "achievementItems", item.id), { hidden:!item.hidden });
  };
  const startEdit = (item: any) => {
    setAchieveForm({ type: item.type||'RECORD', year: item.year||'2025', title: item.title||'', subtitle: item.subtitle||'', date: item.date||'18 June 2025', link: item.link||'' });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({top:0, behavior:'smooth'});
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
        <option value="palette">🎨 Palette - Calendar</option>
        <option value="votingItems">🗳️ Voting</option>
        <option value="updates">📰 Updates</option>
        <option value="scheduleItems">📅 Schedule</option>
        <option value="achievementItems">🏆 Achievements - Archive (PRO)</option>
      </select>

      {type==='palette' && (
        <>
          <div className="mt-6 flex items-center justify-between"><h2 className="text-[14px] font-semibold flex items-center gap-2"><Palette size={16}/> {monthNames[currentMonth]} - {paletteEvents.length} total</h2></div>
          <div className="mt-4 ps-panel rounded-2xl p-4 bg-white border border-[#ece6f3]">
            <div className="flex items-center justify-between mb-4"><span className="text-[13px] font-semibold">{monthNames[currentMonth]} 2025</span><div className="flex gap-1"><button onClick={()=>setCurrentMonth(m=>m>0?m-1:11)} className="rounded-lg border p-1.5">‹</button><button onClick={()=>setCurrentMonth(m=>m<11?m+1:0)} className="rounded-lg border p-1.5">›</button></div></div>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[#998ea2]">{['S','M','T','W','T','F','S'].map(d=> <div key={d} className="py-1">{d}</div>)}{Array.from({length: daysInMonth}, (_,i)=>{const day=i+1;const evs=getEventsForDay(day);const isSel=selectedDate===day;return (<button key={i} onClick={()=>setSelectedDate(day)} className={`min-h-[48px] rounded-lg text-[11px] border ${isSel?'bg-[#5e428f] text-white border-[#5e428f]':'bg-[#fdfcff] border-[#f0e6f8]'} ${evs.length>0 &&!isSel?'bg-[#f0e9f7]':''}`}>{day}{evs.length>0 && <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-[#8d6bb7]"/>}</button>)})}</div>
          </div>
          <div className="mt-4 border border-[#e0d4ed] rounded-2xl p-4 bg-[#fdfaff] space-y-3">
            <p className="text-[12px] font-semibold">Add for {monthNames[currentMonth]} {selectedDate}</p>
            <select value={paletteForm.type} onChange={e=>setPaletteForm({...paletteForm, type: e.target.value as any})} className="w-full border p-2.5 rounded-xl text-[12px] bg-white"><option value="birthday">🎂 Birthday</option><option value="album">💿 Album</option><option value="mv">▶️ MV</option><option value="army">💜 ARMY</option><option value="festa">🎉 FESTA</option><option value="anniversary">✨ Anniversary</option><option value="pet">🐾 Pet</option><option value="black">🖤 Black Day</option></select>
            <input value={paletteForm.title} onChange={e=>setPaletteForm({...paletteForm, title: e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px]" />
            <textarea value={paletteForm.info} onChange={e=>setPaletteForm({...paletteForm, info: e.target.value})} placeholder="Info" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[60px]" />
            <button onClick={savePalette} className="w-full bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"><Save size={14}/> Save to Firebase</button>
          </div>
        </>
      )}

      {type==='achievementItems' && (
        <>
          {/* LIVE PREVIEW - PURPLE BOX SAME AS APP */}
          <div className="mt-6">
            <p className="ps-mono text-[9px] text-[#8068a9] mb-2">LIVE PREVIEW - EXACT APP PURPLE BOX</p>
            <div className="relative overflow-hidden rounded-2xl bg-[#60438f] p-7 text-white">
              <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-[#876bb0]" />
              <p className="relative ps-mono text-[9px] text-[#d0beea]">LATEST ENTRY · {allAchForCount.length + 1}</p>
              <h2 className="ps-display relative mt-8 max-w-[500px] text-[28px] leading-[1.02]">{achieveForm.title||"Three decades.\nOne name at the centre."}</h2>
              <p className="relative mt-5 max-w-[410px] text-[12px] leading-5 text-[#d5c9e5]">{achieveForm.subtitle||"The first group to place three albums at No. 1 across three different decades."}</p>
              <div className="relative mt-6 flex items-end justify-between border-t border-[#8c72b2] pt-4">
                <span className="text-[11px] text-[#d5c9e5]">{achieveForm.date}</span>
                <span className="text-[10px] text-[#d5c9e5]">{achieveForm.type} · {achieveForm.year}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold">Achievements · {achievements.length} custom + {defaultAchievements.length} default = {allAchForCount.length} total</h2>
            <button onClick={()=>{setShowForm(!showForm); setEditingId(null); setAchieveForm({ type: 'RECORD', year: '2025', title: '', subtitle: '', date: '18 June 2025', link: '' })}} className="flex items-center gap-1.5 bg-[#5e428f] text-white px-3.5 py-2 rounded-full text-[11px] font-medium"><Plus size={14}/> {showForm?'Close':'Add New Archive'}</button>
          </div>

          {showForm && (
            <div className="mt-4 border border-[#e0d4ed] rounded-2xl p-4 bg-[#fdfaff] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input value={achieveForm.type} onChange={e=>setAchieveForm({...achieveForm, type: e.target.value})} placeholder="Type - RECORD / NO.1 / BILLBOARD" className="border p-2.5 rounded-xl text-[12px]" />
                <input value={achieveForm.year} onChange={e=>setAchieveForm({...achieveForm, year: e.target.value})} placeholder="Year - 2025" className="border p-2.5 rounded-xl text-[12px]" />
              </div>
              <input value={achieveForm.title} onChange={e=>setAchieveForm({...achieveForm, title: e.target.value})} placeholder="Title - Three decades. One name..." className="w-full border p-2.5 rounded-xl text-[12px] font-medium" />
              <textarea value={achieveForm.subtitle} onChange={e=>setAchieveForm({...achieveForm, subtitle: e.target.value})} placeholder="Subtitle - The first group to place three albums at No. 1..." className="w-full border p-2.5 rounded-xl text-[12px] min-h-[80px]" />
              <div className="grid grid-cols-2 gap-2">
                <input value={achieveForm.date} onChange={e=>setAchieveForm({...achieveForm, date: e.target.value})} placeholder="Date - 18 June 2025" className="border p-2.5 rounded-xl text-[12px]" />
                <input value={achieveForm.link} onChange={e=>setAchieveForm({...achieveForm, link: e.target.value})} placeholder="Link (optional) - https://..." className="border p-2.5 rounded-xl text-[12px]" />
              </div>
              <button onClick={saveAchievement} className="w-full bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"><Save size={14}/> {editingId?'Update Archive':'Publish to App'}</button>
              <p className="text-[10px] text-[#9a8ea2] text-center">Agar title me No.1 likhegi to auto "territories with a No. 1" me count hoga · Total me auto add hoga</p>
            </div>
          )}

          {/* CUSTOM ENTRIES WITH EDIT/HIDE/DELETE */}
          <div className="mt-6">
            <p className="text-[11px] font-semibold text-[#3d324b]">Your Custom Archives (Editable)</p>
            <div className="mt-3 space-y-2">
              {achievements.length===0 && <p className="text-[11px] text-[#9a8ea2]">No custom yet. Add New Archive se add kar.</p>}
              {achievements.map((a:any)=> (
                <div key={a.id} className={`flex gap-3 border rounded-xl p-3 bg-white ${a.hidden?'opacity-50 bg-[#f8f5ff]':''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><span className="text-[9px] px-2 py-0.5 rounded-full bg-[#f5f0fb] text-[#5e428f] font-bold">{a.type}</span><span className="text-[9px] text-[#9a8ea2]">{a.year} {a.hidden&&'· HIDDEN'}</span></div>
                    <p className="text-[12px] font-medium mt-1 truncate">{a.title}</p>
                    <p className="text-[10px] text-[#8e819c] truncate">{a.subtitle}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={()=>startEdit(a)} className="h-8 w-8 rounded-full bg-[#f5f0fb] text-[#5e428f] flex items-center justify-center"><Pencil size={12}/></button>
                    <button onClick={()=>toggleHide(a)} className="h-8 w-8 rounded-full bg-[#f5f0fb] flex items-center justify-center">{a.hidden?<EyeOff size={12}/>:<Eye size={12}/>}</button>
                    <button onClick={()=>deleteDocById('achievementItems', a.id)} className="h-8 w-8 rounded-full bg-[#ffe5e5] text-[#ff4d4f] flex items-center justify-center"><Trash2 size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ALL APP ACHIEVEMENTS FOR DUPLICATE CHECK */}
          <div className="mt-8">
            <p className="text-[11px] font-semibold text-[#3d324b] flex items-center justify-between"><span>All App Achievements - {defaultAchievements.length} default (duplicate check)</span><span className="text-[9px] text-[#9a8ea2] font-normal">No.1 auto detect</span></p>
            <div className="mt-3 max-h-[400px] overflow-y-auto space-y-2 border rounded-xl p-2 bg-[#fdfcff]">
              {defaultAchievements.map((a:any, idx:number)=> {
                const isNo1 = `${a.title}`.toLowerCase().includes('no.1') || `${a.title}`.toLowerCase().includes('no. 1');
                return <div key={idx} className="flex items-center gap-2 text-[10px] p-2 rounded-lg hover:bg-[#f5f0fb]"><span className={`h-1.5 w-1.5 rounded-full ${isNo1?'bg-[#ec4899]':'bg-[#d1c5e0]'}`} /><span className="flex-1 truncate">{a.title}</span><span className="text-[8px] text-[#9a8ea2]">{a.type} {isNo1&&'· NO1'}</span></div>
              })}
            </div>
          </div>
        </>
      )}

      {type==='votingItems' && (
        <div className="mt-6 space-y-3">
          <input value={votingForm.title} onChange={e=>setVotingForm({...votingForm, title: e.target.value})} className="w-full border p-3 rounded-xl text-[13px]" placeholder="Title" />
          <button onClick={saveVoting} className="w-full bg-[#60438f] text-white p-3 rounded-xl text-[13px]">Publish Voting</button>
          {votingItems.map((it:any)=> <div key={it.id} className="flex items-center gap-3 border rounded-xl p-3 bg-white"><p className="flex-1 text-[12px] truncate">{it.title}</p><button onClick={()=>deleteDocById('votingItems', it.id)} className="h-8 w-8 rounded-full bg-[#ffe5e5] flex items-center justify-center"><X size={12}/></button></div>)}
        </div>
      )}

      {type==='updates' && <div className="mt-6"><input value={updateForm.title} onChange={e=>setUpdateForm({...updateForm, title: e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px]" /><button onClick={saveUpdate} className="w-full mt-3 bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px]">Publish Update</button></div>}
      {type==='scheduleItems' && <div className="mt-6"><input value={scheduleForm.title} onChange={e=>setScheduleForm({...scheduleForm, title: e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px]" /><button onClick={saveSchedule} className="w-full mt-3 bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px]">Publish Schedule</button></div>}
    </div>
  );
}
