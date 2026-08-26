import { useState, useEffect, useCallback } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { fetchListings, fetchDevelopers, fetchProfile, fetchPropertyTypes, fetchUnitTypes, seedIfEmpty } from './data/seed';
import Toast from './components/Toast';
import PublicView from './components/PublicView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [listings, setListings] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [view, setView] = useState('public');
  const [toasts, setToasts] = useState([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const loadListings = useCallback(async (bustCache = false) => {
    setLoading(true);
    try {
      if (!bustCache) {
        const cached = sessionStorage.getItem('hbj_cache');
        if (cached) {
          const { listings: l, developers: d, profile: p, unitTypes: u, propertyTypes: pt, ts } = JSON.parse(cached);
          if (Date.now() - ts < 5 * 60 * 1000) {
            setListings(l); setDevelopers(d); setProfile(p); setUnitTypes(u); setPropertyTypes(pt);
            setLoading(false);
            return;
          }
        }
      }
      await seedIfEmpty();
      const [data, devs, currentProfile, types, propertyTypeOptions] = await Promise.all([
        fetchListings(), fetchDevelopers(), fetchProfile(), fetchUnitTypes(), fetchPropertyTypes(),
      ]);
      setListings(data); setDevelopers(devs); setProfile(currentProfile);
      setUnitTypes(types); setPropertyTypes(propertyTypeOptions);
      sessionStorage.setItem('hbj_cache', JSON.stringify({
        listings: data, developers: devs, profile: currentProfile,
        unitTypes: types, propertyTypes: propertyTypeOptions, ts: Date.now(),
      }));
    } catch (e) {
      console.error('Listings error:', e);
      addToast('Failed to load listings.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    // Auth listener — resolves quickly, just checks session
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setView('admin');
      setReady(true);
    });

    // Safety timeout — if Firebase auth hangs for 5s, show the app anyway
    const timeout = setTimeout(() => setReady(true), 5000);

    return () => { unsub(); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => { loadListings(); }, 0);
    return () => clearTimeout(id);
  }, [loadListings]);

  async function handleLogout() {
    await signOut(auth);
    sessionStorage.removeItem('hbj_cache');
    setView('public');
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm font-sans">Loading Homes By Juvy...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === 'public' && (
        <PublicView listings={listings} developers={developers} profile={profile} loading={loading} onAdminClick={() => setView('login')} addToast={addToast} />
      )}
      {view === 'login' && (
        <AdminLogin onLogin={() => setView('admin')} onBack={() => setView('public')} addToast={addToast} />
      )}
      {view === 'admin' && (
        <AdminDashboard
          listings={listings}
          developers={developers}
          profile={profile}
          propertyTypes={propertyTypes}
          unitTypes={unitTypes}
          onLogout={handleLogout}
          addToast={addToast}
          reloadListings={() => loadListings(true)}
        />
      )}
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
