import { useState } from 'react';
import {
  LayoutDashboard, List, PlusCircle, LogOut, Bell, Trash2, Pencil, Eye, EyeOff,
  TrendingUp, Home, Building2, Layers, X, Check, Menu, Upload
} from 'lucide-react';
import { formatPrice, addListing, updateListing, deleteListing, uploadImage } from '../data/seed';

const EMPTY_FORM = {
  title: '', type: 'House', status: 'For Sale', price: '', location: '', address: '',
  bedrooms: '', bathrooms: '', floorArea: '', lotArea: '', parking: '', furnishing: 'Bare',
  yearBuilt: '', description: '', amenities: [], images: [],
  agentName: 'Maria Santos', agentPhone: '+63 912 345 6789', agentEmail: 'maria@luxerealty.com',
  visible: true,
};


function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-white/10 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-muted text-xs mb-1">{label}</p>
        <p className="text-primary text-2xl font-bold font-serif">{value}</p>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-card border border-white/10 rounded-2xl p-6 max-w-sm w-full">
        <p className="text-primary mb-6 text-sm">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
          <button onClick={onCancel} className="flex-1 border border-white/10 text-muted py-2 rounded-lg text-sm hover:text-primary transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function PropertyForm({ initial, onSave, onCancel, addToast }) {
  const [form, setForm] = useState(initial ? { ...initial, images: initial.images || [] } : EMPTY_FORM);
  const [amenityInput, setAmenityInput] = useState('');
  const [uploading, setUploading] = useState(false);

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleAmenityKey(e) {
    if (e.key === 'Enter' && amenityInput.trim()) {
      e.preventDefault();
      setF('amenities', [...form.amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  }

  function removeAmenity(i) { setF('amenities', form.amenities.filter((_, idx) => idx !== i)); }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files).slice(0, 5 - form.images.length);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadImage(f)));
      setF('images', [...form.images, ...urls].slice(0, 5));
    } catch {
      addToast('Image upload failed. Try again.', 'error');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i) {
    setF('images', form.images.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const listing = {
      ...form,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      floorArea: Number(form.floorArea) || 0,
      lotArea: Number(form.lotArea) || 0,
      parking: Number(form.parking) || 0,
      yearBuilt: Number(form.yearBuilt) || 0,
      images: form.images.filter(Boolean),
      views: form.views || 0,
    };
    await onSave(listing);
  }

  const inputCls = "w-full bg-navy border border-white/10 rounded-xl px-4 py-2.5 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors";
  const labelCls = "text-muted text-xs mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Property Title *</label>
          <input required value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. Modern 3BR House in Cebu City" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Property Type</label>
          <select value={form.type} onChange={e => setF('type', e.target.value)} className={inputCls}>
            {['House', 'Condo', 'House & Lot', 'Lot Only', 'Commercial'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Listing Status</label>
          <div className="flex gap-3 mt-1">
            {['For Sale', 'For Rent'].map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setF('status', s)} className="accent-gold" />
                <span className="text-primary text-sm">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Price (₱) *</label>
          <input required type="number" value={form.price} onChange={e => setF('price', e.target.value)} placeholder="e.g. 4500000" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Location / City *</label>
          <input required value={form.location} onChange={e => setF('location', e.target.value)} placeholder="e.g. Cebu City" className={inputCls} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Full Address</label>
          <textarea rows={2} value={form.address} onChange={e => setF('address', e.target.value)} placeholder="Street, Subdivision, City, Province" className={`${inputCls} resize-none`} />
        </div>

        {[['Bedrooms', 'bedrooms'], ['Bathrooms', 'bathrooms'], ['Floor Area (sqm)', 'floorArea'], ['Lot Area (sqm)', 'lotArea'], ['Parking Slots', 'parking'], ['Year Built', 'yearBuilt']].map(([label, key]) => (
          <div key={key}>
            <label className={labelCls}>{label}</label>
            <input type="number" value={form[key]} onChange={e => setF(key, e.target.value)} placeholder="0" className={inputCls} />
          </div>
        ))}

        <div>
          <label className={labelCls}>Furnishing</label>
          <select value={form.furnishing} onChange={e => setF('furnishing', e.target.value)} className={inputCls}>
            {['Bare', 'Semi-Furnished', 'Fully Furnished'].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Description</label>
          <textarea rows={4} value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Describe the property..." className={`${inputCls} resize-none`} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Amenities (press Enter to add)</label>
          <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} onKeyDown={handleAmenityKey}
            placeholder="e.g. Swimming Pool" className={inputCls} />
          {form.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.amenities.map((a, i) => (
                <span key={i} className="flex items-center gap-1 bg-gold/10 border border-gold/30 text-gold text-xs px-3 py-1 rounded-full">
                  {a}
                  <button type="button" onClick={() => removeAmenity(i)}><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Property Images (up to 5)</label>
          <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors bg-navy/50 group
            ${form.images.length >= 5 ? 'border-white/10 opacity-50 cursor-not-allowed' : 'border-white/20 hover:border-gold/50'}`}>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={form.images.length >= 5 || uploading} />
            <div className="flex flex-col items-center gap-2 text-muted group-hover:text-primary transition-colors">
              {uploading
                ? <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                : <Upload size={28} />}
              <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Click to upload or drag & drop'}</span>
              <span className="text-xs">PNG, JPG, WEBP — {5 - form.images.length} slot{5 - form.images.length !== 1 ? 's' : ''} remaining</span>
            </div>
          </label>
          {form.images.filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {form.images.filter(Boolean).map((img, i) => (
                <div key={i} className="relative group/img">
                  <img src={img} alt="" className="w-20 h-16 object-cover rounded-xl border border-white/10" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <X size={10} className="text-white" />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-gold text-navy px-1 rounded font-bold">MAIN</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>Agent Name</label>
          <input value={form.agentName} onChange={e => setF('agentName', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Agent Phone</label>
          <input value={form.agentPhone} onChange={e => setF('agentPhone', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Agent Email</label>
          <input type="email" value={form.agentEmail} onChange={e => setF('agentEmail', e.target.value)} className={inputCls} />
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setF('visible', !form.visible)}
            className={`w-12 h-6 rounded-full transition-colors relative ${form.visible ? 'bg-gold' : 'bg-white/20'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.visible ? 'left-7' : 'left-1'}`} />
          </button>
          <span className="text-primary text-sm">{form.visible ? 'Visible to public' : 'Hidden from public'}</span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2">
          <Check size={16} /> Save Listing
        </button>
        <button type="button" onClick={onCancel} className="border border-white/10 text-muted px-6 py-2.5 rounded-xl hover:text-primary transition-colors text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminDashboard({ listings, setListings, onLogout, addToast, reloadListings }) {
  const [view, setView] = useState('overview');
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSave(listing) {
    try {
      if (listing.id && listings.find(l => l.id === listing.id)) {
        const { id, ...data } = listing;
        await updateListing(id, data);
      } else {
        await addListing(listing);
      }
      await reloadListings();
      addToast('Property saved successfully!', 'success');
      setView('listings');
    } catch {
      addToast('Failed to save property.', 'error');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteListing(id);
      await reloadListings();
      addToast('Property deleted.', 'success');
    } catch {
      addToast('Failed to delete property.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  async function toggleVisibility(id) {
    const prop = listings.find(l => l.id === id);
    if (!prop) return;
    try {
      await updateListing(id, { visible: !prop.visible });
      await reloadListings();
    } catch {
      addToast('Failed to update visibility.', 'error');
    }
  }

  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0);
  const forSale = listings.filter(l => l.status === 'For Sale').length;
  const forRent = listings.filter(l => l.status === 'For Rent').length;
  const recent = [...listings].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 5);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'My Listings', icon: List },
    { id: 'add', label: 'Add Property', icon: PlusCircle },
  ];

  const pageTitles = { overview: 'Overview', listings: 'My Listings', add: 'Add Property', edit: 'Edit Property' };

  function NavItem({ item }) {
    const Icon = item.icon;
    const active = view === item.id;
    return (
      <button onClick={() => { setView(item.id); setSidebarOpen(false); }}
        className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-colors
          ${active ? 'bg-gold/10 text-gold border border-gold/20' : 'text-muted hover:text-primary hover:bg-white/5'}`}>
        <Icon size={16} />{item.label}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-card border-r border-white/10 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="font-serif text-xl text-primary font-bold">LuxeRealty</h1>
          <p className="text-muted text-xs mt-1">Admin Portal</p>
        </div>
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm">M</div>
          <div>
            <p className="text-primary text-sm font-semibold">Maria Santos</p>
            <p className="text-muted text-xs">Agent</p>
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(item => <NavItem key={item.id} item={item} />)}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-navy/90 backdrop-blur border-b border-white/10 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted hover:text-primary">
              <Menu size={20} />
            </button>
            <h2 className="font-serif text-lg text-primary font-semibold">{pageTitles[view] || 'Dashboard'}</h2>
          </div>
          <button className="text-muted hover:text-primary relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {/* Overview */}
          {view === 'overview' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Home} label="Total Listings" value={listings.length} color="bg-gold/10 text-gold" />
                <StatCard icon={TrendingUp} label="For Sale" value={forSale} color="bg-emerald-500/10 text-emerald-400" />
                <StatCard icon={Building2} label="For Rent" value={forRent} color="bg-blue-500/10 text-blue-400" />
                <StatCard icon={Layers} label="Total Views" value={totalViews.toLocaleString()} color="bg-purple-500/10 text-purple-400" />
              </div>

              <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                  <h3 className="font-serif text-primary font-semibold">Recent Listings</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Property', 'Type', 'Price', 'Status', 'Date'].map(h => (
                          <th key={h} className="text-left text-muted text-xs font-medium px-6 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map(p => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-3 text-primary font-medium">{p.title}</td>
                          <td className="px-6 py-3 text-muted">{p.type}</td>
                          <td className="px-6 py-3 text-gold">{formatPrice(p.price, p.status)}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full border
                              ${p.status === 'For Sale' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-muted">{new Date(p.dateAdded).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* My Listings */}
          {view === 'listings' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => setView('add')} className="bg-gold text-navy text-sm font-semibold px-4 py-2 rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2">
                  <PlusCircle size={15} /> Add Property
                </button>
              </div>
              <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Property', 'Type', 'Price', 'Status', 'Visible', 'Actions'].map(h => (
                          <th key={h} className="text-left text-muted text-xs font-medium px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {listings.length === 0 && (
                        <tr><td colSpan={6} className="text-center text-muted py-10">No listings yet.</td></tr>
                      )}
                      {listings.map(p => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" onError={e => e.target.style.display='none'} />
                                : <div className="w-10 h-10 rounded-lg bg-navy border border-white/10 flex items-center justify-center text-muted"><Home size={14} /></div>
                              }
                              <span className="text-primary font-medium line-clamp-1 max-w-[160px]">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted">{p.type}</td>
                          <td className="px-4 py-3 text-gold">{formatPrice(p.price, p.status)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full border
                              ${p.status === 'For Sale' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs ${p.visible ? 'text-emerald-400' : 'text-muted'}`}>
                              {p.visible ? 'Visible' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditTarget(p); setView('edit'); }} className="text-muted hover:text-gold transition-colors" title="Edit">
                                <Pencil size={15} />
                              </button>
                              <button onClick={() => toggleVisibility(p.id)} className="text-muted hover:text-blue-400 transition-colors" title="Toggle visibility">
                                {p.visible ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                              <button onClick={() => setDeleteTarget(p.id)} className="text-muted hover:text-red-400 transition-colors" title="Delete">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Add Property */}
          {view === 'add' && (
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <PropertyForm onSave={handleSave} onCancel={() => setView('listings')} addToast={addToast} />
            </div>
          )}

          {/* Edit Property */}
          {view === 'edit' && editTarget && (
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <PropertyForm initial={editTarget} onSave={handleSave} onCancel={() => setView('listings')} addToast={addToast} />
            </div>
          )}
        </main>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message="Are you sure you want to delete this listing? This action cannot be undone."
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
