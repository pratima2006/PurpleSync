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

const validPages: PageKey[] = [
  'home',
  'voting',
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
];

function pageFromPath(pathname: string): PageKey {
  const raw = pathname.replace(/^\/+/, '').split('/')[0];
  const value = raw as PageKey;
  return validPages.includes(value)? value : 'home';
}

// SILENT AUTO UPDATE - bina version.json ke
function useSilentUpdate(){
  useEffect(()=>{
    const silentReload = async () => {
      try{
        if('caches' in window){
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        if('serviceWorker' in navigator){
          const regs = await navigator.serviceWorker.getRegistrations();
          for(const r of regs){ await r.update(); }
        }
      }catch{}
      window.location.reload();
    };

    const checkForUpdate = async () => {
      try{
        // 1. Check if new service worker is waiting
        if('serviceWorker' in navigator){
          const reg = await navigator.serviceWorker.getRegistration();
          if(reg?.waiting){
            reg.waiting.postMessage({type:'SKIP_WAITING'});
            await silentReload();
            return;
          }
          // Force check for new SW from Vercel
          await reg?.update();
        }
        // 2. Extra check: fetch index.html no-cache to see if deploy changed (Vercel sends new ETag)
        const res = await fetch(`/?_t=${Date.now()}`, { cache: 'no-store' });
        const etag = res.headers.get('etag') || res.headers.get('x-vercel-cache') || '';
        const lastEtag = localStorage.getItem('app_etag');
        if(lastEtag && etag && lastEtag!== etag){
          localStorage.setItem('app_etag', etag);
          await silentReload();
        } else if(etag){
          localStorage.setItem('app_etag', etag);
        }
      }catch{}
    };

    // SW update milte hi silent reload
    if('serviceWorker' in navigator){
      navigator.serviceWorker.addEventListener('controllerchange', ()=>{
        window.location.reload();
      });
    }

    checkForUpdate();
    const id = setInterval(checkForUpdate, 60 * 1000); // har 60 sec
    const onVisible = () => { if(document.visibilityState==='visible') checkForUpdate(); };
    document.addEventListener('visibilitychange', onVisible);

    return ()=>{
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  },[]);
}

function Shell() {
  useSilentUpdate();
  const [page, setPage] = useState<PageKey>(() => pageFromPath(window.location.pathname));
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handlePopState = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setPage('admin');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextPage: PageKey) => {
    const nextPath = nextPage === 'home'? '/' : `/${nextPage}`;
    window.history.pushState({}, '', nextPath);
    setPage(nextPage);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const content = useMemo(() => {
    if (page === 'voting') return <Voting />;
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
    return (
      <Home
        onNavigate={navigate}
        dismissed={dismissed}
        onDismiss={() => setDismissed(true)}
      />
    );
  }, [page, dismissed]);

  const isUserAdmin = page === 'user-admin';

  return (
    <div className="ps-shell">
      <main className="ps-main ml-0">
        {!isUserAdmin && <Topbar page={page} onNavigate={navigate} onSearch={() => setSearchOpen(true)} onMenu={() => setMobileMenuOpen(true)} />}
        {content}
      </main>
      {!isUserAdmin && <MobileNav page={page} onNavigate={navigate} />}
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
