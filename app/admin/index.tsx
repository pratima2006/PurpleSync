import { useState } from 'react';
import { AchievementsAdmin } from './AchievementsAdmin';
import { PaletteAdmin } from './PaletteAdmin';
import { UpdatesAdmin } from './UpdatesAdmin';
import { VotingAdmin } from './VotingAdmin';
import { ScheduleAdmin } from './ScheduleAdmin';

const PASSWORD = "borahae13";

export function Admin(){
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState<'palette'|'voting'|'updates'|'schedule'|'achievements'>('achievements');

  if(!auth) return <div className="p-10 max-w-sm mx-auto"><h1 className="font-semibold">Admin Access</h1><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="w-full border p-3 rounded-xl mt-4"/><button onClick={()=>pass===PASSWORD? setAuth(true): alert('Wrong')} className="w-full bg-black text-white p-3 rounded-xl mt-3">Continue</button></div>;

  return (
    <div className="p-6 max-w-xl mx-auto pb-24">
      <h1 className="text-[20px] font-semibold">Main Admin - A to Z</h1>
      <select value={tab} onChange={e=>setTab(e.target.value as any)} className="w-full border p-3 rounded-xl mt-5 bg-white text-[13px]">
        <option value="achievements">🏆 Achievements</option>
        <option value="palette">🎨 Palette of Memories</option>
        <option value="updates">📰 Updates</option>
        <option value="voting">🗳️ Voting</option>
        <option value="schedule">📅 Schedule</option>
      </select>
      <div className="mt-6">
        {tab==='achievements' && <AchievementsAdmin/>}
        {tab==='palette' && <PaletteAdmin/>}
        {tab==='updates' && <UpdatesAdmin/>}
        {tab==='voting' && <VotingAdmin/>}
        {tab==='schedule' && <ScheduleAdmin/>}
      </div>
    </div>
  );
}

export { UserAdminPanel } from './AchievementsAdmin'; // simple re-export for /user-admin
