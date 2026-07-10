import { useState } from 'react';
import { Search, MapPin, Bed, Bath, Maximize2, X, ChevronLeft, ChevronRight, Phone, Mail, Send, Building2, Home, Layers } from 'lucide-react';
import { formatPrice } from '../data/seed';

const TYPE_ICON = { House: Home, Condo: Building2, 'House & Lot': Home, Commercial: Building2, 'Lot Only': Layers };

function ImageWithFallback({ src, alt, type, className }) {
  const [err, setErr] = useState(false);
  const Icon = TYPE_ICON[type] || Home;
  if (err || !src) return (
    <div className={`${className} bg-card flex flex-col items-center justify-center gap-2 text-muted`}>
      <Icon size={32} />
      <span className="text-xs">{type}</span>
    </div>
  );
  return <img src={src} alt={alt} className={className} onError={() => setErr(true)} />;
}

function PropertyCard({ property, onClick }) {
  return (
    <div onClick={() => onClick(property)}
      className="bg-card border border-white/10 rounded-2xl overflow-hidden cursor-pointer group hover:-translate-y-1 hover:border-gold/40 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={property.images?.[0]}
          alt={property.title}
          type={property.type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-gold text-navy text-xs font-semibold px-2 py-1 rounded-full">
          {property.type}
        </span>
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full
          ${property.status === 'For Sale' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
          {property.status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-primary font-semibold text-base leading-snug mb-1 line-clamp-2">{property.title}</h3>
        <div className="flex items-center gap-1 text-muted text-xs mb-3">
          <MapPin size={12} /><span>{property.location}</span>
        </div>
        <p className="text-gold font-semibold text-lg mb-3">{formatPrice(property.price, property.status)}</p>
        <div className="flex items-center gap-3 text-muted text-xs border-t border-white/10 pt-3">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={12} />{property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath size={12} />{property.bathrooms}</span>}
          {property.floorArea > 0 && <span className="flex items-center gap-1"><Maximize2 size={12} />{property.floorArea} sqm</span>}
          {property.lotArea > 0 && !property.floorArea && <span className="flex items-center gap-1"><Maximize2 size={12} />{property.lotArea} sqm lot</span>}
        </div>
      </div>
    </div>
  );
}

function PropertyModal({ property, onClose, addToast }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const images = property.images?.length ? property.images : [null];

  function submitInquiry(e) {
    e.preventDefault();
    addToast('Inquiry sent! The agent will contact you shortly.', 'success');
    setShowInquiry(false);
    setForm({ name: '', email: '', message: '' });
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Image Gallery */}
        <div className="relative aspect-video bg-navy">
          <ImageWithFallback src={images[imgIdx]} alt={property.title} type={property.type}
            className="w-full h-full object-cover rounded-t-2xl" />
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

        {/* Thumbnails */}
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
            <div className="mb-4">
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

          {!showInquiry ? (
            <button onClick={() => setShowInquiry(true)}
              className="w-full bg-gold text-navy font-semibold py-3 rounded-xl hover:bg-yellow-400 transition-colors">
              Inquire Now
            </button>
          ) : (
            <form onSubmit={submitInquiry} className="flex flex-col gap-3 border border-gold/30 rounded-xl p-4">
              <h4 className="text-primary font-semibold text-sm">Send an Inquiry</h4>
              <input required placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-navy border border-white/10 rounded-lg px-4 py-2 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold" />
              <input required type="email" placeholder="Your Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="bg-navy border border-white/10 rounded-lg px-4 py-2 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold" />
              <textarea required rows={3} placeholder="Your message..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="bg-navy border border-white/10 rounded-lg px-4 py-2 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-gold resize-none" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-gold text-navy font-semibold py-2 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
                  <Send size={14} /> Send
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

export default function PublicView({ listings, onAdminClick, addToast }) {
  const [filters, setFilters] = useState({ type: 'All', location: '', minPrice: '', maxPrice: '' });
  const [selected, setSelected] = useState(null);

  const visible = listings.filter(p => p.visible);

  const filtered = visible.filter(p => {
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
      <nav className="fixed top-0 left-0 right-0 z-30 bg-navy/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="Logo" className="h-9 w-auto object-contain" />
            <span className="hidden sm:inline text-muted text-xs">Your Premier Property Partner</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm text-muted">
              <a href="#home" className="hover:text-primary transition-colors">Home</a>
              <a href="#listings" className="hover:text-primary transition-colors">Listings</a>
              <a href="#footer" className="hover:text-primary transition-colors">Contact</a>
            </div>
            <button onClick={onAdminClick}
              className="text-xs border border-gold/40 text-gold px-3 py-1.5 rounded-lg hover:bg-gold/10 transition-colors">
              Agent Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="relative pt-16 min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1117] via-[#1a1d27] to-[#0f1117]" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="max-w-2xl">
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-4">Premium Properties in Cebu</p>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-primary font-bold leading-tight mb-6">
              Find Your<br /><span className="text-gold">Perfect Home</span>
            </h1>
            <p className="text-muted text-lg mb-10 leading-relaxed">
              Discover curated luxury properties across Bohol's most sought-after locations. Your dream home is just a search away.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-card/90 backdrop-blur border border-white/10 rounded-2xl p-4 sm:p-6 max-w-4xl">
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
            <button onClick={() => {}} className="mt-3 w-full sm:w-auto bg-gold text-navy font-semibold px-8 py-3 rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2">
              <Search size={16} /> Search Properties
            </button>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">Portfolio</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-primary font-bold">Available Properties</h2>
          </div>
          <span className="text-muted text-sm">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</span>
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

      {/* Footer */}
      <footer id="footer" className="border-t border-white/10 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <img src="/Logo.png" alt="Logo" className="h-10 w-auto object-contain mb-2" />
              <p className="text-muted text-sm leading-relaxed">Your premier property partner. Connecting buyers and sellers with exceptional real estate.</p>
            </div>
            <div>
              <h4 className="text-primary font-semibold text-sm mb-3">Contact</h4>
              <div className="flex flex-col gap-2 text-muted text-sm">
                <span>Juvy C. Espina</span>
                <a href="tel:+639123456789" className="hover:text-gold transition-colors">+63 912 345 6789</a>
                <a href="mailto:juvy@luxerealty.com" className="hover:text-gold transition-colors">juvy@luxerealty.com</a>
              </div>
            </div>
            <div>
              <h4 className="text-primary font-semibold text-sm mb-3">Follow Us</h4>
              <div className="flex gap-3">
                {['Facebook', 'Instagram', 'LinkedIn'].map(s => (
                  <a key={s} href="#" className="text-muted text-xs border border-white/10 px-3 py-1.5 rounded-lg hover:border-gold/40 hover:text-gold transition-colors">{s}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-muted text-xs">
            © {new Date().getFullYear()} YUPPRealty. All rights reserved.
          </div>
        </div>
      </footer>

      {selected && <PropertyModal property={selected} onClose={() => setSelected(null)} addToast={addToast} />}
    </div>
  );
}
