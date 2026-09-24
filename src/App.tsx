import { useEffect, useMemo, useState } from 'react';
import { Achievements } from '../app/Achievements';
import { Home } from '../app/Home';
import { Links } from '../app/Links';
import { Members } from '../app/Members';
import { Schedule } from '../app/Schedule';
import { Updates } from '../app/Updates';
import { Voting } from '../app/Voting';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { MobileNav } from '../components/MobileNav';
import { SearchPanel } from '../components/SearchPanel';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import type { PageKey } from '../components/types';
import { Admin } from '../app/Admin';

const validPages: PageKey[] = [
  'home',
  'voting',
  'schedule',
  'achievements',
  'updates',
  'links',
  'members',
  'admin',
];

function pageFromPath(pathname: string): PageKey {
  const value = pathname.replace(/^\/+/, '').split('/')[0] as PageKey;
  return validPages.includes(value)? value : 'home';
}

function Shell() {
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
    return (
      <Home
        onNavigate={navigate}
        dismissed={dismissed}
        onDismiss={() => setDismissed(true)}
      />
    );
  }, [page, dismissed]);

  return (
    <div className="ps-shell">
      <Sidebar page={page} mobileOpen={mobileMenuOpen} onNavigate={navigate} onClose={() => setMobileMenuOpen(false)} />
      <main className="ps-main ml-0 md:ml-[258px]">
        <Topbar page={page} onNavigate={navigate} onSearch={() => setSearchOpen(true)} onMenu={() => setMobileMenuOpen(true)} />
        {content}
      </main>
      <MobileNav page={page} onNavigate={navigate} />
      {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} onNavigate={navigate} />}
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
