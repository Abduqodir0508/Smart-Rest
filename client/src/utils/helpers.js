// Valyutani o'zbek so'mida chiroyli formatlash
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 so'm";
  return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + " so'm";
};

// Sana va vaqtni formatlash
export const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Faqat vaqtni ko'rsatish (HH:mm)
export const formatTime = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Buyurtma qabul qilinganidan beri o'tgan vaqt (minutlarda)
export const getElapsedMinutes = (dateString) => {
  if (!dateString) return 0;
  const diff = Date.now() - new Date(dateString).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60)));
};

// Web Audio API orqali oshxona va kassa uchun yoqimli bildirishnoma qo'ng'irog'i (Chime)
export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // 1-ohang (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // 2-ohang (880 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn("Audio chime ijro etishda xatolik:", err);
  }
};

// Buyurtma statuslari matnlari va ranglari
export const STATUS_CONFIG = {
  pending: {
    label: "Kutilmoqda",
    badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    bgClass: "bg-amber-500",
    textClass: "text-amber-400",
    nextStatus: "preparing",
    nextLabel: "Tayyorlashni boshlash"
  },
  preparing: {
    label: "Tayyorlanmoqda",
    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse",
    bgClass: "bg-blue-500",
    textClass: "text-blue-400",
    nextStatus: "ready",
    nextLabel: "Tayyor deb belgilash"
  },
  ready: {
    label: "Tayyor",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-400",
    nextStatus: "served",
    nextLabel: "Mijozga topshirildi"
  },
  served: {
    label: "Yetkazilgan",
    badgeClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    bgClass: "bg-purple-500",
    textClass: "text-purple-400",
    nextStatus: null,
    nextLabel: null
  },
  cancelled: {
    label: "Bekor qilingan",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    bgClass: "bg-red-500",
    textClass: "text-red-400",
    nextStatus: null,
    nextLabel: null
  }
};

// To'lov usullari
export const PAYMENT_METHODS = {
  cash: { label: "Naqd pul", icon: "Banknote" },
  card: { label: "Bank kartasi (Humo/Uzcard)", icon: "CreditCard" },
  click_payme: { label: "Click / Payme / QR", icon: "QrCode" }
};
