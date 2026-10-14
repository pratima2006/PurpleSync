import { useState, useEffect, useRef } from 'react';
import { Check, Edit3, Heart, Trophy, Zap, X, LogOut, Trash2, AlertTriangle, Image as ImageIcon, Pencil, Sparkles, Bookmark, Flag } from 'lucide-react';
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

export default function Profile({ onNavigate, viewingUserId }: { onNavigate?: (p:any, data?:any)=>void, viewingUserId?:string }) {
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deskNote, setDeskNote] = useState({ title: 'Making every vote count.', subtitle: 'Two windows need attention before the weekend.', visibility: 'public' as 'public'|'private' });
  const [editDeskTitle, setEditDeskTitle] = useState('');
  const [editDeskSubtitle, setEditDeskSubtitle] = useState('');
  const [editDeskVis, setEditDeskVis] = useState<'public'|'private'>('public');
  const [flaggedCount, setFlaggedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const isOtherUser =!!viewingUserId;
  const targetUid = viewingUserId || user?.uid;

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (u)=>{
      setUser(u);
      if(u){
        const snap = await getDoc(doc(db,'users',u.uid));
        if(snap.exists()){
          const data = snap.data();
          setUserData(data);
          setEditName(data.displayName||u.displayName||'');
          setPfpPreview(data.photoURL||u.photoURL||'');
          if(data.deskNote){ setDeskNote(data.deskNote); }
        } else {
          const data={ uid:u.uid, email:u.email, displayName:u.displayName||'Ari', photoURL:u.photoURL||'', createdAt:new Date().toISOString(), deskNote };
          await setDoc(doc(db,'users',u.uid), data);
          setUserData(data);
        }
      }
    });
    return ()=>unsub();
  },[]);

  // Load other user's public data if viewing other
  useEffect(()=>{
    if(!viewingUserId) return;
    (async ()=>{
      const snap = await getDoc(doc(db,'users',viewingUserId));
      if(snap.exists()) setUserData(snap.data());
    })();
  },[viewingUserId]);

  // Flagged voting count for desk note
  useEffect(()=>{
    if(!targetUid) return;
    const q = query(collection(db,'flaggedVotings'), where('userId','==',targetUid));
    const unsub = onSnapshot(q, (snap)=> setFlaggedCount(snap.size));
    return ()=>unsub();
  },[targetUid]);

  const joinedText = ()=>{
    const meta = isOtherUser? userData?.createdAt : user?.metadata?.creationTime;
    if(!meta) return 'ARMY since 2024';
    const d = new Date(meta);
    return `Joined ${d.toLocaleString('en-US',{month:'short'})} ${d.getFullYear()}`;
  };

  const handlePfpChange = (e:any)=>{
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>2*1024*1024){ alert('Max 2MB'); return; }
    setPfpFile(file); setPfpPreview(URL.createObjectURL(file));
  };

  // FIXED: PFP + NAME PERSIST
  const handleSaveProfile = async ()=>{
    if(!user) return; setSaving(true);
    try{
      let photoURL = userData?.photoURL || user.photoURL || '';
      if(pfpFile){
        const r=ref(storage,`pfp/${user.uid}/avatar_${Date.now()}`);
        await uploadBytes(r, pfpFile);
        photoURL = await getDownloadURL(r);
      }
      await updateProfile(user, { displayName: editName, photoURL });
      await setDoc(doc(db,'users',user.uid), { displayName: editName, photoURL, updatedAt: new Date().toISOString() }, {merge:true});
      setUserData((prev:any)=> ({...prev, displayName: editName, photoURL}));
      setPfpPreview(photoURL);
      setPfpFile(null);
      setToast('Profile saved! 💜');
      setShowEdit(false);
      setTimeout(()=>setToast(''),3000);
      await auth.currentUser?.reload();
    }catch(e:any){ alert(e.message); }
    setSaving(false);
  };

  const handleDeletePfp = async ()=>{
    if(!user) return; setSaving(true);
    try{
      await deleteObject(ref(storage,`pfp/${user.uid}`)).catch(()=>{});
      await updateProfile(user,{ photoURL:'' });
      await setDoc(doc(db,'users',user.uid),{ photoURL:'' },{merge:true});
      setPfpPreview(''); setPfpFile(null);
      setUserData((prev:any)=> ({...prev, photoURL:''}));
      setToast('PFP removed');
      setTimeout(()=>setToast(''),2000);
    }catch(e:any){ alert(e.message); }
    setSaving(false);
  };

  const openDeskEdit = ()=>{
    setEditDeskTitle(deskNote.title);
    setEditDeskSubtitle(deskNote.subtitle);
    setEditDeskVis(deskNote.visibility);
    setShowDeskEdit(true);
  };

  const handleSaveDeskNote = async ()=>{
    if(!user) return;
    if(editDeskSubtitle.split(/\s+/).filter(Boolean).length > 200){ alert('Subtitle max 200 words'); return; }
    setSaving(true);
    try{
      const newNote = { title: editDeskTitle, subtitle: editDeskSubtitle, visibility: editDeskVis, updatedAt: new Date().toISOString() };
      await setDoc(doc(db,'users',user.uid), { deskNote: newNote }, {merge:true});
      setDeskNote(newNote);
      setShowDeskEdit(false);
      setToast('Desk note updated!');
      setTimeout(()=>setToast(''),2500);
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
      setShowAuth(false); setEmail(''); setPassword(''); setToast('Welcome! 💜'); setTimeout(()=>setToast(''),3000);
    }catch(e:any){ alert(e.message.replace('Firebase:','')); }
    finally{ setSaving(false); }
  };

  const handleLogout = async ()=>{ await signOut(auth); onNavigate?.('home'); };
  const handleDeleteAccount = async ()=>{
    if(!user) return; setDeleting(true);
    try{
      const q=query(collection(db,'userVotings'), where('ownerId','==',user.uid));
      const snap=await getDocs(q);
      for(const d of snap.docs){ const data=d.data(); if(data.verificationStatus==='private'||data.visibility==='private') await deleteDoc(d.ref); else await updateDoc(d.ref,{ ownerName:'', ownerId:'deleted_'+user.uid, displayOption:'anonymous', addedByDisplay:'Verified' }); }
      await deleteDoc(doc(db,'users',user.uid)).catch(()=>{});
      await deleteUser(user); setShowDeleteConfirm(false); onNavigate?.('home');
    }catch(e:any){ alert(e.message); } setDeleting(false);
  };

  const isGuest =!user &&!isOtherUser;
  const displayName = userData?.displayName || user?.displayName || 'Ari';
  const displayPhoto = userData?.photoURL || pfpPreview;
  const showDeskToOthers =!isOtherUser || deskNote.visibility==='public';

  return (
    <main className="ps-profile" style={{background:'#fbf8ff', minHeight:'100vh'}}>
      {/* CLEAN TOPBAR - No back, no ARMY/PROFILE, no Bell */}
      <header className="ps-profile__topbar" style={{justifyContent:'center', background:'#fff', borderBottom:'1px solid #f0e9f8', height:52}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{height:22, width:22, borderRadius:7, background:'linear-gradient(135deg,#c7b1ec,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:11}}>P</div>
          <strong style={{fontSize:12, letterSpacing:'0.08em', color:'#231a33'}}>PURPLESYNC</strong>
        </div>
      </header>

      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-[#332840] text-white px-5 py-2.5 rounded-full text-[12px] shadow-xl">{toast}</div>}

      {isGuest? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div className="h-20 w-20 rounded-full bg-white border border-[#ece6f3] flex items-center justify-center mb-4"><div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#c7b1ec] to-[#8b5cf6]" /></div>
          <h2 className="text-[20px] font-semibold">Welcome to PurpleSync</h2>
          <p className="text-[13px] text-[#81758d] mt-2 max-w-[320px]">Create an account to add voting boxes, achievements and updates.</p>
          <div className="mt-6 w-full max-w-[300px] space-y-2">
            <button onClick={()=>{setAuthMode('signup'); setShowAuth(true);}} className="w-full bg-[#60438f] text-white py-3.5 rounded-full text-[13px] font-medium">Create an account</button>
            <button onClick={()=>{setAuthMode('login'); setShowAuth(true);}} className="w-full bg-white border border-[#e3dced] py-3.5 rounded-full text-[13px] font-medium">Login</button>
          </div>
        </div>
      ):(
        <div className="ps-profile__content" style={{maxWidth:560, margin:'0 auto', padding:'0 16px'}}>
          {/* PROFILE HEADER - MY PURPLESYNC DESK small left like voting page */}
          <section style={{padding:'20px 0 12px'}}>
            <p className="ps-mono text-[9px] text-[#8068a9] tracking-widest">MY PURPLESYNC DESK</p>
            <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginTop:8}}>
              <div style={{display:'flex', gap:14, alignItems:'center'}}>
                <div style={{position:'relative'}}>
                  <div style={{height:72, width:72, borderRadius:'50%', background:'#e9e0f5', backgroundImage: displayPhoto?`url(${displayPhoto})`:undefined, backgroundSize:'cover', backgroundPosition:'center', border:'3px solid white', boxShadow:'0 6px 18px rgba(107,69,168,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#60438f', fontSize:20}}>
                    {!displayPhoto && <span>{displayName.slice(0,2).toUpperCase()}</span>}
                  </div>
                </div>
                <div>
                  <h1 style={{fontSize:20, fontWeight:700, color:'#231a33', lineHeight:1.1}}>{displayName}</h1>
                  <p style={{fontSize:11, color:'#8a7e9a', marginTop:3}}>{joinedText()} · {userData?.email || user?.email}</p>
                  <p style={{fontSize:10, color:'#9b8eac', marginTop:2}}>keeping the signal close</p>
                </div>
              </div>
              {/* Pencil + Following small */}
              {!isOtherUser && (
                <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8}}>
                  <button onClick={()=>setShowEdit(true)} title="Edit profile" style={{height:28, width:28, background:'#fff', border:'1px solid #e8dff3', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <Pencil size={12} />
                  </button>
                  <button className={`ps-profile__follow ${following?'is-following':''}`} type="button" onClick={()=>setFollowing(c=>!c)} style={{fontSize:10, padding:'5px 10px', borderRadius:20, height:26}}>
                    {following? <Check size={10}/> : <Heart size={10}/>}{following?'Following':'Follow'}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* STATS 4 BOXES - keep */}
          <section style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:12}}>
            {[
              {k:'18', v:'votes this month'},
              {k:'07', v:'saved updates'},
              {k:'12', v:'archive visits'},
              {k:'14', v:'day streak', icon:true},
            ].map(s=>(
              <div key={s.v} style={{background:'#fff', border:'1px solid #efe8f8', borderRadius:14, padding:'10px 6px', textAlign:'center'}}>
                <strong style={{fontSize:14, display:'flex', justifyContent:'center', gap:2}}>{s.icon && <Zap size={12} fill="currentColor"/>}{s.k}</strong>
                <span style={{fontSize:8, color:'#8a7e9a', display:'block', marginTop:2, lineHeight:1.2}}>{s.v}</span>
              </div>
            ))}
          </section>

          {/* THE DESK NOTE - with own edit pencil */}
          {showDeskToOthers && (
            <section className="ps-profile__panel" style={{marginTop:14, background:'#fff', border:'1px solid #ece6f3', borderRadius:16, padding:14}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div><span className="ps-mono text-[9px] text-[#8068a9]">THE DESK NOTE</span><h2 style={{fontSize:13, fontWeight:600, marginTop:2}}>What I’m close to</h2></div>
                {!isOtherUser && <button onClick={openDeskEdit} style={{height:26, width:26, background:'#f5f0fd', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><Edit3 size={12}/></button>}
              </div>
              <div style={{marginTop:10, background:'linear-gradient(135deg,#f5f0ff,#efe6ff)', border:'1px solid #e9dff6', borderRadius:12, padding:12, display:'flex', gap:10}}>
                <div style={{height:28, width:28, background:'#fff', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center'}}><Sparkles size={14} /></div>
                <div style={{flex:1}}>
                  <span className="ps-mono text-[8px] text-[#8068a9]">CURRENT FOCUS</span>
                  <h3 style={{fontSize:12, fontWeight:600, marginTop:2}}>{deskNote.title}</h3>
                  <p style={{fontSize:11, color:'#6b5a80', marginTop:2, lineHeight:1.4}}>{deskNote.subtitle}</p>
                  <p style={{fontSize:10, color:'#9b8eac', marginTop:6, display:'flex', alignItems:'center', gap:4}}><Flag size={10}/> {flaggedCount} votings flagged for desk · {deskNote.visibility}</p>
                </div>
              </div>
            </section>
          )}

          {/* ON RECORD - no delete/logout */}
          <section className="ps-profile__panel" style={{marginTop:12, background:'#fff', border:'1px solid #ece6f3', borderRadius:16, padding:14}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div><span className="ps-mono text-[9px] text-[#8068a9]">ON RECORD</span><h2 style={{fontSize:13, fontWeight:600, marginTop:2}}>Small wins, kept close</h2></div><Trophy size={14} />
            </div>
            <div style={{marginTop:10, display:'flex', flexDirection:'column', gap:8}}>
              <div style={{display:'flex', gap:8, alignItems:'center', fontSize:11}}><div style={{height:22,width:22, background:'#f5f0fd', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center'}}><Trophy size={12}/></div><div><strong>Steady signal</strong><p style={{fontSize:10,color:'#8a7e9a'}}>14 days showing up</p></div></div>
              <div style={{display:'flex', gap:8, alignItems:'center', fontSize:11}}><div style={{height:22,width:22, background:'#fbf8ff', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center'}}><Bookmark size={12}/></div><div><strong>Thoughtful archive</strong><p style={{fontSize:10,color:'#8a7e9a'}}>7 notes saved</p></div></div>
            </div>
          </section>

          {/* DELETE / LOGOUT side by side at bottom */}
          {!isOtherUser && (
            <div style={{display:'flex', gap:10, marginTop:18, marginBottom:12}}>
              <button onClick={()=>setShowDeleteConfirm(true)} style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', padding:'12px 0', borderRadius:24, fontSize:12, fontWeight:500}}><Trash2 size={13}/> Delete Account</button>
              <button onClick={handleLogout} style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'#ef4444', color:'#fff', padding:'12px 0', borderRadius:24, fontSize:12, fontWeight:500}}><LogOut size={13}/> Logout</button>
            </div>
          )}

          <footer style={{textAlign:'center', padding:'12px 0 32px'}}>
            <div style={{height:24,width:24, borderRadius:7, background:'#231a33', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11}}>P</div>
            <p style={{fontSize:10, color:'#9b8eac', marginTop:6}}>PurpleSync keeps your desk calm,<br/>current, and close to the source.</p>
          </footer>
        </div>
      )}

      {/* EDIT PFP + NAME POPUP */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[360px] p-5 animate-[scaleIn_0.2s_ease]">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[13px]">Edit Profile</h3><button onClick={()=>setShowEdit(false)} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button></div>
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full border-4 border-white shadow bg-gradient-to-br from-[#c7b1ec] to-[#8b5cf6] flex items-center justify-center text-white font-semibold overflow-hidden" style={pfpPreview?{backgroundImage:`url(${pfpPreview})`, backgroundSize:'cover', backgroundPosition:'center'}:{}}>{!pfpPreview && (editName||'AR').slice(0,2).toUpperCase()}</div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePfpChange} />
              <div className="flex gap-2 mt-3"><button onClick={()=>fileRef.current?.click()} className="px-3 py-1.5 rounded-full border text-[11px] flex items-center gap-1"><ImageIcon size={12}/> Change</button><button onClick={handleDeletePfp} className="px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[11px]">Remove</button></div>
            </div>
            <div className="mt-5 space-y-3">
              <label className="text-[10px] font-semibold text-[#6b5a80]">USERNAME</label>
              <input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full border border-[#e3dced] rounded-xl p-3 text-[13px] outline-none focus:border-[#8b5cf6]"/>
              <button onClick={handleSaveProfile} disabled={saving} className="w-full bg-black text-white py-3 rounded-xl text-[13px] disabled:opacity-50">{saving?'Saving...':'Save'}</button>
              <p className="text-[10px] text-center text-gray-400">Saved data will stay after logout & refresh until you change it</p>
            </div>
          </div>
        </div>
      )}

      {/* DESK NOTE EDIT POPUP - NEW */}
      {showDeskEdit && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[380px] p-5">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[13px]">Edit Desk Note</h3><button onClick={()=>setShowDeskEdit(false)} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button></div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-[#6b5a80]">CURRENT FOCUS - Title</label>
                <input value={editDeskTitle} onChange={e=>setEditDeskTitle(e.target.value)} placeholder="Making every vote count." className="w-full mt-1 border border-[#e3dced] rounded-xl p-3 text-[13px] outline-none focus:border-[#8b5cf6]"/>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#6b5a80]">Subtitle (max 200 words) - {editDeskSubtitle.split(/\s+/).filter(Boolean).length}/200</label>
                <textarea value={editDeskSubtitle} onChange={e=>setEditDeskSubtitle(e.target.value)} rows={3} placeholder="Two windows need attention..." className="w-full mt-1 border border-[#e3dced] rounded-xl p-3 text-[12px] outline-none focus:border-[#8b5cf6] resize-none"/>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setEditDeskVis('public')} className={`flex-1 py-2 rounded-full text-[11px] border ${editDeskVis==='public'?'bg-[#60438f] text-white border-[#60438f]':'bg-white'}`}>Public - Show to others</button>
                <button onClick={()=>setEditDeskVis('private')} className={`flex-1 py-2 rounded-full text-[11px] border ${editDeskVis==='private'?'bg-[#231a33] text-white border-[#231a33]':'bg-white'}`}>Private - Only me</button>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={()=>setShowDeskEdit(false)} className="flex-1 bg-gray-100 py-3 rounded-xl text-[12px]">Cancel</button>
                <button onClick={handleSaveDeskNote} disabled={!hasDeskChanged || saving} className="flex-1 bg-black text-white py-3 rounded-xl text-[12px] disabled:opacity-40 disabled:cursor-not-allowed">{saving?'Saving...':'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[340px] p-6">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[13px]">{authMode==='login'?'Login':'Create Account'}</h3><button onClick={()=>setShowAuth(false)} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button></div>
            <div className="space-y-3">
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border border-[#e3dced] p-3 rounded-xl text-[13px]" type="email"/>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border border-[#e3dced] p-3 rounded-xl text-[13px]"/>
              <button onClick={handleAuth} disabled={saving} className="w-full bg-[#60438f] text-white py-3 rounded-full text-[13px]">{saving?'Wait...': authMode==='login'?'Login':'Create'}</button>
              <button onClick={()=>setAuthMode(authMode==='login'?'signup':'login')} className="w-full text-[11px] text-[#704ca5]">{authMode==='login'?'Need account? Sign up':'Have account? Login'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[360px] p-6 animate-[scaleIn_0.25s_ease] shadow-2xl">
            <h3 className="font-semibold text-[14px]">Delete account?</h3>
            <div className="mt-3 flex gap-2 items-start bg-red-50 border border-red-200 p-3 rounded-xl"><AlertTriangle size={14} className="text-red-500 mt-0.5"/><p className="text-[11px] text-red-700 leading-4">Private boxes deleted forever. Public boxes stay with Verified tick only.</p></div>
            <div className="mt-4 flex gap-2"><button onClick={()=>setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-[12px]">Cancel</button><button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-[12px]">{deleting?'Deleting...':'Yes, Delete'}</button></div>
          </div>
        </div>
      )}
      <style>{`@keyframes scaleIn{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </main>
  );
}
