import React, { useState } from 'react';
import { X, Plus, Save, Armchair } from 'lucide-react';
import { useResto } from '../context/RestoContext';
import { supabase } from '../services/supabase';

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
      let num = formData.number.trim();
      if (!isNaN(num) && !num.toLowerCase().includes('stol') && !num.startsWith('T-') && !num.startsWith('VIP')) {
        num = `${num}-Stol`;
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const payload = {
        number: num,
        zone: formData.zone,
        capacity: Number(formData.capacity) || 4,
        status: 'empty',
        restaurant_id: userId
      };

      const { error } = await supabase.from('tables').insert(payload);
      if (error) throw error;

      showToast(`"${num}" stoli muvaffaqiyatli qo'shildi`, "success");
      await loadAllData();
      setTableModalOpen(false);
      setFormData({ number: '', zone: 'Asosiy Zal', capacity: 4 });
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Stol Raqami yoki Nomi <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: 1-Stol, VIP-3 yoki 12"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Zal / Joylashuv
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ZONES.map((zone) => (
                <button
                  type="button"
                  key={zone}
                  onClick={() => setFormData({ ...formData, zone })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    formData.zone === zone
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Sig'imi (Kishi soni)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
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
