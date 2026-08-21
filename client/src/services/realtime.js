import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  broadcastToSupabase, 
  subscribeSupabaseRealtime 
} from './supabase';

// 1. Cross-Tab Realtime BroadcastChannel
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('smart_resto_realtime_hub');
  }
} catch (e) {
  console.log("BroadcastChannel mavjud emas:", e);
}

// Realtime xabar yuborish (Barcha qurilmalarga)
export const broadcastRealtimeUpdate = (type, payload) => {
  const message = {
    type,
    payload,
    timestamp: Date.now()
  };

  // A. Localhost / Bir xil qurilma tablariga uzatish (0ms)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(message);
    } catch (e) {}
  }

  // B. Supabase Cloud orqali barcha masofaviy telefon va kompyuterlarga uzatish (< 100ms)
  broadcastToSupabase('smart_resto_sync', message);

  // C. LocalStorage ping
  try {
    localStorage.setItem('smart_resto_realtime_ping', JSON.stringify({
      type,
      time: Date.now()
    }));
  } catch (e) {}
};

// Realtime tinglovchi ulanishi
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

  // B. Supabase Realtime tinglash (Masofaviy qurilmalar)
  const unsubscribeSupabase = subscribeSupabaseRealtime((data) => {
    callback(data);
  });

  // C. Window Storage Event tinglash
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

  // Tozalash
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
    if (unsubscribeSupabase) unsubscribeSupabase();
  };
};

export { getSupabaseCredentials, saveSupabaseCredentials };
