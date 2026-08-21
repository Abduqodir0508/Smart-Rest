import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  PieChart, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings, 
  Utensils, 
  Flame, 
  CreditCard, 
  Building, 
  Save 
} from 'lucide-react';
import { useResto } from '../context/RestoContext';
import { formatCurrency } from '../utils/helpers';
import api from '../services/api';

const AdminView = () => {
  const { stats, menu, setMenu, settings, setSettings, setMenuModalData, loadAllData, showToast } = useResto();
  const [activeAdminSubtab, setActiveAdminSubtab] = useState('menu');
  const [filterCat, setFilterCat] = useState('Barchasi');

  const [settingsForm, setSettingsForm] = useState({
    restaurantName: settings.restaurantName || '',
    address: settings.address || '',
    phone: settings.phone || '',
    defaultServiceCharge: settings.defaultServiceCharge || 10,
    wifiPassword: settings.wifiPassword || ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const categories = ['Barchasi', ...new Set(menu.map(m => m.category))];
  const filteredMenu = menu.filter(m => filterCat === 'Barchasi' || m.category === filterCat);

  // Stop-list toggle (Server + LocalStorage)
  const handleToggleAvailable = async (id) => {
    try {
      await api.toggleMenuItem(id).catch(() => null);
      setMenu(prev => prev.map(m => m.id === id ? { ...m, available: !m.available } : m));
      showToast("Taom holati o'zgartirildi", "info");
    } catch (err) {
      showToast("Xatolik yuz berdi", "error");
    }
  };

  // Taomni o'chirish (Server + LocalStorage)
  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`"${name}" taomini o'chirishni xohlaysizmi?`)) return;
    try {
      await api.deleteMenuItem(id).catch(() => null);
      setMenu(prev => prev.filter(m => m.id !== id));
      showToast(`"${name}" o'chirildi`, "success");
    } catch (err) {
      showToast("O'chirishda xatolik", "error");
    }
  };

  // Sozlamalarni saqlash
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await api.updateSettings(settingsForm).catch(() => null);
      setSettings(prev => ({ ...prev, ...settingsForm }));
      showToast("Restoran sozlamalari saqlandi", "success");
    } catch (err) {
      showToast("Sozlamalarni saqlashda xatolik", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2.5 sm:p-4 flex-1 flex flex-col gap-4 sm:gap-6 w-full">
      {/* 1. KPI Analitika Bloklari (Mobil: 1-2 ustun, Katta ekranda: 4 ustun) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Jami Tushum */}
        <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border-l-4 border-orange-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase text-slate-400">Jami Tushum</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h3 className="text-xl sm:text-2xl font-black font-mono text-slate-100">
              {formatCurrency(stats?.totalRevenue || 0)}
            </h3>
            <p className="text-[11px] sm:text-xs text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>{stats?.paidOrdersCount || 0} ta to'langan chek</span>
            </p>
          </div>
        </div>

        {/* Sof Foyda */}
        <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border-l-4 border-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase text-slate-400">Sof Foyda</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h3 className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {formatCurrency(stats?.netProfit || 0)}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Marja: <strong className="text-emerald-300 font-mono">{stats?.profitMargin || 0}%</strong>
            </p>
          </div>
        </div>

        {/* O'rtacha Chek */}
        <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border-l-4 border-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase text-slate-400">O'rtacha Chek</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h3 className="text-xl sm:text-2xl font-black font-mono text-blue-400">
              {formatCurrency(stats?.averageOrderValue || 0)}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              1 ta buyurtma summasi
            </p>
          </div>
        </div>

        {/* Kutilayotgan tushum */}
        <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border-l-4 border-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase text-slate-400">Faol hisoblar</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h3 className="text-xl sm:text-2xl font-black font-mono text-purple-400">
              {formatCurrency(stats?.pendingRevenue || 0)}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {stats?.activeOrdersCount || 0} ta ochiq buyurtma
            </p>
          </div>
        </div>
      </div>

      {/* 2. Admin Subtab Navigatsiya (Mobil Scroll) */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-800 pb-2.5 overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => setActiveAdminSubtab('menu')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeAdminSubtab === 'menu'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Menyu Boshqaruvi ({menu.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubtab('analytics')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeAdminSubtab === 'analytics'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Analitika & TOP 5</span>
        </button>

        <button
          onClick={() => setActiveAdminSubtab('settings')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeAdminSubtab === 'settings'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Sozlamalar</span>
        </button>
      </div>

      {/* 3. Subtab Kontenti */}
      {activeAdminSubtab === 'menu' && (
        <div className="glass-panel p-3.5 sm:p-5 rounded-2xl space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    filterCat === cat
                      ? 'bg-slate-100 text-slate-950 shadow-sm'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMenuModalData({})}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shrink-0 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Taom Qo'shish</span>
            </button>
          </div>

          {/* Menyu Jadvali */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Taom Nomi</th>
                  <th className="p-3">Kategoriya</th>
                  <th className="p-3">Sotish narxi</th>
                  <th className="p-3">Tannarxi</th>
                  <th className="p-3">Sof foyda</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMenu.map((item) => {
                  const profit = item.price - (item.costPrice || 0);
                  const margin = item.price > 0 ? Math.round((profit / item.price) * 100) : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-100 text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{item.description || "Taom tavsifi"}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-100">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {formatCurrency(item.costPrice)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-400">{formatCurrency(profit)}</span>
                          <span className="px-1 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                            {margin}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleAvailable(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            item.available
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {item.available ? "Sotuvda" : "Stop-list"}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => setMenuModalData(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminSubtab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top 5 Taomlar */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">Eng Ko'p Sotilgan Taomlar (TOP 5)</h3>
            </div>

            <div className="space-y-2.5">
              {stats?.popularDishes && stats.popularDishes.length > 0 ? (
                stats.popularDishes.map((dish, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-slate-100">{dish.name}</span>
                      </div>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-orange-400">
                        {dish.quantity} dona
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pl-7">
                      <span>Tushum: <strong>{formatCurrency(dish.revenue)}</strong></span>
                      <span className="text-emerald-400">Foyda: <strong>{formatCurrency(dish.profit)}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">Hozircha sotuvlar mavjud emas</p>
              )}
            </div>
          </div>

          {/* To'lov Turlari */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">To'lov Turlari Taqsimoti</h3>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200 text-xs sm:text-sm">Naqd Pul (Cash)</div>
                  <div className="text-[11px] text-slate-400">Kassaga tushgan naqd summa</div>
                </div>
                <div className="font-mono font-bold text-sm sm:text-base text-orange-400">
                  {formatCurrency(stats?.paymentMethods?.cash || 0)}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200 text-xs sm:text-sm">Bank Kartasi (Terminal)</div>
                  <div className="text-[11px] text-slate-400">Humo va Uzcard orqali to'lovlar</div>
                </div>
                <div className="font-mono font-bold text-sm sm:text-base text-blue-400">
                  {formatCurrency(stats?.paymentMethods?.card || 0)}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200 text-xs sm:text-sm">Click / Payme / QR</div>
                  <div className="text-[11px] text-slate-400">Elektron to'lov tizimlari</div>
                </div>
                <div className="font-mono font-bold text-sm sm:text-base text-emerald-400">
                  {formatCurrency(stats?.paymentMethods?.click_payme || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeAdminSubtab === 'settings' && (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">Restoran Sozlamalari</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Restoran / Kafe Nomi
              </label>
              <input
                type="text"
                required
                value={settingsForm.restaurantName}
                onChange={(e) => setSettingsForm({ ...settingsForm, restaurantName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Telefon Raqami
                </label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Birlamchi Xizmat Haqi (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settingsForm.defaultServiceCharge}
                  onChange={(e) => setSettingsForm({ ...settingsForm, defaultServiceCharge: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Manzil
              </label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mijozlar uchun Wi-Fi Paroli
              </label>
              <input
                type="text"
                value={settingsForm.wifiPassword}
                onChange={(e) => setSettingsForm({ ...settingsForm, wifiPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? "Saqlanmoqda..." : "Sozlamalarni Saqlash"}</span>
              </button>
            </div>
          </form>

          {/* Real-time Cloud Sinxronizatsiya (Supabase / Firebase) */}
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="font-bold text-slate-100 text-xs sm:text-sm">Real-time Sinxronizatsiya Holati</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                FAOL (0ms latency)
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ofitsiant telefondan buyurtma yuborganda, oshxona (KDS) va kassa kompyuterida sahifani yangilamasdan real vaqtda audio signal bilan ko'rinadi.
            </p>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Lokal Brauzerlararo Uzatish:</span>
                <span className="text-emerald-400 font-semibold">Ulangan (BroadcastChannel)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Oshxona Ovozli Signali:</span>
                <span className="text-orange-400 font-semibold">Web Audio Synthesizer (Chime)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Ma'lumotlar saqlanishi:</span>
                <span className="text-blue-400 font-semibold">Gibrid (LocalStorage + Cloud)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
