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

const validPages: PageKey[] = [
  'home',
  'voting',
  'userAddVoting',
  'schedule',
  'achievements',
  'updates',
  'links',
  'members',
  'admin',
  'user-admin',
  'settings',
  'faq',
  'help',
  'palette',
  'profile',
];

function pageFromPath(pathname: string): PageKey {
  const raw = pathname.replace(/^\/+/, '').split('/')[0];
  const value = raw as PageKey;
  return validPages.includes(value)? value : 'home';
}

function useSilentUpdate(){
  useEffect(()=>{
    let lastHtmlSnapshot = '';
    let lastEtagSnapshot = '';
    const doReload = async () => {
      try{
        if('caches' in window){
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
      }catch{}
      window.location.reload();
    };
    const checkForUpdate = async () => {
      try{
        const res = await fetch(`/index.html?_=${Date.now()}`, { cache: 'no-store' });
        const html = await res.text();
        const etag = res.headers.get('etag') || '';
        if(!lastHtmlSnapshot){
          lastHtmlSnapshot = html;
          lastEtagSnapshot = etag;
          if(etag) localStorage.setItem('app_etag', etag);
          return;
        }
        const storedEtag = localStorage.getItem('app_etag');
        if((etag && storedEtag && etag!== storedEtag) || (html && html!== lastHtmlSnapshot && html.length > 500)){
          if(etag) localStorage.setItem('app_etag', etag);
          await doReload();
        } else {
          if(etag) localStorage.setItem('app_etag', etag);
        }
      }catch{}
    };
    checkForUpdate();
    const id = setInterval(checkForUpdate, 15000);
    const onVisible = () => { if(document.visibilityState==='visible') checkForUpdate(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', checkForUpdate);
    return ()=>{
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', checkForUpdate);
    };
  },[]);
}

function Shell() {
  useSilentUpdate();
  const [page, setPage] = useState<PageKey>(() => pageFromPath(window.location.pathname));
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Auth listener for notifications
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, (u)=> setCurrentUser(u));
    return ()=> unsub();
  },[]);

  // Daily streak + Voting reminder notifications
  useEffect(()=>{
    if(!currentUser) return;

    // Request permission once
    if('Notification' in window && Notification.permission === 'default'){
      Notification.requestPermission().catch(()=>{});
    }

    const updateLastActive = ()=>{
      localStorage.setItem('lastActive', Date.now().toString());
    };

    // Track activity
    updateLastActive();
    window.addEventListener('click', updateLastActive);
    window.addEventListener('scroll', updateLastActive);
    document.addEventListener('visibilitychange', updateLastActive);

    const interval = setInterval(()=>{
      if(!('Notification' in window)) return;
      if(Notification.permission!== 'granted') return;
      if(document.visibilityState!== 'visible') return;

      const lastSeen = localStorage.getItem('lastActive');
      const diff = Date.now() - Number(lastSeen || 0);
      const twoHours = 2 * 60 * 60 * 1000;

      // Only if user inactive for 2 hours
      if(diff > twoHours){
        const notif = new Notification('PurpleSync 💜', {
          body: "You haven't voted in 2 hours! Don't miss your daily streak - spend 10 min in Voting tab ✨",
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'voting-reminder'
        });
        notif.onclick = ()=>{
          window.focus();
          notif.close();
        };
        // Reset to avoid spamming
        localStorage.setItem('lastActive', Date.now().toString());
      }
    }, 60 * 60 * 1000); // Check every hour

    return ()=>{
      clearInterval(interval);
      window.removeEventListener('click', updateLastActive);
      window.removeEventListener('scroll', updateLastActive);
      document.removeEventListener('visibilitychange', updateLastActive);
    };
  },[currentUser]);

  useEffect(() => {
    const handlePopState = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') setPage('admin');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextPage: PageKey) => {
    const nextPath = nextPage === 'home'? '/' : `/${nextPage}`;
    window.history.pushState({}, '', nextPath);
    setPage(nextPage);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    localStorage.setItem('lastActive', Date.now().toString());
  };

  const content = useMemo(() => {
    if (page === 'voting') return <Voting onNavigate={navigate as any} />;
    if (page === 'userAddVoting') return <UserAddVoting onBack={()=>navigate('voting')} />;
    if (page === 'schedule') return <Schedule />;
    if (page === 'achievements') return <Achievements />;
    if (page === 'updates') return <Updates />;
    if (page === 'links') return <Links />;
    if (page === 'members') return <Members />;
    if (page === 'admin') return <Admin />;
    if (page === 'user-admin') return <UserAdminPanel />;
    if (page === 'settings') return <Settings />;
    if (page === 'faq') return <FAQ />;
    if (page === 'help') return <Help />;
    if (page === 'palette') return <PaletteOfMemories />;
    if (page === 'profile') return <Profile onNavigate={navigate} />;
    return <Home onNavigate={navigate} dismissed={dismissed} onDismiss={() => setDismissed(true)} />;
  }, [page, dismissed]);

  const isUserAdmin = page === 'user-admin';
  const isUserAddVoting = page === 'userAddVoting';

  return (
    <div className="ps-shell">
      <main className="ps-main ml-0">
        {!isUserAdmin && <Topbar page={page as any} onNavigate={navigate} onSearch={() => setSearchOpen(true)} onMenu={() => setMobileMenuOpen(true)} />}
        {content}
      </main>
      {!isUserAdmin &&!isUserAddVoting && <MobileNav page={page} onNavigate={navigate} />}
      {searchOpen &&!isUserAdmin && <SearchPanel onClose={() => setSearchOpen(false)} onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Shell />
    </ErrorBoundary>
  );
}
