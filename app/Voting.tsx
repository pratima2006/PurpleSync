import { useEffect, useState, useMemo } from 'react';
import { CircleCheck, Clock3, ExternalLink, Flag, ShieldCheck, AlertTriangle, BookmarkCheck, Plus, X, LogIn } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

type VotingItem = any;
function getTargetTime(item:any){ if(item.endAt){const t=new Date(item.endAt).getTime(); if(!isNaN(t)) return t;} if(item.closeDate){const t=new Date(item.closeDate).getTime(); if(!isNaN(t)) return t;} return null; }
function isEndingSoon(item:any){ const target=getTargetTime(item); if(!target) return false; const diff=target-Date.now(); return diff>0 && diff<=3*24*60*60*1000; }
function formatTwoUnits(item:any){ const target=getTargetTime(item); const statusLabel=(item.status||'Open').charAt(0).toUpperCase()+(item.status||'Open').slice(1).toLowerCase(); if(!target) return statusLabel; const diff=target-Date.now(); if(diff<=0) return 'Closed'; const d=Math.floor(diff/(1000*60*60*24)); const h=Math.floor((diff/(1000*60*60))%24); const m=Math.floor((diff/(1000*60))%60); const s=Math.floor((diff/1000)%60); if(d>0) return `Closes in ${d}d ${String(h).padStart(2,'0')}h`; if(h>0) return `Closes in ${h}h ${String(m).padStart(2,'0')}m`; if(m>0) return `Closes in ${m}m ${String(s).padStart(2,'0')}s`; return `Closes in ${s}s`; }
function formatFourUnits(item:any){ const target=getTargetTime(item); if(!target) return (item.status||'Open').toUpperCase(); const diff=target-Date.now(); if(diff<=0) return 'Closed'; const d=Math.floor(diff/(1000*60*60*24)); const h=Math.floor((diff/(1000*60*60))%24); const m=Math.floor((diff/(1000*60))%60); const s=Math.floor((diff/1000)%60); const parts=[]; if(d>0) parts.push(`${d}d`); if(h>0||d>0) parts.push(`${h}h`); if(m>0||h>0||d>0) parts.push(`${m}m`); parts.push(`${s}s`); return parts.join(' '); }

