import { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Brain, Disc3, Archive, Bell, Sparkles, Users } from 'lucide-react';

type QuizCategory = 'voting'|'archive'|'updates'|'discography'|'bts'|'random';
type Question = { q:string, options:string[], correct:number, xp:number };

const mockQuizzes: Record<string, Question[]> = {
  'MAMA 2025': [
    { q: 'MAMA Worldwide Fans Choice voting is on which app?', options: ['Mnet Plus', 'Spotify', 'Weverse', 'Other'], correct: 0, xp: 10 },
    { q: 'How many times can you vote per day?', options: ['Once', '3 times', 'Unlimited', 'Other'], correct: 0, xp: 10 },
  ],
  'Billboard Hot 100': [
    { q: 'BTS first Hot 100 #1 was?', options: ['Dynamite', 'Butter', 'My Universe', 'Other'], correct: 0, xp: 15 },
  ]
};

export function QuizPage({ onBack }: { onBack: ()=>void }){
  const [view, setView] = useState<'categories'|'votingList'|'quizPlay'|'result'>('categories');
  const [selectedVoting, setSelectedVoting] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [xp, setXp] = useState(0);
  const [showCheatWarn, setShowCheatWarn] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasAnsweredOnce, setHasAnsweredOnce] = useState(false);

  // Anti-cheat
  useEffect(()=>{
    if(view!=='quizPlay') return;
    const onVisibility = ()=>{
      if(document.hidden){
        if(hasAnsweredOnce){
          setShowCheatWarn(true);
          setTimeout(()=>{ setQuestions([]); setAnswers([]); setCurrentIdx(0); setXp(0); setView('votingList'); setShowCheatWarn(false); setHasAnsweredOnce(false); }, 2000);
        } else {
          setShowCheatWarn(true);
          setTimeout(()=>setShowCheatWarn(false), 3000);
        }
      }
    };
    const onBlur = ()=>{
      if(hasAnsweredOnce && view==='quizPlay'){
        setShowCheatWarn(true);
        setTimeout(()=>{ setQuestions([]); setAnswers([]); setCurrentIdx(0); setXp(0); setView('votingList'); setShowCheatWarn(false); setHasAnsweredOnce(false); }, 2000);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return ()=>{ document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('blur', onBlur); }
  }, [view, hasAnsweredOnce]);

  const progress = questions.length? ((currentIdx)/questions.length)*100 : 0;

  const handleAnswer = (optIdx:number)=>{
    setHasAnsweredOnce(true);
    const newAns=[...answers]; newAns[currentIdx]=optIdx; setAnswers(newAns);
    if(optIdx===questions[currentIdx].correct) setXp(x=>x+questions[currentIdx].xp);
    if(currentIdx+1<questions.length) setCurrentIdx(c=>c+1);
    else {
      setView('result');
      // Save participation count
      const count = parseInt(localStorage.getItem('quiz_participants')||'0')+1;
      localStorage.setItem('quiz_participants', count.toString());
    }
  };

  const handleBack = ()=>{
    if(view==='quizPlay' && hasAnsweredOnce){ setShowExitConfirm(true); }
    else if(view==='quizPlay') setView('votingList');
    else if(view==='votingList') setView('categories');
    else if(view==='result') setView('categories');
    else onBack();
  };

  return (
    <div className="min-h-screen bg-[#fbf8ff] p-4">
      {/* Top Bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleBack} className="h-9 w-9 bg-white border border-[#ece6f3] rounded-full flex items-center justify-center"><ChevronLeft size={18}/></button>
        <h1 className="font-semibold text-[15px]">{view==='categories'?'Quiz Zone': view==='votingList'?'Voting Quizzes' : selectedVoting}</h1>
        {view==='quizPlay' && <div className="ml-auto text-[11px] bg-[#5e428f] text-white px-3 py-1 rounded-full">{xp} XP</div>}
      </div>

      {view==='categories' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { id:'voting', label:'Voting Quiz', desc:'Current votings', icon: Trophy, color:'#efe8ff' },
            { id:'archive', label:'Archive', desc:'Past wins', icon: Archive, color:'#f0e9f7' },
            { id:'updates', label:'Updates', desc:'News & Notices', icon: Bell, color:'#fef3f0' },
            { id:'discography', label:'Discography', desc:'Songs & Albums', icon: Disc3, color:'#eef6f0' },
            { id:'bts', label:'BTS Knowledge', desc:'Members & Facts', icon: Users, color:'#f5f0ff' },
            { id:'random', label:'Random Fun', desc:'No bore!', icon: Sparkles, color:'#fff8e8' },
          ].map(c=>(
            <button key={c.id} onClick={()=> c.id==='voting'? setView('votingList') : alert('Coming soon! Voting quizzes first 💜')} className="bg-white border border-[#ece6f3] rounded-[18px] p-4 text-left hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-full flex items-center justify-center mb-3" style={{background:c.color}}><c.icon size={18} color="#5e428f"/></div>
              <p className="font-semibold text-[13px]">{c.label}</p><p className="text-[11px] text-gray-500 mt-1">{c.desc}</p>
            </button>
          ))}
          <div className="col-span-2 mt-4 bg-white border border-[#ece6f3] rounded-xl p-4 text-center">
            <p className="text-[11px] text-gray-500">Today {localStorage.getItem('quiz_participants')||0} ARMYs participated in voting quizzes 💜</p>
          </div>
        </div>
      )}

      {view==='votingList' && (
        <div className="space-y-3">
          {Object.keys(mockQuizzes).map(v=>(
            <button key={v} onClick={()=>{ setSelectedVoting(v); setQuestions(mockQuizzes[v]); setCurrentIdx(0); setAnswers([]); setXp(0); setHasAnsweredOnce(false); setView('quizPlay'); }} className="w-full bg-white border border-[#ece6f3] rounded-[16px] p-4 text-left flex items-center justify-between">
              <div><p className="font-semibold text-[13px]">{v}</p><p className="text-[11px] text-gray-500">{mockQuizzes[v].length} questions • {mockQuizzes[v].reduce((a,b)=>a+b.xp,0)} XP</p></div><ChevronLeft className="rotate-180" size={16} color="#a89db8"/>
            </button>
          ))}
        </div>
      )}

      {view==='quizPlay' && (
        <div>
          {/* Duolingo style progress */}
          <div className="w-full h-2 bg-[#f0e6f8] rounded-full overflow-hidden mb-6">
            <div className="h-full bg-[#8b5cf6] transition-all duration-500" style={{width:`${progress}%`, opacity: 0.3 + (progress/100)*0.7}}/>
          </div>
          <div className="bg-white border border-[#ece6f3] rounded-[20px] p-5">
            <p className="text-[12px] text-[#a89db8]">Question {currentIdx+1}/{questions.length}</p>
            <h2 className="font-semibold text-[15px] mt-2 leading-6">{questions[currentIdx]?.q}</h2>
            <div className="mt-5 space-y-2.5">
              {questions[currentIdx]?.options.map((opt, i)=>(
                <button key={i} onClick={()=>handleAnswer(i)} className="w-full text-left border border-[#ece6f3] rounded-xl p-3.5 text-[13px] hover:bg-[#f8f5ff] hover:border-[#8b5cf6] transition-colors">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {view==='result' && (
        <div className="space-y-4">
          <div className="bg-[#5e428f] rounded-[20px] p-6 text-white text-center">
            <p className="text-[12px] opacity-80">You earned</p><p className="text-[28px] font-bold mt-1">{xp} XP</p>
            <p className="text-[12px] mt-2 opacity-90">Amazing! You proved you voted right 💜 Keep supporting BTS!</p>
          </div>
          {questions.map((qq, idx)=>(
            <div key={idx} className="bg-white border border-[#ece6f3] rounded-[16px] p-4">
              <p className="font-semibold text-[13px]">{idx+1}. {qq.q}</p>
              {answers[idx]!==qq.correct? (
                <>
                  <p className="mt-3 text-[12px]"><span className="text-red-500 line-through">Your answer: {qq.options[answers[idx]]}</span> ❌</p>
                  <p className="mt-1 text-[12px] text-green-600 font-medium">Correct: {qq.options[qq.correct]} ✅</p>
                </>
              ) : (
                <p className="mt-3 text-[12px] text-green-600 font-medium">Your answer: {qq.options[answers[idx]]} ✅ Correct!</p>
              )}
            </div>
          ))}
          <button onClick={()=>setView('categories')} className="w-full bg-white border border-[#ece6f3] py-3 rounded-full text-[13px] font-medium mt-4">Back to Quizzes</button>
        </div>
      )}

      {showCheatWarn && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-[320px] text-center">
            <p className="font-semibold text-[14px]">Heads up!</p>
            <p className="text-[12px] text-gray-600 mt-2 leading-5">If you leave this page, your progress will be lost and XP won't count. Your current answers won't be counted and quiz will restart.</p>
          </div>
        </div>
      )}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[20px] p-5 w-full max-w-[320px]">
            <p className="font-semibold text-[14px]">Leave quiz?</p><p className="text-[12px] text-gray-600 mt-1">Progress will be lost and XP won't count.</p>
            <div className="flex gap-2 mt-4"><button onClick={()=>setShowExitConfirm(false)} className="flex-1 bg-gray-100 py-2.5 rounded-full text-[12px]">Stay</button><button onClick={()=>{ setShowExitConfirm(false); setView('votingList'); setHasAnsweredOnce(false); setAnswers([]); setCurrentIdx(0); setXp(0); }} className="flex-1 bg-red-500 text-white py-2.5 rounded-full text-[12px]">Leave</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
