import React, { useState } from 'react';
import { X, Plus, Save, Armchair } from 'lucide-react';
import { useResto } from '../context/RestoContext';
import api from '../services/api';

const ZONES = ["Asosiy Zal", "Terassa", "VIP Xona", "Bar"];

const TableModal = () => {
  const { tableModalOpen, setTableModalOpen, loadAllData, showToast } = useResto();

  const [formData, setFormData] = useState({
    number: '',
    zone: 'Asosiy Zal',
    capacity: 4
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!tableModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.number.trim()) {
      showToast("Stol raqami yoki nomini kiriting", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createTable(formData);
      if (res.success) {
        showToast(`"${formData.number}" stoli qo'shildi`, "success");
        await loadAllData();
        setTableModalOpen(false);
        setFormData({ number: '', zone: 'Asosiy Zal', capacity: 4 });
      }
    } catch (err) {
      showToast(err.message || "Stol qo'shishda xatolik", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Yangi Stol Qo'shish</h3>
              <p className="text-xs text-slate-400">Restoran zallari xaritasi</p>
            </div>
          </div>
          <button
            onClick={() => setTableModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Stol Raqami / Nomi <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="Masalan: 12-Stol, T-5, VIP-3..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Zal / Hudud
            </label>
            <select
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            >
              {ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Sig'imi (O'rinlar soni)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setTableModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saqlanmoqda..." : "Stolni Saqlash"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableModal;
