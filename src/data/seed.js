import { db } from '../firebase';
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp
} from 'firebase/firestore';

const COL = 'listings';

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

export function formatPrice(price, status) {
  const formatted = new Intl.NumberFormat('en-PH').format(price);
  return status === 'For Rent' ? `₱${formatted}/mo` : `₱${formatted}`;
}
