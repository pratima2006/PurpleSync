import { useState } from 'react';

const PASSWORD = "borahae13";

export function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [type, setType] = useState<'votingItems'|'updates'|'scheduleItems'|'achievementItems'>('votingItems');
  const [form, setForm] = useState<any>({ title: '', platform: 'Mnet Plus', voteType: 'app', webLink: '', playStoreLink: '', closes: 'Closes in 2d', note: 'Daily votes', status: 'open', progress: 50 });

  const save = () => {
    const key = `ps_admin_${type}`;
    const old = JSON.parse(localStorage.getItem(key) || '[]');
    const newItem = { id: Date.now(),...form, title: form.title, platform: form.platform };
    localStorage.setItem(key, JSON.stringify([newItem,...old]));
    alert(`${type} added! Home aur Voting page pe turant aa jayega.`);
    setForm({...form, title: '' });
  };

  if (!auth) return (
    <div className="p-10 max-w-sm mx-auto"><h1 className="font-bold">Owner Login</h1><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="borahae13" className="w-full border p-2 rounded mt-3" /><button onClick={()=> pass===PASSWORD? setAuth(true): alert('Wrong')} className="w-full bg-[#60438f] text-white p-2 rounded mt-3">Login</button></div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">PurpleSync Admin - No Code</h1>
      <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full border p-2 rounded mt-4">
        <option value="votingItems">Voting Box</option>
        <option value="updates">Update</option>
        <option value="scheduleItems">Schedule</option>
        <option value="achievementItems">Achievement</option>
      </select>

      {type==='votingItems' && (
        <>
          <input placeholder="Title ex: MAMA Fan Choice" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="w-full border p-2 rounded mt-3" />
          <input placeholder="Platform ex: Mnet Plus" value={form.platform} onChange={e=>setForm({...form, platform: e.target.value})} className="w-full border p-2 rounded mt-3" />
          <select value={form.voteType} onChange={e=>setForm({...form, voteType: e.target.value})} className="w-full border p-2 rounded mt-3">
            <option value="app">App Voting</option>
            <option value="website">Website Voting</option>
          </select>
          <input placeholder="Main Link (https://... jo app ko bhi khole)" value={form.webLink} onChange={e=>setForm({...form, webLink: e.target.value})} className="w-full border p-2 rounded mt-3" />
          <input placeholder="Play Store Link (https://play.google.com/...)" value={form.playStoreLink} onChange={e=>setForm({...form, playStoreLink: e.target.value})} className="w-full border p-2 rounded mt-3" />
          <p className="text-[10px] mt-2 text-gray-500">Example Mnet Plus: webLink = https://mnetplus.world/c/..., playStoreLink = https://play.google.com/store/apps/details?id=com.mnetplus</p>
        </>
      )}

      <button onClick={save} className="w-full bg-[#60438f] text-white p-3 rounded-xl mt-5">Publish - No Code Edit Needed</button>
      <button onClick={()=>{localStorage.clear(); alert('Cleared')}} className="w-full border p-2 rounded mt-3 text-xs">Clear All Admin Data (Testing)</button>
    </div>
  );
}
