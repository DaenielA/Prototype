import { useState } from 'react';
import { Search, MapPin, Bed, Bath, Maximize2, X, ChevronLeft, ChevronRight, Phone, Mail, Send, Building2, Home, Layers } from 'lucide-react';
import { formatPrice, addInquiry } from '../data/seed';

const TYPE_ICON = { House: Home, Condo: Building2, 'House & Lot': Home, Commercial: Building2, 'Lot Only': Layers };

function ImageWithFallback({ src, alt, type, className, onClick }) {
  const [err, setErr] = useState(false);
  const Icon = TYPE_ICON[type] || Home;
  if (err || !src) return (
    <div className={`${className} bg-card flex flex-col items-center justify-center gap-2 text-muted`}>
      <Icon size={32} />
      <span className="text-xs">{type}</span>
    </div>
  );
  return <img src={src} alt={alt} className={className} onClick={onClick} onError={() => setErr(true)} />;
}

function PropertyCard({ property, onClick }) {
  return (
    <div onClick={() => onClick(property)}
      className="bg-card/80 border border-white/10 rounded-[28px] overflow-hidden cursor-pointer group hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 backdrop-blur-sm">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={property.images?.[0]}
          alt={property.title}
          type={property.type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 bg-gold text-navy text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg">
          {property.type}
        </span>
        <span className={`absolute top-3 right-3 text-[11px] font-semibold px-3 py-1 rounded-full border ${property.status === 'For Sale' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
          {property.status}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-serif text-primary font-semibold text-lg leading-snug line-clamp-2">{property.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-muted text-xs mb-3">
          <MapPin size={12} /><span>{property.location}</span>
        </div>
        <p className="text-gold font-semibold text-xl mb-3">{formatPrice(property.price, property.status)}</p>
        <div className="grid grid-cols-3 gap-2 text-muted text-xs border-t border-white/10 pt-3">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={12} />{property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath size={12} />{property.bathrooms}</span>}
          {(property.floorArea > 0 || property.lotArea > 0) && <span className="flex items-center gap-1"><Maximize2 size={12} />{property.floorArea || property.lotArea} sqm</span>}
        </div>
      </div>
    </div>
  );
}

function LightBox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  function prev(e) { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }
  function next(e) { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={28} /></button>
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-3 transition-colors">
        <ChevronLeft size={28} />
      </button>
      <img src={images[idx]} alt="" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-3 transition-colors">
        <ChevronRight size={28} />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
            className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-gold' : 'bg-white/40'}`} />
        ))}
      </div>
      <span className="absolute bottom-4 right-6 text-white/50 text-sm">{idx + 1} / {images.length}</span>
    </div>
  );
}

