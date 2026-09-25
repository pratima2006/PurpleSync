import { useState, useRef, useEffect } from 'react';
import { X, Check, Image as ImageIcon, Link2 } from 'lucide-react';

type Block = {
  id: string;
  type: 'image'|'link';
  url?: string;
  width: number;
  x?: number; y?: number;
  settled: boolean;
  showOptions: boolean;
};

export function FullScreenEditor({ form, setForm, onSave, onClose, isEditing }: any) {
  const fileRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [linkInput, setLinkInput] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [dragId, setDragId] = useState<string|null>(null);
  const blocks: any[] = form.contentBlocks || [];

  const addImage = (e: any) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newBlock: Block = {
        id: Date.now().toString(),
        type: 'image',
        url: reader.result as string,
        width: 90,
        settled: false,
        showOptions: true
      };
      setForm({...form, contentBlocks: [...blocks, newBlock]});
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addLink = () => {
    if(!linkInput.trim()) return;
    const newBlock = { id: Date.now().toString(), type:'link', url:linkInput, width: 100, settled:false, showOptions:true };
    setForm({...form, contentBlocks: [...blocks, newBlock]});
    setLinkInput(''); setShowLink(false);
  };

  const update = (id: string, patch: any) => {
    setForm({...form, contentBlocks: blocks.map((b:any)=> b.id===id? {...b,...patch}: b)});
  };
  const remove = (id: string) => {
    if(!confirm('Delete?')) return;
    setForm({...form, contentBlocks: blocks.filter((b:any)=>b.id!==id)});
  };

  // DRAG FIX - page scroll nahi hoga
  useEffect(()=>{
    const onMove = (e: MouseEvent | TouchEvent) => {
      if(!dragId) return;
      if((e as TouchEvent).touches) (e as any).preventDefault();
    };
    const onUp = () => setDragId(null);
    window.addEventListener('touchmove', onMove as any, {passive:false});
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return ()=>{
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragId]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#fbf8ff] overflow-y-auto">
      <div className="sticky top-0 z-20 bg-white border-b border-[#e0d4ed] p-3 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full border"><X size={14}/> Close</button>
        <p className="ps-mono text-[9px] text-[#8068a9] hidden md:block">DESKTOP FULL SCREEN - JAISA PIC ME DIKHA</p>
        <button onClick={onSave} className="bg-[#5e428f] text-white px-4 py-1.5 rounded-full text-[11px] font-medium">{isEditing? 'Update' : 'Publish'}</button>
      </div>

      {/* PIC JAISA FULL SCREEN BOX - DESKTOP MODE */}
      <div className="w-full max-w-[760px] mx-auto p-3 md:p-8 pb-24">
        <div className="flex gap-2 mb-4">
          <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-1.5 bg-white border border-[#e0d4ed] px-4 py-2 rounded-full text-[11px] font-medium"><ImageIcon size={14}/> +Add pics</button>
          <button onClick={()=>setShowLink(!showLink)} className="flex items-center gap-1.5 bg-white border border-[#e0d4ed] px-4 py-2 rounded-full text-[11px] font-medium"><Link2 size={14}/> +Add links</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addImage} />
        </div>

        {showLink && (
          <div className="flex gap-2 mb-4 bg-white p-2 rounded-xl border">
            <input value={linkInput} onChange={e=>setLinkInput(e.target.value)} placeholder="https://..." className="flex-1 border p-2 rounded-xl text-[11px]" />
            <button onClick={addLink} className="bg-[#5e428f] text-white px-4 rounded-xl text-[11px]">Add</button>
          </div>
        )}

        {/* YE BOX AB EXACT TERI PIC JAISA DIKHEGA */}
        <div ref={containerRef} className="ps-panel rounded-2xl p-6 md:p-8 bg-white border border-[#eeeaf3]">
          <p className="ps-mono text-[9px] text-[#907fa0]">VERIFIED RECORD - FULL STORY - PREVIEW LIKE YOUR PIC</p>

          <div className="mt-4 space-y-4">
            <textarea
              value={form.fullInfo}
              onChange={e=>setForm({...form, fullInfo: e.target.value})}
              placeholder="Yahan full story likh - jaise pic me dikh raha hai - text upar niche ayega, pic beech me full width"
              className="w-full min-h-[120px] bg-transparent outline-none text-[13px] leading-6 text-[#40334e] resize-none"
              style={{whiteSpace:'pre-wrap', wordBreak:'break-word'}}
            />

            {/* PICS - AB PIC KE NICHE TEXT NAHI JAYEGA, PIC FULL WIDTH BLOCK JAISA PIC ME HAI */}
            {blocks.map((b:any)=>(
              <div
                key={b.id}
                onClick={()=>{ if(b.settled) update(b.id, { settled:false, showOptions:true }); }}
                className={`relative rounded-xl overflow-hidden ${b.settled? 'border-0' : 'border-2 border-[#8b5cf6] bg-white p-2 shadow-lg'}`}
                style={{ width: b.settled? '100%' : `${b.width}%`, margin: '0 auto' }}
              >
                {b.showOptions &&!b.settled && (
                  <div className="flex justify-between mb-2">
                    <button onClick={()=>remove(b.id)} className="h-6 w-6 bg-black text-white rounded-full flex items-center justify-center"><X size={12}/></button>
                    <button onClick={()=>update(b.id, { settled:true, showOptions:false })} className="h-6 w-6 bg-black text-white rounded-full flex items-center justify-center"><Check size={12}/></button>
                  </div>
                )}
                {b.type==='image'? (
                  <img src={b.url} className="w-full h-auto rounded-xl object-cover mx-auto" style={{maxHeight:'500px'}} />
                ) : (
                  <a href={b.url} target="_blank" className="text-[11px] text-blue-600 underline break-all block p-3 bg-[#eff6ff] rounded-xl">{b.url}</a>
                )}
                {b.showOptions &&!b.settled && <p className="text-[8px] text-center mt-1 text-[#9a8ea2]">✓ dabao toh pic yahi settle hogi, click karke wapas edit</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
