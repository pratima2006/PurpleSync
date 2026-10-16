import { useState, useEffect, useRef } from 'react';
import { Bookmark, Check, ChevronRight, Edit3, Heart, Sparkles, Trophy, Vote, Zap, X, LogOut, Trash2, AlertTriangle, Image as ImageIcon, Pencil, CalendarDays, Star } from 'lucide-react';
import './Profile.css';
import { auth, db } from '../firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut, deleteUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
const IMGBB_API_KEY = "4e2e98bc940a51d1c6a30f7d1d13bc22";

export default function Profile({ onNavigate }: { onNavigate?: (p:any)=>void }) {
  const [following,setFollowing]=useState(true);
  const [user,setUser]=useState<any>(null);
  const [userData,setUserData]=useState<any>(null);
  const [showEdit,setShowEdit]=useState(false);
  const [editName,setEditName]=useState('');
  const [pfpPreview,setPfpPreview]=useState(''); const [pfpFile,setPfpFile]=useState<File|null>(null); const [pfpLink,setPfpLink]=useState('');
  const [saving,setSaving]=useState(false); const [toast,setToast]=useState('');
  const [showAuth,setShowAuth]=useState(false); const [authMode,setAuthMode]=useState<'login'|'signup'>('login'); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [showDeleteConfirm,setShowDeleteConfirm]=useState(false); const [deleting,setDeleting]=useState(false);
  const [deskNote,setDeskNote]=useState({title:'Making every vote count.',subtitle:'Two windows need attention before the weekend.',visibility:'public' as any});
  const [totalXP,setTotalXP]=useState(0); const [totalQuizzes,setTotalQuizzes]=useState(0);
  const fileRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{ const unsub=onAuthStateChanged(auth, async (u)=>{ setUser(u); if(u){ const snap=await getDoc(doc(db,'users',u.uid)); if(snap.exists()){ const d=snap.data(); setUserData(d); setPfpPreview(d.photoURL||u.photoURL||''); setEditName(d.displayName||u.displayName||''); if(d.deskNote) setDeskNote(d.deskNote);} } }); return ()=>unsub(); },[]);
  useEffect(()=>{ if(!user) return; const q=query(collection(db,'quizAttempts'),where('userId','==',user.uid)); return onSnapshot(q,s=>{ let xp=0; s.docs.forEach(d=>xp+=d.data().xpEarned||0); setTotalXP(xp); setTotalQuizzes(s.size); }); },[user]);

  const joinedText=()=>{ if(!user?.metadata?.creationTime) return 'ARMY since 2018'; const d=new Date(user.metadata.creationTime); return `Joined ${d.toLocaleString('en-US',{month:'short'})} ${d.getFullYear()}`; };
  const handlePfpChange=(e:any)=>{ const f=e.target.files?.[0]; if(!f) return; setPfpFile(f); setPfpLink(''); setPfpPreview(URL.createObjectURL(f)); };

  const handleSaveProfile=async()=>{ if(!user) return; setSaving(true); try{ let photoURL=pfpPreview; if(pfpLink.trim()) photoURL=pfpLink.trim(); else if(pfpFile){ const fd=new FormData(); fd.append('image',pfpFile); const res=await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,{method:'POST',body:fd}); const data=await res.json(); photoURL=data.data.url; } await updateProfile(user,{displayName:editName,photoURL}); await setDoc(doc(db,'users',user.uid),{displayName:editName,photoURL},{merge:true}); setUserData((p:any)=>({...p,displayName:editName,photoURL})); setPfpPreview(photoURL); setToast('Profile saved! 💜'); setShowEdit(false);}catch(e:any){alert(e.message);} setSaving(false); setTimeout(()=>setToast(''),2000); };

  if(!user) return <main className="ps-profile"><div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center"><h2 className="text-[20px] font-semibold">Welcome to PurpleSync</h2><div className="mt-6 w-full max-w-[320px] space-y-2"><button onClick={()=>{setAuthMode('signup'); setShowAuth(true);}} className="w-full bg-[#60438f] text-white py-3 rounded-full text-[13px]">Create account</button><button onClick={()=>{setAuthMode('login'); setShowAuth(true);}} className="w-full bg-white border py-3 rounded-full text-[13px]">Login</button></div></div></main>;

  return (
    <main className="ps-profile">
      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-[#332840] text-white px-5 py-2.5 rounded-full text-[12px]">{toast}</div>}
      <div className="ps-profile__content">
        <div style={{padding:'16px 0 0 2px'}}><div className="ps-profile__eyebrow"><span className="ps-profile__dot"/><span>MY PURPLESYNC DESK</span></div></div>

        {/* EXACT LAYOUT AS PER YOUR GREEN MARKS */}
        <section style={{marginTop:14, display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div style={{display:'flex', gap:14, flex:1}}>
            <div className="ps-profile__avatar" style={pfpPreview? {backgroundImage:`url(${pfpPreview})`,backgroundSize:'cover',backgroundPosition:'center',width:72,height:72,minWidth:72,border:'3px solid #fff',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}:{width:72,height:72,minWidth:72}}>{!pfpPreview && <span>{(userData?.displayName||'AR').slice(0,2).toUpperCase()}</span>}</div>
            <div style={{paddingTop:2}}>
              <h1 style={{fontFamily:'serif', fontSize:28, lineHeight:'28px', fontWeight:600, color:'#2f2640'}}>{userData?.displayName||'Ari'}</h1>
              <p style={{fontSize:12, color:'#8a7f9a', marginTop:6}}>{joinedText()} · keeping the signal close</p>
            </div>
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:20, marginTop:2}}>
            <button onClick={()=>setShowEdit(true)} style={{height:32,width:32,background:'#fff',border:'1px solid #e9dff6',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}><Pencil size={14}/></button>
            <button onClick={()=>setFollowing(c=>!c)} style={{display:'flex',alignItems:'center',gap:6,background:following?'#f3eeff':'#fff',border:'1px solid #e9dff6',padding:'7px 14px',borderRadius:20,fontSize:12,color:'#6b5a80'}}>{following?<Check size={14}/>:<Heart size={14}/>}{following?'Following':'Follow desk'}</button>
          </div>
        </section>

        {/* XP ADDED HERE - YAHAN SE DIKHEGA */}
        <div style={{marginTop:18, background:'linear-gradient(135deg,#f3eeff,#ece3ff)',border:'1px solid #dcc9ff',borderRadius:16,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:10,alignItems:'center'}}><div style={{height:36,width:36,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #dcc9ff'}}><Star size={16} color="#8b5cf6"/></div><div><p style={{fontSize:10,letterSpacing:1,color:'#8a7f9a',fontWeight:600}}>TOTAL QUIZ XP</p><p style={{fontSize:15,fontWeight:700,color:'#4c2e8a'}}>{totalXP} XP • {totalQuizzes} quizzes played</p></div></div><button onClick={()=>onNavigate?.('quiz')} style={{fontSize:11,background:'#5e428f',color:'#fff',padding:'6px 12px',borderRadius:20}}>Quizzes</button>
        </div>

        <section className="ps-profile__stats ps-profile__rise" style={{marginTop:16}}><div className="ps-profile__stat"><strong>18</strong><span>votes this month</span></div><div className="ps-profile__stat"><strong>07</strong><span>saved updates</span></div><div className="ps-profile__stat"><strong>12</strong><span>archive visits</span></div><div className="ps-profile__stat ps-profile__stat--accent"><strong><Zap size={16} fill="currentColor"/>14</strong><span>day desk streak</span></div></section>

        <footer className="ps-profile__footer"><div className="ps-profile__footer-mark">P</div><p>PurpleSync keeps your desk calm,<br/>current, and close to the source.</p></footer>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[380px] p-5">
            <div className="flex justify-between mb-4"><h3 className="font-semibold text-[14px]">Edit Profile</h3><button onClick={()=>setShowEdit(false)} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button></div>
            <div className="flex flex-col items-center"><div className="ps-profile__avatar" style={pfpPreview?{backgroundImage:`url(${pfpPreview})`,backgroundSize:'cover',width:88,height:88}:{width:88,height:88}}>{!pfpPreview && <span>{editName.slice(0,2).toUpperCase()}</span>}</div><input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePfpChange}/><button onClick={()=>fileRef.current?.click()} className="mt-3 px-4 py-1.5 rounded-full border text-[11px]">Change File</button><input value={pfpLink} onChange={e=>{setPfpLink(e.target.value); if(e.target.value) setPfpPreview(e.target.value);}} placeholder="https://i.ibb.co/..." className="w-full mt-3 border rounded-lg p-2 text-[11px]"/></div>
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Username" className="w-full border rounded-xl p-3 mt-4 text-[13px]"/><button onClick={handleSaveProfile} disabled={saving} className="w-full bg-[#60438f] text-white py-3 rounded-xl text-[13px] mt-3">{saving?'Saving...':'Save'}</button>
          </div>
        </div>
      )}
    </main>
  );
}
