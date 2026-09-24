import { useState } from 'react';

const PASSWORD = "borahae13";

export function Admin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [type, setType] = useState<'votingItems'|'updates'|'scheduleItems'|'achievementItems'>('votingItems');
  const [form, setForm] = useState<any>({
    title: '',
    platform: 'MNET PLUS',
    voteType: 'app',
    webLink: '',
    playStoreLink: '',
    appStoreLink: '',
    closes: 'Closes in 18h 42m',
    note: 'Daily votes available',
    description: 'Global Fan Choice voting. Vote once per day. Extra votes via ads.',
    status: 'open',
    progress: 68
  });
  const [isFocused, setIsFocused] = useState(false);

  const save = () => {
    if (!form.title) return alert('Title daal pehle');
    const key = `ps_admin_${type}`;
    const old = JSON.parse(localStorage.getItem(key) || '[]');
    const newItem = {
      id: Date.now(),
      title: form.title,
      platform: form.platform,
      closes: form.closes,
      note: form.note,
      description: form.description,
      status: form.status,
      progress: Number(form.progress),
      voteType: form.voteType,
      webLink: form.webLink,
      playStoreLink: form.playStoreLink,
      appStoreLink: form.appStoreLink,
    };
    localStorage.setItem(key, JSON.stringify([newItem,...old]));
    alert(`${form.title} added! Voting page pe aa jayega.`);
    setForm({...form, title: '', webLink: '' });
  };

  if (!auth) return (
    <div className="p-10 max-w-sm mx-auto"><h1 className="font-bold">Owner Login</h1><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="borahae13" className="w-full border p-2 rounded mt-3" /><button onClick={()=> pass===PASSWORD? setAuth(true): alert('Wrong')} className="w-full bg-[#60438f] text-white p-2 rounded mt-3">Login</button></div>
  );

  return (
    <div className="p-6 max-w-xl mx-auto pb-24">
      <h1 className="text-xl font-bold">PurpleSync Admin - No Code</h1>
      <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full border p-2 rounded mt-4">
        <option value="votingItems">Voting Box</option>
        <option value="updates">Update</option>
        <option value="scheduleItems">Schedule</option>
        <option value="achievementItems">Achievement</option>
      </select>

      {type === 'votingItems' && (
        <>
          <p className="ps-mono text-[9px] text-[#8068a9] mt-6 mb-2">LIVE PREVIEW - Exact same as Voting page</p>

          {/* SAME BOX AS PIC */}
          <article className="ps-panel rounded-2xl p-5 md:p-6 border border-[#e0d4ed] bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${form.status === 'open'? 'bg-[#6aaf8f]' : 'bg-[#b3a9bc]'}`} />
                  {/* Yaha pe Title ka floating label logic */}
                  <div className="relative">
                    {form.platform? (
                      <span className="ps-mono text-[9px] text-[#8e819c]">{form.platform}</span>
                    ) : (
                      <span className="ps-mono text-[9px] text-[#c4b8d0]">• MNET PLUS</span>
                    )}
                  </div>
                </div>
                <div className="relative mt-3 min-h-[22px]">
                  {!form.title &&!isFocused && (
                    <span className="absolute text-[15px] text-[#b8adc6] pointer-events-none">Title</span>
                  )}
                  {form.title && (
                    <h2 className="text-[16px] font-semibold text-[#3d324b]">{form.title}</h2>
                  )}
                  {isFocused &&!form.title && (
                    <span className="ps-mono text-[9px] text-[#8e819c] absolute -top-3 left-0">TITLE - Left me chala gaya</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-7 flex items-end justify-between">
              <div>
                <p className="ps-mono text-[9px] text-[#95899d]">STATUS</p>
                <p className={`mt-1 text-[12px] font-medium ${form.status === 'open'? 'text-[#6b9c7e]' : 'text-[#8f8495]'}`}>{form.closes}</p>
              </div>
              <p className="font-mono text-[18px] text-[#4f3a70]">{form.progress}%</p>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-[#eeeaf3]">
              <div className="h-full rounded-full bg-[#9b79c7]" style={{ width: `${form.progress}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#958a9c]">{form.note}</span>
              <button type="button" className="flex items-center gap-1.5 rounded-lg bg-[#60438f] px-3 py-2 text-[11px] font-semibold text-white">
                Open official page
              </button>
            </div>
          </article>

          {/* FORM - Title gayab hone wala logic */}
          <div className="mt-6 space-y-3">
            <div className="relative border border-[#e0d4ed] rounded-xl bg-white">
              <label className={`absolute left-3 transition-all ${isFocused || form.title? 'top-1 text-[9px] text-[#8068a9] ps-mono' : 'top-3.5 text-[13px] text-[#aaa]'}`}>Title - Yaha likh, upar Title gayab hoga</label>
              <input value={form.title} onFocus={()=>setIsFocused(true)} onBlur={()=>setIsFocused(false)} onChange={e=>setForm({...form, title: e.target.value})} className="w-full p-3 pt-6 rounded-xl text-[14px] outline-none" />
            </div>

            <input placeholder="Platform - MNET PLUS" value={form.platform} onChange={e=>setForm({...form, platform: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl" />
            <input placeholder="Description - Daily votes available ki jagah" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl" />

            <div className="grid grid-cols-2 gap-3">
              <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl bg-white">
                <option value="open">open</option>
                <option value="ended">ended</option>
              </select>
              <input placeholder="Closes in 18h 42m" value={form.closes} onChange={e=>setForm({...form, closes: e.target.value})} className="w-full border border-[#e0d4ed] p-3 rounded-xl" />
            </div>

            <div>
              <label className="ps-mono text-[9px] text-[#8068a9]">VOTING % - Tu khud set karegi, API nahi milta isliye manual</label>
              <input type="range" min="0" max="100" value={form.progress} onChange={e=>setForm({...form, progress: e.target.value})} className="w-full" />
              <p className="font-mono text-[13px] text-[#60438f]">{form.progress}% progress bar</p>
            </div>

            <select value={form.voteType} onChange={e=>setForm({...form, voteType: e.target.value})} className="w-full border p-3 rounded-xl bg-white">
              <option value="app">App Voting - App kholega, nahi hai to Store pe le jayega</option>
              <option value="website">Website Voting - Direct website kholega</option>
            </select>

            <input placeholder="Main Link - https://mnetplus.world/..." value={form.webLink} onChange={e=>setForm({...form, webLink: e.target.value})} className="w-full border p-3 rounded-xl" />
            <input placeholder="Play Store - https://play.google.com/..." value={form.playStoreLink} onChange={e=>setForm({...form, playStoreLink: e.target.value})} className="w-full border p-3 rounded-xl" />
            <input placeholder="App Store - https://apps.apple.com/..." value={form.appStoreLink} onChange={e=>setForm({...form, appStoreLink: e.target.value})} className="w-full border p-3 rounded-xl" />
          </div>
        </>
      )}

      <button onClick={save} className="w-full bg-[#60438f] text-white p-3 rounded-xl mt-6">Publish - No Code Edit Needed</button>
    </div>
  );
}