export function Voting({ onNavigate }: { onNavigate?: (p:any, data?:any)=>void }) {
  const [filter, setFilter] = useState<'all'|'open'|'ended'|'upcoming'|'endingSoon'>('all');
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<any>(null);
  const [seconds, setSeconds] = useState(18*3600+42*60+9);
  const [allItems, setAllItems] = useState<VotingItem[]>([]);
  const [userVerified, setUserVerified] = useState<VotingItem[]>([]);
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState<{type:'success'|'error',msg:string}|null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUid, setCurrentUid] = useState<string|null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(()=>{ if(toast){ const t=setTimeout(()=>setToast(null),3000); return()=>clearTimeout(t);} },[toast]);
  useEffect(()=>{
    const unsubAuth = onAuthStateChanged(auth, async (u)=>{
      setIsLoggedIn(!!u);
      setCurrentUid(u?.uid||null);
      if(u){
        const q = query(collection(db,"flaggedVotings"), where("userId","==",u.uid));
        const snap = await getDocs(q);
        setFlaggedIds(snap.docs.map(d=> d.data().votingId));
        onSnapshot(q, s=> setFlaggedIds(s.docs.map(d=> d.data().votingId)));
      } else setFlaggedIds([]);
    });
    const t=setInterval(()=>setTick(v=>v+1),1000);
    const unsub=onSnapshot(collection(db,"votingItems"), snap=>{
      let items=snap.docs.map(d=>({id:d.id,...d.data()} as any)).filter((it:any)=>{ if((it.title||'').toLowerCase().includes('global fan choice')||(it.title||'').toLowerCase().includes('artist of the summer')) return false; if(it.isHidden) return false; return true; });
      items.sort((a:any,b:any)=>{ if(a.order!==undefined&&b.order!==undefined) return a.order-b.order; return 0; });
      setAllItems(items);
    });
    const unsubUser=onSnapshot(collection(db,"userVotings"), snap=>{
      const verified=snap.docs.map(d=>({id:d.id,...d.data()} as any)).filter((x:any)=> x.verificationStatus==='verified' &&!x.isHidden);
      setUserVerified(verified);
    });
    return()=>{clearInterval(t); unsub(); unsubUser(); unsubAuth();};
  },[]);

  const combined = useMemo(()=> [...allItems,...userVerified].sort((a:any,b:any)=>{ const ta=getTargetTime(a); const tb=getTargetTime(b); if(ta&&tb) return ta-tb; return 0; }), [allItems,userVerified,tick]);
  const endingSoonItems = useMemo(()=>combined.filter(isEndingSoon),[combined,tick]);
  const filtered=combined.filter(item=>{ if(filter==='all') return true; if(filter==='endingSoon') return isEndingSoon(item); const s=(item.status||'').toLowerCase(); if(filter==='open') return s==='open'||s==='active'||s==='live'; return s===filter; });
  const closest=useMemo(()=>{ const withEnd=combined.filter((i:any)=>getTargetTime(i)); if(withEnd.length>0){ withEnd.sort((a:any,b:any)=>(getTargetTime(a)||0)-(getTargetTime(b)||0)); const future=withEnd.find((i:any)=>(getTargetTime(i)||0)>Date.now()); return future||withEnd[0]; } return combined[0]; },[combined,tick]);
  useEffect(()=>{ const timer=window.setInterval(()=>setSeconds(v=>Math.max(0,v-1)),1000); return()=>clearInterval(timer); },[]);
  const countdown=useMemo(()=>{ if(closest&&getTargetTime(closest)) return formatFourUnits(closest); if(closest) return (closest.status||'Soon').toUpperCase(); return `${String(Math.floor(seconds/3600)).padStart(2,'0')}h ${String(Math.floor((seconds%3600)/60)).padStart(2,'0')}m ${String(seconds%60).padStart(2,'0')}s`; },[closest,seconds,tick]);

  const handleAddClick = () => { if(!isLoggedIn){ setShowLoginPopup(true); return; } onNavigate?.('userAddVoting'); };
  const handleOpen=(item:VotingItem,e:any)=>{ e.stopPropagation(); const isLive=['open','active','live'].includes((item.status||'').toLowerCase()); if(!isLive) return; const link=item.webLink||item.link; if(!link) return alert('Voting link not added'); window.open(link,'_blank'); };

  // NEW: Flag -> Desk Note, not Home
  const handleFlag=async(item:any,e:any)=>{
    e.stopPropagation();
    if(!currentUid){ setShowLoginPopup(true); return; }
    const isFlagged = flaggedIds.includes(item.id);
    try{
      if(isFlagged){
        const q = query(collection(db,"flaggedVotings"), where("userId","==",currentUid), where("votingId","==",item.id));
        const snap = await getDocs(q);
        for(const d of snap.docs) await deleteDoc(d.ref);
        setToast({type:'success',msg:`Removed "${item.title}" from Desk Note`});
      } else {
        const id = `${currentUid}_${item.id}`;
        await setDoc(doc(db,"flaggedVotings",id), { userId: currentUid, votingId: item.id, title: item.title, createdAt: new Date().toISOString() });
        setToast({type:'success',msg:`Added "${item.title}" to your Desk Note`});
      }
    }catch(err:any){ setToast({type:'error',msg: err.message}); }
  };

  const getCardStyle=(item:any,isExpanded:boolean,endingSoon:boolean)=>{ const status=(item.status||'').toLowerCase(); let base='ps-panel ps-panel-hover rounded-2xl p-5 md:p-6 cursor-pointer '; if(isExpanded) base+='ring-1 ring-[#d1c0ea] '; if(endingSoon) return base+'border-red-200 bg-[#fff5f5]'; if(status==='ended'||status==='closed') return base+'bg-[#f6f5f7] border-[#e8e4ec]'; if(status==='upcoming') return base+'bg-[#fefce8] border-[#f5e7a0]'; if(status==='open'||status==='active'||status==='live') return base+'bg-[#f0f9ff] border-[#bae6fd]'; return base+'bg-white'; };

  return (
    <div className="ps-page-enter ps-content py-8 md:py-12">
      {toast && (<div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-[420px]"><div className={`flex items-center gap-3 px-5 py-3 rounded-full shadow border ${toast.type==='success'?'bg-[#332840] text-white border-white/10':'bg-[#fef2f2] text-red-700 border-red-300'}`}><p className="text-[12px] truncate">{toast.msg}</p></div></div>)}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="ps-mono text-[9px] text-[#8068a9]">THE VOTING DESK</p><h1 className="ps-display mt-2 text-[48px] leading-[.9] tracking-[-.03em] text-[#332840]">Make the moment<br/><em className="text-[#704ca5]">count.</em></h1><p className="mt-5 max-w-[440px] text-[13px] leading-6 text-[#81758d]">A clear view of active windows. ARMYs can now add their own votings - verified by PurpleSync.</p></div>
        <div className="rounded-2xl border border-[#e0d4ed] bg-[#f1e9f9] p-4 md:min-w-[225px]"><div className="flex items-center justify-between"><span className="ps-mono text-[9px] text-[#8068a9]">NEXT CLOSES IN</span><Clock3 size={15} className="text-[#8068a9]"/></div><p className="mt-3 font-mono text-[20px] font-medium tracking-[-.04em] text-[#4f3876]">{countdown}</p><p className="mt-1 text-[11px] font-semibold text-[#4f3876] truncate">{closest?`${closest.title}`:'No active voting'}</p><p className="text-[10px] text-[#887b99] truncate">{closest?.platform||''}</p></div>
      </div>

      {endingSoonItems.length>0 && (<button onClick={()=>setFilter(filter==='endingSoon'?'all':'endingSoon')} className={`mt-6 w-full flex items-center justify-between rounded-2xl border p-4 text-left ${filter==='endingSoon'?'bg-[#fef2f2] border-red-200':'bg-[#fff7ed] border-orange-200'}`}><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center text-red-600"><AlertTriangle size={18}/></div><div><p className="text-[13px] font-semibold text-[#7c2d12]">{endingSoonItems.length} votings ending soon!</p><p className="text-[11px] text-[#9a6a4a]">Click to see all ending within 3 days</p></div></div><span className="text-[11px] text-[#9a6a4a]">{filter==='endingSoon'?'Show All':'View →'}</span></button>)}

      <div className="mt-10 flex items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 flex-1">
          {(['all','open','ended','upcoming','endingSoon'] as const).map(item=>(<button key={item} type="button" onClick={()=>setFilter(item)} className={`shrink-0 rounded-full border px-5 py-2 text-[12px] font-medium capitalize ${filter===item?'border-[#60438f] bg-[#60438f] text-white':'border-[#ded6e9] bg-white text-[#766a84]'}`}>{item==='all'?'All': item==='open'?'Open': item==='ended'?'Ended': item==='endingSoon'?`Soon (${endingSoonItems.length})`:'Upcoming'}</button>))}
        </div>
        <button onClick={handleAddClick} className="shrink-0 h-9 px-4 rounded-full bg-[#60438f] text-white text-[11px] font-semibold flex items-center gap-1.5"><Plus size={12}/> Add Voting</button>
      </div>

      <div className="ps-stagger mt-5 grid gap-4 lg:grid-cols-2">
        {filtered.length===0 && <p className="text-[12px] text-gray-400 py-10 col-span-2 text-center">No votings found.</p>}
        {filtered.map(item=>{
          const isExpanded=expanded===item.id; const endingSoon=isEndingSoon(item); const isLive=['open','active','live'].includes((item.status||'').toLowerCase()); const isFlagged=flaggedIds.includes(item.id);
          return (
            <article key={item.id} onClick={()=>setExpanded(isExpanded?null:item.id)} className={getCardStyle(item,isExpanded,endingSoon)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`h-2 w-2 rounded-full ${isLive?'bg-[#38bdf8]':(item.status==='ended'||item.status==='closed')?'bg-[#b3a9bc]':'bg-[#eab308]'}`}/>
                    <span className="ps-mono text-[11px] font-medium text-[#6b5a80]">{item.platform}</span>
                    {item.isUserAdded && <span className="ps-mono text-[8px] bg-[#f1e9f9] text-[#704ca5] border border-[#d1c0ea] px-2 py-0.5 rounded-full">VERIFIED</span>}
                    {endingSoon && <span className="ps-mono text-[8px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ENDING SOON</span>}
                  </div>
                  <h2 className={`mt-3 font-semibold text-[#3d324b] ${isExpanded?'text-[14px] opacity-80':'text-[17px] leading-tight'}`}>{item.title}</h2>
                  {/* OWNER NAME BLUE @ */}
                  {item.ownerName && (
                    <button onClick={(e)=>{e.stopPropagation(); onNavigate?.('profile', {userId: item.ownerId});}} className="mt-1 text-[11px] text-[#3b82f6] hover:underline font-medium text-left">
                      @{item.ownerName} ✔
                    </button>
                  )}
                </div>
                <button title={isFlagged?'Added to Desk':'Flag for Desk'} type="button" onClick={e=>handleFlag(item,e)} className={`rounded-lg border p-2 ${isFlagged?'border-[#bca9d9] bg-[#f1eafb] text-[#704ca5]':'border-[#e1dbe9] text-[#988ca1]'}`}>{isFlagged?<CircleCheck size={16}/>:<Flag size={16}/>}</button>
              </div>
              <div className="mt-5"><p className="ps-mono text-[9px] text-[#95899d]">STATUS</p><p className={`mt-1 text-[13px] font-medium capitalize ${endingSoon?'text-red-600':isLive?'text-[#0ea5e9]':'text-[#8f8495]'}`}>{formatTwoUnits(item)}</p></div>
              {isExpanded && (<div className="mt-4 rounded-[16px] bg-[#f6f0fd] border border-[#e9dff6] p-4"><p className="ps-mono text-[10px] text-[#9a8aac]">DESCRIPTION</p><p className="mt-2 text-[13px] leading-6 text-[#4e415f]">{item.description||item.note||'Daily votes available.'}</p></div>)}
              <div className="mt-4 flex items-center justify-between gap-3"><span className="text-[11px] text-[#958a9c] truncate">{item.isUserAdded? (item.addedByDisplay||`Added by @${item.ownerName||'ARMY'} ✔`) : (isExpanded?'Tap to collapse':'Tap to see details')}</span><button type="button" onClick={e=>handleOpen(item,e)} disabled={!isLive} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-semibold ${isLive?'bg-[#60438f] text-white':'bg-[#ddd7e4] text-[#918797]'}`}>{isLive?'Vote Now':'Closed'} <ExternalLink size={14}/></button></div>
            </article>
          );
        })}
      </div>

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[340px] text-center">
            <h3 className="font-semibold text-[14px]">Login Required</h3>
            <p className="mt-2 text-[12px] text-gray-600">Login to flag votings for your Desk Note and add votings.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={()=>setShowLoginPopup(false)} className="flex-1 bg-gray-100 p-2.5 rounded-xl text-[12px]">Cancel</button>
              <button onClick={()=>{setShowLoginPopup(false); onNavigate?.('profile');}} className="flex-1 bg-[#60438f] text-white p-2.5 rounded-xl text-[12px]">Go to Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
