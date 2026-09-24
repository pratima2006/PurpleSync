import { useState, useEffect, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
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

function formatTwoUnits(dateStr?: string, fallback?: string) {
  if (!dateStr) return fallback || 'Closes soon';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Closed';
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  if (d > 0) return `Closes in ${d}d ${String(h).padStart(2,'0')}h`;
  if (h > 0) return `Closes in ${h}h ${String(m).padStart(2,'0')}m`;
  if (m > 0) return `Closes in ${m}m ${String(s).padStart(2,'0')}s`;
  return `Closes in ${s}s`;
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
  const [type, setType] = useState<'votingItems'|'updates'|'scheduleItems'|'achievementItems'>('votingItems');
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

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // FIREBASE LIVE LOAD
  useEffect(() => {
    if (!auth) return;
    if (type !== 'votingItems') {
      const old = JSON.parse(localStorage.getItem(`ps_admin_${type}`) || '[]');
      setItems(old as any);
      return;
    }
    const unsub = onSnapshot(collection(db, "votingItems"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminItem));
      setItems(list);
    });
    return () => unsub();
  }, [auth, type]);

  const liveClosesTwo = useMemo(() => formatTwoUnits(form.closeDate, undefined), [form.closeDate, tick]);
  const liveClosesFour = useMemo(() => formatFourUnits(form.closeDate, undefined), [form.closeDate, tick]);

  const save = async () => {
    if (!form.title.trim()) return alert('Title is required');
    if (!form.webLink.trim()) return alert('Voting link is required');
    if (!form.closeDate) return alert('Please select close date');
    
    if (type !== 'votingItems') {
      const key = `ps_admin_${type}`;
      const old = JSON.parse(localStorage.getItem(key) || '[]');
      const newItem = { id: Date.now(),...form, closes: formatTwoUnits(form.closeDate) };
      const updated = [newItem,...old];
      localStorage.setItem(key, JSON.stringify(updated));
      setItems(updated as any);
      setForm({...form, title: '', webLink: '', closeDate: '' });
      return;
    }

    // FIREBASE SAVE
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

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    if (type !== 'votingItems') {
      const key = `ps_admin_${type}`;
      const updated = items.filter((i: any) => i.id !== id);
      localStorage.setItem(key, JSON.stringify(updated));
      setItems(updated as any);
      return;
    }
    try {
      await deleteDoc(doc(db, "votingItems", id));
    } catch (e: any) {
      alert('Delete error: ' + e.message);
    }
  };

  const resetForm = () => {
    setForm({
      title: '', platform: 'MNET PLUS', voteType: 'app', webLink: '', playStoreLink: '',
      closeDate: '', note: 'Daily votes available', description: 'Vote once per day on the official platform.', status: 'open',
    });
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
        <button onClick={resetForm} className="flex items-center gap-1.5 border border-[#e0d4ed] px-3 py-2 rounded-full text-[11px] font-medium hover:bg-[#f6f1fb]">
          <Plus size={14} /> New
        </button>
      </div>

      <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full border border-[#e0d4ed] p-3 rounded-xl mt-5 bg-white text-[13px]">
        <option value="votingItems">Voting</option>
        <option value="updates">Updates</option>
        <option value="scheduleItems">Schedule</option>
        <option value="achievementItems">Achievements</option>
      </select>

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
                    <button onClick={() => deleteItem(it.id as any)} className="h-8 w-8 rounded-full bg-[#ffe5e5] text-[#ff4d4f] flex items-center justify-center hover:bg-[#ffd0d0]">
                      <X size={14} />
                    </button>
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
              <p className="text-[10px] text-[#8e819c] mt-1.5">Example: 27 Jan 2026, 23:59. Card shows: {liveClosesTwo}. Top purple box shows: {liveClosesFour}</p>
            </div>

            <input value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px] outline-none focus:border-[#60438f]" placeholder="Description - shown on expand" />
            <input value={form.note} onChange={e=>setForm({...form, note: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px] outline-none focus:border-[#60438f]" placeholder="Short note" />

            <select value={form.voteType} onChange={e=>setForm({...form, voteType: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl bg-white text-[13px]">
              <option value="app">App Voting</option>
              <option value="website">Website Voting</option>
            </select>

            <input placeholder="Voting Link" value={form.webLink} onChange={e=>setForm({...form, webLink: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px] outline-none focus:border-[#60438f]" />
            <input placeholder="Play Store Link (optional)" value={form.playStoreLink} onChange={e=>setForm({...form, playStoreLink: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl text-[13px] outline-none focus:border-[#60438f]" />
          </div>
        </>
      )}

      <button onClick={save} className="w-full bg-[#60438f] text-white p-3 rounded-xl mt-6 font-medium text-[13px]">Publish</button>
    </div>
  );
}
