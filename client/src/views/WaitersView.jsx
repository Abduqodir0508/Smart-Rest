import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useResto } from '../context/RestoContext';
import { Plus, Edit2, Trash2, Search, Loader2, UserSquare, X } from 'lucide-react';

export default function WaitersView() {
  const { user } = useAuth();
  const { waiters, setWaiters } = useResto();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pin_code: '',
  });

  const filteredWaiters = waiters.filter(
    (w) => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (w.phone && w.phone.includes(searchQuery))
  );

  const openModal = (waiter = null) => {
    if (waiter) {
      setEditingWaiter(waiter);
      setFormData({
        name: waiter.name,
        phone: waiter.phone || '',
        pin_code: waiter.pin_code || '',
      });
    } else {
      setEditingWaiter(null);
      setFormData({
        name: '',
        phone: '',
        pin_code: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWaiter(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.pin_code) return;
    
    // PIN kod 4 ta raqam ekanligini tekshirish
    if (formData.pin_code.length !== 4 || isNaN(formData.pin_code)) {
      alert("PIN kod faqat 4 ta raqamdan iborat bo'lishi kerak!");
      return;
    }

    setSaving(true);

    try {
      if (editingWaiter) {
        // Tahrirlash
        const { error } = await supabase
          .from('waiters')
          .update({
            name: formData.name,
            phone: formData.phone,
            pin_code: formData.pin_code,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingWaiter.id);

        if (error) throw error;
        
        setWaiters((prev) =>
          prev.map((item) =>
            item.id === editingWaiter.id
              ? { ...item, ...formData }
              : item
          )
        );
      } else {
        // Yangi qo'shish
        const payload = {
          name: formData.name,
          phone: formData.phone,
          pin_code: formData.pin_code,
          restaurant_id: user?.id,
        };

        const { data, error } = await supabase
          .from('waiters')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (data) setWaiters((prev) => [data, ...prev]);
      }

      closeModal();
    } catch (error) {
      alert(`Xatolik: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu ofitsiantni o'chirishni xohlaysizmi?")) return;

    try {
      const { error } = await supabase.from('waiters').delete().eq('id', id);
      if (error) throw error;
      setWaiters((prev) => prev.filter((w) => w.id !== id));
    } catch (error) {
      alert(`O'chirishda xatolik: ${error.message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">Ofitsiantlar</h1>
          <p className="text-sm text-slate-400 mt-1">
            Restorandagi barcha ofitsiantlarni boshqarish
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors whitespace-nowrap shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Qo'shish</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex-1">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm">Yuklanmoqda...</p>
          </div>
        ) : filteredWaiters.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3">
            <UserSquare className="w-12 h-12 text-slate-700" />
            <p className="text-sm">Ofitsiantlar topilmadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Ismi</th>
                  <th className="px-6 py-4 font-semibold">Telefon</th>
                  <th className="px-6 py-4 font-semibold">PIN-kod</th>
                  <th className="px-6 py-4 font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWaiters.map((waiter) => (
                  <tr key={waiter.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-100">
                      {waiter.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {waiter.phone || '-'}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold tracking-widest text-orange-400">
                      {waiter.pin_code}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(waiter)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-orange-400 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(waiter.id)}
                          className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h2 className="text-lg font-bold text-slate-100">
                {editingWaiter ? "Ofitsiantni Tahrirlash" : "Yangi Ofitsiant Qo'shish"}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Ism-Familiya <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Telefon raqam (ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  PIN kod (4 xonali raqam) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="1234"
                  value={formData.pin_code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // faqat raqam
                    setFormData({ ...formData, pin_code: val });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500 font-mono tracking-widest"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-orange-500/25 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
