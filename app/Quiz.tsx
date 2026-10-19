import { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Archive, Bell, Disc3, Sparkles, Users, Star, Flame, SkipForward } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

type Question = { q:string, options:string[], correct:number, xp:number };
type QuizDoc = { id:string, category:string, subCategory:string, title:string, questions:Question[], isVisible:boolean, createdBy?:string };

const mockQuizzes: Record<string, Question[]> = {
  'MAMA 2025': [{ q: 'MAMA Worldwide Fans Choice voting is on which app?', options: ['Mnet Plus', 'Spotify', 'Weverse', 'Other'], correct: 0, xp: 10 },{ q: 'How many times can you vote per day?', options: ['Once', '3 times', 'Unlimited', 'Other'], correct: 0, xp: 10 }],
  'Billboard Hot 100': [{ q: 'BTS first Hot 100 #1 was?', options: ['Dynamite', 'Butter', 'My Universe', 'Other'], correct: 0, xp: 15 }]
};

function shuffle<T>(arr:T[]):T[]{ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
const todayKey=()=>new Date().toISOString().split('T')[0];

export function QuizPage({ onBack }: { onBack: ()=>void, onNavigate?: (p:any)=>void }){
  const [view,setView]=useState<'categories'|'votingList'|'quizPlay'|'result'>('categories');
  const [selectedVoting,setSelectedVoting]=useState('');
  const [questions,setQuestions]=useState<Question[]>([]);
  const [currentIdx,setCurrentIdx]=useState(0);
  const [answers,setAnswers]=useState<number[]>([]);
  const [xp,setXp]=useState(0);
  const [showCheatWarn,setShowCheatWarn]=useState(false);
  const [showExitConfirm,setShowExitConfirm]=useState(false);
  const [showSkipConfirm,setShowSkipConfirm]=useState(false);
  const [hasAnswered,setHasAnswered]=useState(false);
  const [totalParticipants,setTotalParticipants]=useState(0);
  const [viralQuiz,setViralQuiz]=useState('');
  const [userId,setUserId]=useState('');
  const [playedToday,setPlayedToday]=useState<Record<string,boolean>>({});
  const [skipToast,setSkipToast]=useState('');
  const [isDoneVisible,setIsDoneVisible]=useState(false);
  const [resultData,setResultData]=useState<{xp:number,answers:number[],qs:Question[]}|null>(null);
  const [firestoreQuizzes,setFirestoreQuizzes]=useState<QuizDoc[]>([]);

  useEffect(()=>{ const u=onAuthStateChanged(auth, x=>{ if(x) setUserId(x.uid); }); return ()=>u(); },[]);
  useEffect(()=>{ return onSnapshot(collection(db,'quizAttempts'), snap=>{ setTotalParticipants(snap.size); const counts:Record<string,number>={}; snap.docs.forEach(d=>{ const t=d.data().votingTitle; counts[t]=(counts[t]||0)+1; }); let max='',m=0; Object.entries(counts).forEach(([k,v])=>{ if(v>m){ m=v; max=k; } }); setViralQuiz(max); }); },[]);
  useEffect(()=>{ if(!userId) return; const q=query(collection(db,'quizAttempts'),where('userId','==',userId),where('dateKey','==',todayKey())); return onSnapshot(q,s=>{ const map:Record<string,boolean>={}; s.docs.forEach(d=>map[d.data().votingTitle]=true); setPlayedToday(map); }); },[userId,view]);
  useEffect(()=>{ return onSnapshot(query(collection(db,'quizzes'), where('isVisible','==',true)), snap=>{ setFirestoreQuizzes(snap.docs.map(d=> ({id:d.id, ...d.data()} as QuizDoc))); }); },[]);
  useEffect(()=>{ if(view!=='quizPlay') return; const onVis=()=>{ if(document.hidden) setShowCheatWarn(true); }; const onBlur=()=>{ if(hasAnswered) setShowCheatWarn(true); }; document.addEventListener('visibilitychange',onVis); window.addEventListener('blur',onBlur); return ()=>{ document.removeEventListener('visibilitychange',onVis); window.removeEventListener('blur',onBlur); }; },[view,hasAnswered]);

  const votingQuizzes = firestoreQuizzes.filter(q=>q.category==='voting');
  const displayVotingList = votingQuizzes.length>0 ? votingQuizzes : Object.keys(mockQuizzes).map(k=>({ id:k, category:'voting', subCategory:k, title:k, questions:mockQuizzes[k], isVisible:true } as QuizDoc));

  const startQuiz=async (vTitle:string, qs:Question[])=>{
    if(playedToday[vTitle]){
      const q=query(collection(db,'quizAttempts'),where('userId','==',userId),where('votingTitle','==',vTitle),where('dateKey','==',todayKey()));
      const snap=await getDocs(q); if(snap.docs[0]){ const d=snap.docs[0].data(); setSelectedVoting(vTitle); setResultData({xp:d.xpEarned,answers:d.answers,qs:d.questionsSnapshot||qs}); setView('result'); } return;
    }
    const shuffled=shuffle(qs).map(qq=>{ const opts=qq.options.map((o,i)=>({o,i})); const sh=shuffle(opts); const newC=sh.findIndex(x=>x.i===qq.correct); return {...qq,options:sh.map(x=>x.o),correct:newC}; });
    setSelectedVoting(vTitle); setQuestions(shuffled); setCurrentIdx(0); setAnswers([]); setXp(0); setHasAnswered(false); setIsDoneVisible(false); setView('quizPlay');
  };

  const handleAnswer=(idx:number)=>{ setHasAnswered(true); const na=[...answers]; na[currentIdx]=idx; setAnswers(na); if(idx===questions[currentIdx].correct) setXp(x=>x+questions[currentIdx].xp); if(currentIdx+1<questions.length) setCurrentIdx(c=>c+1); else setIsDoneVisible(true); };
  const confirmSkip=()=>{ setShowSkipConfirm(false); const na=[...answers]; na[currentIdx]=-1; setAnswers(na); setSkipToast(`Question ${currentIdx+1} skipped - no XP`); setTimeout(()=>setSkipToast(''),5000); if(currentIdx+1<questions.length) setCurrentIdx(c=>c+1); else setIsDoneVisible(true); };
  const handleDone=async()=>{ const xpEarned=questions.reduce((acc,qq,i)=>acc+(answers[i]===qq.correct?qq.xp:0),0); try{ await addDoc(collection(db,'quizAttempts'),{userId,votingTitle:selectedVoting,xpEarned,answers,questionsSnapshot:questions,dateKey:todayKey(),createdAt:new Date().toISOString()}); }catch{} setResultData({xp:xpEarned,answers,qs:questions}); setView('result'); };

  return (
    <div className="min-h-screen bg-[#fbf8ff] p-4 pb-24">
      {skipToast && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-[#332840] text-white px-4 py-2 rounded-full text-[11px]">{skipToast}</div>}
      <div className="flex items-center gap-3 mb-6"><button onClick={()=>{ if(view==='quizPlay' && hasAnswered) setShowExitConfirm(true); else if(view==='quizPlay') setView('votingList'); else if(view==='votingList') setView('categories'); else if(view==='result') setView('categories'); else onBack(); }} className="h-9 w-9 bg-white border rounded-full flex items-center justify-center"><ChevronLeft size={18}/></button><h1 className="font-semibold text-[15px]">{view==='categories'?'Quiz Zone':view==='votingList'?'Voting Quizzes':selectedVoting}</h1>{view==='quizPlay' && <div className="ml-auto text-[11px] bg-[#5e428f] text-white px-3 py-1 rounded-full flex items-center gap-1"><Star size={12}/>{xp} XP</div>}</div>

      {view==='categories' && (
        <div className="grid grid-cols-2 gap-3">
          {[{id:'voting',label:'Voting Quiz',desc:'Current votings',icon:Trophy,color:'#efe8ff'},{id:'archive',label:'Archive',desc:'Past wins',icon:Archive,color:'#f0e9f7'},{id:'updates',label:'Updates',desc:'News & Notices',icon:Bell,color:'#fef3f0'},{id:'discography',label:'Discography',desc:'Songs & Albums',icon:Disc3,color:'#eef6f0'},{id:'bts',label:'BTS Knowledge',desc:'Members & Facts',icon:Users,color:'#f5f0ff'},{id:'random',label:'Random Fun',desc:'No bore!',icon:Sparkles,color:'#fff8e8'}].map(c=>(
            <button key={c.id} onClick={()=>c.id==='voting'?setView('votingList'):alert('Coming soon! 💜 For now only Voting quizzes live. Other boxes will open when more ARMYs join to help.')} className="bg-white border border-[#ece6f3] rounded-[18px] p-4 text-left"><div className="h-10 w-10 rounded-full flex items-center justify-center mb-3" style={{background:c.color}}><c.icon size={18} color="#5e428f"/></div><p className="font-semibold text-[13px]">{c.label}</p><p className="text-[11px] text-gray-500">{c.desc}</p>{c.id==='voting' && viralQuiz && <p className="text-[10px] text-[#ff6b6b] mt-1 flex items-center gap-1"><Flame size={10}/>Viral: {viralQuiz}</p>}</button>
          ))}
          <div className="col-span-2 mt-4 bg-white border rounded-xl p-4 text-center"><p className="text-[11px] text-gray-500">{totalParticipants} ARMYs have participated till now 💜 {viralQuiz?`• Most viral today: ${viralQuiz}`:''}</p></div>
        </div>
      )}

      {view==='votingList' && <div className="space-y-3">{displayVotingList.map(v=>{ const played=!!playedToday[v.title]; return <button key={v.id} onClick={()=>startQuiz(v.title,v.questions)} className={`w-full bg-white border rounded-[16px] p-4 text-left flex justify-between ${played?'opacity-60':''}`}><div><p className="font-semibold text-[13px]">{v.title} {played && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">Done Today</span>}</p><p className="text-[11px] text-gray-500">{v.subCategory} • {v.questions.length} Qs • {v.questions.reduce((a,b)=>a+b.xp,0)} XP {v.createdBy?`• by ${v.createdBy}`:''}</p></div><ChevronLeft className="rotate-180" size={16}/></button>; })}</div>}

      {view==='quizPlay' && (
        <div><div className="w-full h-2.5 bg-[#f0e6f8] rounded-full overflow-hidden mb-6"><div className="h-full bg-[#8b5cf6] transition-all" style={{width:`${(currentIdx/questions.length)*100}%`}}/></div><div className="bg-white border rounded-[20px] p-5"><p className="text-[11px] text-[#a89db8]">QUESTION {currentIdx+1}/{questions.length}</p><h2 className="font-semibold text-[15px] mt-2">{questions[currentIdx]?.q}</h2><div className="mt-5 space-y-2.5">{questions[currentIdx]?.options.map((o,i)=><button key={i} onClick={()=>handleAnswer(i)} className="w-full text-left border rounded-xl p-3.5 text-[13px] hover:bg-[#f8f5ff]">{String.fromCharCode(65+i)}. {o}</button>)}</div><div className="flex gap-2 mt-5"><button onClick={()=>setShowSkipConfirm(true)} className="text-[11px] border px-3 py-1.5 rounded-full flex items-center gap-1"><SkipForward size={12}/>Skip</button>{isDoneVisible && <button onClick={handleDone} className="ml-auto bg-[#5e428f] text-white px-6 py-2 rounded-full text-[12px]">Done ✓</button>}</div></div></div>
      )}

      {view==='result' && resultData && (
        <div className="space-y-4"><div className="bg-[#5e428f] rounded-[20px] p-6 text-white text-center"><p className="text-[12px] opacity-80">You earned</p><p className="text-[32px] font-bold">{resultData.xp} XP</p><p className="text-[12px] mt-2 opacity-90">Amazing! You proved you voted right 💜 Keep supporting BTS!</p></div>{resultData.qs.map((qq,idx)=><div key={idx} className="bg-white border rounded-[16px] p-4"><p className="font-semibold text-[13px]">{idx+1}. {qq.q}</p>{resultData.answers[idx]===-1?<p className="mt-3 text-[12px] text-gray-400">Your answer: <span className="text-gray-400">skipped</span></p>:resultData.answers[idx]!==qq.correct?<><p className="mt-3 text-[12px]"><span className="text-red-500 line-through">Your answer: {qq.options[resultData.answers[idx]]}</span> ❌</p><p className="mt-1 text-[12px] text-green-600">Correct: {qq.options[qq.correct]} ✅</p></>:<p className="mt-3 text-[12px] text-green-600">Your answer: {qq.options[resultData.answers[idx]]} ✅ Correct!</p>}</div>)}<p className="text-[11px] text-gray-400 text-center px-4">*Come back tomorrow for more XP. One quiz per day - you can play this voting quiz again tomorrow 💜</p><button onClick={()=>setView('categories')} className="w-full bg-white border py-3 rounded-full text-[13px]">Back to Quizzes</button></div>
      )}

      {showCheatWarn && <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6"><div className="bg-white rounded-[20px] p-6 w-full max-w-[320px] text-center"><p className="font-semibold text-[14px]">Heads up!</p><p className="text-[12px] text-gray-600 mt-2 leading-5">If you leave this page, your progress will be lost and XP won't count.</p><div className="flex gap-2 mt-4"><button onClick={()=>setShowCheatWarn(false)} className="flex-1 bg-gray-100 py-2.5 rounded-full text-[12px]">Cancel</button><button onClick={()=>{ setShowCheatWarn(false); setQuestions([]); setAnswers([]); setCurrentIdx(0); setXp(0); setView('votingList'); setHasAnswered(false); }} className="flex-1 bg-[#5e428f] text-white py-2.5 rounded-full text-[12px]">Oops, let's try again</button></div></div></div>}
      {showExitConfirm && <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6"><div className="bg-white rounded-[20px] p-5 w-full max-w-[320px]"><p className="font-semibold text-[14px]">Leave quiz?</p><p className="text-[12px] text-gray-600 mt-1">Progress will be lost and XP won't count.</p><div className="flex gap-2 mt-4"><button onClick={()=>setShowExitConfirm(false)} className="flex-1 bg-gray-100 py-2.5 rounded-full text-[12px]">Stay</button><button onClick={()=>{ setShowExitConfirm(false); setView('votingList'); }} className="flex-1 bg-red-500 text-white py-2.5 rounded-full text-[12px]">Leave</button></div></div></div>}
      {showSkipConfirm && <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6"><div className="bg-white rounded-[20px] p-5 w-full max-w-[320px]"><p className="font-semibold text-[14px]">Skip this question?</p><p className="text-[12px] text-gray-600 mt-1">If you skip, you won't get XP for this question.</p><div className="flex gap-2 mt-4"><button onClick={()=>setShowSkipConfirm(false)} className="flex-1 bg-gray-100 py-2.5 rounded-full text-[12px]">Cancel</button><button onClick={confirmSkip} className="flex-1 bg-[#5e428f] text-white py-2.5 rounded-full text-[12px]">Skip</button></div></div></div>}
    </div>
  );
}
