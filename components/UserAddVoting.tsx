import { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Eye, CheckCircle, X, ShieldCheck, ExternalLink } from 'lucide-react';

type Props = { onBack: () => void };

export function UserAddVoting({ onBack }: Props){
  const [userId, setUserId] = useState<string>(()=>{
    let id = localStorage.getItem('ps_user_id');
    if(!id){ id = 'army_'+Math.random().toString(36).slice(2,8); localStorage.setItem('ps_user_id', id); }
    return id;
  });
  const [userName, setUserName] = useState<string>(()=> localStorage.getItem('ps_user_name') || `army${Math.floor(Math.random()*999)}`);

  const [form, setForm] = useState({
    title:'', platform:'MNET PLUS', link:'', status:'open',
    votingDate: new Date().toISOString().split('T')[0],
    startAt:'', endAt:'', description:'', voteType:'website' as 'website'|'app',
    visibility:'private' as 'private'|'public',
    displayOption:'showName' as 'showName'|'anonymous',
    playStoreLink:'', appStoreLink:'', webLink:''
  });
  const [myBoxes, setMyBoxes] = useState<any[]>([]);
  const [showMyBoxes, setShowMyBoxes] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showVerifyOptions, setShowVerifyOptions] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [filterMy, setFilterMy] = useState<'all'|'private'|'pending'|'verified'>('all');

  useEffect(()=>{
    const q = query(collection(db,"userVotings"), where("ownerId","==",userId));
    const unsub = onSnapshot(q, s=>{
      setMyBoxes(s.docs.map(d=>({id:d.id,...d.data()} as any)));
    });
    return ()=>unsub();
  },[userId]);

  const handleSubmit = async (isPublicVerify:boolean)=>{
    if(!form.title.trim() ||! (form.webLink||form.link).trim()) return alert('Title & Official Voting Link required');
    if(isPublicVerify &&!form.displayOption) return alert('Choose display option');

    const payload:any = {
    ...form, ownerId:userId, ownerName:userName, ownerPfp:'',
      webLink: form.webLink || form.link, link: form.webLink || form.link,
      verificationStatus: isPublicVerify? 'pending' : (form.visibility==='private'?'private':'pending'),
      isPublic: form.visibility==='public',
      createdAt: new Date().toISOString(),
      isHidden:false, order: 999
    };
    if(editId){ await updateDoc(doc(db,"userVotings", editId), payload); setEditId(null); }
    else { await addDoc(collection(db,"userVotings"), payload); }

    if(isPublicVerify){ setShowPopup(true); setShowVerifyOptions(false); }
    setForm({ title:'', platform:'MNET PLUS', link:'', status:'open', votingDate: new Date().toISOString().split('T')[0], startAt:'', endAt:'', description:'', voteType:'website', visibility:'private', displayOption:'showName', playStoreLink:'', appStoreLink:'', webLink:'' });
  };

  const filteredMy = myBoxes.filter((b:any)=>{
    if(filterMy==='all') return true;
    if(filterMy==='private') return b.verificationStatus==='private' || b.visibility==='private';
    return b.verificationStatus===filterMy;
  });

  return (
    <div className="ps-page-enter ps-content py-6 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-[13px] font-medium text-[#4c425c]"><ArrowLeft size={16}/> Back to Voting</button>
        <div className="flex gap-2">
          <div className="flex rounded-full border p-1 bg-white">
            <button onClick={()=>setForm({...form, visibility:'private'})} className={`px-4 py-1.5 rounded-full text-[11px] font-medium ${form.visibility==='private'?'bg-black text-white':'text-gray-500'}`}>Private</button>
            <button onClick={()=>{setForm({...form, visibility:'public'}); setShowVerifyOptions(true);}} className={`px-4 py-1.5 rounded-full text-[11px] font-medium ${form.visibility==='public'?'bg-black text-white':'text-gray-500'}`}>Public</button>
          </div>
          <button onClick={()=>setPreview(true)} className="h-9 w-9 bg-[#eef2ff] rounded-full flex items-center justify-center border border-[#e0d8ed]"><Eye size={14}/></button>
        </div>
      </div>

      <div className="bg-white border border-[#ece6f3] rounded-2xl p-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#6b5a80]">Voting Title *</label>
          <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="e.g. Favorite Song: SWIM" className="w-full border border-[#e3dced] p-3 rounded-xl text-[13px] focus:outline-none focus:border-[#704ca5]"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5"><label className="text-[11px] font-semibold text-[#6b5a80]">Platform</label><input value={form.platform} onChange={e=>setForm({...form, platform:e.target.value})} className="w-full border border-[#e3dced] p-3 rounded-xl text-[13px]"/></div>
          <div className="space-y-1.5"><label className="text-[11px] font-semibold text-[#6b5a80]">Voting Date</label><input type="date" value={form.votingDate} onChange={e=>setForm({...form, votingDate:e.target.value})} className="w-full border border-[#e3dced] p-3 rounded-xl text-[13px]"/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><label className="text-[10px] text-gray-500">Start</label><input type="datetime-local" value={form.startAt} onChange={e=>setForm({...form, startAt:e.target.value})} className="w-full border border-[#e3dced] p-3 rounded-xl text-[12px]"/><p className="text-[10px] text-gray-400 italic">{!form.startAt?'NC':''}</p></div>
          <div className="space-y-1"><label className="text-[10px] text-gray-500">Ends</label><input type="datetime-local" value={form.endAt} onChange={e=>setForm({...form, endAt:e.target.value})} className="w-full border border-[#e3dced] p-3 rounded-xl text-[12px]"/><p className="text-[10px] text-gray-400 italic">{!form.endAt?'NC':''}</p></div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#6b5a80]">Official Voting Link * (clickable for owner)</label>
          <input value={form.webLink || form.link} onChange={e=>setForm({...form, webLink:e.target.value, link:e.target.value})} placeholder="https://mnetplus.world/..." className="w-full border border-[#e3dced] p-3 rounded-xl text-[12px]"/>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#6b5a80]">Description</label>
          <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={3} className="w-full border border-[#e3dced] p-3 rounded-xl text-[12px] resize-none" placeholder="Daily voting available, no login needed..."/>
        </div>

        {form.visibility==='private' && (
          <button onClick={()=>handleSubmit(false)} className="w-full bg-black text-white p-3 rounded-xl text-[13px] font-semibold">{editId?'Update Private':'Add to My Private List'}</button>
        )}

        {showVerifyOptions && form.visibility==='public' && (
          <div className="border border-[#e9dff6] rounded-2xl p-4 bg-[#faf7ff] space-y-3">
            <p className="text-[11px] font-semibold text-red-600">*Required - Choose one option only</p>
            <label className="flex gap-2.5 items-start border border-[#e3dced] p-3 rounded-xl bg-white cursor-pointer hover:border-[#b9a5d7]">
              <input type="radio" checked={form.displayOption==='showName'} onChange={()=>setForm({...form, displayOption:'showName'})} className="mt-1"/>
              <span className="text-[12px] leading-4">Show my name in the voting box eg: Added by @{userName} <span className="inline-flex items-center gap-1 bg-[#f1e9f9] text-[#704ca5] px-1.5 py-0.5 rounded-full text-[10px]">✔ PurpleSync Verified</span> - Name will display on voting page</span>
            </label>
            <label className="flex gap-2.5 items-start border border-[#e3dced] p-3 rounded-xl bg-white cursor-pointer hover:border-[#b9a5d7]">
              <input type="radio" checked={form.displayOption==='anonymous'} onChange={()=>setForm({...form, displayOption:'anonymous'})} className="mt-1"/>
              <span className="text-[12px]">Do not add my name - Only Verified badge will show so others know it's user-added & verified</span>
            </label>
            <div className="flex gap-2 items-start bg-[#f1e9f9] border border-[#e0d4ed] p-3 rounded-xl">
              <ShieldCheck size={16} className="text-[#704ca5] mt-0.5 shrink-0"/><p className="text-[11px] text-[#594879] leading-4">PurpleSync does not allow fake/malicious links. Please add only official voting links. Wrong or misleading links may lead to your voting box being rejected and your account being restricted. This is to keep our app safe from being banned/taken down.</p>
            </div>
            <button onClick={()=>handleSubmit(true)} className="w-full bg-[#332840] text-white p-3 rounded-xl text-[13px] font-semibold">Verify & Send to PurpleSync Team</button>
          </div>
        )}
      </div>

      <button onClick={()=>setShowMyBoxes(!showMyBoxes)} className="w-full border border-[#e3dced] bg-white p-3.5 rounded-xl text-[13px] font-medium flex justify-between">
        <span>Show my voting boxes ({myBoxes.length})</span><span className="text-[11px] text-gray-500">{myBoxes.filter((b:any)=>b.verificationStatus==='pending').length} Being Verified</span>
      </button>

      {showMyBoxes && (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all','private','pending','verified'] as const).map(f=>(
              <button key={f} onClick={()=>setFilterMy(f)} className={`px-4 py-1.5 rounded-full text-[11px] capitalize border ${filterMy===f?'bg-black text-white border-black':'bg-white border-[#e3dced] text-gray-500'}`}>{f==='pending'?'Being Verified':f}</button>
            ))}
          </div>
          <p className="text-[12px] font-semibold">Total: {filteredMy.length} boxes</p>
          {filteredMy.map((b:any)=>(
            <div key={b.id} className="border border-[#e3dced] bg-white rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <p className="font-medium text-[13px] truncate w-[160px]">{b.title}</p>
                <span className={`text-[9px] px-2.5 py-1 rounded-full border ${b.verificationStatus==='pending'?'bg-yellow-50 text-yellow-700 border-yellow-200': b.verificationStatus==='verified'?'bg-green-50 text-green-700 border-green-200': b.verificationStatus==='private'?'bg-gray-100 border-gray-200':'bg-red-50 text-red-600 border-red-200'}`}>{b.verificationStatus==='pending'?'Being Verified':b.verificationStatus}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Start: {b.startAt? new Date(b.startAt).toLocaleString() : 'NC'} | End: {b.endAt? new Date(b.endAt).toLocaleString() : 'NC'} | {b.visibility} | {b.displayOption}</p>
              <div className="flex gap-2 mt-3">
                {(b.verificationStatus==='pending' || b.verificationStatus==='private')? (
                  <>
                    <button onClick={()=>{setForm({ title:b.title, platform:b.platform||'MNET PLUS', link:b.link, webLink:b.webLink||b.link, status:b.status||'open', votingDate:b.votingDate|| new Date().toISOString().split('T')[0], startAt:b.startAt||'', endAt:b.endAt||'', description:b.description||'', voteType:b.voteType||'website', visibility:b.visibility||'private', displayOption:b.displayOption||'showName', playStoreLink:b.playStoreLink||'', appStoreLink:b.appStoreLink||'' }); setEditId(b.id); window.scrollTo({top:0, behavior:'smooth'});}} className="text-[11px] px-4 py-1.5 border border-[#e3dced] rounded-full bg-white">Edit</button>
                    <button onClick={async()=>{if(confirm('Delete this box?')) await deleteDoc(doc(db,"userVotings", b.id))}} className="text-[11px] px-4 py-1.5 border rounded-full bg-red-50 text-red-600 border-red-100">Delete</button>
                  </>
                ): <p className="text-[10px] text-gray-400 italic">Locked after verification - cannot edit/hide/delete</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={()=>setPreview(false)}>
          <div className="bg-[#f9f6ff] rounded-2xl p-4 w-full max-w-[380px]" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between mb-3"><p className="text-[12px] font-semibold">Preview - Voting Page Box</p><button onClick={()=>setPreview(false)} className="h-6 w-6 bg-white rounded-full flex items-center justify-center"><X size={12}/></button></div>
            <article className="bg-white border border-[#e3dced] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2"><span className="h-2 w-2 bg-[#38bdf8] rounded-full"/><span className="ps-mono text-[11px] text-[#6b5a80]">{form.platform}</span></div>
              <h2 className="mt-3 font-semibold text-[16px] leading-tight">{form.title || 'Your Voting Title'}</h2>
              <p className="mt-2 text-[11px] text-[#0ea5e9]">STATUS: Open - Closes in 2d 12h</p>
              <div className="mt-4 rounded-[16px] bg-[#f6f0fd] border border-[#e9dff6] p-3"><p className="ps-mono text-[9px] text-[#9a8aac]">DESCRIPTION</p><p className="mt-1 text-[12px]">{form.description || 'Daily votes available...'}</p></div>
              <div className="mt-3 flex justify-between text-[11px]"><span className="text-[#958a9c] truncate">{form.displayOption==='showName'?`Added by @${userName} ✔ Verified`:'Verified • User added'}</span><span className="text-[#60438f] font-semibold flex items-center gap-1">Vote Now <ExternalLink size={12}/></span></div>
            </article>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[380px] text-center relative">
            <button onClick={()=>setShowPopup(false)} className="absolute top-3 right-3 h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button>
            <div className="h-12 w-12 bg-[#f1e9f9] rounded-full flex items-center justify-center mx-auto"><CheckCircle className="text-[#704ca5]"/></div>
            <h3 className="mt-3 font-semibold text-[14px]">Sent for Verification!</h3>
            <p className="mt-2 text-[12px] leading-5 text-gray-600">Your voting box is sent to verify to the PurpleSync team. We will let you know about it. It may take 12-24 hours to verify.</p>
            <p className="mt-3 text-[11px] text-[#704ca5] font-medium leading-4">Your little contribution, dedication and help means a lot to us, ARMY. Thank you for keeping the signal close! 💜</p>
            <button onClick={()=>setShowPopup(false)} className="mt-5 w-full bg-black text-white p-2.5 rounded-xl text-[13px]">Okay</button>
          </div>
        </div>
      )}
    </div>
  );
}
