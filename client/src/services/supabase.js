import { createClient } from '@supabase/supabase-js';

// Environment variables yoki LocalStorage dan Supabase konfiguratsiyasini olish
const LS_SUPABASE_URL = 'smart_resto_supabase_url';
const LS_SUPABASE_KEY = 'smart_resto_supabase_key';

export const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(LS_SUPABASE_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(LS_SUPABASE_KEY) || '' : '';

  return {
    url: localUrl || envUrl,
    key: localKey || envKey
  };
};

export const saveSupabaseCredentials = (url, key) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(LS_SUPABASE_URL, url.trim());
    else localStorage.removeItem(LS_SUPABASE_URL);

    if (key) localStorage.setItem(LS_SUPABASE_KEY, key.trim());
    else localStorage.removeItem(LS_SUPABASE_KEY);
  }
};

let supabaseInstance = null;
let activeChannel = null;

// Supabase mijozini yaratish va Realtime kanaliga ulanish
export const getSupabaseClient = () => {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    } catch (err) {
      console.warn("Supabase mijozini ishga tushirishda xatolik:", err);
      return null;
    }
  }

  return supabaseInstance;
};

// Realtime xabarlar uzatish (Ofitsiant -> Oshxona / Kassa)
export const broadcastToSupabase = (event, payload) => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    if (!activeChannel) {
      activeChannel = client.channel('smart_resto_channel');
      activeChannel.subscribe();
    }

    activeChannel.send({
      type: 'broadcast',
      event: event || 'smart_resto_sync',
      payload: {
        ...payload,
        senderTime: Date.now()
      }
    });
    return true;
  } catch (err) {
    console.warn("Supabase orqali uzatishda xatolik:", err);
    return false;
  }
};

// Realtime xabarlarni tinglash
export const subscribeSupabaseRealtime = (callback) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  try {
    const channel = client.channel('smart_resto_channel');

    channel
      .on('broadcast', { event: 'smart_resto_sync' }, (data) => {
        if (data && data.payload) {
          callback(data.payload);
        }
      })
      .subscribe((status) => {
        console.log("📡 Supabase Realtime ulanish holati:", status);
      });

    activeChannel = channel;

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Supabase tinglovchi ulanishida xatolik:", err);
    return () => {};
  }
};
