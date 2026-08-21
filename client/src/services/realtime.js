// Cross-Tab & Local Realtime BroadcastChannel
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('smart_resto_realtime_hub');
  }
} catch (e) {
  console.log("BroadcastChannel mavjud emas:", e);
}

// Realtime xabar yuborish (Lokal oynalar va tablar uchun)
export const broadcastRealtimeUpdate = (type, payload) => {
  const message = {
    type,
    payload,
    timestamp: Date.now()
  };

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(message);
    } catch (e) {}
  }

  try {
    localStorage.setItem('smart_resto_realtime_ping', JSON.stringify({
      type,
      time: Date.now()
    }));
  } catch (e) {}
};

// Realtime tinglovchi ulanishi
export const subscribeToRealtimeUpdates = (callback) => {
  const handleBroadcast = (event) => {
    if (event && event.data) {
      callback(event.data);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  const handleStorage = (event) => {
    if (event.key === 'smart_resto_realtime_ping') {
      callback({
        type: 'STORAGE_SYNC',
        key: event.key,
        timestamp: Date.now()
      });
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
};
