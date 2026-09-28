import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Pencil, Trash2, Eye, EyeOff, Plus, Save, X, Image as ImageIcon, Type, Link2 } from 'lucide-react';
import { achievementItems as defaults } from '../../components/data';

function FullScreenEditor({ form, setForm, onSave, onClose, isEditing }: any) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-block]')) return;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBlock = {
      id: Date.now().toString(),
      type: 'text',
      content: '',
      x, y,
      w: 280,
      isNew: true
    };
    setForm({...form, contentBlocks: [...(form.contentBlocks || []), newBlock] });
  };

  const handleDoubleClick = (id: string, e: any) => {
    e.stopPropagation();
    setDragId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragId ||!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    const updated = form.contentBlocks.map((b: any) =>
      b.id === dragId? {...b, x: newX, y: newY } : b
    );
    setForm({...form, contentBlocks: updated });
  };

  const handlePointerDown = (e: React.PointerEvent, block: any) => {
    if (dragId!== block.id) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    setDragId(null);
  };

  const addImage = (url: string) => {
    const newBlock = {
      id: Date.now().toString(),
      type: 'image',
      content: url,
      x: 100,
      y: 120,
      w: 320,
    };
    setForm({...form, contentBlocks: [...(form.contentBlocks || []), newBlock] });
  };

  const handleFile = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addImage(url);
  };

  const deleteBlock = (id: string) => {
    setForm({...form, contentBlocks: form.contentBlocks.filter((b: any) => b.id!== id) });
  };

  const updateText = (id: string, text: string) => {
    const updated = form.contentBlocks.map((b: any) => b.id === id? {...b, content: text, isNew: false } : b);
    setForm({...form, contentBlocks: updated });
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#f5f3ff] flex flex-col">
      <div className="bg-white border-b p-3 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h2 className="text-[11px] font-bold tracking-widest">DESKTOP FULL SCREEN - EDIT ANYWHERE</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center"><X size={14} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.type} onChange={e => setForm({...form, type: e.target.value })} placeholder="Type - RECORD" className="border p-2 rounded-xl text-[11px]" />
          <input value={form.year} onChange={e => setForm({...form, year: e.target.value })} placeholder="Year - 2026" className="border p-2 rounded-xl text-[11px]" />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value })} placeholder="Title - VMAs 2026 Triple Crown" className="border p-2.5 rounded-xl text-[12px] font-medium" />
          <textarea value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value })} placeholder="Subtitle - short summary" className="border p-2.5 rounded-xl text-[11px] min-h-[50px]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.date} onChange={e => setForm({...form, date: e.target.value })} placeholder="Date - 27 Sep 2026" className="border p-2 rounded-xl text-[11px]" />
          <input value={form.link} onChange={e => setForm({...form, link: e.target.value })} placeholder="Official Link" className="border p-2 rounded-xl text-[11px]" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-black text-white px-3 py-2 rounded-full text-[11px]"><ImageIcon size={12} /> +Add pics</button>
          <button onClick={() => { const url = prompt('Image URL paste karo:'); if (url) addImage(url); }} className="flex items-center gap-1.5 bg-[#f0e9f7] px-3 py-2 rounded-full text-[11px] border"><Link2 size={12} /> +Add link</button>
          <button onClick={onSave} className="ml-auto flex items-center gap-1.5 bg-[#5e428f] text-white px-5 py-2 rounded-full text-[11px] font-medium"><Save size={12} /> {isEditing? 'Update' : 'Publish'}</button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>

      <div className="flex-1 overflow-auto p-4 bg-[#eeebf5]" style={{ touchAction: 'none' }}>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative mx-auto bg-white min-h-[900px] w-full max-w-[800px] rounded-xl shadow-sm border"
        >
          <div className="absolute inset-0 pointer-events-none rounded-xl opacity-[0.07]" style={{ backgroundImage: `repeating-linear-gradient(transparent 0 23px, #5e428f 24px)`, backgroundPosition: '0 80px' }} />

          <div className="relative p-6 pt-4">
            <p className="text-[8px] tracking-[0.2em] text-[#b8aec7]">VERIFIED RECORD · FULL STORY · PREVIEW LIKE YOUR PIC</p>
            {form.link && <p className="text-[10px] text-[#5e428f] break-all mt-1">{form.link}</p>}
            <div className="mt-6 h-px bg-[#f0e6f8]" />
            <p className="mt-3 text-[10px] text-[#b8aec7]">Tip: Kahin bhi click karo to text likho. Pic pe double-click karo fir drag karo. Text apne aap pic ke side me chala jayega.</p>
          </div>

          {(form.contentBlocks || []).map((block: any) => (
            <div
              key={block.id}
              data-block
              onDoubleClick={(e) => handleDoubleClick(block.id, e)}
              onPointerDown={(e) => handlePointerDown(e, block)}
              className={`absolute group touch-none ${dragId === block.id? 'cursor-grabbing z-50 ring-2 ring-[#5e428f] shadow-xl' : 'cursor-grab'}`}
              style={{ left: block.x, top: block.y, width: block.w }}
            >
              {block.type === 'image'? (
                <div className="relative">
                  <img src={block.content} className="w-full rounded-xl border shadow-sm pointer-events-none select-none" draggable={false} />
                  <button onClick={() => deleteBlock(block.id)} className="absolute -top-2 -right-2 h-6 w-6 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                  {dragId!== block.id && <p className="text-[8px] text-center text-[#8e819c] mt-1">double tap to drag</p>}
                </div>
              ) : (
                <div className="relative">
                  <textarea
                    value={block.content}
                    onChange={(e) => updateText(block.id, e.target.value)}
                    autoFocus={block.isNew}
                    className="w-full bg-white/80 backdrop-blur-sm border border-transparent resize-none outline-none text-[12px] leading-[24px] p-2 rounded-xl focus:bg-white focus:border-[#d8c9ec] focus:ring-2 focus:ring-[#f0e9f7] shadow-sm"
                    style={{ minHeight: '48px' }}
                    placeholder="Type here..."
                  />
                  <button onClick={() => deleteBlock(block.id)} className="absolute -right-2 -top-2 h-5 w-5 bg-black/70 text-white rounded-full hidden group-hover:flex items-center justify-center"><Trash2 size={10} /></button>
                </div>
              )}
            </div>
          ))}

          {(form.contentBlocks || []).length === 0 && (
            <div className="mt-40 text-center pointer-events-none">
              <Type size={28} className="mx-auto text-[#d8c9ec] mb-3" />
              <p className="text-[12px] text-[#8e819c] font-medium">Click anywhere on this white box to add text</p>
              <p className="text-[10px] text-[#b8aec7] mt-1">Like MS Word - text will auto-move around images<br/>On phone: Double tap image, then drag - screen will NOT scroll</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AchievementsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    type: 'RECORD',
    year: '2025',
    title: '',
    subtitle: '',
    fullInfo: '',
    date: '18 June 2025',
    link: '',
    contentBlocks: [] as any[],
    columns: 1
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "achievementItems"), s => setItems(s.docs.map(d => ({ id: d.id,...d.data() } as any))));
    return () => unsub();
  }, []);

  const save = async () => {
    if (!form.title.trim()) return alert('Title required');
    if (editingId) {
      await updateDoc(doc(db, "achievementItems", editingId), form as any);
    } else {
      await addDoc(collection(db, "achievementItems"), {...form, hidden: false, createdAt: new Date().toISOString() });
    }
    setForm({ type: 'RECORD', year: '2025', title: '', subtitle: '', fullInfo: '', date: '18 June 2025', link: '', contentBlocks: [], columns: 1 });
    setEditingId(null);
    setIsFull(false);
  };

  const toggleHide = async (item: any) => {
    await updateDoc(doc(db, "achievementItems", item.id), { hidden:!item.hidden });
  };

  if (isFull) return <FullScreenEditor form={form} setForm={setForm} onSave={save} onClose={() => { setIsFull(false); setEditingId(null); }} isEditing={!!editingId} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-[14px]">Achievements · {items.length + defaults.length} total</h2>
        <button onClick={() => setIsFull(true)} className="bg-black text-white px-3 py-2 rounded-full text-[11px] flex gap-1.5 items-center"><Plus size={14} /> Add New Archive</button>
      </div>

      <div className="border p-3 rounded-xl bg-white space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input value={form.type} onChange={e => setForm({...form, type: e.target.value })} placeholder="Type - RECORD" className="w-full border p-2.5 rounded-xl text-[12px]" />
          <input value={form.year} onChange={e => setForm({...form, year: e.target.value })} placeholder="Year - 2025" className="w-full border p-2.5 rounded-xl text-[12px]" />
        </div>
        <input value={form.title} onChange={e => setForm({...form, title: e.target.value })} placeholder="Title - BTS ranks No. 1 in tour revenue with ARIRANG." className="w-full border p-2.5 rounded-xl text-[12px] font-medium" />
        <textarea value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value })} placeholder="Subtitle" className="w-full border p-2.5 rounded-xl text-[12px] min-h-[60px]" />
        <div className="grid grid-cols-2 gap-2">
          <input value={form.date} onChange={e => setForm({...form, date: e.target.value })} placeholder="Date - 18 June 2025" className="border p-2.5 rounded-xl text-[12px]" />
          <input value={form.link} onChange={e => setForm({...form, link: e.target.value })} placeholder="Official Link" className="border p-2.5 rounded-xl text-[12px]" />
        </div>
        <button onClick={() => setIsFull(true)} className="w-full border border-black p-2.5 rounded-xl text-[12px] font-medium">Open Full Screen Editor for Pics & Links (Desktop Full Box)</button>
        <button onClick={save} className="w-full bg-black text-white p-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"><Save size={14} /> {editingId? 'Update' : 'Publish'}</button>
      </div>

      <div className="space-y-2">
        {items.map((a: any) => (
          <div key={a.id} className={`flex gap-3 border rounded-xl p-3 bg-white ${a.hidden? 'opacity-50' : ''}`}>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate">{a.title}</p>
              <p className="text-[10px] text-[#8e819c] truncate">{a.subtitle}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setForm(a); setEditingId(a.id); setIsFull(true); }} className="h-8 w-8 rounded-full bg-[#f5f0fb] flex items-center justify-center"><Pencil size={12} /></button>
              <button onClick={() => toggleHide(a)} className="h-8 w-8 rounded-full bg-[#f5f0fb] flex items-center justify-center">{a.hidden? <EyeOff size={12} /> : <Eye size={12} />}</button>
              <button onClick={async () => { if (confirm('Delete?')) await deleteDoc(doc(db, "achievementItems", a.id)) }} className="h-8 w-8 rounded-full bg-[#ffe5e5] flex items-center justify-center"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
