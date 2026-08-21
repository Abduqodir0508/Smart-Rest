import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push } from 'firebase/database';
import { createClient } from '@supabase/supabase-js';

// Standart / Default Firebase Realtime DB sozlamalari
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDummyKeyForSmartRestoRealtime2026",
  authDomain: "smart-resto-pos.firebaseapp.com",
  databaseURL: "https://smart-resto-pos-default-rtdb.firebaseio.com",
  projectId: "smart-resto-pos",
  storageBucket: "smart-resto-pos.appspot.com",
  messagingSenderId: "1029384756",
  appId: "1:1029384756:web:smartrestopos2026"
};

// LocalStorage kalitlari
const LS_CLOUD_CONFIG = 'smart_resto_cloud_config_v1';

// Cloud konfiguratsiyasini olish
export const getCloudConfig = () => {
  try {
    const saved = localStorage.getItem(LS_CLOUD_CONFIG);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Cloud config o'qishda xatolik:", e);
  }
  return {
    provider: 'broadcast', // 'supabase', 'firebase', 'broadcast'
    supabaseUrl: '',
    supabaseAnonKey: '',
    firebaseConfig: DEFAULT_FIREBASE_CONFIG
  };
};

export const saveCloudConfig = (config) => {
  try {
    localStorage.setItem(LS_CLOUD_CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    return false;
  }
};

// 1. Cross-Tab & Device Realtime BroadcastChannel
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('smart_resto_realtime_hub');
  }
} catch (e) {
  console.log("BroadcastChannel qo'llab-quvvatlanmadi:", e);
}

// 2. Supabase Realtime Client (agar ulangan bo'lsa)
let supabaseClient = null;
let supabaseSubscription = null;

export const initSupabase = (url, anonKey, onDataUpdate) => {
  if (!url || !anonKey) return null;
  try {
    supabaseClient = createClient(url, anonKey);
    const channel = supabaseClient.channel('smart-resto-room');

    channel
      .on('broadcast', { event: 'resto_sync' }, (payload) => {
        if (payload && payload.payload) {
          onDataUpdate(payload.payload);
        }
      })
      .subscribe();

    supabaseSubscription = channel;
    return supabaseClient;
  } catch (e) {
    console.warn("Supabase ulanishda xatolik:", e);
    return null;
  }
};

// Realtime xabar yuborish (Barcha ulangan ekranlarga)
export const broadcastRealtimeUpdate = (type, payload) => {
  const message = {
    type,
    payload,
    timestamp: Date.now(),
    senderId: typeof window !== 'undefined' ? window.name || Math.random().toString() : 'server'
  };

  // 1. Brauzerlar o'rtasida darhol uzatish (0ms)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(message);
    } catch (e) {
      console.warn("Broadcast xatolik:", e);
    }
  }

  // 2. Supabase orqali masofaviy qurilmalarga yuborish (Telefon <-> Kassa <-> Oshxona)
  if (supabaseSubscription) {
    try {
      supabaseSubscription.send({
        type: 'broadcast',
        event: 'resto_sync',
        payload: message
      });
    } catch (e) {
      console.warn("Supabase broadcast xatolik:", e);
    }
  }

  // 3. LocalStorage storage eventini chaqirish (eski brauzerlar va qo'shni tablar uchun)
  try {
    localStorage.setItem('smart_resto_realtime_ping', JSON.stringify({
      type,
      time: Date.now()
    }));
  } catch (e) {}
};

// Realtime tinglovchi ulanishi (Listen)
export const subscribeToRealtimeUpdates = (callback) => {
  // A. BroadcastChannel tinglash
  const handleBroadcast = (event) => {
    if (event && event.data) {
      callback(event.data);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // B. Window Storage Event tinglash (Cross-device / Cross-tab)
  const handleStorage = (event) => {
    if (event.key === 'smart_resto_orders_v1' || event.key === 'smart_resto_tables_v1' || event.key === 'smart_resto_realtime_ping') {
      callback({
        type: 'STORAGE_SYNC',
        key: event.key,
        timestamp: Date.now()
      });
    }
  };

  window.addEventListener('storage', handleStorage);

  // Unsubscribe funksiyasi
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
    if (supabaseSubscription && supabaseClient) {
      supabaseClient.removeChannel(supabaseSubscription);
    }
  };
};
