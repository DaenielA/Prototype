import { useState, useEffect, useCallback } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { fetchListings, seedIfEmpty } from './data/seed';
import Toast from './components/Toast';
import PublicView from './components/PublicView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [listings, setListings] = useState([]);
  const [view, setView] = useState('public');
  const [toasts, setToasts] = useState([]);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  async function loadListings() {
    try {
      await seedIfEmpty();
      const data = await fetchListings();
      setListings(data);
    } catch (e) {
      addToast('Failed to load listings.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
      if (user) setView('admin');
    });
    return unsub;
  }, []);

  useEffect(() => {
    loadListings();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    setView('public');
  }

  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm font-sans">Loading LuxeRealty...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === 'public' && (
        <PublicView listings={listings} onAdminClick={() => setView('login')} addToast={addToast} />
      )}
      {view === 'login' && (
        <AdminLogin onLogin={() => setView('admin')} onBack={() => setView('public')} addToast={addToast} />
      )}
      {view === 'admin' && (
        <AdminDashboard
          listings={listings}
          setListings={setListings}
          onLogout={handleLogout}
          addToast={addToast}
          reloadListings={loadListings}
        />
      )}
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
