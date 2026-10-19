import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Trophy, Archive, Bell, Disc3, Users, Sparkles, Plus, Trash2, Eye, EyeOff, Pencil, Save } from 'lucide-react';

type Question = { q:string, options:string[], correct:number, xp:number };
type QuizDoc = { id:string, category:string, subCategory:string, title:string, questions:Question[], isVisible:boolean, createdBy?:string, createdAt?:string };

const CATEGORIES = [
  { id:'voting', label:'Voting Quiz', icon:Trophy },
  { id:'archive', label:'Archive', icon:Archive },
  { id:'updates', label:'Updates', icon:Bell },
  { id:'discography', label:'Discography', icon:Disc3 },
  { id:'bts', label:'BTS Knowledge', icon:Users },
  { id:'random', label:'Random Fun', icon:Sparkles },
];

const MEMBERS = ['Bangtan','RM','JIN','SUGA','JHOPE','JIMIN','V','JK'];

export function QuizAdmin(){
  const [quizzes,setQuizzes]=useState<QuizDoc[]>([]);
  const [category,setCategory]=useState('voting');
  const [subCategory,setSubCategory]=useState('');
  const [title,setTitle]=useState('');
  const [createdBy,setCreatedBy]=useState('Admin');
  const [questions,setQuestions]=useState<Question[]>([]);
  const [curQ,setCurQ]=useState('');
  const [opts,setOpts]=useState(['','','','']);
  const [correct,setCorrect]=useState(0);
  const [xp,setXp]=useState(10);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [filterCat,setFilterCat]=useState('all');

  useEffect(()=>{ return onSnapshot(collection(db,'quizzes'), snap=> setQuizzes(snap.docs.map(d=> ({id:d.id, ...d.data()} as QuizDoc)))); },[]);

  const addQuestion=()=>{
    if(!curQ.trim() || opts.some(o=>!o.trim())){ alert('Fill question & all 4 options'); return; }
    setQuestions([...questions,{ q:curQ, options:opts, correct, xp }]);
    setCurQ(''); setOpts(['','','','']); setCorrect(0); setXp(10);
  };

  const saveQuiz=async()=>{
    if(!title.trim() || !subCategory.trim() || questions.length===0){ alert('Title, Voting/Member box & at least 1 question required'); return; }
    const data = { category, subCategory, title, questions, isVisible:true, createdBy, createdAt:new Date().toISOString() };
    if(editingId){
      await updateDoc(doc(db,'quizzes',editingId), data);
      setEditingId(null);
    } else {
      await addDoc(collection(db,'quizzes'), data);
    }
    setTitle(''); setSubCategory(''); setQuestions([]); 
  };

  const startEdit=(q:QuizDoc)=>{
    setEditingId(q.id); setCategory(q.category); setSubCategory(q.subCategory); setTitle(q.title); setQuestions(q.questions); setCreatedBy(q.createdBy||'Admin');
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const toggleHide=async(q:QuizDoc)=>{ await updateDoc(doc(db,'quizzes',q.id), { isVisible: !q.isVisible }); };
  const deleteQuiz=async(id:string)=>{ if(confirm('Delete this quiz?')) await deleteDoc(doc(db,'quizzes',id)); };

  const filtered = filterCat==='all' ? quizzes : quizzes.filter(q=>q.category===filterCat);

  return (
    // FULL SCREEN BREAKOUT - parent ke max-w-xl ko tod ke pura screen lega
    <div className="w-[100vw] relative left-1/2 -translate-x-1/2 min-h-screen bg-[#fbf8ff] flex flex-col lg:flex-row -mt-6">
      
      {/* LEFT - All Quizzes - BIG & SPREAD */}
      <div className="lg:w-[48%] bg-white border-r border-[#ece6f3] p-6 lg:p-8 lg:h-screen lg:overflow-y-auto">
        <h2 className="font-bold text-[20px] lg:text-[22px] mb-4">All Quizzes - {filtered.length}</h2>
        <div className="flex gap-2 overflow-x-auto pb-4">
          <button onClick={()=>setFilterCat('all')} className={`px-4 py-2 rounded-full text-[12px] border font-medium ${filterCat==='all'?'bg-[#5e428f] text-white':'bg-white'}`}>All</button>
          {CATEGORIES.map(c=><button key={c.id} onClick={()=>setFilterCat(c.id)} className={`px-4 py-2 rounded-full text-[12px] border whitespace-nowrap font-medium ${filterCat===c.id?'bg-[#5e428f] text-white':'bg-white'}`}>{c.label}</button>)}
        </div>
        <div className="space-y-3 mt-4">
          {filtered.map(q=>(
            <div key={q.id} className={`border border-[#ece6f3] rounded-[18px] p-4 lg:p-5 shadow-sm hover:shadow-md transition ${!q.isVisible?'opacity-50 bg-gray-50':''}`}>
              <div className="flex justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-[13px] lg:text-[14px] leading-5">{q.title} <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#efe8ff] ml-2">{q.category}</span></p>
                  <p className="mt-2"><span className="text-[11px] bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">{q.subCategory}</span></p>
                  <p className="text-[11px] text-gray-500 mt-2">{q.questions.length} Qs • {q.questions.reduce((a,b)=>a+b.xp,0)} XP • by {q.createdBy} {q.isVisible?'':'• Hidden'}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={()=>toggleHide(q)} className="h-9 w-9 border rounded-full flex items-center justify-center bg-white hover:bg-gray-50">{q.isVisible?<Eye size={14}/>:<EyeOff size={14}/>}</button>
                  <button onClick={()=>startEdit(q)} className="h-9 w-9 border rounded-full flex items-center justify-center bg-white hover:bg-gray-50"><Pencil size={14}/></button>
                  <button onClick={()=>deleteQuiz(q.id)} className="h-9 w-9 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0 && <p className="text-center text-[13px] text-gray-400 mt-10">No quizzes yet. Add first quiz on right side →</p>}
        </div>
      </div>

      {/* RIGHT - Add Form - BIG & SPREAD */}
      <div className="lg:w-[52%] p-6 lg:p-10 bg-[#fbf8ff] lg:h-screen lg:overflow-y-auto">
        <h2 className="font-bold text-[20px] lg:text-[24px] mb-6">{editingId?'Edit Quiz':'Add New Quiz'} 💜</h2>
        
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {CATEGORIES.map(c=>{
            const Icon=c.icon;
            return <button key={c.id} onClick={()=>setCategory(c.id)} className={`border rounded-[14px] p-4 flex flex-col items-center gap-2 font-medium transition ${category===c.id?'bg-[#5e428f] text-white shadow-lg scale-[1.02]':'bg-white hover:border-[#5e428f]/30'}`}><Icon size={20}/><span className="text-[11px] text-center leading-3">{c.label}</span></button>
          })}
        </div>

        {category==='voting' ? (
          <div className="bg-white border border-[#ece6f3] rounded-[18px] p-6 mb-4 shadow-sm">
            <label className="text-[12px] font-semibold">Voting App/Site Name (e.g., MAMA 2025, Billboard)</label>
            <input value={subCategory} onChange={e=>setSubCategory(e.target.value)} placeholder="e.g., MAMA 2025" className="w-full border border-[#e3dced] rounded-xl p-4 mt-2 text-[14px] focus:border-[#8b5cf6] outline-none"/>
            <label className="text-[12px] font-semibold mt-5 block">Quiz Title (Box Name)</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., MAMA Worldwide Fans Choice" className="w-full border border-[#e3dced] rounded-xl p-4 mt-2 text-[14px] focus:border-[#8b5cf6] outline-none"/>
          </div>
        ) : (
          <div className="bg-white border border-[#ece6f3] rounded-[18px] p-6 mb-4 shadow-sm">
            <label className="text-[12px] font-semibold">Select Box / Member</label>
            <div className="flex flex-wrap gap-2.5 mt-3">
              {MEMBERS.map(m=><button key={m} onClick={()=>setSubCategory(m)} className={`px-4 py-2 rounded-full text-[12px] border font-medium ${subCategory===m?'bg-[#5e428f] text-white':'bg-white hover:bg-gray-50'}`}>{m}</button>)}
            </div>
            <label className="text-[12px] font-semibold mt-5 block">Quiz Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={`e.g., ${subCategory} Discography Quiz`} className="w-full border border-[#e3dced] rounded-xl p-4 mt-2 text-[14px] focus:border-[#8b5cf6] outline-none"/>
          </div>
        )}

        <div className="bg-white border border-[#ece6f3] rounded-[18px] p-6 mb-4 shadow-sm">
          <label className="text-[12px] font-semibold">Created By (ARMY Name for credit)</label>
          <input value={createdBy} onChange={e=>setCreatedBy(e.target.value)} className="w-full border border-[#e3dced] rounded-xl p-4 mt-2 text-[14px] focus:border-[#8b5cf6] outline-none"/>
        </div>

        <div className="bg-white border border-[#ece6f3] rounded-[20px] p-6 shadow-sm">
          <h3 className="font-semibold text-[15px] mb-4">Add Question - XP & Correct Answer</h3>
          <input value={curQ} onChange={e=>setCurQ(e.target.value)} placeholder="Question" className="w-full border border-[#e3dced] rounded-xl p-4 text-[14px] focus:border-[#8b5cf6] outline-none"/>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            {opts.map((o,i)=><input key={i} value={o} onChange={e=>{ const no=[...opts]; no[i]=e.target.value; setOpts(no); }} placeholder={`Option ${String.fromCharCode(65+i)}`} className="border border-[#e3dced] rounded-xl p-3.5 text-[13px] focus:border-[#8b5cf6] outline-none"/>)}
          </div>
          <div className="flex gap-4 mt-5 items-center flex-wrap">
            <div className="flex items-center gap-2"><span className="text-[12px] font-medium">Correct:</span>
              <select value={correct} onChange={e=>setCorrect(Number(e.target.value))} className="border border-[#e3dced] rounded-full px-4 py-2 text-[12px] bg-white">
                <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
              </select>
            </div>
            <div className="flex items-center gap-2"><span className="text-[12px] font-medium">XP:</span><input type="number" value={xp} onChange={e=>setXp(Number(e.target.value))} className="border border-[#e3dced] rounded-full w-20 px-3 py-2 text-[12px] bg-white"/></div>
            <button onClick={addQuestion} className="ml-auto bg-[#5e428f] text-white px-6 py-2.5 rounded-full text-[13px] font-medium flex items-center gap-2 hover:bg-[#4c3575]"><Plus size={14}/>Add Question</button>
          </div>

          {questions.length>0 && (
            <div className="mt-6 space-y-2.5">
              <p className="text-[12px] font-semibold">Added Questions ({questions.length})</p>
              {questions.map((qq,idx)=><div key={idx} className="border border-[#ece6f3] rounded-xl p-4 flex justify-between bg-[#fbf8ff]"><div><p className="text-[13px] font-medium">{idx+1}. {qq.q} ({qq.xp} XP)</p><p className="text-[11px] text-gray-500 mt-1">Correct: {String.fromCharCode(65+qq.correct)} - {qq.options[qq.correct]}</p></div><button onClick={()=>setQuestions(questions.filter((_,i)=>i!==idx))} className="text-red-500 hover:bg-red-50 h-8 w-8 rounded-full flex items-center justify-center"><Trash2 size={14}/></button></div>)}
            </div>
          )}

          <button onClick={saveQuiz} className="w-full mt-8 bg-black text-white py-4 rounded-full text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800"><Save size={16}/>{editingId?'Update Quiz':'Save Quiz'} ({questions.length} Qs)</button>
          {editingId && <button onClick={()=>{setEditingId(null); setTitle(''); setSubCategory(''); setQuestions([]);}} className="w-full mt-3 bg-gray-100 py-3 rounded-full text-[13px] font-medium">Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}
