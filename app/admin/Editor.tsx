import { useState, useRef, useEffect } from 'react';
import { X, Check, Image as ImageIcon, Link2 } from 'lucide-react';

type Block = {
  id: string;
  type: 'image'|'link';
  url?: string;
  width: number;
  height?: number;
  x: number; y: number;
  settled: boolean;
  showOptions: boolean;
};

export function FullScreenEditor({ form, setForm, onSave, onClose, isEditing }: any) {
  const fileRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [linkInput, setLinkInput] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [dragId, setDragId] = useState<string|null>(null);
  const [pinchStart, setPinchStart] = useState<{dist: number, blockId: string, w: number, h: number}|null>(null);
  const blocks: Block[] = form.contentBlocks || [];

  const addImage = (e: any) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // BILKUL MIDDLE ME ADD - jaise tune bola
      const newBlock: Block = {
        id: Date.now().toString(),
        type: 'image',
        url: reader.result as string,
        width: 50,
        height: 200,
        x: 25, // 50% - width/2 = middle
        y: 40,
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
    const newBlock: Block = {
      id: Date.now().toString(),
      type: 'link',
      url: linkInput,
      width: 40,
      x: 30,
      y: 45,
      settled: false,
      showOptions: true
    };
    setForm({...form, contentBlocks: [...blocks, newBlock]});
    setLinkInput(''); setShowLink(false);
  };

  const update = (id: string, patch: any) => {
    setForm({...form, contentBlocks: blocks.map((b: any)=> b.id===id? {...b,...patch}: b)});
  };
  const remove = (id: string) => {
    if(!confirm('Delete?')) return;
    setForm({...form, contentBlocks: blocks.filter((b:any)=>b.id!==id)});
  };

  // DRAG + 2 FINGER RESIZE LOGIC
  useEffect(()=>{
    const getDist = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx*dx + dy*dy);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if(!containerRef.current ||!dragId) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isTouch = (e as TouchEvent).touches!== undefined;

      if(isTouch && (e as TouchEvent).touches.length===2 && pinchStart){
        const dist = getDist((e as TouchEvent).touches);
        const scale = dist / pinchStart.dist;
        const newW = Math.max(20, Math.min(95, pinchStart.w * scale));
        const newH = Math.max(80, pinchStart.h * scale);
        update(pinchStart.blockId, { width: newW, height: newH });
        return;
      }

      const clientX = isTouch? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = isTouch? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const newX = ((clientX - rect.left)/rect.width)*100 - (blocks.find(b=>b.id===dragId)?.width||50)/2;
      const newY = ((clientY - rect.top)/rect.height)*100 - 5;
      update(dragId, { x: Math.max(0, Math.min(80, newX)), y: Math.max(0, Math.min(90, newY)) });
    };

    const onUp = () => { setDragId(null); setPinchStart(null); };

    const onTouchStart = (e: TouchEvent) => {
      if(e.touches.length===2){
        const block = blocks.find(b=> b.showOptions);
        if(block){
          setPinchStart({ dist: getDist(e.touches), blockId: block.id, w: block.width, h: block.height||200 });
        }
      }
    };

    window.addEventListener('mousemove', onMove as any);
    window.addEventListener('touchmove', onMove as any, {passive:false});
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchstart', onTouchStart as any);

    return ()=>{
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('touchstart', onTouchStart as any);
    };
  }, [dragId, blocks, pinchStart]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-auto">
      <div className="sticky top-0 z-20 bg-white border-b p-3 flex justify-between items-center">
        <button onClick={onClose} className="border px-3 py-1.5 rounded-full text-[11px] flex gap-1 items-center"><X size={14}/> Close</button>
        <button onClick={onSave} className="bg-black text-white px-4 py-1.5 rounded-full text-[11px]">{isEditing? 'Update':'Publish'}</button>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        <div className="flex gap-2 mb-4">
          <button onClick={()=>fileRef.current?.click()} className="border px-4 py-2 rounded-full text-[11px] flex gap-1"><ImageIcon size={14}/> +Add pic</button>
          <button onClick={()=>setShowLink(!showLink)} className="border px-4 py-2 rounded-full text-[11px] flex gap-1"><Link2 size={14}/> +Add link</button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={addImage}/>
        </div>
        {showLink && (
          <div className="flex gap-2 mb-4 border p-2 rounded-xl">
            <input value={linkInput} onChange={e=>setLinkInput(e.target.value)} placeholder="https://..." className="flex-1 border p-2 rounded-xl text-[11px]"/>
            <button onClick={addLink} className="bg-black text-white px-4 rounded-xl text-[11px]">Add</button>
          </div>
        )}

        {/* BIG INFO BOX - JAISA PIC 1 ME HAI FULL SCREEN */}
        <div ref={containerRef} className="relative min-h-[700px] border-2 border-[#e0d4ed] rounded-2xl bg-[#fffefc] overflow-hidden" style={{backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #f3eef9 28px)'}}>
          <textarea
            value={form.fullInfo}
            onChange={e=>setForm({...form, fullInfo: e.target.value})}
            placeholder="Yahan full story likh... Pic add hogi toh text side me auto fit ho jayega"
            className="w-full min-h-[700px] bg-transparent p-6 outline-none text-[13px] leading-7"
            style={{whiteSpace:'pre-wrap', wordBreak:'break-word'}}
          />

          {blocks.map((b:any)=>(
            <div
              key={b.id}
              onMouseDown={(e)=>{ if(!b.settled){ e.preventDefault(); setDragId(b.id); }}}
              onTouchStart={(e)=>{ if(!b.settled) setDragId(b.id); }}
              onClick={()=>{ if(b.settled) update(b.id, { settled: false, showOptions: true }); }}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.width}%`,
                height: b.type==='image'? `${b.height}px` : 'auto',
                position:'absolute',
                zIndex: b.showOptions? 20 : 5,
                cursor: b.settled? 'pointer' : 'grab'
              }}
              className={`${b.settled? 'border-0 shadow-none' : 'border-2 border-[#8b5cf6] shadow-xl bg-white rounded-xl p-2'}`}
            >
              {b.showOptions &&!b.settled && (
                <div className="flex justify-between mb-1">
                  <button onClick={()=>remove(b.id)} className="h-6 w-6 bg-black text-white rounded-full flex items-center justify-center"><X size={12}/></button>
                  <button onClick={()=>update(b.id, { settled: true, showOptions: false })} className="h-6 w-6 bg-black text-white rounded-full flex items-center justify-center"><Check size={12}/></button>
                </div>
              )}
              {b.type==='image'? <img src={b.url} className="w-full h-full object-contain rounded-lg pointer-events-none select-none"/> : <a href={b.url} target="_blank" className="text-[11px] text-blue-600 underline break-all">{b.url}</a>}
              {b.showOptions &&!b.settled && <p className="text-[8px] text-center mt-1">Drag karo, 2 fingers se resize</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
