import { useState, useEffect, useRef } from 'react';
import { Bookmark, Check, ChevronRight, Edit3, Heart, Sparkles, Trophy, Vote, Zap, X, LogOut, Trash2, AlertTriangle, Image as ImageIcon, Pencil, CalendarDays, Link2, Archive, Star } from 'lucide-react';
import './Profile.css';
import { auth, db } from '../firebase';
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

const IMGBB_API_KEY = "4e2e98bc940a51d1c6a30f7d1d13bc22";

export default function Profile({ onNavigate }: { onNavigate?: (p:any)=>void }) {
  const [following, setFollowing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeskEdit, setShowDeskEdit] = useState(false);
  const [showSavedAll, setShowSavedAll] = useState(false);
  const [savedFilter, setSavedFilter] = useState<'all'|'voting'|'archive'|'updates'|'notice'|'community'>('all');
  const [editName, setEditName] = useState('');
  const [pfpFile, setPfpFile] = useState<File|null>(null);
  const [pfpPreview, setPfpPreview] = useState<string>('');
  const [pfpLink, setPfpLink] = useState<string>('');
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
  const [flaggedItems, setFlaggedItems] = useState<any[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      setUser(u);
      if(u){
        const snap = await getDoc(doc(db,'users',u.uid));
        if(snap.exists()){
          const d = snap.data();
          setUserData(d);
          setPfpPreview(d.photoURL||u.photoURL||'');
          setEditName(d.displayName||u.displayName||'');
          if(d.deskNote) setDeskNote(d.deskNote);
        } else {
          const data={ uid:u.uid, email:u.email, displayName:u.displayName||'Ari', photoURL:u.photoURL||'', createdAt:new Date().toISOString(), deskNote };
          await setDoc(doc(db,'users',u.uid), data);
          setUserData(data);
        }
      } else { setUserData(null); }
    });
    return ()=>unsub();
  },[]);

  useEffect(()=>{
    if(!user) return;
    const q = query(collection(db,'flaggedVotings'), where('userId','==',user.uid));
    const unsub = onSnapshot(q, snap=> setFlaggedItems(snap.docs.map(d=> d.data())));
    return ()=>unsub();
  },[user]);

  // XP fetch - small, not highlighted
  useEffect(()=>{
    if(!user) return;
    const q = query(collection(db,'quizAttempts'), where('userId','==',user.uid));
    const unsub = onSnapshot(q, snap=>{ let xp=0; snap.docs.forEach(d=>xp+=d.data().xpEarned||0); setTotalXP(xp); setTotalQuizzes(snap.size); });
    return ()=>unsub();
  },[user]);

  const joinedText = ()=>{
    if(!user?.metadata?.creationTime) return 'ARMY since 2018';
    const d = new Date(user.metadata.creationTime);
    return `Joined ${d.toLocaleString('en-US',{month:'short'})} ${d.getFullYear()}`;
  };

  const handlePfpChange = (e:any)=>{
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>5*1024*1024){ alert('Max 5MB'); return; }
    setPfpFile(file); setPfpLink(''); setPfpPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async ()=>{
    if(!user) return; setSaving(true);
    try{
      let photoURL = pfpPreview;
      if(pfpLink.trim()){ photoURL = pfpLink.trim(); }
      else if(pfpFile){
        const formData = new FormData(); formData.append('image', pfpFile);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method:'POST', body:formData });
        const data = await res.json(); if(!data.success) throw new Error('imgBB upload failed'); photoURL = data.data.url;
      }
      await updateProfile(user, { displayName: editName, photoURL });
      await setDoc(doc(db,'users',user.uid), { displayName: editName, photoURL, updatedAt:new Date().toISOString() }, {merge:true});
      setUserData((prev:any)=> ({...prev, displayName: editName, photoURL}));
      setPfpPreview(photoURL); setPfpFile(null); setPfpLink('');
      setToast('Profile saved! 💜'); setShowEdit(false); setTimeout(()=>setToast(''),2500);
    }catch(e:any){ alert(e.message); } setSaving(false);
  };

  const handleDeletePfp = async ()=>{
    if(!user) return;
    await setDoc(doc(db,'users',user.uid),{ photoURL:'' },{merge:true});
    await updateProfile(user,{ photoURL:'' }).catch(()=>{});
    setPfpPreview(''); setPfpFile(null); setPfpLink(''); setUserData((prev:any)=> ({...prev, photoURL:''}));
    setToast('PFP removed'); setTimeout(()=>setToast(''),2000);
  };

  const openDeskEdit = ()=>{ setEditDeskTitle(deskNote.title); setEditDeskSubtitle(deskNote.subtitle); setEditDeskVis(deskNote.visibility); setShowDeskEdit(true); };
  const handleSaveDeskNote = async ()=>{
    if(!user) return;
    if(editDeskSubtitle.split(/\s+/).filter(Boolean).length>200){ alert('Max 200 words'); return; }
    setSaving(true);
    try{
      const newNote={ title: editDeskTitle, subtitle: editDeskSubtitle, visibility: editDeskVis, updatedAt:new Date().toISOString() };
      await setDoc(doc(db,'users',user.uid), { deskNote: newNote }, {merge:true});
      setDeskNote(newNote); setShowDeskEdit(false); setToast('Desk note updated!');
    }catch(e:any){ alert(e.message); } setSaving(false); setTimeout(()=>setToast(''),2000);
  };
  const hasDeskChanged = editDeskTitle!==deskNote.title || editDeskSubtitle!==deskNote.subtitle || editDeskVis!==deskNote.visibility;

  const handleAuth = async ()=>{
    if(!email.trim()||!password.trim()){ alert('Email and password required'); return; }
    if(password.length<6){ alert('Min 6 chars'); return; }
    try{
      setSaving(true); await setPersistence(auth, browserLocalPersistence);
      if(authMode==='signup') await createUserWithEmailAndPassword(auth,email,password);
      else await signInWithEmailAndPassword(auth,email,password);
      setShowAuth(false); setEmail(''); setPassword(''); setToast('Logged in!');
    }catch(e:any){ alert(e.message.replace('Firebase:','')); } finally{ setSaving(false); setTimeout(()=>setToast(''),2500); }
  };
  const handleLogout = async ()=>{ await signOut(auth); onNavigate?.('home'); };
  const handleDeleteAccount = async ()=>{
    if(!user) return; setDeleting(true);
    try{
      const q=query(collection(db,'userVotings'), where('ownerId','==',user.uid));
      const snap=await getDocs(q);
      for(const d of snap.docs){ const data=d.data(); if(data.verificationStatus==='private') await deleteDoc(d.ref); else await updateDoc(d.ref,{ ownerName:'', ownerId:'deleted_'+user.uid }); }
      await deleteDoc(doc(db,'users',user.uid)).catch(()=>{}); await deleteUser(user); setShowDeleteConfirm(false); onNavigate?.('home');
    }catch(e:any){ alert(e.message); } setDeleting(false);
  };

  const isGuest =!user;
  const savedDisplay = flaggedItems.length>0? flaggedItems.map((f:any)=> ({ label:'VOTING DESK', title:f.title, detail:'Saved to desk', icon:Vote, tone:'violet', category:'voting' })) : [
    { label: 'VOTING DESK', title: 'MAMA 2025 · Worldwide Fans’ Choice', detail: 'Closes in 2 days · 3 actions left', icon: Vote, tone: 'violet', category:'voting' },
    { label: 'NEXT ON THE CALENDAR', title: 'BTS WORLD TOUR “ARIRANG”', detail: '20 JUN · 19:00 KST', icon: CalendarDays, tone: 'lilac', category:'archive' },
  ];
  const filteredSaved = savedFilter==='all'? savedDisplay : savedDisplay.filter((s:any)=> s.category===savedFilter);

  if(showSavedAll){
    return (
      <main className="ps-profile">
        <header className="ps-profile__topbar" style={{height:52}}>
          <button onClick={()=>setShowSavedAll(false)} className="ps-profile__icon-button" style={{border:'1px solid #e9dff6', background:'#fff'}}><ChevronRight style={{transform:'rotate(180deg)'}} size={16}/></button>
          <strong style={{fontSize:13}}>Saved Desk</strong><div style={{width:30}}/>
        </header>
        <div className="ps-profile__content">
          <div style={{display:'flex', gap:8, overflowX:'auto', padding:'12px 0'}} className="ps-scroll-hide">
            {(['all','voting','archive','updates','notice','community'] as const).map(cat=>(
              <button key={cat} onClick={()=>setSavedFilter(cat)} style={{whiteSpace:'nowrap', padding:'7px 14px', borderRadius:20, fontSize:11, border:'1px solid #e9dff6', background: savedFilter===cat?'#60438f':'#fff', color: savedFilter===cat?'#fff':'#6b5a80', textTransform:'capitalize'}}>{cat}</button>
            ))}
          </div>
          <div className="ps-profile__saved-list" style={{marginTop:12}}>{filteredSaved.map((note:any, idx:number)=>{ const Icon=note.icon; return (<article key={idx} className="ps-profile__saved-card"><div className={`ps-profile__saved-icon ps-profile__saved-icon--${note.tone}`}><Icon size={17} /></div><div className="ps-profile__saved-copy"><span className="ps-profile__label">{note.label}</span><h3>{note.title}</h3><p>{note.detail}</p></div></article>);})}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="ps-profile">
      <div style={{height:8}}/>
      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-[#332840] text-white px-5 py-2.5 rounded-full text-[12px] shadow">{toast}</div>}
      {isGuest? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div className="h-20 w-20 rounded-full bg-white border border-[#ece6f3] flex items-center justify-center mb-4"><div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#c7b1ec] to-[#8b5cf6]" /></div>
          <h2 className="text-[20px] font-semibold">Welcome to PurpleSync</h2><p className="text-[13px] text-[#81758d] mt-2 max-w-[320px]">Create an account to save votings. Login required to save/like.</p>
          <div className="mt-6 w-full max-w-[320px] space-y-2">
            <button onClick={()=>{setAuthMode('signup'); setShowAuth(true);}} className="w-full bg-[#60438f] text-white py-3 rounded-full text-[13px] font-medium">Create an account</button>
            <button onClick={()=>{setAuthMode('login'); setShowAuth(true);}} className="w-full bg-white border border-[#e3dced] py-3 rounded-full text-[13px] font-medium">Login</button>
          </div>
        </div>
      ):(
        <div className="ps-profile__content">
          <div style={{padding:'16px 0 0 2px'}}><div className="ps-profile__eyebrow"><span className="ps-profile__dot" /><span>MY PURPLESYNC DESK</span></div></div>
          <section className="ps-profile__intro ps-profile__rise" style={{marginTop:10}}>
            <div className="ps-profile__identity">
              <div className="ps-profile__avatar" aria-hidden="true" style={pfpPreview? { backgroundImage:`url(${pfpPreview})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
                {!pfpPreview && <span>{(userData?.displayName||user?.displayName||'AR').slice(0,2).toUpperCase()}</span>}
                <div className="ps-profile__avatar-orbit ps-profile__avatar-orbit--one" /><div className="ps-profile__avatar-orbit ps-profile__avatar-orbit--two" />
              </div>
              <div className="ps-profile__identity-copy"><h1>{userData?.displayName||user?.displayName||'Ari'}</h1><p>{joinedText()} · keeping the signal close</p></div>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginLeft:'auto'}}>
              <button onClick={()=>setShowEdit(true)} title="Edit profile" style={{height:32,width:32, background:'#fff', border:'1px solid #e9dff6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(0,0,0,0.06)'}}><Pencil size={14} /></button>
              <button className={`ps-profile__follow ${following? 'is-following' : ''}`} type="button" onClick={() => setFollowing((c) =>!c)} style={{fontSize:11, padding:'7px 14px'}}>{following? <Check size={12} /> : <Heart size={12} />}{following? 'Following' : 'Follow desk'}</button>
            </div>
          </section>

          {/* XP BOX - CHOTA KAR DIYA, BILKUL HALKA HIGHLIGHT */}
          <div style={{marginTop:12, background:'#fff', border:'1px solid #ece6f3', borderRadius:14, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <div style={{height:28,width:28, borderRadius:'50%', background:'#f8f5ff', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #ece6f3'}}><Star size={13} color="#8b5cf6"/></div>
              <div><p style={{fontSize:9, letterSpacing:0.8, color:'#a89db8', fontWeight:600}}>QUIZ XP</p><p style={{fontSize:12, fontWeight:600, color:'#4c425c'}}>{totalXP} XP • {totalQuizzes} quizzes</p></div>
            </div>
            <button onClick={()=>onNavigate?.('quiz')} style={{fontSize:10, background:'#f8f5ff', border:'1px solid #ece6f3', color:'#6b5a80', padding:'5px 10px', borderRadius:20}}>View</button>
          </div>

          {/* 4 BOXES WITH ICONS AND LIGHT COLORS AS YOU SAID */}
          <section className="ps-profile__stats ps-profile__rise" style={{marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <div className="ps-profile__stat" style={{background:'#fff', border:'1px solid #ece6f3', borderRadius:14, padding:'12px', display:'flex', flexDirection:'column', gap:6}}>
              <div style={{height:26,width:26, borderRadius:'50%', background:'#f3eeff', display:'flex', alignItems:'center', justifyContent:'center'}}><Vote size={13} color="#8b5cf6"/></div>
              <strong style={{fontSize:18}}>18</strong><span style={{fontSize:11, color:'#8a7f9a'}}>votes this month</span>
            </div>
            <div className="ps-profile__stat" style={{background:'#fff', border:'1px solid #ece6f3', borderRadius:14, padding:'12px', display:'flex', flexDirection:'column', gap:6}}>
              <div style={{height:26,width:26, borderRadius:'50%', background:'#fff9db', display:'flex', alignItems:'center', justifyContent:'center'}}><Bookmark size={13} color="#c9a800"/></div>
              <strong style={{fontSize:18}}>07</strong><span style={{fontSize:11, color:'#8a7f9a'}}>saved updates</span>
            </div>
            <div className="ps-profile__stat" style={{background:'#fff', border:'1px solid #ece6f3', borderRadius:14, padding:'12px', display:'flex', flexDirection:'column', gap:6}}>
              <div style={{height:26,width:26, borderRadius:'50%', background:'#eef4ff', display:'flex', alignItems:'center', justifyContent:'center'}}><Archive size={13} color="#5b8def"/></div>
              <strong style={{fontSize:18}}>12</strong><span style={{fontSize:11, color:'#8a7f9a'}}>archive visits</span>
            </div>
            <div className="ps-profile__stat" style={{background:'#fff', border:'1px solid #ece6f3', borderRadius:14, padding:'12px', display:'flex', flexDirection:'column', gap:6}}>
              <div style={{height:26,width:26, borderRadius:'50%', background:'#fff2e6', display:'flex', alignItems:'center', justifyContent:'center'}}><Zap size={13} color="#e67e22" fill="#e67e22"/></div>
              <strong style={{fontSize:18, display:'flex', alignItems:'center', gap:4, color:'#7c4a1e'}}><Zap size={16} fill="currentColor"/>14</strong><span style={{fontSize:11, color:'#8a7f9a'}}>day desk streak</span>
            </div>
          </section>

          <div className="ps-profile__grid">
            <section className="ps-profile__panel ps-profile__panel--focus ps-profile__rise">
              <div className="ps-profile__section-heading"><div><span className="ps-profile__label">THE DESK NOTE</span><h2>What I’m close to</h2></div><button className="ps-profile__edit" type="button" onClick={openDeskEdit}><Edit3 size={15} /></button></div>
              <div className="ps-profile__focus-card"><div className="ps-profile__focus-icon"><Sparkles size={18} /></div><div><span className="ps-profile__label">CURRENT FOCUS</span><h3>{deskNote.title}</h3><p>{deskNote.subtitle}</p></div></div>
              <div className="ps-profile__focus-footer"><span><span className="ps-profile__mini-dot" />{deskNote.visibility} view</span><span>updated just now</span></div>
            </section>
            <section className="ps-profile__panel ps-profile__panel--record ps-profile__rise">
              <div className="ps-profile__section-heading"><div><span className="ps-profile__label">ON RECORD</span><h2>Small wins, kept close</h2></div><Trophy className="ps-profile__heading-icon" size={18} /></div>
              <div className="ps-profile__record-row"><div className="ps-profile__record-badge"><Trophy size={17} /></div><div><strong>Steady signal</strong><p>14 days showing up for the desk</p></div><ChevronRight size={16} /></div>
              <div className="ps-profile__record-row"><div className="ps-profile__record-badge ps-profile__record-badge--soft"><Bookmark size={17} /></div><div><strong>Thoughtful archive</strong><p>7 official notes saved this month</p></div><ChevronRight size={16} /></div>
            </section>
          </div>
          <section className="ps-profile__saved ps-profile__rise"><div className="ps-profile__section-heading"><div><span className="ps-profile__label">SAVED TO MY DESK</span><h2>Keep close</h2></div><button className="ps-profile__text-button" type="button" onClick={()=>setShowSavedAll(true)}>View all <ChevronRight size={14} /></button></div><div className="ps-profile__saved-list">{savedDisplay.slice(0,7).map((note:any, idx:number) => { const Icon = note.icon; return (<article className="ps-profile__saved-card" key={idx}><div className={`ps-profile__saved-icon ps-profile__saved-icon--${note.tone}`}><Icon size={17} /></div><div className="ps-profile__saved-copy"><span className="ps-profile__label">{note.label}</span><h3>{note.title}</h3><p>{note.detail}</p></div><ChevronRight className="ps-profile__saved-arrow" size={16} /></article>);})}</div></section>
          <div style={{display:'flex', gap:10, marginTop:20}}>
            <button onClick={()=>setShowDeleteConfirm(true)} className="flex-1 flex items-center justify-center gap-2 border border-red-200 bg-red-50 text-red-600 py-3 rounded-full text-[12px] font-medium"><Trash2 size={14}/> Delete Account</button>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-full text-[12px] font-medium"><LogOut size={14}/> Logout</button>
          </div>
          <footer className="ps-profile__footer"><div className="ps-profile__footer-mark">P</div><p>PurpleSync keeps your desk calm,<br />current, and close to the source.</p><span>LOCAL VIEW · PRIVATE</span></footer>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[380px] max-h-[90vh] overflow-y-auto p-5 animate-[scaleIn_0.2s_ease]">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[14px]">Edit Profile</h3><button onClick={()=>{setShowEdit(false);}} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button></div>
            <div className="flex flex-col items-center">
              <div className="ps-profile__avatar" aria-hidden="true" style={pfpPreview? { backgroundImage:`url(${pfpPreview})`, backgroundSize:'cover', backgroundPosition:'center', width:88, height:88 } : {width:88, height:88}}>
                {!pfpPreview && <span>{(editName||'AR').slice(0,2).toUpperCase()}</span>}
                <div className="ps-profile__avatar-orbit ps-profile__avatar-orbit--one" /><div className="ps-profile__avatar-orbit ps-profile__avatar-orbit--two" />
              </div>
              <p className="text-[10px] text-gray-500 mt-3">Best 1:1 (500x500) max 5MB - Free via imgBB</p>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePfpChange} />
              <div className="flex gap-2 mt-3"><button onClick={()=>fileRef.current?.click()} className="px-4 py-1.5 rounded-full border bg-white text-[11px] flex items-center gap-1"><ImageIcon size={12}/> Change File</button><button onClick={handleDeletePfp} className="px-4 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[11px]">Delete</button></div>
              <div className="w-full mt-4 p-3 bg-[#fbf8ff] border border-[#efe8f8] rounded-xl">
                <label className="text-[10px] font-semibold text-[#6b5a80] flex items-center gap-1"><Link2 size={10}/> ADD LINK OF PHOTO</label>
                <input value={pfpLink} onChange={e=>{setPfpLink(e.target.value); if(e.target.value){setPfpPreview(e.target.value); setPfpFile(null);}}} placeholder="https://i.ibb.co/..." className="w-full mt-1 text-[11px] outline-none border border-[#e3dced] rounded-lg p-2 focus:border-[#8b5cf6] bg-white"/>
                <p className="text-[9px] text-gray-400 mt-1">Paste direct link - will stay forever after refresh</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-[#8b5cf6] to-white my-5" />
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-[#6b5a80]">Change Username</label>
              <div className="border border-[#e3dced] rounded-xl p-3"><input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="ARI" className="w-full text-[13px] outline-none"/></div>
              <button onClick={handleSaveProfile} disabled={saving} className="w-full bg-[#60438f] text-white py-3 rounded-xl text-[13px] font-medium disabled:
