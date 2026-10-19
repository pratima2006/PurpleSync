import { useState, useEffect } from 'react';
import { LogOut, Trash2, AlertTriangle, X } from 'lucide-react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';

export function Settings({ onNavigate }: { onNavigate?: (p:any)=>void }) {
  const [user, setUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'signup'>('login');

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, (u)=> setUser(u));
    return ()=>unsub();
  },[]);

  const handleLogout = async ()=>{ 
    await signOut(auth); 
    setToast('Logged out');
    onNavigate?.('home'); 
  };

  const handleDeleteAccount = async ()=>{
    if(!user) return; setDeleting(true);
    try{
      const q=query(collection(db,'userVotings'), where('ownerId','==',user.uid));
      const snap=await getDocs(q);
      for(const d of snap.docs){ 
        const data=d.data(); 
        if(data.verificationStatus==='private') await deleteDoc(d.ref); 
        else await updateDoc(d.ref,{ ownerName:'', ownerId:'deleted_'+user.uid }); 
      }
      await deleteDoc(doc(db,'users',user.uid)).catch(()=>{}); 
      await deleteUser(user); 
      setShowDeleteConfirm(false); 
      onNavigate?.('home');
    }catch(e:any){ alert(e.message); } 
    setDeleting(false);
  };

  const isGuest = !user;

  return (
    <div className="relative min-h-[80vh] overflow-hidden p-6 md:p-10">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f8f5ff] via-[#f0edff] to-[#eef2ff]">
        <div className="absolute -top-24 -left-24 h-[400px] w-[400px] rounded-full bg-[#c4b5fd]/40 blur-[80px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute top-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#a78bfa]/30 blur-[90px] animate-[float_10s_ease-in-out_infinite_reverse]" />
      </div>

      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-[#332840] text-white px-5 py-2.5 rounded-full text-[12px] shadow">{toast}</div>}

      <h1 className="text-[22px] font-semibold text-[#2f2640]">Settings</h1>
      <p className="mt-1 text-[13px] text-[#8a829c]">Manage your account</p>

      {isGuest ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="h-20 w-20 rounded-full bg-white border border-[#ece6f3] flex items-center justify-center mb-4"><div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#c7b1ec] to-[#8b5cf6]" /></div>
          <h2 className="text-[20px] font-semibold">Welcome to PurpleSync</h2>
          <p className="text-[13px] text-[#81758d] mt-2 max-w-[320px]">Create an account to save votings. Login required to save/like.</p>
          <div className="mt-6 w-full max-w-[320px] space-y-2">
            <button onClick={()=>{setAuthMode('signup'); setShowAuth(true); onNavigate?.('profile');}} className="w-full bg-[#60438f] text-white py-3 rounded-full text-[13px] font-medium">Create an account</button>
            <button onClick={()=>{setAuthMode('login'); setShowAuth(true); onNavigate?.('profile');}} className="w-full bg-white border border-[#e3dced] py-3 rounded-full text-[13px] font-medium">Login</button>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-[640px] flex flex-col gap-4">
          <div className="bg-white rounded-[16px] p-5 shadow-[0_10px_30px_rgba(96,67,143,0.08)] border border-[#efe8f8]">
            <h3 className="text-[14px] font-semibold text-[#3d2d5a]">Account Actions</h3>
            <p className="text-[11px] text-[#8a829c] mt-1">These actions will move you to home page after completion.</p>
            
            <div className="mt-5 flex flex-col gap-3">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-[#ff3b30] md:bg-red-500 text-white py-3.5 rounded-full text-[13px] font-medium hover:bg-red-600 transition-colors">
                <LogOut size={16}/> Logout
              </button>
              
              <button onClick={()=>setShowDeleteConfirm(true)} className="w-full flex items-center justify-center gap-2 border border-red-200 bg-red-50 text-red-600 py-3.5 rounded-full text-[13px] font-medium hover:bg-red-100 transition-colors">
                <Trash2 size={16}/> Delete Account
              </button>
            </div>

            <div className="mt-4 p-3 bg-[#fbf8ff] border border-[#efe8f8] rounded-xl">
              <p className="text-[10px] text-[#6b5a80] leading-4 flex gap-2"><AlertTriangle size={12} className="shrink-0 mt-[2px]"/> Private votings will be deleted forever. Public posts will stay with verified tick only.</p>
            </div>
          </div>

          <div className="bg-[#e9e2ff]/60 rounded-[12px] px-5 py-4 backdrop-blur-md">
            <p className="text-[12px] font-semibold text-[#3d2d5a]">Version 1.0</p>
            <p className="text-[11px] text-[#6e6582] mt-1">Built for ARMY by ARMY. All sources verified. No ads.</p>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[380px] p-6 animate-[scaleIn_0.25s_ease] shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-[15px]">You really want to delete this account?</h3>
              <button onClick={()=>setShowDeleteConfirm(false)} className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center"><X size={12}/></button>
            </div>
            <div className="mt-4 flex gap-2 items-start bg-red-50 border border-red-200 p-3 rounded-xl"><AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0"/><p className="text-[11px] text-red-700 leading-4">Private boxes deleted forever. Public boxes stay with Verified tick only.</p></div>
            <div className="mt-5 flex gap-2"><button onClick={()=>setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-[12px]">Cancel</button><button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-[12px] font-medium">{deleting?'Deleting...':'Yes, Delete'}</button></div>
          </div>
        </div>
      )}

      <style>{`@keyframes float { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} } @keyframes scaleIn{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
