import { useState, useEffect, useRef } from 'react';
import { Bookmark, Check, ChevronRight, Edit3, Heart, Sparkles, Trophy, Vote, Zap, X, LogOut, Trash2, AlertTriangle, Image as ImageIcon, Pencil, CalendarDays, Flag } from 'lucide-react';
import './Profile.css';
import { auth, db, storage } from '../firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  deleteUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const savedNotes = [
  { label: 'VOTING DESK', title: 'MAMA 2025 · Worldwide Fans’ Choice', detail: 'Closes in 2 days · 3 actions left', icon: Vote, tone: 'violet' },
  { label: 'NEXT ON THE CALENDAR', title: 'BTS WORLD TOUR “ARIRANG”', detail: '20 JUN · 19:00 KST', icon: CalendarDays, tone: 'lilac' },
];

export default function Profile({ onNavigate }: { onNavigate?: (p:any)=>void }) {
  const [following, setFollowing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeskEdit, setShowDeskEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [pfpFile, setPfpFile] = useState<File|null>(null);
  const [pfpPreview, setPfpPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string>('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deskNote, setDeskNote] = useState({ title: 'Making every vote count.', subtitle: 'Two windows need attention before the weekend.', visibility: 'public' as 'public'|'private' });
  const [editDeskTitle, setEditDeskTitle] = useState('');
  const [editDeskSubtitle, setEditDeskSubtitle] = useState('');
  const [editDeskVis, setEditDeskVis] = useState<'public'|'private'>('public');
  const [flaggedCount, setFlaggedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      setUser(u);
      if(u){
        const snap = await getDoc(doc(db,'users',u.uid));
        if(snap.exists()){
          const d = snap.data();
          setUserData(d);
          setEditName(d.displayName||u.displayName||'');
          setPfpPreview(d.photoURL||u.photoURL||'');
          if(d.deskNote) setDeskNote(d.deskNote);
        } else {
          const data={ uid:u.uid, email:u.email, displayName:u.displayName||'Ari', photoURL:u.photoURL||'', createdAt:new Date().toISOString(), deskNote };
          await setDoc(doc(db,'users',u.uid), data);
          setUserData(data);
          setPfpPreview(u.photoURL||'');
          setEditName(u.displayName||'Ari');
        }
      } else {
        setUserData(null);
      }
    });
    return ()=>unsub();
  },[]);

  useEffect(()=>{
    if(!user) return;
    const q = query(collection(db,'flaggedVotings'), where('userId','==',user.uid));
    const unsub = onSnapshot(q, snap=> setFlaggedCount(snap.size));
    return ()=>unsub();
  },[user]);

  const joinedText = ()=>{
    if(!user?.metadata?.creationTime) return 'ARMY since 2018';
    const d = new Date(user.metadata.creationTime);
    return `Joined ${d.toLocaleString('en-US',{month:'short'})} ${d.getFullYear()}`;
  };

  const handlePfpChange = (e:any)=>{
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>2*1024*1024){ alert('Max 2MB'); return; }
    setPfpFile(file); setPfpPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async ()=>{
    if(!user) return; setSaving(true);
    try{
      let photoURL = userData?.photoURL || user.photoURL || '';
      if(pfpFile){
        const r=ref(storage,`pfp/${user.uid}/avatar_${Date.now()}`);
        await uploadBytes(r, pfpFile);
        photoURL=await getDownloadURL(r);
      }
      await updateProfile(user, { displayName: editName, photoURL });
      await setDoc(doc(db,'users',user.uid), { displayName: editName, photoURL, updatedAt:new Date().toISOString() }, {merge:true});
      setUserData((prev:any)=> ({...prev, displayName: editName, photoURL}));
      setPfpPreview(photoURL);
      setPfpFile(null);
      setToast('Profile saved successfully!'); setShowEdit(false);
      await auth.currentUser?.reload();
    }catch(e:any){ alert(e.message); }
    setSaving(false); setTimeout(()=>setToast(''),3000);
  };

  const handleDeletePfp = async ()=>{
    if(!user) return;
    try{
      await deleteObject(ref(storage,`pfp/${user.uid}`)).catch(()=>{});
      await updateProfile(user,{ photoURL:'' });
      await setDoc(doc(db,'users',user.uid),{ photoURL:'' },{merge:true});
      setPfpPreview(''); setPfpFile(null);
      setUserData((prev:any)=> ({...prev, photoURL:''}));
      setToast('PFP deleted'); setTimeout(()=>setToast(''),3000);
    }catch(e:any){ alert(e.message); }
  };

  const openDeskEdit = ()=>{
    setEditDeskTitle(deskNote.title);
    setEditDeskSubtitle(deskNote.subtitle);
    setEditDeskVis(deskNote.visibility);
    setShowDeskEdit(true);
  };

  const handleSaveDeskNote = async ()=>{
    if(!user) return;
    if(editDeskSubtitle.split(/\s+/).filter(Boolean).length>200){ alert('Max 200 words'); return; }
    setSaving(true);
    try{
      const newNote={ title: editDeskTitle, subtitle: editDeskSubtitle, visibility: editDeskVis, updatedAt:new Date().toISOString() };
      await setDoc(doc(db,'users',user.uid), { deskNote: newNote }, {merge:true});
      setDeskNote(newNote);
      setShowDeskEdit(false);
      setToast('Desk note updated!'); setTimeout(()=>setToast(''),2500);
    }catch(e:any){ alert(e.message); }
    setSaving(false);
  };
  const hasDeskChanged = editDeskTitle!==deskNote.title || editDeskSubtitle!==deskNote.subtitle || editDeskVis!==deskNote.visibility;

  const handleAuth = async ()=>{
    if(!email.trim()||!password.trim()){ alert('Email and password required'); return; }
    if(password.length<6){ alert('Min 6 chars'); return; }
    try{
      setSaving(true);
      await setPersistence(auth, browserLocalPersistence);
      if(authMode==='signup') await createUserWithEmailAndPassword(auth,email,password);
      else await signInWithEmailAndPassword(auth,email,password);
      setShowAuth(false); setEmail(''); setPassword(''); setToast('Logged in successfully!'); setTimeout(()=>setToast(''),3000);
    }catch(e:any){ alert(e.message.replace('Firebase:','')); } finally{ setSaving(false); }
  };
  const handleLogout = async ()=>{ await signOut(auth); onNavigate?.('home'); };
  const handleDeleteAccount = async ()=>{
    if(!user) return; setDeleting(true);
    try{
      const q=query(collection(db,'userVotings'), where('ownerId','==',user.uid));
      const snap=await getDocs(q);
      for(const d of snap.docs){ const data=d.data(); if(data.verificationStatus==='private'||data.visibility==='private') await deleteDoc(d.ref); else await updateDoc(d.ref,{ ownerName:'', ownerId:'deleted_'+user.uid, displayOption:'anonymous', addedByDisplay:'Verified' }); }
      await deleteDoc(doc(db,'users',user.uid)).catch(()=>{});
      await deleteUser(user); setShowDeleteConfirm(false); setToast('Account deleted'); onNavigate?.('home');
    }catch(e:any){ alert(e.message); } setDeleting(false);
  };

  const isGuest =!user;

  return (
    <main className="ps-profile">
      {/* TOPBAR CLEAN - No back, no ARMY/PROFILE, no Bell/Settings */}
      <header className="ps-profile__topbar" style={{justifyContent:'center', height:52}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{height:22,width:22,borderRadius:7, background:'linear-gradient(135deg,#c7b1ec,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:11}}>P</div>
          <strong style={{fontSize:12, letterSpacing:'0.08em'}}>PURPLESYNC</strong>
        </div>
      </header>

      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-[#332840] text-white px-5 py-2.5 rounded-full text-[12px] shadow">{toast}</div>}

      {isGuest? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div className="h-20 w-20 rounded-full bg-white border border-[#ece6f3] flex items-center justify-center mb-4"><div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#c7b1ec] to-[#8b5cf6]" /></div>
          <h2 className="text-[20px] font-semibold">Welcome to PurpleSync</h2><p className="text-[13px] text-[#81758d] mt-2 max-w-[320px]">Create an account to add voting boxes, achievements and updates.</p>
          <div className="mt-6 w-full max-w-[320px] space-y-2">
            <button onClick={()=>{setAuthMode('signup'); setShowAuth(true);}} className="w-full bg-[#60438f] text-white py-3 rounded-full text-[13px] font-medium">Create an account</button>
            <button onClick={()=>{setAuthMode('login'); setShowAuth(true);}} className="w-full bg-white border border-[#e3dced] py-3 rounded-full text-[13px] font-medium">Login</button>
          </div>
        </div>
      ):(
        <div className="ps-profile__content">
          <section className="ps-profile__intro ps-profile__rise">
            <div className="ps-profile__identity">
              <div className="ps-profile__avatar" aria-hidden="true" style={pfpPreview? { backgroundImage:`url(${pfpPreview})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
                {!pfpPreview && <span>{(userData?.displayName||user?.displayName||'AR').slice(0,2).toUpperCase()}</span>}
                <div className="ps-profile__avatar-orbit ps-profile__avatar-orbit--one" /><div className="ps-profile__avatar-orbit ps-profile__avatar-orbit--two" />
              </div>
              <div className="ps-profile__identity-copy">
                {/* MY PURPLESYNC DESK - chhota left side voting page jaisa */}
                <div className="ps-profile__eyebrow" style={{marginBottom:4}}><span className="ps-profile__dot" /><span style={{fontSize:9, letterSpacing:'0.12em'}}>MY PURPLESYNC DESK</span></div>
                <h1 style={{fontSize:22}}>{userData?.displayName||user?.displayName||'Ari'}</h1>
                <p>{joinedText()} · keeping the signal close</p>
                {/* Source-first supporter hata diya */}
              </div>
            </div>
            {/* Following chhota + uske upar pencil */}
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8}}>
              <button onClick={()=>setShowEdit(true)} title="Edit profile" style={{height:30,width:30, background:'#fff', border:'1px solid #e9dff6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><Pencil size={13}/></button>
              <button className={`ps-profile__follow ${following? 'is-following' : ''}`} type="button" onClick={() => setFollowing((c) =>!c)} style={{fontSize:11, padding:'6px 12px', height:32}}>{following? <Check size={12} /> : <Heart size={12} />}{following? 'Following' : 'Follow desk'}</button>
            </div>
          </section>

          <section className="ps-profile__stats ps-profile__rise"><div className="ps-profile__stat"><strong>18</strong><span>votes this month</span></div><div className="ps-profile__stat"><strong>07</strong><span>saved updates</span></div><div className="ps-profile__stat"><strong>12</strong><span>archive visits</span></div><div className="ps-profile__stat ps-profile__stat--accent"><strong><Zap size={14} fill="currentColor" />14</strong><span>day desk streak</span></div></section>

          <div className="ps-profile__grid">
            <section className="ps-profile__panel ps-profile__panel--focus ps-profile__rise">
              <div className="ps-profile__section-heading"><div><span className="ps-profile__label">THE DESK NOTE</span><h2>What I’m close to</h2></div>
                {/* Pencil ab Edit Profile nahi, Desk Note edit kholega */}
                <button className="ps-profile__edit" type="button" onClick={openDeskEdit}><Edit3 size={15} /></button>
              </div>
              <div className="ps-profile__focus-card"><div className="ps-profile__focus-icon"><Sparkles size={18} /></div><div><span className="ps-profile__label">CURRENT FOCUS</span><h3>{deskNote.title}</h3><p>{deskNote.subtitle}</p><p style={{fontSize:10, marginTop:6, display:'flex', gap:4, alignItems:'center', color:'#8a7e9a'}}><Flag size={10}/>{flaggedCount} flagged for desk · {deskNote.visibility}</p></div></div>
              <div className="ps-profile__focus-footer"><span><span className="ps-profile__mini-dot" />private view</span><span>updated just now</span></div>
            </section>
            <section className="ps-profile__panel ps-profile__panel--record ps-profile__rise">
              <div className="ps-profile__section-heading"><div><span className="ps-profile__label">ON RECORD</span><h2>Small wins, kept close</h2></div><Trophy className="ps-profile__heading-icon" size={18} /></div>
              <div className="ps-profile__record-row"><div className="ps-profile__record-badge"><Trophy size={17} /></div><div><strong>Steady signal</strong><p>14 days showing up for the desk</p></div><ChevronRight size={16} /></div>
              <div className="ps-profile__record-row"><div className="ps-profile__record-badge ps-profile__record-badge--soft"><Bookmark size={17} /></div><div><strong>Thoughtful archive</strong><p>7 official notes saved this month</p></div><ChevronRight size={16} /></div>
              {/* Delete/Logout yaha se hata diya */}
            </section>
          </div>

          <section className="ps-profile__saved ps-profile__rise"><div className="ps-profile__section-heading"><div><span className="ps-profile__label">SAVED TO MY DESK</span><h2>Keep close</h2></div><button className="ps-profile__text-button" type="button">View all <ChevronRight size={14} /></button></div><div className="ps-profile__saved-list">{savedNotes.map((note) => { const Icon = note.icon; return (<article className="ps-profile__saved-card" key={note.title}><div className={`ps-profile__saved-icon ps-profile__saved-icon--${note.tone}`}><Icon size={17} /></div><div className="ps-profile__saved-copy"><span className="ps-profile__label">{note.label}</span><h3>{note.title}</h3><p>{note.detail}</p></div><ChevronRight className="ps-profile__saved-arrow" size={16} /></article>);})}</div></section>

          {/* DELETE / LOGOUT niche side by side - phone + laptop dono */}
          <div style={{display:'flex', gap:10, marginTop:20}}>
            <button onClick={()=>setShowDeleteConfirm(true)} className="flex-1 flex items-center justify-center gap-2 border border-red-200 bg-red-50 text-red-600 py-3 rounded-full text-[12px] font-medium"><Trash2 size={14}/> Delete Account</button>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-full text-[12px] font-medium"><LogOut size={14}/> Logout</button>
          </div>

          <footer className="ps-profile__footer"><div className="ps-profile__footer-mark">P</div><p>PurpleSync keeps your desk calm,<br />current, and close to the source.</p><span>LOCAL VIEW · PRIVATE</span></footer>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[380px] p-5 animate-[scaleIn_0.2s_ease]">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[14px]">Edit Profile</h3><button onClick={()=>setShowEdit(false)} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button></div>
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-[#c7b1ec] to-[#8b5cf6] flex items-center justify-center text-white text-[20px] font-semibold overflow-hidden" style={pfpPreview? {backgroundImage:`url(${pfpPreview})`, backgroundSize:'cover', backgroundPosition:'center'} : {}}>{!pfpPreview && (editName||'AR').slice(0,2).toUpperCase()}</div>
              <p className="text-[10px] text-gray-500 mt-2">Best ratio 1:1 (500x500) square, max 2MB</p>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePfpChange} />
              <div className="flex gap-2 mt-3"><button onClick={()=>fileRef.current?.click()} className="px-4 py-1.5 rounded-full border bg-white text-[11px] flex items-center gap-1"><ImageIcon size={12}/> Change</button><button onClick={handleDeletePfp} className="px-4 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[11px]">Delete</button></div>
            </div>
            <div className="h-px bg-gradient-to-r from-[#8b5cf6] to-white my-5" />
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-[#6b5a80]">Change Username</label>
              <div className="border border-[#e3dced] rounded-xl p-3"><p className="text-[10px] text-gray-400">Current: {editName}</p><input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="ARI" className="w-full mt-1 text-[13px] outline-none border-b border-[#e3dced] py-1 focus:border-[#8b5cf6]"/></div>
              <button onClick={handleSaveProfile} disabled={saving} className="w-full bg-black text-white py-3 rounded-xl text-[13px] font-medium disabled:opacity-50">{saving?'Saving...':'Save'}</button>
              <p className="text-[10px] text-center text-gray-400">Will stay after logout & refresh</p>
            </div>
          </div>
        </div>
      )}

      {showDeskEdit && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[380px] p-5 animate-[scaleIn_0.2s_ease]">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[13px]">Edit Desk Note</h3><button onClick={()=>setShowDeskEdit(false)} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button></div>
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-[#6b5a80]">CURRENT FOCUS - Main Title</label>
              <input value={editDeskTitle} onChange={e=>setEditDeskTitle(e.target.value)} placeholder="Making every vote count." className="w-full border border-[#e3dced] rounded-xl p-3 text-[13px] outline-none focus:border-[#8b5cf6]"/>
              <label className="text-[11px] font-semibold text-[#6b5a80]">Subtitle (max 200 words) - {editDeskSubtitle.split(/\s+/).filter(Boolean).length}/200</label>
              <textarea value={editDeskSubtitle} onChange={e=>setEditDeskSubtitle(e.target.value)} rows={3} className="w-full border border-[#e3dced] rounded-xl p-3 text-[12px] outline-none focus:border-[#8b5cf6] resize-none"/>
              <div className="flex gap-2">
                <button onClick={()=>setEditDeskVis('public')} className={`flex-1 py-2 rounded-full text-[11px] border ${editDeskVis==='public'?'bg-[#60438f] text-white':'bg-white'}`}>Public</button>
                <button onClick={()=>setEditDeskVis('private')} className={`flex-1 py-2 rounded-full text-[11px] border ${editDeskVis==='private'?'bg-black text-white':'bg-white'}`}>Private</button>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={()=>setShowDeskEdit(false)} className="flex-1 bg-gray-100 py-3 rounded-xl text-[12px]">Cancel</button>
                <button onClick={handleSaveDeskNote} disabled={!hasDeskChanged || saving} className="flex-1 bg-black text-white py-3 rounded-xl text-[12px] disabled:opacity-40">{saving?'Saving...':'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[360px] p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[14px]">{authMode==='login'?'Login':'Create Account'}</h3><button onClick={()=>setShowAuth(false)} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button></div>
            <div className="space-y-3">
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border border-[#e3dced] p-3 rounded-xl text-[13px]"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 6)" className="w-full border border-[#e3dced] p-3 rounded-xl text-[13px]"/>
              <button onClick={handleAuth} disabled={saving} className="w-full bg-[#60438f] text-white py-3 rounded-xl text-[13px] font-medium disabled:opacity-60">{saving?'Please wait...': authMode==='login'?'Login':'Create Account'}</button>
              <button onClick={()=>setAuthMode(authMode==='login'?'signup':'login')} className="w-full text-[11px] text-[#704ca5] mt-2">{authMode==='login'?'Need account? Sign up':'Already have account? Login'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[380px] p-6 animate-[scaleIn_0.25s_ease] shadow-2xl">
            <h3 className="font-semibold text-[15px]">You really want to delete this account?</h3>
            <div className="mt-4 flex gap-2 items-start bg-red-50 border border-red-200 p-3 rounded-xl"><AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0"/><p className="text-[11px] text-red-700 leading-4">Private boxes deleted forever. Public boxes stay with Verified tick only. Name removed.</p></div>
            <div className="mt-5 flex gap-2"><button onClick={()=>setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-[12px]">Cancel</button><button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-[12px] font-medium">{deleting?'Deleting...':'Yes, Delete'}</button></div>
          </div>
        </div>
      )}
      <style>{`@keyframes scaleIn{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </main>
  );
}