function PropertyModal({ property, onClose, addToast }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [sending, setSending] = useState(false);
  const [refNumber, setRefNumber] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const images = property.images?.length ? property.images : [null];

  async function submitInquiry(e) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const id = await addInquiry({
        propertyId: property.id,
        propertyTitle: property.title,
        name: form.name,
        email: form.email,
        message: form.message,
      });
      setRefNumber(id.slice(0, 8).toUpperCase());
    } catch (err) {
      if (err.message === 'rate_limited') {
        addToast('Too many inquiries. Please wait 10 minutes before trying again.', 'error');
      } else {
        addToast('Failed to send inquiry. Try again.', 'error');
      }
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Image Gallery */}
        <div className="relative aspect-video bg-navy">
          <ImageWithFallback src={images[imgIdx]} alt={property.title} type={property.type}
            className="w-full h-full object-cover rounded-t-2xl cursor-zoom-in" onClick={() => images[imgIdx] && setLightbox(true)} />
          {images.length > 1 && (
            <>
              <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors">
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-gold' : 'bg-white/40'}`} />
                ))}
              </div>
            </>
          )}
          <button onClick={onClose}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        {lightbox && images[0] && (
          <LightBox images={images.filter(Boolean)} startIdx={imgIdx} type={property.type} onClose={() => setLightbox(false)} />
        )}
        {images.length > 1 && (
          <div className="flex gap-2 px-6 pt-3">
            {images.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-gold' : 'border-transparent'}`}>
                <ImageWithFallback src={img} alt="" type={property.type} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full border border-gold/30">{property.type}</span>
            <span className={`text-xs px-2 py-1 rounded-full border
              ${property.status === 'For Sale' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
              {property.status}
            </span>
          </div>

          <h2 className="font-serif text-2xl text-primary font-bold mb-1">{property.title}</h2>
          <div className="flex items-center gap-1 text-muted text-sm mb-2"><MapPin size={14} />{property.address}</div>
          <p className="text-gold text-2xl font-bold mb-4">{formatPrice(property.price, property.status)}</p>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {[
              property.unitType && ['Unit Type', property.unitType],
              property.bedrooms > 0 && ['Bedrooms', property.bedrooms],
              property.bathrooms > 0 && ['Bathrooms', property.bathrooms],
              property.floorArea > 0 && ['Floor Area', `${property.floorArea} sqm`],
              property.lotArea > 0 && ['Lot Area', `${property.lotArea} sqm`],
              property.parking > 0 && ['Parking', property.parking],
              property.furnishing && ['Furnishing', property.furnishing],
              property.yearBuilt > 0 && ['Year Built', property.yearBuilt],
            ].filter(Boolean).map(([label, val]) => (
              <div key={label} className="bg-navy rounded-xl p-3 border border-white/10">
                <p className="text-muted text-xs mb-1">{label}</p>
                <p className="text-primary text-sm font-semibold">{val}</p>
              </div>
            ))}
          </div>

          {property.description && (
            <div className="bg-navy border border-white/10 rounded-xl p-4 mb-4">
              <h4 className="text-primary font-semibold text-sm mb-2">Description</h4>
              <p className="text-muted text-sm leading-relaxed">{property.description}</p>
            </div>
          )}

          {property.amenities?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-primary font-semibold text-sm mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(a => (
                  <span key={a} className="bg-navy border border-white/10 text-muted text-xs px-3 py-1 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}

          {property.videos?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-primary font-semibold text-sm mb-2">Videos</h4>
              <div className="flex flex-col gap-3">
                {property.videos.map((vid, i) => (
                  <video key={i} src={vid} controls className="w-full rounded-xl border border-white/10" />
                ))}
              </div>
            </div>
          )}

          {/* Agent Info */}
          <div className="bg-navy border border-white/10 rounded-xl p-4 mb-4">
            <h4 className="text-primary font-semibold text-sm mb-3">Listed by</h4>
            <p className="text-primary font-semibold">{property.agentName}</p>
            <div className="flex flex-col gap-1 mt-2">
              <a href={`tel:${property.agentPhone}`} className="flex items-center gap-2 text-muted text-sm hover:text-gold transition-colors">
                <Phone size={13} />{property.agentPhone}
              </a>
              <a href={`mailto:${property.agentEmail}`} className="flex items-center gap-2 text-muted text-sm hover:text-gold transition-colors">
                <Mail size={13} />{property.agentEmail}
              </a>
            </div>
          </div>

          {!showInquiry && !refNumber && (
            <button onClick={() => setShowInquiry(true)}
              className="w-full bg-gold text-navy font-semibold py-3 rounded-xl hover:bg-yellow-400 transition-colors">
              Inquire Now
            </button>
          )}

          {refNumber && (
            <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-xl p-4 text-center">
              <p className="text-emerald-400 font-semibold text-sm mb-1">Inquiry Sent!</p>
              <p className="text-muted text-xs mb-2">The agent will contact you shortly.</p>
              <p className="text-primary text-xs">Reference No: <span className="font-bold text-gold tracking-widest">{refNumber}</span></p>
            </div>
          )}

          {showInquiry && !refNumber && (
            <form onSubmit={submitInquiry} className="flex flex-col gap-3 border border-gold/30 rounded-xl p-4">
              <h4 className="text-primary font-semibold text-sm">Send an Inquiry</h4>
              <input required placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-navy border border-white/10 rounded-lg px-4 py-2 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold" />
              <input required type="email" placeholder="Your Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="bg-navy border border-white/10 rounded-lg px-4 py-2 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold" />
              <textarea required rows={3} placeholder="Your message..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="bg-navy border border-white/10 rounded-lg px-4 py-2 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold resize-none" />
              <div className="flex gap-2">
                <button type="submit" disabled={sending} className="flex-1 bg-gold text-navy font-semibold py-2 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {sending ? <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" /> : <><Send size={14} /> Send</>}
                </button>
                <button type="button" onClick={() => setShowInquiry(false)}
                  className="px-4 py-2 border border-white/10 text-muted rounded-lg hover:text-primary transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicView({ listings, developers, profile, onAdminClick, addToast }) {
  const [filters, setFilters] = useState({ type: 'All', location: '', minPrice: '', maxPrice: '' });
  const [selected, setSelected] = useState(null);
  const [activeDev, setActiveDev] = useState(null);
  const [publicTab, setPublicTab] = useState('home');
  const [listingSection, setListingSection] = useState('brokerage');

  const visible = listings.filter(p => p.visible);
  const brokerageListings = visible.filter(p => p.listingType !== 'developer' && p.listingType !== 'memorial' && !p.developerId);
  const developerListings = visible.filter(p => p.developerId || p.listingType === 'developer');
  const memorialListings = visible.filter(p => p.listingType === 'memorial');

  const featuredStats = [
    { label: 'Premium Listings', value: visible.length },
    { label: 'Developer Pipelines', value: developers.length },
    { label: 'Memorial Lots', value: memorialListings.length },
  ];

  const currentListings = listingSection === 'developer'
    ? (activeDev ? developerListings.filter(p => p.developerId === activeDev) : [])
    : listingSection === 'brokerage'
      ? brokerageListings
      : memorialListings;

  const filtered = currentListings.filter(p => {
    if (filters.type !== 'All' && p.type !== filters.type) return false;
    if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
    return true;
  });

  function setF(key, val) { setFilters(f => ({ ...f, [key]: val })); }

  return (
    <div className="min-h-screen bg-navy font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-navy/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="Logo" className="h-14 w-14 object-contain rounded-full border-2 border-primary bg-white p-0.5" />
            <span className="font-serif font-bold text-primary text-lg hidden sm:inline">{profile?.name || 'Homes By Juvy'}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm text-muted">
              <button onClick={() => setPublicTab('home')} className={`px-3 py-1.5 rounded-full transition-colors ${publicTab === 'home' ? 'bg-gold/15 text-gold' : 'hover:text-primary'}`}>Home</button>
              <button onClick={() => setPublicTab('listings')} className={`px-3 py-1.5 rounded-full transition-colors ${publicTab === 'listings' ? 'bg-gold/15 text-gold' : 'hover:text-primary'}`}>Listings</button>
              <a href="#footer" className="px-3 py-1.5 rounded-full hover:text-primary transition-colors">Contact</a>
            </div>
            <button onClick={onAdminClick}
              className="text-xs border border-gold/40 text-gold px-3 py-1.5 rounded-lg hover:bg-gold/10 transition-colors">
              Agent Login
            </button>
          </div>
        </div>
      </nav>

      {publicTab === 'home' && (
        <section id="home" className="relative pt-8 min-h-[70vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-card to-navy" />
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'url(/Juvy.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-end">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <img src={profile?.picture || '/Juvy.jpg'} alt={profile?.name || 'Agent'} className="w-14 h-14 rounded-full object-cover border-2 border-gold/40" />
                  <div>
                    <p className="text-gold text-sm font-semibold tracking-widest uppercase">Premium Properties in Bohol</p>
                    <p className="text-primary font-serif text-lg font-semibold">{profile?.name || 'Juvy C. Espina'}</p>
                  </div>
                </div>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-primary font-bold leading-tight mb-6">
                  Find Your<br /><span className="text-gold">Perfect Home</span>
                </h1>
                <p className="text-muted text-lg mb-10 leading-relaxed max-w-xl">
                  {profile?.bio || 'Discover curated luxury properties across Bohol\'s most sought-after locations. Your dream home is just a search away.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setPublicTab('listings')} className="bg-gold text-navy font-semibold px-5 py-3 rounded-xl hover:bg-yellow-400 transition-colors">Explore Listings</button>
                  <a href="#footer" className="border border-white/15 text-primary px-5 py-3 rounded-xl hover:border-gold/40 hover:text-gold transition-colors">Contact Agent</a>
                </div>
              </div>

              <div className="bg-card/75 border border-white/10 rounded-[28px] p-4 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <div className="grid grid-cols-3 gap-3">
                  {featuredStats.map(stat => (
                    <div key={stat.label} className="bg-navy/60 border border-white/10 rounded-2xl p-3 text-center">
                      <p className="text-gold text-xl font-bold">{stat.value}</p>
                      <p className="text-muted text-[11px] mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-navy/70 border border-gold/20 p-4">
                  <p className="text-gold text-xs uppercase tracking-[0.3em] mb-2">Signature Service</p>
                  <p className="text-primary text-sm leading-relaxed">Luxury, clarity, and a smooth buying experience — from first search to final paperwork.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {publicTab === 'listings' && (
        <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="sticky top-20 z-10 bg-card/80 backdrop-blur-xl border border-white/10 rounded-[26px] p-4 sm:p-6 mb-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select value={filters.type} onChange={e => setF('type', e.target.value)}
                className="bg-navy border border-white/10 rounded-xl px-4 py-3 text-primary text-sm focus:outline-none focus:border-gold transition-colors">
                {['All', 'House', 'Condo', 'House & Lot', 'Commercial', 'Lot Only'].map(t => (
                  <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
                ))}
              </select>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input placeholder="Location / City" value={filters.location} onChange={e => setF('location', e.target.value)}
                  className="w-full bg-navy border border-white/10 rounded-xl pl-9 pr-4 py-3 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors" />
              </div>
              <input type="number" placeholder="Min Price (₱)" value={filters.minPrice} onChange={e => setF('minPrice', e.target.value)}
                className="bg-navy border border-white/10 rounded-xl px-4 py-3 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors" />
              <input type="number" placeholder="Max Price (₱)" value={filters.maxPrice} onChange={e => setF('maxPrice', e.target.value)}
                className="bg-navy border border-white/10 rounded-xl px-4 py-3 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold transition-colors" />
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={() => setPublicTab('listings')} className="w-full sm:w-auto bg-gold text-navy font-semibold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2">
                <Search size={16} /> Search Properties
              </button>
              {(filters.type !== 'All' || filters.location || filters.minPrice || filters.maxPrice) && (
                <button onClick={() => setFilters({ type: 'All', location: '', minPrice: '', maxPrice: '' })}
                  className="w-full sm:w-auto border border-white/20 text-muted px-8 py-3 rounded-xl hover:text-primary hover:border-white/40 transition-colors flex items-center gap-2 text-sm">
                  <X size={15} /> Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                ['brokerage', 'Brokerage Listings'],
                ['developer', 'Developer Listings'],
                ['memorial', 'Memorial Lots'],
              ].map(([key, label]) => (
                <button key={key} onClick={() => { setListingSection(key); if (key !== 'developer') setActiveDev(null); }} className={`px-4 py-2 rounded-full border text-sm transition-colors ${listingSection === key ? 'bg-gold/10 border-gold/40 text-gold' : 'border-white/10 text-muted hover:text-primary'}`}>
                  {label}
                </button>
              ))}
            </div>

            {listingSection === 'developer' && developers.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-8">
                {developers.map(d => {
                  const count = visible.filter(p => p.developerId === d.id).length;
                  const isActive = activeDev === d.id;
                  return (
                    <button key={d.id} onClick={() => { setActiveDev(isActive ? null : d.id); setFilters({ type: 'All', location: '', minPrice: '', maxPrice: '' }); }} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${isActive ? 'bg-gold/10 border-gold/40 text-gold' : 'bg-card border-white/10 text-primary hover:border-gold/30'}`}>
                      {d.logo ? <img src={d.logo} alt={d.name} className="w-10 h-8 object-contain" /> : <Building2 size={20} className="text-muted" />}
                      <div className="text-left">
                        <p className="text-sm font-semibold leading-tight">{d.name}</p>
                        <p className="text-xs text-muted">{count} propert{count !== 1 ? 'ies' : 'y'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">Portfolio</p>
                <h2 className="font-serif text-3xl sm:text-4xl text-primary font-bold">
                  {listingSection === 'developer' ? (activeDev ? developers.find(d => d.id === activeDev)?.name + ' Properties' : 'Developer Listings') : listingSection === 'memorial' ? 'Memorial Lots' : 'Brokerage Listings'}
                </h2>
              </div>
              <span className="text-muted text-sm">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted">
              <Home size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No properties match your search.</p>
              <button onClick={() => setFilters({ type: 'All', location: '', minPrice: '', maxPrice: '' })}
                className="mt-4 text-gold text-sm hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => <PropertyCard key={p.id} property={p} onClick={setSelected} />)}
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer id="footer" className="border-t border-white/10 bg-card/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <img src="/Logo.png" alt="Logo" className="h-14 w-14 object-contain rounded-full border-2 border-primary bg-white p-0.5 mb-2" />
              <p className="text-muted text-sm leading-relaxed">Your premier property partner. Connecting buyers and sellers with exceptional real estate.</p>
            </div>
            <div>
              <h4 className="text-primary font-semibold text-sm mb-3">Contact</h4>
              <div className="flex flex-col gap-2 text-muted text-sm">
                <span>Juvy E. Amolat,REB</span>
                <a href="tel:+639123456789" className="hover:text-gold transition-colors">+63175902973</a>
                <a href="mailto:juvy@luxerealty.com" className="hover:text-gold transition-colors">juvyespina@gmail.com</a>
              </div>
            </div>
            <div>
              <h4 className="text-primary font-semibold text-sm mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/juvy.espina.realty.listings" target="_blank" rel="noreferrer" className="text-muted text-xs border border-white/10 px-3 py-1.5 rounded-lg hover:border-gold/40 hover:text-gold transition-colors">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-muted text-xs">
            © {new Date().getFullYear()} Homes By Juvy. All rights reserved.
          </div>
        </div>
      </footer>

      {selected && <PropertyModal property={selected} onClose={() => setSelected(null)} addToast={addToast} />}
    </div>
  );
}
