import { db } from '../firebase';
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, serverTimestamp, Timestamp
} from 'firebase/firestore';

const COL = 'listings';
const DEV_COL = 'developers';
const PROFILE_COL = 'profile';
const PROPERTY_TYPE_COL = 'propertyTypes';
const UNIT_TYPE_COL = 'unitTypes';

const DEFAULT_PROFILE = {
  name: 'Juvy C. Espina',
  picture: '/Juvy.jpg',
  bio: 'Discover curated luxury properties across Bohol\'s most sought-after locations. Your dream home is just a search away.',
};

const DEFAULT_PROPERTY_TYPES = ['House', 'Condo', 'House & Lot', 'Lot Only', 'Commercial'];
const DEFAULT_UNIT_TYPES = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Penthouse', 'Townhouse'];

export const SEED_LISTINGS = [
  {
    title: 'Modern 3BR House in Cebu City',
    type: 'House', status: 'For Sale', price: 4500000,
    location: 'Cebu City', address: '123 Mango Ave, Cebu City, Cebu',
    bedrooms: 3, bathrooms: 2, floorArea: 120, lotArea: 200, parking: 2,
    furnishing: 'Semi-Furnished', yearBuilt: 2020,
    description: 'A beautiful modern house nestled in the heart of Cebu City. Features open-plan living, premium finishes, and a landscaped garden.',
    amenities: ['Swimming Pool', 'Gym', '24/7 Security', 'CCTV'],
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
    agentName: 'Juvy C. Espina', agentPhone: '+63 912 345 6789', agentEmail: 'juvy@luxerealty.com',
    visible: true, views: 84,
  },
  {
    title: 'Elegant 1BR Condo in Mandaue City',
    type: 'Condo', status: 'For Sale', price: 2200000,
    location: 'Mandaue City', address: 'Tower 2, Skyrise Residences, Mandaue City, Cebu',
    bedrooms: 1, bathrooms: 1, floorArea: 42, lotArea: 0, parking: 1,
    furnishing: 'Fully Furnished', yearBuilt: 2022,
    description: 'Stylish high-rise condo unit with stunning city views. Fully furnished with modern appliances. Ideal for young professionals and investors.',
    amenities: ['Rooftop Pool', 'Fitness Center', 'Concierge', 'Sky Lounge'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
    agentName: 'Juvy C. Espina', agentPhone: '+63 912 345 6789', agentEmail: 'juvy@luxerealty.com',
    visible: true, views: 61,
  },
  {
    title: 'Spacious House & Lot in Talisay',
    type: 'House & Lot', status: 'For Sale', price: 6800000,
    location: 'Talisay City', address: '45 Coral Drive, South Hills Subdivision, Talisay City, Cebu',
    bedrooms: 4, bathrooms: 3, floorArea: 220, lotArea: 350, parking: 2,
    furnishing: 'Bare', yearBuilt: 2019,
    description: 'Grand house and lot in a prestigious subdivision in Talisay. Expansive living spaces, high ceilings, and a large garden perfect for family living.',
    amenities: ['Clubhouse', 'Basketball Court', 'Jogging Path', '24/7 Security', 'Playground'],
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80'],
    agentName: 'Juvy C. Espina', agentPhone: '+63 912 345 6789', agentEmail: 'juvy@luxerealty.com',
    visible: true, views: 112,
  },
  {
    title: 'Prime Commercial Space in IT Park',
    type: 'Commercial', status: 'For Rent', price: 35000,
    location: 'Cebu City', address: 'Ground Floor, Cybergate Tower, IT Park, Lahug, Cebu City',
    bedrooms: 0, bathrooms: 2, floorArea: 85, lotArea: 0, parking: 2,
    furnishing: 'Bare', yearBuilt: 2018,
    description: 'Premium commercial space in the heart of Cebu IT Park. High foot traffic, surrounded by BPO companies, restaurants, and hotels.',
    amenities: ['24/7 Access', 'CCTV', 'Backup Power', 'High-Speed Internet Ready'],
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
    agentName: 'Juvy C. Espina', agentPhone: '+63 912 345 6789', agentEmail: 'juvy@luxerealty.com',
    visible: true, views: 47,
  },
  {
    title: 'Residential Lot in Lapu-Lapu City',
    type: 'Lot Only', status: 'For Sale', price: 1200000,
    location: 'Lapu-Lapu City', address: 'Block 7, Lot 12, Mactan Seaside Estates, Lapu-Lapu City, Cebu',
    bedrooms: 0, bathrooms: 0, floorArea: 0, lotArea: 150, parking: 0,
    furnishing: 'Bare', yearBuilt: 0,
    description: 'Clean titled residential lot in a gated community near Mactan-Cebu International Airport. Perfect for building your dream home.',
    amenities: ['Gated Community', 'Concrete Roads', 'Underground Utilities'],
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'],
    agentName: 'Juvy C. Espina', agentPhone: '+63 912 345 6789', agentEmail: 'juvy@luxerealty.com',
    visible: true, views: 29,
  },
];

export async function fetchDevelopers() {
  const q = query(collection(db, DEV_COL), orderBy('dateAdded', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchPropertyTypes() {
  const q = query(collection(db, PROPERTY_TYPE_COL), orderBy('label', 'asc'));
  const snap = await getDocs(q);
  if (snap.empty) {
    await Promise.all(DEFAULT_PROPERTY_TYPES.map(label => addDoc(collection(db, PROPERTY_TYPE_COL), { label, dateAdded: serverTimestamp() })));
    return DEFAULT_PROPERTY_TYPES;
  }

  return snap.docs.map(d => ({ id: d.id, ...d.data() })).map(item => item.label);
}

export async function addPropertyType(label) {
  const trimmed = label.trim();
  if (!trimmed) return null;

  const snap = await getDocs(query(collection(db, PROPERTY_TYPE_COL), where('label', '==', trimmed)));
  if (!snap.empty) return trimmed;

  await addDoc(collection(db, PROPERTY_TYPE_COL), { label: trimmed, dateAdded: serverTimestamp() });
  return trimmed;
}

export async function fetchUnitTypes() {
  const q = query(collection(db, UNIT_TYPE_COL), orderBy('label', 'asc'));
  const snap = await getDocs(q);
  if (snap.empty) {
    await Promise.all(DEFAULT_UNIT_TYPES.map(label => addDoc(collection(db, UNIT_TYPE_COL), { label, dateAdded: serverTimestamp() })));
    return DEFAULT_UNIT_TYPES;
  }

  return snap.docs.map(d => ({ id: d.id, ...d.data() })).map(item => item.label);
}

export async function addUnitType(label) {
  const trimmed = label.trim();
  if (!trimmed) return null;

  const snap = await getDocs(query(collection(db, UNIT_TYPE_COL), where('label', '==', trimmed)));
  if (!snap.empty) return trimmed;

  await addDoc(collection(db, UNIT_TYPE_COL), { label: trimmed, dateAdded: serverTimestamp() });
  return trimmed;
}

export async function fetchProfile() {
  const snap = await getDocs(collection(db, PROFILE_COL));
  if (snap.empty) {
    const ref = await addDoc(collection(db, PROFILE_COL), { ...DEFAULT_PROFILE, dateAdded: serverTimestamp() });
    return { id: ref.id, ...DEFAULT_PROFILE };
  }

  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function updateProfile(id, data) {
  if (!id) {
    const ref = await addDoc(collection(db, PROFILE_COL), { ...DEFAULT_PROFILE, ...data, dateAdded: serverTimestamp() });
    return ref.id;
  }

  await updateDoc(doc(db, PROFILE_COL, id), data);
}

export async function addDeveloper(data) {
  const ref = await addDoc(collection(db, DEV_COL), { ...data, dateAdded: serverTimestamp() });
  return ref.id;
}

export async function updateDeveloper(id, data) {
  await updateDoc(doc(db, DEV_COL, id), data);
}

export async function deleteDeveloper(id) {
  await deleteDoc(doc(db, DEV_COL, id));
}

export async function fetchListings() {
  const q = query(collection(db, COL), orderBy('dateAdded', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addListing(data) {
  const ref = await addDoc(collection(db, COL), { ...data, dateAdded: serverTimestamp() });
  return ref.id;
}

export async function updateListing(id, data) {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteListing(id) {
  await deleteDoc(doc(db, COL, id));
}

export async function seedIfEmpty() {
  const snap = await getDocs(collection(db, COL));
  if (snap.empty) {
    await Promise.all(SEED_LISTINGS.map(l => addDoc(collection(db, COL), { ...l, dateAdded: serverTimestamp() })));
  }
}

export async function uploadImage(file) {
  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(url, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Image upload failed');
  const json = await res.json();
  return json.secure_url;
}

export async function uploadVideo(file) {
  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(url, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Video upload failed');
  const json = await res.json();
  return json.secure_url;
}

const INQ = 'inquiries';

export async function addInquiry(data) {
  const tenMinutesAgo = Timestamp.fromMillis(Date.now() - 10 * 60 * 1000);
  const recentSnap = await getDocs(query(
    collection(db, INQ),
    where('email', '==', data.email),
    where('createdAt', '>=', tenMinutesAgo)
  ));
  if (recentSnap.size >= 3) throw new Error('rate_limited');
  const ref = await addDoc(collection(db, INQ), { ...data, read: false, createdAt: serverTimestamp() });
  return ref.id;
}

export async function fetchInquiries() {
  const q = query(collection(db, INQ), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function markInquiryRead(id) {
  await updateDoc(doc(db, INQ, id), { read: true });
}

export function formatPrice(price, status) {
  const formatted = new Intl.NumberFormat('en-PH').format(price);
  return status === 'For Rent' ? `₱${formatted}/mo` : `₱${formatted}`;
}
