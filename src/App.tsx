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

// SILENT AUTO UPDATE - FIXED - ab pakka kaam karega
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
        // Hum seedha index.html ka content check karenge - sabse reliable
        const res = await fetch(`/index.html?_=${Date.now()}`, { cache: 'no-store' });
        const html = await res.text();
        const etag = res.headers.get('etag') || '';

        if(!lastHtmlSnapshot){
          lastHtmlSnapshot = html;
          lastEtagSnapshot = etag;
          if(etag) localStorage.setItem('app_etag', etag);
          return;
        }

        // Agar etag badla ya html badla = naya deploy
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
    const id = setInterval(checkForUpdate, 15000); // har 15 sec
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
