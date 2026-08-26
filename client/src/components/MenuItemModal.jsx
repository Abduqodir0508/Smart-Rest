import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Image as ImageIcon, Calculator, Percent, Sparkles } from 'lucide-react';
import { useResto } from '../context/RestoContext';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { supabase } from '../services/supabase';

const CATEGORIES = [
  "Milliy taomlar",
  "Kebab & Gril",
  "Salatlar",
  "Fast Food & Pitsa",
  "Ichimliklar",
  "Desertlar",
  "Boshqa"
];

const MenuItemModal = () => {
  const { menuModalData, setMenuModalData, loadAllData, showToast } = useResto();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Milliy taomlar',
    price: '',
    costPrice: '',
    prepTime: 15,
    available: true,
    image: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(menuModalData && menuModalData.id);

  useEffect(() => {
    if (menuModalData && menuModalData.id) {
      setFormData({
        name: menuModalData.name || '',
        category: menuModalData.category || 'Milliy taomlar',
        price: menuModalData.price || '',
        costPrice: menuModalData.costPrice || '',
        prepTime: menuModalData.prepTime || 15,
        available: menuModalData.available !== undefined ? menuModalData.available : true,
        image: menuModalData.image || '',
        description: menuModalData.description || ''
      });
    } else if (menuModalData) {
      // Yangi taom
      setFormData({
        name: '',
        category: 'Milliy taomlar',
        price: '',
        costPrice: '',
        prepTime: 15,
        available: true,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        description: ''
      });
    }
  }, [menuModalData]);

  if (!menuModalData) return null;

  const priceNum = parseFloat(formData.price) || 0;
  const costNum = parseFloat(formData.costPrice) || 0;
  const profit = priceNum - costNum;
  const marginPercent = priceNum > 0 ? Math.round((profit / priceNum) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Taom nomini kiriting", "error");
      return;
    }
    if (!priceNum || priceNum <= 0) {
      showToast("Sotish narxini to'g'ri kiriting", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const payload = {
        name: formData.name,
        category: formData.category,
        price: priceNum,
        cost_price: costNum,
        prep_time: Number(formData.prepTime) || 15,
        available: formData.available,
        image: formData.image,
        description: formData.description,
        user_id: userId
      };

      if (isEdit) {
        const { error } = await supabase.from('foods').update(payload).eq('id', menuModalData.id);
        if (error) throw error;
        showToast(`"${formData.name}" taomi yangilandi`, "success");
      } else {
        const { error } = await supabase.from('foods').insert(payload);
        if (error) throw error;
        showToast(`Yangi taom "${formData.name}" qo'shildi`, "success");
      }
      
      await loadAllData();
      setMenuModalData(null);
    } catch (error) {
      showToast(error.message || "Xatolik yuz berdi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                {isEdit ? "Taomni Tahrirlash" : "Yangi Taom Qo'shish"}
              </h3>
              <p className="text-xs text-slate-400">Menyu va tannarx boshqaruvi</p>
            </div>
          </div>
          <button
            onClick={() => setMenuModalData(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Taom nomi */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Taom / Ichimlik nomi <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masalan: To'y Oshi, Qozon Kabob..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Kategoriya va Tayyorlanish vaqti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kategoriya
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tayyorlanish vaqti (minut)
              </label>
              <input
                type="number"
                min="1"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Narx va Tannarx Kalkulyatori */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Tannarx va Foyda Marjasi Kalkulyatori</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Sotish narxi (so'm) <span className="text-orange-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => {
                    const price = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      price,
                      // Agar costPrice bo'sh bo'lsa avto 45% tannarx tavsiya qiladi
                      costPrice: prev.costPrice ? prev.costPrice : Math.round((parseFloat(price) || 0) * 0.45).toString()
                    }));
                  }}
                  placeholder="45 000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Tannarxi (Masalliqlar xarajati)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="20 000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Hisoblangan marja ko'rsatkichi */}
            {priceNum > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">1 dona taomdan sof foyda: </span>
                  <span className={`font-bold font-mono ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(profit)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Rentabellik: </span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    marginPercent >= 50 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    marginPercent >= 30 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {marginPercent}% marja
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Rasm URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Rasm URL manzili</span>
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Tavsif */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tavsif va tarkibi
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Taom tarkibidagi asosiy masalliqlar..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Mavjudlik switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-sm font-medium text-slate-200">Sotuvda mavjud (Status)</div>
              <div className="text-xs text-slate-400">O'chirilsa taom stop-listga tushadi</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setMenuModalData(null)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saqlanmoqda..." : isEdit ? "O'zgarishlarni Saqlash" : "Taomni Qo'shish"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemModal;
