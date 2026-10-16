import { Bell, Globe2, Menu, Search, Settings, FileQuestion, HelpCircle, X, Map, ChevronRight, Users, Link2, Palette, CheckCircle, XCircle, BrainCircuit } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { navItems } from './data';
import type { PageKey } from './types';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

type TopbarProps = { page: PageKey; onNavigate: (page: PageKey)=>void; onSearch: ()=>void; onMenu: ()=>void; };
const tourSteps=[{key:'home',title:'Briefing - Home',desc:'Yaha daily updates, important notices aayenge.'},{key:'voting',title:'Voting Hub',desc:'Yaha comeback, MV goals pe vote hota hai.'},{key:'schedule',title:'Schedule',desc:'BTS ka pura calendar.'},{key:'links',title:'Official Sources',desc:'Fake news se bachne ke liye direct links.'},{key:'search',title:'Search & Nav',desc:'Search se kuch bhi dhundh.'}];

export function Topbar({ page, onNavigate, onSearch, onMenu }: TopbarProps){
  const [menuOpen,setMenuOpen]=useState(false);
  const [tourActive,setTourActive]=useState(false);
  const [tourStep,setTourStep]=useState(0);
  const [notifOpen,setNotifOpen]=useState(false);
  const [notifications,setNotifications]=useState<any[]>([]);
  const [userId,setUserId]=useState(()=> localStorage.getItem('ps_user_id') || '');
  const [userPhoto, setUserPhoto] = useState<string>('');
  const [userName, setUserName] = useState('AR');
  const title=navItems.find(i=>i.key===page)?.label??page;

  useEffect(()=>{
    const unsubAuth = onAuthStateChanged(auth, (u)=>{
      if(u){ setUserPhoto(u.photoURL||''); setUserName((u.displayName||'AR').slice(0,2).toUpperCase()); }
      else { setUserPhoto(''); setUserName('AR'); }
    });
    return ()=>unsubAuth();
  },[]);

  useEffect(()=>{
    let id=localStorage.getItem('ps_user_id');
    if(!id){ id='army_'+Math.random().toString(36).slice(2,8); localStorage.setItem('ps_user_id',id); }
    setUserId(id);
    if(!id) return;
    const q=query(collection(db,"notifications"), where("userId","==",id));
    const unsub=onSnapshot(q,s=>{ const data=s.docs.map(d=>({id:d.id,...d.data()} as any)).sort((a:any,b:any)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()); setNotifications(data); });
    return()=>unsub();
  },[]);

  const unread = notifications.filter((n:any)=>!n.read).length;
  const markRead = async (n:any)=>{ await updateDoc(doc(db,"notifications",n.id),{read:true}); };
  const markAllRead = async ()=>{ for(const n of notifications.filter((x:any)=>!x.read)){ await updateDoc(doc(db,"notifications",n.id),{read:true}); } };

  const toggleMenu=()=>{ const next=!menuOpen; setMenuOpen(next); if(next) onMenu(); };
  const startTour=()=>{ setMenuOpen(false); setTourStep(0); setTourActive(true); onNavigate('home' as PageKey); };
  const nextTour=()=>{ const next=tourStep+1; if(next>=tourSteps.length){setTourActive(false); return;} setTourStep(next); const k=tourSteps[next].key; if(k==='search') onSearch(); else onNavigate(k as PageKey); };

  return (
    <>
      <header className="flex h-[60px] items-center justify-between rounded-full border border-[#ece6f3] bg-white px-4 md:px-5 shadow-[0_2px_16px_rgba(94,66,143,0.06)] mt-3 mx-3 md:mx-4 relative">
        <div className="flex items-center gap-2"><BrandMark compact/><div className="hidden sm:flex items-center gap-2 text-[11px] text-[#a89db8] ml-2"><span className="text-[#b8aec7]">ARMY /</span><span className="font-semibold text-[#4c425c]">{title}</span></div></div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <button type="button" onClick={onSearch} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f5ff] text-[#7b6a93] hover:bg-[#efe8fb]"><Search size={17}/></button>
          <button type="button" onClick={()=>setNotifOpen(!notifOpen)} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f8f5ff] text-[#7b6a93] hover:bg-[#efe8fb]">
            <Bell size={17}/>{unread>0 && <><span className="absolute right-1.5 top-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[7px] text-white">{unread>9?'9+':unread}</span><span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#aa8be8] animate-ping"/></>}
          </button>
          <button type="button" onClick={()=>onNavigate('links')} className="hidden sm:flex h-9 items-center gap-2 rounded-full bg-white border border-[#ece6f3] px-3.5 text-[11px] font-medium text-[#4c425c] whitespace-nowrap hover:bg-[#f8f5ff]"><Globe2 size={14}/> Official</button>
          <button type="button" onClick={()=>onNavigate('profile' as PageKey)} className="flex h-9 w-9 items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-[#c7b1ec] to-[#8b5cf6] text-[12px] font-semibold text-white shadow-[0_2px_8px_rgba(139,92,246,0.3)] border-2 border-white hover:scale-105 transition-transform">
            {userPhoto? <img src={userPhoto} alt="pfp" className="h-full w-full object-cover"/> : userName}
          </button>
          <button type="button" onClick={toggleMenu} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5e428f] text-white hover:bg-[#4d3678] shadow-[0_4px_12px_rgba(94,66,143,0.25)]"><span className={`transition-all duration-300 ${menuOpen?'rotate-90 scale-90':'rotate-0 scale-100'}`}>{menuOpen?<X size={18}/>:<Menu size={18}/>}</span></button>
        </div>
      </header>

      {notifOpen && (
        <div className="absolute left-3 right-3 md:left-auto md:right-4 top-[76px] z-[60] md:w-[360px] rounded-[20px] border border-[#e8e0f2] bg-white shadow-[0_16px_40px_rgba(94,66,143,0.15)] overflow-hidden animate-in fade-in">
          <div className="flex items-center justify-between p-4 border-b border-[#f0e6f8]"><p className="font-semibold text-[13px]">Notifications {unread>0?`(${unread} new)`:''}</p><div className="flex gap-2"><button onClick={markAllRead} className="text-[10px] text-[#704ca5]">Mark all read</button><button onClick={()=>setNotifOpen(false)}><X size={14}/></button></div></div>
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length===0 && <p className="text-[12px] text-gray-400 text-center py-8">No notifications yet. When your public voting is verified, you'll get notified here 💜</p>}
            {notifications.map((n:any)=>(
              <div key={n.id} onClick={()=>markRead(n)} className={`p-4 border-b border-[#f5f0fb] hover:bg-[#faf7ff] cursor-pointer ${!n.read?'bg-[#f8f5ff]':''}`}>
                <div className="flex gap-2.5"><div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.type==='verified'?'bg-green-100 text-green-600':'bg-red-100 text-red-600'}`}>{n.type==='verified'?<CheckCircle size={14}/>:<XCircle size={14}/>}</div><div className="flex-1"><p className="text-[12px] font-semibold">{n.title}</p><p className="text-[11px] text-gray-600 mt-1 leading-4">{n.message}</p><p className="text-[9px] text-gray-400 mt-1">{n.createdAt? new Date(n.createdAt).toLocaleString() : ''}</p></div>{!n.read && <span className="h-2 w-2 bg-[#704ca5] rounded-full mt-1.5 shrink-0"/>}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="absolute left-3 right-3 md:left-auto md:right-4 top-[76px] z-50 md:w-[320px] rounded-[22px] border border-[#e8e0f2] bg-white p-3 shadow-[0_16px_40px_rgba(94,66,143,0.15)] animate-in fade-in">
          <button onClick={startTour} className="flex w-full items-center gap-3 rounded-xl bg-[#5e428f] px-4 py-3 text-left text-[13px] font-medium text-white hover:bg-[#4d3678]"><Map size={16}/> Take a Tour <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">NEW</span></button>
          <div className="my-3 h-px w-full bg-[#f0e6f8]"/>
          <div className="flex flex-col gap-2">
            <button onClick={()=>{onNavigate('members' as PageKey); setMenuOpen(false);}} className="flex w-full items-center gap-3 rounded-xl bg-[#f8f5ff] px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-[#f0e9f7] border border-[#f0e6f8]"><Users size={16}/> Members</button>
            <button onClick={()=>{onNavigate('links' as PageKey); setMenuOpen(false);}} className="flex w-full items-center gap-3 rounded-xl bg-[#f8f5ff] px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-[#f0e9f7] border border-[#f0e6f8]"><Link2 size={16}/> Official Links</button>
            <button onClick={()=>{onNavigate('quiz' as PageKey); setMenuOpen(false);}} className="flex w-full items-center gap-3 rounded-xl bg-[#f3eeff] px-4 py-3 text-[13px] font-semibold text-[#5e428f] hover:bg-[#ece3ff] border border-[#dcc9ff]"><BrainCircuit size={16}/> ARMY Quiz Zone <span className="ml-auto text-[9px] bg-[#5e428f] text-white px-2 py-0.5 rounded-full">XP</span></button>
            <button onClick={()=>{onNavigate('palette' as PageKey); setMenuOpen(false);}} className="flex w-full items-center gap-3 rounded-xl bg-[#f0e9f7] px-4 py-3 text-[13px] font-semibold text-[#5e428f] hover:bg-[#e8ddf3] border border-[#d8c9ec]"><Palette size={16}/> Palette of Memories <span className="ml-auto text-[9px] bg-[#5e428f] text-white px-2 py-0.5 rounded-full">NEW</span></button>
          </div>
          <div className="my-3 h-px w-full bg-[#f0e6f8]"/>
          <button onClick={()=>{onNavigate('settings' as PageKey); setMenuOpen(false);}} className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-[#f8f5ff] border border-[#f5f0fb]"><Settings size={16}/> Settings</button>
          <button onClick={()=>{onNavigate('faq' as PageKey); setMenuOpen(false);}} className="mt-2 flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-[#f8f5ff] border border-[#f5f0fb]"><FileQuestion size={16}/> FAQ</button>
          <button onClick={()=>{onNavigate('help' as PageKey); setMenuOpen(false);}} className="mt-2 flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-[13px] font-medium text-[#4c425c] hover:bg-[#f8f5ff] border border-[#f5f0fb]"><HelpCircle size={16}/> Help</button>
        </div>
      )}
      {tourActive && (<div className="fixed inset-0 z-[100] flex items-end justify-center p-5 md:items-center pointer-events-none"><div className="pointer-events-auto w-full max-w-[360px] rounded-[20px] border border-[#e8e0f2] bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><span className="text-[10px] tracking-widest text-[#b8aec7]">STEP {tourStep+1}/{tourSteps.length}</span><button onClick={()=>setTourActive(false)}><X size={16}/></button></div><h3 className="mt-2 text-[16px] font-semibold text-[#2f2640]">{tourSteps[tourStep].title}</h3><p className="mt-1 text-[13px] text-[#6e6582]">{tourSteps[tourStep].desc}</p><div className="mt-4 flex gap-2"><button onClick={()=>setTourActive(false)} className="flex-1 rounded-full bg-[#f1eafb] py-2.5 text-[12px]">Skip</button><button onClick={nextTour} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#5e428f] py-2.5 text-[12px] text-white">{tourStep===tourSteps.length-1?'Done':'Next'} <ChevronRight size={14}/></button></div></div></div>)}
    </>
  );
}
