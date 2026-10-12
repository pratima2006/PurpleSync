import { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Pencil, Save, X, Calendar, Clock } from 'lucide-react';

type VotingForm = {
  title: string;
  platform: string;
  link: string;
  status: 'active' | 'upcoming' | 'closed';
  votingDate: string; // YYYY-MM-DD
  startAt: string; // datetime-local string
  endAt: string; // datetime-local string
};

const getTodayISO = () => new Date().toISOString().split('T')[0];

export function VotingAdmin(){
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<VotingForm>({
    title: '',
    platform: 'MNET PLUS',
    link: '',
    status: 'active',
    votingDate: getTodayISO(),
    startAt: '',
    endAt: ''
  });
  const [editId, setEditId] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "votingItems"),
      (s) => setItems(s.docs.map(d => ({ id: d.id,...d.data() } as any))),
      (err) => console.error("Voting fetch error:", err)
    );
    return () => unsub();
  }, []);

  // Auto-set today's date on open for fast access
  useEffect(() => {
    setForm(f => ({...f, votingDate: f.votingDate || getTodayISO() }));
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      platform: 'MNET PLUS',
      link: '',
      status: 'active',
      votingDate: getTodayISO(),
      startAt: '',
      endAt: ''
    });
    setEditId(null);
  };

  const save = async () => {
    if (!form.title.trim()) return alert('Title required');
    if (!form.link.trim()) return alert('Link required');
    if (!form.votingDate) return alert('Voting Date required');

    setLoading(true);
    try {
      const payload = {
      ...form,
        // For display fallback if not confirmed
        startAt: form.startAt || null,
        endAt: form.endAt || null,
        updatedAt: serverTimestamp()
      };

      if (editId) {
        await updateDoc(doc(db, "votingItems", editId), payload as any);
      } else {
        await addDoc(collection(db, "votingItems"), {
        ...payload,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (e: any) {
      console.error(e);
      alert('Failed to save: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (it: any) => {
    setForm({
      title: it.title || '',
      platform: it.platform || 'MNET PLUS',
      link: it.link || '',
      status: it.status || 'active',
      votingDate: it.votingDate || getTodayISO(),
      startAt: it.startAt || '',
      endAt: it.endAt || ''
    });
    setEditId(it.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await deleteDoc(doc(db, "votingItems", id));
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-[14px]">Voting · {items.length}</h2>
        {editId && (
          <button onClick={resetForm} className="text-[11px] flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
            <X size={12} /> Cancel Edit
          </button>
        )}
      </div>

      <div className="border p-3 rounded-xl bg-white space-y-3">
        <input
          value={form.title}
          onChange={e => setForm({...form, title: e.target.value })}
          placeholder="Voting Title"
          className="w-full border p-2.5 rounded-xl text-[12px] outline-none focus:ring-1 focus:ring-black"
        />

        {/* DATE PICKER - Auto today */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium flex items-center gap-1"><Calendar size={12}/> Voting Date</label>
          <input
            type="date"
            value={form.votingDate}
            onChange={e => setForm({...form, votingDate: e.target.value })}
            className="w-full border p-2.5 rounded-xl text-[12px] outline-none bg-[#fafafd]"
          />
        </div>

        {/* START & END BOXES FOR THAT DATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-medium flex items-center gap-1"><Clock size={12}/> Starts On</label>
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={e => setForm({...form, startAt: e.target.value })}
              className="w-full border p-2.5 rounded-xl text-[12px] outline-none"
            />
            {!form.startAt && <p className="text-[10px] text-gray-400 italic">Not Confirmed • TBD</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium flex items-center gap-1"><Clock size={12}/> Ends On</label>
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={e => setForm({...form, endAt: e.target.value })}
              className="w-full border p-2.5 rounded-xl text-[12px] outline-none"
            />
            {!form.endAt && <p className="text-[10px] text-gray-400 italic">Not Announced • TBD</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            value={form.platform}
            onChange={e => setForm({...form, platform: e.target.value })}
            placeholder="MNET PLUS"
            className="w-full border p-2.5 rounded-xl text-[12px] outline-none"
          />
          <select
            value={form.status}
            onChange={e => setForm({...form, status: e.target.value as any })}
            className="w-full border p-2.5 rounded-xl text-[12px] outline-none bg-white"
          >
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <input
          value={form.link}
          onChange={e => setForm({...form, link: e.target.value })}
          placeholder="Voting Link"
          className="w-full border p-2.5 rounded-xl text-[12px] outline-none"
        />

        <button
          onClick={save}
          disabled={loading}
          className="w-full bg-black text-white p-2.5 rounded-xl text-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Save size={14} /> {loading? 'Saving...' : editId? 'Update' : 'Publish'}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {items.map((it: any) => (
          <div key={it.id} className="border p-3 rounded-xl bg-white">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-[12px] font-medium truncate w-[200px]">{it.title} · {it.platform}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  📅 {it.votingDate? formatDisplayDate(it.votingDate) : 'TBD'}
                </p>
                <div className="flex gap-2 mt-1 text-[10px]">
                  <span className="bg-[#f5f0fb] px-2 py-0.5 rounded-full">
                    Start: {it.startAt? new Date(it.startAt).toLocaleString() : 'Not Confirmed'}
                  </span>
                  <span className="bg-[#eef8ff] px-2 py-0.5 rounded-full">
                    End: {it.endAt? new Date(it.endAt).toLocaleString() : 'Not Announced'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(it)} className="h-8 w-8 bg-[#f5f0fb] rounded-full flex items-center justify-center">
                  <Pencil size={12} />
                </button>
                <button onClick={() => handleDelete(it.id)} className="h-8 w-8 bg-[#ffe5e5] rounded-full flex items-center justify-center">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
