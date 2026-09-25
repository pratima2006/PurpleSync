import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Palette, Save, Trash2, ExternalLink } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

const PASSWORD = "borahae13";

type AdminItem = {
  id: string;
  title: string;
  platform: string;
  closes: string;
  closeDate?: string;
  note: string;
  description: string;
  status: 'open' | 'ended' | 'upcoming';
  voteType: 'app' | 'website';
  webLink: string;
  playStoreLink: string;
};

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

function formatTwoUnits(dateStr?: string, fallback?: string) {
  if (!dateStr) return fallback || 'Closes soon';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Closed';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  if (d > 0) return `Closes in ${d}d ${String(h).padStart(2,'0')}h`;
  const m = Math.floor((diff / (1000 * 60)) % 60);
  return `Closes in ${d > 0? d + 'd ' + h + 'h' : h + 'h ' + String(m).padStart(2,'0') + 'm'}`;
}

function formatFourUnits(dateStr?: string, fallback?: string) {
  if (!dateStr) return fallback || '--';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Closed';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [type, setType] = useState<'votingItems'|'updates'|'scheduleItems'|'achievementItems'|'palette'>('palette');
  const [items, setItems] = useState<AdminItem[]>([]);
  const [form, setForm] = useState<any>({
    title: '',
    platform: 'MNET PLUS',
    voteType: 'app',
    webLink: '',
    playStoreLink: '',
    closeDate: '',
    note: 'Daily votes available',
    description: 'Vote once per day on the official platform.',
    status: 'open',
  });
  const [tick, setTick] = useState(0);

  // Palette States
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [paletteEvents, setPaletteEvents] = useState<ArchiveEvent[]>([]);
  const [paletteForm, setPaletteForm] = useState<ArchiveEvent>({ date: `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`, type: 'birthday', title: '', info: '', sourceUrl: '', sourceName: 'BigHit', year: '', time: '', location: '' });
  const [showAdd, setShowAdd] = useState(false);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(2025, currentMonth + 1, 0).getDate();

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // LOAD - Voting from Firebase, Palette from Firebase + localStorage fallback
  useEffect(() => {
    if (!auth) return;
    if (type === 'palette') {
      // Firebase live for palette
      const unsub = onSnapshot(collection(db, "paletteEvents"), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id,...d.data() } as ArchiveEvent));
        setPaletteEvents(list);
        // localStorage me bhi save taki app wala page bina firebase ke bhi chal jaye
        localStorage.setItem('ps_admin_paletteEvents', JSON.stringify(list));
      });
      // fallback old localStorage
      const old = JSON.parse(localStorage.getItem('ps_admin_paletteEvents')||'[]');
      if(old.length>0 && paletteEvents.length===0) setPaletteEvents(old);
      return () => unsub();
    }
    if (type === 'votingItems') {
      const unsub = onSnapshot(collection(db, "votingItems"), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id,...d.data() } as AdminItem));
        setItems(list);
      });
      return () => unsub();
    } else {
      const old = JSON.parse(localStorage.getItem(`ps_admin_${type}`) || '[]');
      setItems(old as any);
    }
  }, [auth, type]);

  const liveClosesTwo = useMemo(() => formatTwoUnits(form.closeDate, undefined), [form.closeDate, tick]);
  const liveClosesFour = useMemo(() => formatFourUnits(form.closeDate, undefined), [form.closeDate, tick]);

  const getEventsForDay = (day: number) => {
    const mmdd = `${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return paletteEvents.filter(e => e.date === mmdd);
  };
  const selectedDayEvents = useMemo(()=> getEventsForDay(selectedDate), [selectedDate, currentMonth, paletteEvents]);

  // VOTING SAVE - TERA PURANA CODE WAISE KA WAISA
  const save = async () => {
    if (!form.title.trim()) return alert('Title is required');
    if (!form.webLink.trim()) return alert('Voting link is required');
    if (!form.closeDate) return alert('Please select close date');

    if (type!== 'votingItems') {
      const key = `ps_admin_${type}`;
      const old = JSON.parse(localStorage.getItem(key) || '[]');
      const newItem = { id: Date.now(),...form, closes: formatTwoUnits(form.closeDate) };
      const updated = [newItem,...old];
      localStorage.setItem(key, JSON.stringify(updated));
      setItems(updated as any);
      setForm({...form, title: '', webLink: '', closeDate: '' });
      return;
    }

    try {
      await addDoc(collection(db, "votingItems"), {
        title: form.title.trim(),
        platform: form.platform || 'MNET PLUS',
        closes: formatTwoUnits(form.closeDate),
        closeDate: form.closeDate,
        note: form.note,
        description: form.description,
        status: form.status,
        voteType: form.voteType,
        webLink: form.webLink.trim(),
        playStoreLink: form.playStoreLink.trim(),
        createdAt: new Date().toISOString(),
      });
      setForm({...form, title: '', webLink: '', closeDate: '' });
      alert('Published to Firebase! Sabke phone me live ho gaya 🔥');
    } catch (e: any) {
      alert('Firebase error: ' + e.message);
    }
  };

  // PALETTE SAVE - AB FIREBASE LIVE
  const savePaletteEvent = async () => {
    if(!paletteForm.title.trim() ||!paletteForm.info.trim()) return alert('Title and Info required');
    const dateStr = `${String(currentMonth+1).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;
    try {
      await addDoc(collection(db, "paletteEvents"), {
        date: dateStr,
        type: paletteForm.type,
        title: paletteForm.title.trim(),
        info: paletteForm.info.trim(),
        sourceUrl: paletteForm.sourceUrl || '',
        sourceName: paletteForm.sourceName || 'BigHit',
        year: paletteForm.year || '',
        time: paletteForm.time || '',
        location: paletteForm.location || '',
        createdAt: new Date().toISOString(),
      });
      setPaletteForm({ date: dateStr, type: 'birthday', title: '', info: '', sourceUrl: '', sourceName: 'BigHit', year: '', time: '', location: '' });
      setShowAdd(false);
      alert(`Added for ${monthNames[currentMonth]} ${selectedDate} - Firebase Live 🔥`);
    } catch (e:any) {
      alert('Firebase error: ' + e.message);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    if (type === 'palette') {
      try { await deleteDoc(doc(db, "paletteEvents", id)); } catch(e:any){ alert(e.message); }
      return;
    }
    if (type!== 'votingItems') {
      const key = `ps_admin_${type}`;
      const updated = items.filter((i: any) => i.id!== id);
      localStorage.setItem(key, JSON.stringify(updated));
      setItems(updated as any);
      return;
    }
    try { await deleteDoc(doc(db, "votingItems", id)); } catch (e: any) { alert('Delete error: ' + e.message); }
  };

  const resetForm = () => {
    setForm({ title: '', platform: 'MNET PLUS', voteType: 'app', webLink: '', playStoreLink: '', closeDate: '', note: 'Daily votes available', description: 'Vote once per day on the official platform.', status: 'open' });
  };

  if (!auth) return (
    <div className="p-10 max-w-sm mx-auto">
      <h1 className="font-semibold text-[18px]">Admin Access</h1>
      <p className="text-[12px] text-[#8e819c] mt-1">Restricted</p>
      <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full border border-[#e0d4ed] p-3 rounded-xl mt-4 outline-none focus:border-[#60438f]" />
      <button onClick={()=> pass===PASSWORD? setAuth(true): alert('Incorrect password')} className="w-full bg-[#60438f] text-white p-3 rounded-xl mt-3 font-medium">Continue</button>
    </div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold tracking-tight">Admin Panel</h1>
        <button onClick={resetForm} className="flex items-center gap-1.5 border border-[#e0d4ed] px-3 py-2 rounded-full text-[11px] font-medium hover:bg-[#f6f1fb]"><Plus size={14} /> New</button>
      </div>

      <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full border border-[#e0d4ed] p-3 rounded-xl mt-5 bg-white text-[13px]">
        <option value="palette">Palette of Memories 🎨</option>
        <option value="votingItems">Voting</option>
        <option value="updates">Updates</option>
        <option value="scheduleItems">Schedule</option>
        <option value="achievementItems">Achievements</option>
      </select>

      {type === 'palette' && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#3d324b] flex items-center gap-2"><Palette size={16}/> {monthNames[currentMonth]} 2025 - {paletteEvents.length} total</h2>
            <button onClick={()=>setShowAdd(!showAdd)} className="flex items-center gap-1.5 bg-[#5e428f] text-white px-3.5 py-2 rounded-full text-[11px] font-medium"><Plus size={14}/> Add Memory</button>
          </div>

          <div className="mt-4 ps-panel rounded-2xl p-4 bg-white border border-[#ece6f3]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold">{monthNames[currentMonth]} 2025</span>
              <div className="flex gap-1">
                <button onClick={()=>setCurrentMonth(m=>m>0?m-1:11)} className="rounded-lg border p-1.5">‹</button>
                <button onClick={()=>setCurrentMonth(m=>m<11?m+1:0)} className="rounded-lg border p-1.5">›</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[#998ea2]">
              {['S','M','T','W','T','F','S'].map(d=> <div key={d} className="py-1">{d}</div>)}
              {Array.from({length: daysInMonth}, (_,i)=>{
                const day=i+1;
                const evs=getEventsForDay(day);
                const isSel=selectedDate===day;
                return (
                  <button key={i} onClick={()=>setSelectedDate(day)} className={`min-h-[48px] rounded-lg text-[11px] border ${isSel?'bg-[#5e428f] text-white border-[#5e428f]':'bg-[#fdfcff] border-[#f0e6f8] hover:bg-[#f5f0fb]'} ${evs.length>0 &&!isSel?'bg-[#f0e9f7]':''}`}>
                    {day}{evs.length>0 && <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-[#8d6bb7]"/>}
                  </button>
                )
              })}
            </div>
          </div>

          {showAdd && (
            <div className="mt-4 border border-[#e0d4ed] rounded-2xl p-4 bg-[#fdfaff] space-y-3">
              <p className="text-[12px] font-semibold">Add Memory for {monthNames[currentMonth]} {selectedDate}</p>
              <select value={paletteForm.type} onChange={e=>setPaletteForm({...paletteForm, type: e.target.value as any})} className="w-full border p-2.5 rounded-xl text-[12px] bg-white">
                <option value="birthday">🎂 Birthday</option>
                <option value="album">💿 Album Anniversary</option>
                <option value="mv">▶️ MV Anniversary</option>
                <option value="army">💜 ARMY Day</option>
                <option value="festa">🎉 FESTA</option>
                <option value="anniversary">✨ BTS Anniversary</option>
                <option value="pet">🐾 Pet Birthday</option>
                <option value="black">🖤 Black Day</option>
              </select>
              <input value={paletteForm.title} onChange={e=>setPaletteForm({...paletteForm, title: e.target.value})} placeholder="Title" className="w-full border p-2.5 rounded-xl text-[12px]" />
              <textarea value={paletteForm.info} onChange={e=>setPaletteForm({...paletteForm, info: e.target.value})} placeholder="Info" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[60px]" />
              <div className="grid grid-cols-2 gap-2">
                <input value={paletteForm.time||''} onChange={e=>setPaletteForm({...paletteForm, time: e.target.value})} placeholder="19:00 KST" className="w-full border p-2.5 rounded-xl text-[12px]" />
                <input value={paletteForm.location||''} onChange={e=>setPaletteForm({...paletteForm, location: e.target.value})} placeholder="Location" className="w-full border p-2.5 rounded-xl text-[12px]" />
              </div>
              <input value={paletteForm.sourceUrl||''} onChange={e=>setPaletteForm({...paletteForm, sourceUrl: e.target.value})} placeholder="Link https://..." className="w-full border p-2.5 rounded-xl text-[12px]" />
              <button onClick={savePaletteEvent} className="w-full bg-[#5e428f] text-white p-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"><Save size={14}/> Save Memory (Firebase Live)</button>
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-white border border-[#ece6f3] p-4">
            <h3 className="text-[13px] font-semibold">{monthNames[currentMonth]} {selectedDate} - {selectedDayEvents.length} Memories</h3>
            <div className="mt-4 grid gap-3">
              {selectedDayEvents.length===0 && <p className="text-[11px] text-[#b8aec7] text-center py-4">No memories yet.</p>}
              {selectedDayEvents.map((ev,idx)=>{
                const colors: any = { birthday: "#ec4899", album: "#d97706", pet: "#fb923c", army: "#5e428f", festa: "#8b5cf6", anniversary: "#7c3aed", mv: "#ef4444", black: "#27272a" };
                const bg = colors[ev.type]||"#5e428f";
                return (
                  <div key={ev.id||idx} className="flex gap-3 rounded-xl border p-3.5" style={{borderColor: `${bg}20`, backgroundColor: `${bg}0D`}}>
                    <div className="flex-1 min-w-0">
                      <span className="rounded-full px-2 py-0.5 text-[8px] font-bold text-white" style={{background: bg}}>{ev.type.toUpperCase()}</span>
                      <h4 className="mt-1 text-[12px] font-semibold">{ev.title}</h4>
                      <p className="text-[10px] text-[#7b6a93] mt-0.5">{ev.info}</p>
                    </div>
                    <button onClick={()=>deleteItem(ev.id!)} className="h-8 w-8 rounded-full bg-[#ffe5e5] text-[#ff4d4f] flex items-center justify-center shrink-0"><Trash2 size={12}/></button>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {type === 'votingItems' && (
        <>
          <p className="ps-mono text-[9px] text-[#8068a9] mt-6 mb-2">PREVIEW</p>
          <article className="ps-panel rounded-2xl p-5 border border-[#e0d4ed] bg-white">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${form.status === 'open'? 'bg-[#6aaf8f]' : 'bg-[#b3a9bc]'}`} />
              <span className="ps-mono text-[9px] text-[#8e819c]">{form.platform}</span>
            </div>
            <h2 className="mt-3 text-[16px] font-semibold text-[#3d324b]">{form.title || 'Title'}</h2>
            <div className="mt-6">
              <p className="ps-mono text-[9px] text-[#95899d]">STATUS</p>
              <p className="mt-1 text-[12px] font-medium text-[#6b9c7e]">{liveClosesTwo}</p>
              <p className="mt-1 text-[10px] text-[#8e819c]">Top box preview: {liveClosesFour}</p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#958a9c]">{form.note}</span>
              <span className="rounded-lg bg-[#60438f] px-3 py-2 text-[11px] font-semibold text-white">Open official page</span>
            </div>
          </article>

          {items.length > 0 && (
            <div className="mt-8">
              <p className="ps-mono text-[9px] text-[#8068a9] mb-3">PUBLISHED - {items.length} (Firebase Live)</p>
              <div className="space-y-3">
                {items.map(it => (
                  <div key={it.id} className="flex items-center gap-3 border border-[#e0d4ed] rounded-xl p-3 bg-white">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{it.title}</p>
                      <p className="text-[10px] text-[#8e819c] truncate">{it.platform} • {formatTwoUnits(it.closeDate, it.closes)}</p>
                    </div>
                    <button onClick={() => deleteItem(it.id as any)} className="h-8 w-8 rounded-full bg-[#ffe5e5] text-[#ff4d4f] flex items-center justify-center hover:bg-[#ffd0d0]"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px] outline-none focus:border-[#60438f]" placeholder="Title" />
            <input value={form.platform} onChange={e=>setForm({...form, platform: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px] outline-none focus:border-[#60438f]" placeholder="Platform - MNET PLUS" />
            <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl bg-white text-[13px]">
              <option value="open">Open</option>
              <option value="upcoming">Upcoming - Opens 26 Jun</option>
              <option value="ended">Ended</option>
            </select>
            <div className="border border-[#e0d4ed] rounded-xl p-3 bg-[#fdfaff]">
              <label className="ps-mono text-[9px] text-[#8068a9]">CLOSE DATE</label>
              <input type="datetime-local" value={form.closeDate} onChange={e=>setForm({...form, closeDate: e.target.value})} className="w-full mt-2 border border-[#e0d4ed] p-2.5 rounded-lg text-[13px]" />
              <p className="text-[10px] text-[#8e819c] mt-1.5">Card shows: {liveClosesTwo}. Top purple box shows: {liveClosesFour}</p>
            </div>
            <input value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px] outline-none focus:border-[#60438f]" placeholder="Description" />
            <input value={form.note} onChange={e=>setForm({...form, note: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px] outline-none focus:border-[#60438f]" placeholder="Short note" />
            <select value={form.voteType} onChange={e=>setForm({...form, voteType: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl bg-white text-[13px]">
              <option value="app">App Voting</option>
              <option value="website">Website Voting</option>
            </select>
            <input placeholder="Voting Link" value={form.webLink} onChange={e=>setForm({...form, webLink: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px] outline-none focus:border-[#60438f]" />
            <input placeholder="Play Store Link (optional)" value={form.playStoreLink} onChange={e=>setForm({...form, playStoreLink: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px] outline-none focus:border-[#60438f]" />
          </div>
          <button onClick={save} className="w-full bg-[#60438f] text-white p-3 rounded-xl mt-6 font-medium text-[13px]">Publish</button>
        </>
      )}
    </div>
  );
}
