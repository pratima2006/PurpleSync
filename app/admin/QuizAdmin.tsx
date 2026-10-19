import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
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
    <div className="min-h-screen bg-[#fbf8ff] flex flex-col lg:flex-row">
      {/* LEFT - Existing Quizzes */}
      <div className="lg:w-[42%] border-r bg-white p-4 lg:h-screen lg:overflow-y-auto">
        <h2 className="font-bold text-[16px] mb-3">All Quizzes - {filtered.length}</h2>
        <div className="flex gap-2 overflow-x-auto pb-3">
          <button onClick={()=>setFilterCat('all')} className={`px-3 py-1.5 rounded-full text-[11px] border ${filterCat==='all'?'bg-[#5e428f] text-white':'bg-white'}`}>All</button>
          {CATEGORIES.map(c=><button key={c.id} onClick={()=>setFilterCat(c.id)} className={`px-3 py-1.5 rounded-full text-[11px] border whitespace-nowrap ${filterCat===c.id?'bg-[#5e428f] text-white':'bg-white'}`}>{c.label}</button>)}
        </div>
        <div className="space-y-2 mt-3">
          {filtered.map(q=>(
            <div key={q.id} className={`border rounded-[14px] p-3 ${!q.isVisible?'opacity-50 bg-gray-50':''}`}>
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-[12px]">{q.title} <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#efe8ff] ml-1">{q.category}</span> {q.category==='voting' ? <span className="text-[9px] bg-orange-100 px-2 py-0.5 rounded-full">{q.subCategory}</span> : <span className="text-[9px] bg-blue-100 px-2 py-0.5 rounded-full">{q.subCategory}</span>}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{q.questions.length} Qs • {q.questions.reduce((a,b)=>a+b.xp,0)} XP • by {q.createdBy} {q.isVisible?'':'• Hidden'}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>toggleHide(q)} className="h-7 w-7 border rounded-full flex items-center justify-center">{q.isVisible?<Eye size={12}/>:<EyeOff size={12}/>}</button>
                  <button onClick={()=>startEdit(q)} className="h-7 w-7 border rounded-full flex items-center justify-center"><Pencil size={12}/></button>
                  <button onClick={()=>deleteQuiz(q.id)} className="h-7 w-7 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-500"><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT - Add Form */}
      <div className="lg:w-[58%] p-4 lg:h-screen lg:overflow-y-auto">
        <h2 className="font-bold text-[16px] mb-4">{editingId?'Edit Quiz':'Add New Quiz'} 💜</h2>
        
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {CATEGORIES.map(c=>{
            const Icon=c.icon;
            return <button key={c.id} onClick={()=>setCategory(c.id)} className={`border rounded-[12px] p-3 flex flex-col items-center gap-1 ${category===c.id?'bg-[#5e428f] text-white':'bg-white'}`}><Icon size={16}/><span className="text-[10px]">{c.label}</span></button>
          })}
        </div>

        {category==='voting' ? (
          <div className="bg-white border rounded-[14px] p-4 mb-3">
            <label className="text-[11px] font-semibold">Voting App/Site Name (e.g., MAMA 2025, Billboard)</label>
            <input value={subCategory} onChange={e=>setSubCategory(e.target.value)} placeholder="e.g., MAMA 2025" className="w-full border rounded-xl p-3 mt-1 text-[13px]"/>
            <label className="text-[11px] font-semibold mt-3 block">Quiz Title (Box Name)</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., MAMA Worldwide Fans Choice" className="w-full border rounded-xl p-3 mt-1 text-[13px]"/>
          </div>
        ) : (
          <div className="bg-white border rounded-[14px] p-4 mb-3">
            <label className="text-[11px] font-semibold">Select Box / Member</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {MEMBERS.map(m=><button key={m} onClick={()=>setSubCategory(m)} className={`px-3 py-1.5 rounded-full text-[11px] border ${subCategory===m?'bg-[#5e428f] text-white':'bg-white'}`}>{m}</button>)}
            </div>
            <label className="text-[11px] font-semibold mt-3 block">Quiz Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={`e.g., ${subCategory} Discography Quiz`} className="w-full border rounded-xl p-3 mt-1 text-[13px]"/>
            <p className="text-[10px] text-gray-400 mt-2">For now keep {category} as Coming Soon - only voting is live. You can still add but won't show till you enable.</p>
          </div>
        )}

        <div className="bg-white border rounded-[14px] p-4 mb-3">
          <label className="text-[11px] font-semibold">Created By (ARMY Name for credit)</label>
          <input value={createdBy} onChange={e=>setCreatedBy(e.target.value)} className="w-full border rounded-xl p-3 mt-1 text-[13px]"/>
        </div>

        <div className="bg-white border rounded-[16px] p-4">
          <h3 className="font-semibold text-[13px] mb-3">Add Question - XP & Correct Answer</h3>
          <input value={curQ} onChange={e=>setCurQ(e.target.value)} placeholder="Question" className="w-full border rounded-xl p-3 text-[13px]"/>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {opts.map((o,i)=><input key={i} value={o} onChange={e=>{ const no=[...opts]; no[i]=e.target.value; setOpts(no); }} placeholder={`Option ${String.fromCharCode(65+i)}`} className="border rounded-xl p-2.5 text-[12px]"/>)}
          </div>
          <div className="flex gap-3 mt-3 items-center">
            <div className="flex items-center gap-1"><span className="text-[11px]">Correct:</span>
              <select value={correct} onChange={e=>setCorrect(Number(e.target.value))} className="border rounded-full px-3 py-1 text-[11px]">
                <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
              </select>
            </div>
            <div className="flex items-center gap-1"><span className="text-[11px]">XP:</span><input type="number" value={xp} onChange={e=>setXp(Number(e.target.value))} className="border rounded-full w-16 px-2 py-1 text-[11px]"/></div>
            <button onClick={addQuestion} className="ml-auto bg-[#5e428f] text-white px-4 py-1.5 rounded-full text-[11px] flex items-center gap-1"><Plus size={12}/>Add Q</button>
          </div>

          {questions.length>0 && (
            <div className="mt-4 space-y-2">
              {questions.map((qq,idx)=><div key={idx} className="border rounded-xl p-3 flex justify-between"><div><p className="text-[12px] font-medium">{idx+1}. {qq.q} ({qq.xp} XP)</p><p className="text-[10px] text-gray-500">Correct: {qq.options[qq.correct]}</p></div><button onClick={()=>setQuestions(questions.filter((_,i)=>i!==idx))} className="text-red-500"><Trash2 size={12}/></button></div>)}
            </div>
          )}

          <button onClick={saveQuiz} className="w-full mt-5 bg-black text-white py-3 rounded-full text-[13px] flex items-center justify-center gap-2"><Save size={14}/>{editingId?'Update Quiz':'Save Quiz'} ({questions.length} Qs)</button>
          {editingId && <button onClick={()=>{setEditingId(null); setTitle(''); setSubCategory(''); setQuestions([]);}} className="w-full mt-2 bg-gray-100 py-2.5 rounded-full text-[12px]">Cancel Edit</button>}
        </div>
      </div>
    </div>
  );
}
