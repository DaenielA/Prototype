
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, List, PlusCircle, LogOut, Bell, Trash2, Pencil, Eye, EyeOff,
  TrendingUp, Home, Building2, Layers, X, Check, Menu, Upload, UserCircle
} from 'lucide-react';
import { formatPrice, addListing, updateListing, deleteListing, uploadImage, uploadVideo, fetchInquiries, markInquiryRead, addDeveloper, updateDeveloper, deleteDeveloper, updateProfile, addPropertyType, addUnitType } from '../data/seed';

const EMPTY_FORM = {
  title: '', type: 'House', status: 'For Sale', price: '', location: '', address: '',
  bedrooms: '', bathrooms: '', floorArea: '', lotArea: '', parking: '', furnishing: 'Bare',
  yearBuilt: '', description: '', amenities: [], images: [], videos: [],
  agentName: 'Juvy C. Espina', agentPhone: '+63 912 345 6789', agentEmail: 'juvy@luxerealty.com',
  visible: true, listingType: 'brokerage', developerId: '',
};

const EMPTY_DEV_FORM = { name: '', description: '', logo: '' };
const EMPTY_PROFILE_FORM = { name: '', picture: '', bio: '' };


function StatCard({ icon, label, value, color }) {
  const Icon = icon;
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

function DeveloperForm({ initial, onSave, onCancel, addToast }) {
  const [form, setForm] = useState(initial ? { ...initial } : EMPTY_DEV_FORM);
  const [uploading, setUploading] = useState(false);

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(f => ({ ...f, logo: url }));
    } catch {
      addToast('Logo upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave(form);
  }

  const inputCls = "w-full bg-navy border border-white/10 rounded-xl px-4 py-2.5 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors";
  const labelCls = "text-muted text-xs mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-4">
      <div>
        <label className={labelCls}>Developer Name *</label>
        <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Camella Homes" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." className={`${inputCls} resize-none`} />
      </div>
      <div>
        <label className={labelCls}>Logo</label>
        {form.logo && <img src={form.logo} alt="logo" className="w-20 h-14 object-contain rounded-lg border border-white/10 mb-2" />}
        <label className="flex items-center gap-3 cursor-pointer border border-dashed border-white/20 hover:border-gold/50 rounded-xl px-4 py-3 transition-colors">
          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
          {uploading ? <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" /> : <Upload size={16} className="text-muted" />}
          <span className="text-muted text-sm">{uploading ? 'Uploading...' : 'Upload logo'}</span>
        </label>
      </div>
      <div className="flex gap-3 mt-2">
        <button type="submit" className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2">
          <Check size={16} /> Save Developer
        </button>
        <button type="button" onClick={onCancel} className="border border-white/10 text-muted px-6 py-2.5 rounded-xl hover:text-primary transition-colors text-sm">Cancel</button>
      </div>
    </form>
  );
}

function ProfileForm({ initial, onSave, onCancel, addToast }) {
  const [form, setForm] = useState(initial ? { ...EMPTY_PROFILE_FORM, ...initial } : EMPTY_PROFILE_FORM);
  const [uploading, setUploading] = useState(false);

  async function handlePictureUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(f => ({ ...f, picture: url }));
    } catch {
      addToast('Profile photo upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave(form);
  }

  const inputCls = "w-full bg-navy border border-white/10 rounded-xl px-4 py-2.5 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors";
  const labelCls = "text-muted text-xs mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-4">
      <div>
        <label className={labelCls}>Agent / Broker Name *</label>
        <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Profile Picture</label>
        {form.picture && <img src={form.picture} alt="Profile" className="w-24 h-24 rounded-full object-cover border border-white/10 mb-3" />}
        <label className="flex items-center gap-3 cursor-pointer border border-dashed border-white/20 hover:border-gold/50 rounded-xl px-4 py-3 transition-colors">
          <input type="file" accept="image/*" className="hidden" onChange={handlePictureUpload} disabled={uploading} />
          {uploading ? <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" /> : <Upload size={16} className="text-muted" />}
          <span className="text-muted text-sm">{uploading ? 'Uploading...' : 'Upload profile photo'}</span>
        </label>
      </div>
      <div>
        <label className={labelCls}>Bio / Public Description</label>
        <textarea rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short bio shown on the public view..." className={`${inputCls} resize-none`} />
      </div>
      <div className="flex gap-3 mt-2">
        <button type="submit" className="bg-gold text-navy font-semibold px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2">
          <Check size={16} /> Save Profile
        </button>
        <button type="button" onClick={onCancel} className="border border-white/10 text-muted px-6 py-2.5 rounded-xl hover:text-primary transition-colors text-sm">Cancel</button>
      </div>
    </form>
  );
}

function PropertyForm({ initial, onSave, onCancel, addToast, developers, propertyTypes, unitTypes }) {
  const [form, setForm] = useState(initial ? { ...EMPTY_FORM, ...initial, images: initial.images || [], videos: initial.videos || [] } : EMPTY_FORM);
  const [availablePropertyTypes, setAvailablePropertyTypes] = useState(propertyTypes?.length ? propertyTypes : ['House', 'Condo', 'House & Lot', 'Lot Only', 'Commercial']);
  const [availableUnitTypes, setAvailableUnitTypes] = useState(unitTypes || []);
  const [amenityInput, setAmenityInput] = useState('');
  const [propertyTypeInput, setPropertyTypeInput] = useState('');
  const [unitTypeInput, setUnitTypeInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const ADD_PROPERTY_TYPE_OPTION = '__add_property_type';
  const ADD_UNIT_TYPE_OPTION = '__add_unit_type';

  useEffect(() => {
    if (Array.isArray(propertyTypes) && propertyTypes.length) {
      setAvailablePropertyTypes(propertyTypes);
    }
  }, [propertyTypes]);

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

  async function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadVideo(file);
      setF('videos', [...(form.videos || []), url].slice(0, 3));
    } catch {
      addToast('Video upload failed. Try again.', 'error');
    } finally {
      setUploadingVideo(false);
    }
  }

  function removeVideo(i) {
    setF('videos', form.videos.filter((_, idx) => idx !== i));
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
      videos: (form.videos || []).filter(Boolean),
      unitType: form.unitType || '',
      views: form.views || 0,
    };
    await onSave(listing);
  }

  async function addPropertyTypeOption() {
    const trimmed = propertyTypeInput.trim();
    if (!trimmed) return;
    try {
      await addPropertyType(trimmed);
      setAvailablePropertyTypes(prev => [...new Set([...prev, trimmed])]);
      setF('type', trimmed);
      setPropertyTypeInput('');
      addToast('Property type saved.', 'success');
    } catch {
      addToast('Failed to save property type.', 'error');
    }
  }

  async function addUnitTypeOption() {
    const trimmed = unitTypeInput.trim();
    if (!trimmed) return;
    try {
      await addUnitType(trimmed);
      setAvailableUnitTypes(prev => [...new Set([...prev, trimmed])]);
      setForm(f => ({ ...f, unitType: trimmed }));
      setUnitTypeInput('');
      addToast('Unit type saved.', 'success');
    } catch {
      addToast('Failed to save unit type.', 'error');
    }
  }

  const inputCls = "w-full bg-navy border border-white/10 rounded-xl px-4 py-2.5 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors";
  const labelCls = "text-muted text-xs mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Listing Category</label>
          <div className="flex flex-wrap gap-4 mt-1 mb-1">
            {[
              ['brokerage', 'Brokerage Listing'],
              ['developer', 'Under a Developer'],
              ['memorial', 'Memorial Lot'],
            ].map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="listingType" value={val} checked={(form.listingType || 'brokerage') === val}
                  onChange={() => { setF('listingType', val); if (val !== 'developer') setF('developerId', ''); }}
                  className="accent-gold" />
                <span className="text-primary text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {form.listingType === 'developer' && (
          <div className="sm:col-span-2">
            <label className={labelCls}>Developer *</label>
            <select value={form.developerId} onChange={e => setF('developerId', e.target.value)} className={inputCls}>
              <option value="">-- Select Developer --</option>
              {(developers || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className={labelCls}>Property Title *</label>
          <input required value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. Modern 3BR House in Cebu City" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Property Type</label>
          <div className="flex flex-col gap-2">
            <select value={form.type} onChange={e => setF('type', e.target.value)} className={inputCls}>
              {(availablePropertyTypes || []).map(type => <option key={type} value={type}>{type}</option>)}
              <option value={ADD_PROPERTY_TYPE_OPTION}>Add Property Type</option>
            </select>
            {form.type === ADD_PROPERTY_TYPE_OPTION && (
              <div className="flex gap-2">
                <input value={propertyTypeInput} onChange={e => setPropertyTypeInput(e.target.value)} placeholder="Add property type" className={`${inputCls} flex-1`} />
                <button type="button" onClick={addPropertyTypeOption} className="bg-gold text-navy px-3 rounded-xl text-sm font-semibold">Add</button>
              </div>
            )}
          </div>
        </div>

        {(form.type === 'Condo' || form.type === 'House & Lot') && (
          <div>
            <label className={labelCls}>Unit Type</label>
            <div className="flex flex-col gap-2">
              <select value={form.unitType || ''} onChange={e => {
                const nextValue = e.target.value;
                setF('unitType', nextValue);
              }} className={inputCls}>
                <option value="">-- Select Unit Type --</option>
                {(availableUnitTypes || []).map(type => <option key={type} value={type}>{type}</option>)}
                <option value={ADD_UNIT_TYPE_OPTION}>Add Unit Type</option>
              </select>
              {form.unitType === ADD_UNIT_TYPE_OPTION && (
                <div className="flex gap-2">
                  <input value={unitTypeInput} onChange={e => setUnitTypeInput(e.target.value)} placeholder="Add unit type" className={`${inputCls} flex-1`} />
                  <button type="button" onClick={addUnitTypeOption} className="bg-gold text-navy px-3 rounded-xl text-sm font-semibold">Add</button>
                </div>
              )}
            </div>
          </div>
        )}

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

        <div className="sm:col-span-2">
          <label className={labelCls}>Property Videos (up to 3)</label>
          <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl py-6 cursor-pointer transition-colors bg-navy/50 group
            ${(form.videos || []).length >= 3 ? 'border-white/10 opacity-50 cursor-not-allowed' : 'border-white/20 hover:border-gold/50'}`}>
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={(form.videos || []).length >= 3 || uploadingVideo} />
            <div className="flex flex-col items-center gap-2 text-muted group-hover:text-primary transition-colors">
              {uploadingVideo
                ? <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                : <Upload size={28} />}
              <span className="text-sm font-medium">{uploadingVideo ? 'Uploading...' : 'Click to upload video'}</span>
              <span className="text-xs">MP4, MOV, WEBM — {3 - (form.videos || []).length} slot{3 - (form.videos || []).length !== 1 ? 's' : ''} remaining</span>
            </div>
          </label>
          {(form.videos || []).length > 0 && (
            <div className="flex flex-col gap-2 mt-3">
              {form.videos.map((vid, i) => (
                <div key={i} className="flex items-center gap-3 bg-navy border border-white/10 rounded-xl px-4 py-2">
                  <video src={vid} className="w-20 h-12 object-cover rounded-lg" />
                  <span className="text-muted text-xs truncate flex-1">Video {i + 1}</span>
                  <button type="button" onClick={() => removeVideo(i)} className="text-red-400 hover:text-red-300">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
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

export default function AdminDashboard({ listings, developers, profile, propertyTypes, unitTypes, onLogout, addToast, reloadListings }) {
  const [view, setView] = useState('overview');
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [showInquiries, setShowInquiries] = useState(false);
  const [devEditTarget, setDevEditTarget] = useState(null);
  const [devDeleteTarget, setDevDeleteTarget] = useState(null);
  const [listingTab, setListingTab] = useState('brokerage');

  useEffect(() => {
    fetchInquiries().then(setInquiries).catch(() => {});
  }, []);

  const unreadCount = inquiries.filter(i => !i.read).length;

  async function openInquiries() {
    setShowInquiries(true);
    const unread = inquiries.filter(i => !i.read);
    await Promise.all(unread.map(i => markInquiryRead(i.id)));
    setInquiries(prev => prev.map(i => ({ ...i, read: true })));
  }

  async function handleSave(listing) {
    try {
      const normalized = {
        ...listing,
        listingType: listing.listingType === 'independent' ? 'brokerage' : (listing.listingType || 'brokerage'),
        developerId: listing.listingType === 'developer' ? listing.developerId : '',
      };

      if (normalized.id && listings.find(l => l.id === normalized.id)) {
        const { id, ...data } = normalized;
        await updateListing(id, data);
      } else {
        await addListing(normalized);
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
  const brokerageListings = listings.filter(l => l.listingType !== 'developer' && l.listingType !== 'memorial' && !l.developerId);
  const developerListings = listings.filter(l => l.listingType === 'developer' || l.developerId);
  const memorialListings = listings.filter(l => l.listingType === 'memorial');
  const currentListingSet = listingTab === 'brokerage' ? brokerageListings : listingTab === 'developer' ? developerListings : memorialListings;

  async function handleDevSave(data) {
    try {
      if (devEditTarget?.id) {
        await updateDeveloper(devEditTarget.id, data);
      } else {
        await addDeveloper(data);
      }
      await reloadListings();
      addToast('Developer saved!', 'success');
      setView('developers');
      setDevEditTarget(null);
    } catch {
      addToast('Failed to save developer.', 'error');
    }
  }

  async function handleDevDelete(id) {
    try {
      await deleteDeveloper(id);
      await reloadListings();
      addToast('Developer deleted.', 'success');
    } catch {
      addToast('Failed to delete developer.', 'error');
    } finally {
      setDevDeleteTarget(null);
    }
  }

  async function handleProfileSave(data) {
    try {
      await updateProfile(profile?.id, data);
      await reloadListings();
      addToast('Profile updated successfully!', 'success');
      setView('profile');
    } catch {
      addToast('Failed to update profile.', 'error');
    }
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'My Listings', icon: List },
    { id: 'developers', label: 'Developers', icon: Building2 },
    { id: 'add', label: 'Add Property', icon: PlusCircle },
  ];

  const pageTitles = { overview: 'Overview', listings: 'My Listings', add: 'Add Property', edit: 'Edit Property', developers: 'Developers', addDev: 'Add Developer', editDev: 'Edit Developer', profile: 'Profile' };

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
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <img src="/Logo.png" alt="Logo" className="h-10 w-10 object-contain rounded-full border-2 border-primary bg-white p-0.5" />
          <div>
            <p className="text-primary text-sm font-serif font-bold leading-tight">Homes By Juvy</p>
            <p className="text-muted text-xs">Admin Portal</p>
          </div>
        </div>
        <button type="button" onClick={() => { setView('profile'); setSidebarOpen(false); }} className="p-4 border-b border-white/10 flex items-center gap-3 text-left w-full hover:bg-white/5 transition-colors">
          <img src={profile?.picture || '/Juvy.jpg'} alt={profile?.name || 'Agent'} className="w-9 h-9 rounded-full object-cover border-2 border-gold/40" />
          <div>
            <p className="text-primary text-sm font-semibold">{profile?.name || 'Juvy C. Espina'}</p>
            <p className="text-muted text-xs">Agent</p>
          </div>
        </button>
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
          <button onClick={openInquiries} className="text-muted hover:text-primary relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full text-navy text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
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
                          <td className="px-6 py-3 text-muted">{p.dateAdded?.toDate ? p.dateAdded.toDate().toLocaleDateString() : new Date(p.dateAdded).toLocaleDateString()}</td>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    ['brokerage', 'Brokerage Listings'],
                    ['developer', 'Developer Listings'],
                    ['memorial', 'Memorial Lots'],
                  ].map(([key, label]) => (
                    <button key={key} onClick={() => setListingTab(key)} className={`px-4 py-2 rounded-xl border text-sm transition-colors ${listingTab === key ? 'bg-gold/10 border-gold/40 text-gold' : 'border-white/10 text-muted hover:text-primary'}`}>
                      {label}
                    </button>
                  ))}
                </div>
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
                      {currentListingSet.length === 0 && (
                        <tr><td colSpan={6} className="text-center text-muted py-10">No {listingTab === 'brokerage' ? 'brokerage listings' : listingTab === 'developer' ? 'developer listings' : 'memorial lots'} yet.</td></tr>
                      )}
                      {currentListingSet.map(p => (
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
              <PropertyForm onSave={handleSave} onCancel={() => setView('listings')} addToast={addToast} developers={developers} propertyTypes={propertyTypes} unitTypes={unitTypes} />
            </div>
          )}

          {/* Edit Property */}
          {view === 'edit' && editTarget && (
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <PropertyForm initial={editTarget} onSave={handleSave} onCancel={() => setView('listings')} addToast={addToast} developers={developers} propertyTypes={propertyTypes} unitTypes={unitTypes} />
            </div>
          )}

          {/* Developers */}
          {view === 'developers' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => { setDevEditTarget(null); setView('addDev'); }} className="bg-gold text-navy text-sm font-semibold px-4 py-2 rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2">
                  <PlusCircle size={15} /> Add Developer
                </button>
              </div>
              <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {['Logo', 'Name', 'Description', 'Listings', 'Actions'].map(h => (
                          <th key={h} className="text-left text-muted text-xs font-medium px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {developers.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-muted py-10">No developers yet.</td></tr>
                      )}
                      {developers.map(d => (
                        <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            {d.logo
                              ? <img src={d.logo} alt={d.name} className="w-12 h-10 object-contain rounded-lg border border-white/10" />
                              : <div className="w-12 h-10 rounded-lg bg-navy border border-white/10 flex items-center justify-center text-muted"><Building2 size={14} /></div>}
                          </td>
                          <td className="px-4 py-3 text-primary font-semibold">{d.name}</td>
                          <td className="px-4 py-3 text-muted max-w-[200px] truncate">{d.description || '—'}</td>
                          <td className="px-4 py-3 text-gold">{listings.filter(l => l.developerId === d.id).length}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setDevEditTarget(d); setView('editDev'); }} className="text-muted hover:text-gold transition-colors"><Pencil size={15} /></button>
                              <button onClick={() => setDevDeleteTarget(d.id)} className="text-muted hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
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

          {view === 'addDev' && (
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <DeveloperForm onSave={handleDevSave} onCancel={() => setView('developers')} addToast={addToast} />
            </div>
          )}

          {view === 'editDev' && devEditTarget && (
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <DeveloperForm initial={devEditTarget} onSave={handleDevSave} onCancel={() => setView('developers')} addToast={addToast} />
            </div>
          )}

          {view === 'profile' && (
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <ProfileForm initial={profile || EMPTY_PROFILE_FORM} onSave={handleProfileSave} onCancel={() => setView('overview')} addToast={addToast} />
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

      {devDeleteTarget && (
        <ConfirmDialog
          message="Delete this developer? Listings under it will become independent."
          onConfirm={() => handleDevDelete(devDeleteTarget)}
          onCancel={() => setDevDeleteTarget(null)}
        />
      )}

      {showInquiries && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-end p-4" onClick={() => setShowInquiries(false)}>
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto mt-16 mr-2" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="font-serif text-primary font-semibold">Inquiries</h3>
              <button onClick={() => setShowInquiries(false)} className="text-muted hover:text-primary"><X size={18} /></button>
            </div>
            {inquiries.length === 0 ? (
              <p className="text-muted text-sm text-center py-10">No inquiries yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {inquiries.map(inq => (
                  <div key={inq.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-primary text-sm font-semibold">{inq.name}</p>
                      <span className="text-muted text-xs shrink-0">
                        {inq.createdAt?.toDate ? inq.createdAt.toDate().toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-gold text-xs mb-1">{inq.propertyTitle}</p>
                    <a href={`mailto:${inq.email}`} className="text-blue-400 hover:text-blue-300 text-xs mb-1 block transition-colors">{inq.email}</a>
                    <p className="text-muted text-sm leading-relaxed">{inq.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
