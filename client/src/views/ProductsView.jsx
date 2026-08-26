import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Loader2, 
  Package, 
  X, 
  Check, 
  RefreshCw 
} from 'lucide-react';

export default function ProductsView() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal holati
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Asosiy taomlar',
    price: '',
    description: '',
    image: '',
  });

  const categories = [
    'Asosiy taomlar',
    'Milliy taomlar',
    'Kebab & Gril',
    'Fast Food & Pitsa',
    'Salatlar',
    'Ichimliklar',
    'Desertlar',
  ];

  // 1. Tovarlarni Supabase-dan yuklab olish (RLS avtomatik ravishda faqat shu restoranning tovarlarini qaytaradi)
  const fetchProducts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Tovarlarni yuklashda xatolik:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Modalni ochish (Yangi qo'shish yoki Tahrirlash uchun)
  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category || 'Asosiy taomlar',
        price: product.price,
        description: product.description || '',
        image: product.image || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'Asosiy taomlar',
        price: '',
        description: '',
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // 2. Tovar qo'shish (Insert) yoki Yangilash (Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    setSaving(true);

    try {
      if (editingProduct) {
        // UPDATE: Faqat shu ID ga ega mahsulotni yangilash
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            description: formData.description,
            image: formData.image,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProduct.id);

        if (error) throw error;

        // UI holatini yangilash
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingProduct.id
              ? { ...item, ...formData, price: parseFloat(formData.price) }
              : item
          )
        );
      } else {
        // INSERT: Yangi tovar qo'shish (restaurant_id ga auth.uid qo'shiladi)
        const newProductPayload = {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          description: formData.description,
          image: formData.image,
          restaurant_id: user?.id, // Supabase Auth UID biriktiriladi
        };

        const { data, error } = await supabase
          .from('products')
          .insert([newProductPayload])
          .select()
          .single();

        if (error) throw error;
        if (data) setProducts((prev) => [data, ...prev]);
      }

      closeModal();
    } catch (error) {
      alert(`Xatolik yuz berdi: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // 3. Tovarni o'chirish (Delete)
  const handleDelete = async (productId) => {
    if (!window.confirm("Haqiqatan ham bu tovarni o'chirmoqchimisiz?")) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      // UI dan o'chirish
      setProducts((prev) => prev.filter((item) => item.id !== productId));
    } catch (error) {
      alert(`O'chirishda xatolik: ${error.message}`);
    }
  };

  // Qidiruv filtri
  const filteredProducts = products.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header qismi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-500" />
            Tovarlar & Menyu Boshqaruvi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Restoraningizdagi barcha mahsulotlar va narxlar ro'yxati (RLS bilan himoyalangan)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            title="Yangilash"
            className="p-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-orange-400 border border-slate-700/60 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Yangi Tovar Qo'shish
          </button>
        </div>
      </div>

      {/* Qidiruv paneli */}
      <div className="mb-6 relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tovar nomi yoki kategoriya bo'yicha qidirish..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Tovarlar Jadvali (Table) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm">Tovarlar yuklanmoqda...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-base font-medium text-slate-300">Hech qanday tovar topilmadi</p>
            <p className="text-xs text-slate-500 mt-1">Yangi tovar qo'shish uchun yuqoridagi tugmani bosing</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Nomi</th>
                  <th className="px-6 py-4 font-semibold">Kategoriya</th>
                  <th className="px-6 py-4 font-semibold">Narxi</th>
                  <th className="px-6 py-4 font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{product.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-100">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-800" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          {product.name}
                          {product.description && (
                            <p className="text-xs text-slate-500 font-normal line-clamp-1">{product.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                        {product.category || 'Asosiy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-orange-400">
                      {Number(product.price || 0).toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(product)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-orange-400 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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

      {/* Yangi Tovar Qo'shish / Tahrirlash Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h2 className="text-lg font-bold text-slate-100">
                {editingProduct ? "Tovarni Tahrirlash" : "Yangi Tovar Qo'shish"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tovar Nomi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Oshpaz Oshi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kategoriya
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Sotish Narxi (so'mda) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="45000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rasm URL-i (ixtiyoriy)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tavsif (ixtiyoriy)
                </label>
                <textarea
                  rows="2"
                  placeholder="Taom tarkibi yoki izoh..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500 resize-none"
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
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingProduct ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
