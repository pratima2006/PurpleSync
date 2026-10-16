import { useState, useEffect, useRef } from 'react';
import { Check, Heart, Pencil, Zap, X, Image as ImageIcon, Star } from 'lucide-react';
import './Profile.css';
import { auth, db } from '../firebase';
import { onAuthStateChanged, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

const IMGBB_API_KEY = "4e2e98bc940a51d1c6a30f7d1d13bc22";

export default function Profile({ onNavigate }: { onNavigate?: (p:any)=>void }) {
  const [following, setFollowing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [pfpFile, setPfpFile] = useState<File|null>(null);
  const [pfpPreview, setPfpPreview] = useState<string>('');
  const [pfpLink, setPfpLink] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string>('');
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
        }
      }
    });
    return ()=>unsub();
  },[]);

  useEffect(()=>{
    if(!user) return;
    const q = query(collection(db,'quizAttempts'), where('userId','==',user.uid));
    const unsub = onSnapshot(q, snap=>{
      let xp=0;
      snap.docs.forEach(d=> xp += (d.data().xpEarned||0));
      setTotalXP(xp);
      setTotalQuizzes(snap.size);
    });
    return ()=>unsub();
  },[user]);

  const joinedText = ()=>{
    if(!user?.metadata?.creationTime) return 'ARMY since 2018';
    const d = new Date(user.metadata.creationTime);
    return `Joined ${d.toLocaleString('en-US',{month:'short'})} ${d.getFullYear()}`;
  };

  const handlePfpChange = (e:any)=>{
    const file=e.target.files?.[0]; if(!file) return;
    setPfpFile(file); setPfpLink(''); setPfpPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async ()=>{
    if(!user) return; setSaving(true);
    try{
      let photoURL = pfpPreview;
      if(pfpLink.trim()){
        photoURL = pfpLink.trim();
      } else if(pfpFile){
        const fd = new FormData(); fd.append('image', pfpFile);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method:'POST', body:fd });
        const data = await res.json();
        photoURL = data.data.url;
      }
      await updateProfile(user, { displayName: editName, photoURL });
      await setDoc(doc(db,'users',user.uid), { displayName: editName, photoURL, updatedAt: new Date().toISOString() }, {merge:true});
      setUserData((prev:any)=> ({...prev, displayName: editName, photoURL}));
      setPfpPreview(photoURL); setPfpFile(null); setPfpLink('');
      setToast('Profile saved! 💜'); setShowEdit(false);
      setTimeout(()=>setToast(''),2000);
    }catch(e:any){ alert(e.message); }
    setSaving(false);
  };

  if(!user){
    return (
      <main className="ps-profile">
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <h2 className="text-[20px] font-semibold">Welcome to PurpleSync</h2>
          <p className="text-[13px] text-[#81758d] mt-2">Please login to view profile</p>
        </div>
      </main>
    );
  }

  return (
    <main className="ps-profile">
      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-[#332840] text-white px-5 py-2.5 rounded-full text-[12px] shadow">{toast}</div>}
      <div className="ps-profile__content">
        <div style={{padding:'16px 0 0 2px'}}>
          <div className="ps-profile__eyebrow"><span className="ps-profile__dot"/><span>MY PURPLESYNC DESK</span></div>
        </div>

        <section style={{marginTop:14, display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div style={{display:'flex', gap:14, flex:1}}>
            <div className="ps-profile__avatar" aria-hidden="true" style={pfpPreview? {backgroundImage:`url(${pfpPreview})`,backgroundSize:'cover',backgroundPosition:'center',width:72,height:72,minWidth:72,border:'3px solid #fff',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}:{width:72,height:72,minWidth:72}}>
              {!pfpPreview && <span>{(userData?.displayName||'AR').slice(0,2).toUpperCase()}</span>}
            </div>
            <div style={{paddingTop:2}}>
              <h1 style={{fontFamily:'serif', fontSize:28, lineHeight:'28px', fontWeight:600, color:'#2f2640'}}>{userData?.displayName||user?.displayName||'Ari'}</h1>
              <p style={{fontSize:12, color:'#8a7f9a', marginTop:6}}>{joinedText()} · keeping the signal close</p>
            </div>
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:20, marginTop:2}}>
            <button onClick={()=>setShowEdit(true)} style={{height:32,width:32,background:'#fff',border:'1px solid #e9dff6',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><Pencil size={14}/></button>
            <button onClick={()=>setFollowing(c=>!c)} style={{display:'flex',alignItems:'center',gap:6,background:following?'#f3eeff':'#fff',border:'1px solid #e9dff6',padding:'7px 14px',borderRadius:20,fontSize:12,color:'#6b5a80',cursor:'pointer'}}>{following?<Check size={14}/>:<Heart size={14}/>}{following?'Following':'Follow desk'}</button>
          </div>
        </section>

        <div style={{marginTop:18, background:'linear-gradient(135deg,#f3eeff,#ece3ff)',border:'1px solid #dcc9ff',borderRadius:16,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div style={{height:36,width:36,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #dcc9ff'}}><Star size={16} color="#8b5cf6"/></div>
            <div><p style={{fontSize:10,letterSpacing:1,color:'#8a7f9a',fontWeight:600}}>TOTAL QUIZ XP</p><p style={{fontSize:15,fontWeight:700,color:'#4c2e8a'}}>{totalXP} XP • {totalQuizzes} quizzes played</p></div>
          </div>
          <button onClick={()=>onNavigate?.('quiz')} style={{fontSize:11,background:'#5e428f',color:'#fff',padding:'6px 12px',borderRadius:20,border:'none',cursor:'pointer'}}>Quizzes</button>
        </div>

        <section className="ps-profile__stats ps-profile__rise" style={{marginTop:16}}>
          <div className="ps-profile__stat"><strong>18</strong><span>votes this month</span></div>
          <div className="ps-profile__stat"><strong>07</strong><span>saved updates</span></div>
          <div className="ps-profile__stat"><strong>12</strong><span>archive visits</span></div>
          <div className="ps-profile__stat ps-profile__stat--accent"><strong><Zap size={16} fill="currentColor"/>14</strong><span>day desk streak</span></div>
        </section>

        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button onClick={async()=>{ await signOut(auth); onNavigate?.('home'); }} className="flex-1 flex items-center justify-center gap-2 bg-[#332840] text-white py-3 rounded-full text-[12px] font-medium">Logout</button>
        </div>

        <footer className="ps-profile__footer"><div className="ps-profile__footer-mark">P</div><p>PurpleSync keeps your desk calm,<br/>current, and close to the source.</p><span>LOCAL VIEW · PRIVATE</span></footer>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[380px] p-5">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-[14px]">Edit Profile</h3><button onClick={()=>setShowEdit(false)} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button></div>
            <div className="flex flex-col items-center">
              <div className="ps-profile__avatar" aria-hidden="true" style={pfpPreview? {backgroundImage:`url(${pfpPreview})`,backgroundSize:'cover',backgroundPosition:'center',width:88,height:88}:{width:88,height:88}}><span>{!pfpPreview && (editName||'AR').slice(0,2).toUpperCase()}</span></div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePfpChange}/>
              <div className="flex gap-2 mt-3"><button onClick={()=>fileRef.current?.click()} className="px-4 py-1.5 rounded-full border bg-white text-[11px] flex items-center gap-1"><ImageIcon size={12}/>Change File</button></div>
              <div className="w-full mt-4 p-3 bg-[#fbf8ff] border border-[#efe8f8] rounded-xl">
                <label className="text-[10px] font-semibold">ADD LINK OF PHOTO</label>
                <input value={pfpLink} onChange={e=>{setPfpLink(e.target.value); if(e.target.value){setPfpPreview(e.target.value); setPfpFile(null);}}} placeholder="https://i.ibb.co/..." className="w-full mt-1 text-[11px] outline-none border border-[#e3dced] rounded-lg p-2 bg-white"/>
              </div>
            </div>
            <div className="space-y-3 mt-5">
              <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Username" className="w-full border border-[#e3dced] rounded-xl p-3 text-[13px] outline-none"/>
              <button onClick={handleSaveProfile} disabled={saving} className="w-full bg-[#60438f] text-white py-3 rounded-xl text-[13px] font-medium disabled:opacity-50">{saving?'Saving...':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
