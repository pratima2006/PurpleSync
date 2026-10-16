import { useEffect, useMemo, useState } from 'react';
import { Achievements } from '../app/Achievements';
import Home from '../app/Home';
import { Links } from '../app/Links';
import { Members } from '../app/Members';
import { Schedule } from '../app/Schedule';
import { Updates } from '../app/Updates';
import { Voting } from '../app/Voting';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { MobileNav } from '../components/MobileNav';
import { SearchPanel } from '../components/SearchPanel';
import { Topbar } from '../components/Topbar';
import type { PageKey } from '../components/types';
import { Admin, UserAdminPanel } from '../app/Admin';
import { Settings } from '../app/Settings';
import { FAQ } from '../app/FAQ';
import { Help } from '../app/Help';
import { PaletteOfMemories } from '../app/PaletteOfMemories';
import Profile from '../app/Profile';
import { UserAddVoting } from '../components/UserAddVoting';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { QuizPage } from '../app/Quiz';

const validPages: PageKey[] = ['home','voting','userAddVoting','schedule','achievements','updates','links','members','admin','user-admin','settings','faq','help','palette','profile','quiz','quiz-admin'];

function pageFromPath(p:string): PageKey { const raw=p.replace(/^\/+/,'').split('/')[0] as PageKey; return validPages.includes(raw)? raw : 'home'; }

function Shell(){
  const [page,setPage]=useState<PageKey>(()=>pageFromPath(window.location.pathname));
  const [searchOpen,setSearchOpen]=useState(false);
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false);
  const [dismissed,setDismissed]=useState(false);
  const [currentUser,setCurrentUser]=useState<any>(null);

  useEffect(()=>{ const u=onAuthStateChanged(auth, c=>setCurrentUser(c)); return ()=>u(); },[]);
  useEffect(()=>{ const h=()=>setPage(pageFromPath(window.location.pathname)); window.addEventListener('popstate',h); return ()=>window.removeEventListener('popstate',h); },[]);

  const navigate=(next:PageKey)=>{
    const path=next==='home'?'/':`/${next}`;
    window.history.pushState({},'',path);
    setPage(next); setMobileMenuOpen(false); setSearchOpen(false);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const content=useMemo(()=>{
    if(page==='voting') return <Voting onNavigate={navigate as any}/>;
    if(page==='userAddVoting') return <UserAddVoting onBack={()=>navigate('voting')}/>;
    if(page==='schedule') return <Schedule/>;
    if(page==='achievements') return <Achievements/>;
    if(page==='updates') return <Updates/>;
    if(page==='links') return <Links/>;
    if(page==='members') return <Members/>;
    if(page==='admin') return <Admin/>;
    if(page==='user-admin') return <UserAdminPanel/>;
    if(page==='settings') return <Settings/>;
    if(page==='faq') return <FAQ/>;
    if(page==='help') return <Help/>;
    if(page==='palette') return <PaletteOfMemories/>;
    if(page==='profile') return <Profile onNavigate={navigate}/>;
    if(page==='quiz') return <QuizPage onBack={()=>navigate('home')} onNavigate={navigate as any}/>;
    return <Home onNavigate={navigate} dismissed={dismissed} onDismiss={()=>setDismissed(true)}/>;
  },[page,dismissed]);

  return (
    <div className="ps-shell">
      <main className="ps-main ml-0">
        {page!=='user-admin' && <Topbar page={page as any} onNavigate={navigate} onSearch={()=>setSearchOpen(true)} onMenu={()=>setMobileMenuOpen(true)}/>}
        {content}
      </main>
      {page!=='user-admin' && page!=='userAddVoting' && <MobileNav page={page} onNavigate={navigate}/>}
      {searchOpen && <SearchPanel onClose={()=>setSearchOpen(false)} onNavigate={navigate}/>}
    </div>
  );
}
export default function App(){ return <ErrorBoundary><Shell/></ErrorBoundary>; }
