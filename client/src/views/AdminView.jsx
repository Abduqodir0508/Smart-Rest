import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  PieChart, 
  Plus, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Settings, 
  Utensils, 
  Percent, 
  Calculator,
  Flame,
  CreditCard,
  Building,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useResto } from '../context/RestoContext';
import { formatCurrency } from '../utils/helpers';
import api from '../services/api';

const AdminView = () => {
  const { stats, menu, settings, setMenuModalData, loadAllData, showToast } = useResto();
  const [activeAdminSubtab, setActiveAdminSubtab] = useState('menu'); // 'analytics', 'menu', 'settings'
  const [filterCat, setFilterCat] = useState('Barchasi');

  // Sozlamalar formasi
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

  // Stop-list toggle
  const handleToggleAvailable = async (id) => {
    try {
      const res = await api.toggleMenuItem(id);
      if (res.success) {
        showToast(res.data.available ? "Taom sotuvga chiqarildi" : "Taom stop-listga kiritildi", "info");
        await loadAllData();
      }
    } catch (err) {
      showToast("Xatolik yuz berdi", "error");
    }
  };

  // Taomni o'chirish
  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`"${name}" taomini o'chirishni xohlaysizmi?`)) return;
    try {
      const res = await api.deleteMenuItem(id);
      if (res.success) {
        showToast(`"${name}" o'chirildi`, "success");
        await loadAllData();
      }
    } catch (err) {
      showToast("O'chirishda xatolik", "error");
    }
  };

  // Sozlamalarni saqlash
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await api.updateSettings(settingsForm);
      if (res.success) {
        showToast("Restoran sozlamalari yangilandi", "success");
        await loadAllData();
      }
    } catch (err) {
      showToast("Sozlamalarni saqlashda xatolik", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex-1 flex flex-col gap-6 w-full">
      {/* 1. KPI Analitika Bloklari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jami Tushum */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-orange-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Jami Tushum (Kassa)</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black font-mono text-slate-100">
              {formatCurrency(stats?.totalRevenue || 0)}
            </h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stats?.paidOrdersCount || 0} ta to'langan chek</span>
            </p>
          </div>
        </div>

        {/* Sof Foyda */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Sof Foyda (Marja)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black font-mono text-emerald-400">
              {formatCurrency(stats?.netProfit || 0)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Rentabellik: <strong className="text-emerald-300 font-mono">{stats?.profitMargin || 0}%</strong>
            </p>
          </div>
        </div>

        {/* O'rtacha Chek */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">O'rtacha Chek</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black font-mono text-blue-400">
              {formatCurrency(stats?.averageOrderValue || 0)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Xaridor boshiga o'rtacha xarid
            </p>
          </div>
        </div>

        {/* Kutilayotgan tushum (Stollardagi) */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Faol stollardagi hisob</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black font-mono text-purple-400">
              {formatCurrency(stats?.pendingRevenue || 0)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {stats?.activeOrdersCount || 0} ta faol buyurtma
            </p>
          </div>
        </div>
      </div>

      {/* 2. Admin Subtab Navigatsiya */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveAdminSubtab('menu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeAdminSubtab === 'menu'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Menyu va Tannarx Boshqaruvi ({menu.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubtab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeAdminSubtab === 'analytics'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Sotuv Analitikasi & Top Taomlar</span>
        </button>

        <button
          onClick={() => setActiveAdminSubtab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeAdminSubtab === 'settings'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Restoran Sozlamalari</span>
        </button>
      </div>

      {/* 3. Subtab Kontenti */}
      {activeAdminSubtab === 'menu' && (
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Taom Qo'shish</span>
            </button>
          </div>

          {/* Menyu Jadvali */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Taom</th>
                  <th className="p-3.5">Kategoriya</th>
                  <th className="p-3.5">Sotish narxi</th>
                  <th className="p-3.5">Tannarxi</th>
                  <th className="p-3.5">Sof foyda / Marja</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMenu.map((item) => {
                  const profit = item.price - (item.costPrice || 0);
                  const margin = item.price > 0 ? Math.round((profit / item.price) * 100) : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-800"
                        />
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-500">{item.prepTime} daqiqa</div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-100">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">
                        {formatCurrency(item.costPrice)}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">{formatCurrency(profit)}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            margin >= 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {margin}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleAvailable(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            item.available
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {item.available ? "Sotuvda" : "Stop-list"}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => setMenuModalData(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Eng Xaridorgir Taomlar */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-100 text-base">Eng Ko'p Sotilgan Taomlar (TOP 5)</h3>
            </div>

            <div className="space-y-3">
              {stats?.popularDishes && stats.popularDishes.length > 0 ? (
                stats.popularDishes.map((dish, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-sm text-slate-100">{dish.name}</span>
                      </div>
                      <span className="font-mono font-extrabold text-sm text-orange-400">
                        {dish.quantity} dona
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-400 pl-7">
                      <span>Keltirgan tushum: <strong>{formatCurrency(dish.revenue)}</strong></span>
                      <span className="text-emerald-400">Sof foyda: <strong>{formatCurrency(dish.profit)}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">Hozircha sotuvlar yetarli emas</p>
              )}
            </div>
          </div>

          {/* To'lov Turlari Bo'yicha Taqsimot */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-slate-100 text-base">To'lov Usullari Taqsimoti</h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200 text-sm">Naqd Pul (Cash)</div>
                  <div className="text-xs text-slate-400">Kassaga tushgan to'g'ridan-to'g'ri naqd</div>
                </div>
                <div className="font-mono font-bold text-base text-orange-400">
                  {formatCurrency(stats?.paymentMethods?.cash || 0)}
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200 text-sm">Bank Kartasi (Terminal)</div>
                  <div className="text-xs text-slate-400">Humo va Uzcard orqali to'lovlar</div>
                </div>
                <div className="font-mono font-bold text-base text-blue-400">
                  {formatCurrency(stats?.paymentMethods?.card || 0)}
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200 text-sm">Click / Payme / QR</div>
                  <div className="text-xs text-slate-400">Elektron to'lov tizimlari</div>
                </div>
                <div className="font-mono font-bold text-base text-emerald-400">
                  {formatCurrency(stats?.paymentMethods?.click_payme || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeAdminSubtab === 'settings' && (
        <div className="glass-panel p-6 rounded-2xl max-w-2xl">
          <div className="flex items-center gap-2 mb-5">
            <Building className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-100 text-base">Restoran Rekvizitlari va Chek Sozlamalari</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Restoran / Kafe Nomi
              </label>
              <input
                type="text"
                required
                value={settingsForm.restaurantName}
                onChange={(e) => setSettingsForm({ ...settingsForm, restaurantName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Telefon Raqami
                </label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Birlamchi Xizmat Haqi (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={settingsForm.defaultServiceCharge}
                  onChange={(e) => setSettingsForm({ ...settingsForm, defaultServiceCharge: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Manzil
              </label>
              <input
                type="text"
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mijozlar uchun Wi-Fi Paroli
              </label>
              <input
                type="text"
                value={settingsForm.wifiPassword}
                onChange={(e) => setSettingsForm({ ...settingsForm, wifiPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? "Saqlanmoqda..." : "Sozlamalarni Saqlash"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminView;
