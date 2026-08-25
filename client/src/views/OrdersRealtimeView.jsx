import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Utensils, 
  Loader2, 
  Radio,
  RefreshCw 
} from 'lucide-react';

export default function OrdersRealtimeView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Faol buyurtmalarni yuklab olish (RLS avtomatik ravishda restoranga moslab beradi)
  const fetchActiveOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Buyurtmalarni yuklashda xatolik:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Supabase Realtime Obunasi (Subscription)
  useEffect(() => {
    fetchActiveOrders();

    // Supabase Realtime kanalini ochish
    const ordersChannel = supabase
      .channel('public:orders_realtime_stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          // Yangi buyurtma tushganda ro'yxat boshiga qo'shish
          setOrders((prev) => [payload.new, ...prev]);

          // Bildirishnoma ovozi
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch (e) {
            console.log('Audio autoplay blocked');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => {
            // Agar buyurtma yakunlangan bo'lsa (completed), faol ekrandan chiqarish
            if (payload.new.status === 'completed') {
              return prev.filter((order) => order.id !== payload.new.id);
            }
            return prev.map((order) =>
              order.id === payload.new.id ? payload.new : order
            );
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  // 3. Oshxona uchun Buyurtma holatini (statusini) o'zgartirish
  const updateOrderStatus = async (orderId, nextStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      alert(`Statusni yangilashda xatolik: ${error.message}`);
    }
  };

  // Status ko'rinishlari
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Kutilmoqda',
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          nextStatus: 'preparing',
          nextLabel: 'Tayyorlashga olish',
          btnClass: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
          icon: Clock,
        };
      case 'preparing':
        return {
          label: 'Tayyorlanmoqda',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse',
          nextStatus: 'ready',
          nextLabel: 'Tayyor bo\'ldi',
          btnClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
          icon: Flame,
        };
      case 'ready':
        return {
          label: 'Tayyor',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          nextStatus: 'completed',
          nextLabel: 'Topshirildi / Yakunlash',
          btnClass: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
          icon: CheckCircle2,
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-800 text-slate-400 border-slate-700',
          nextStatus: null,
          nextLabel: null,
          btnClass: '',
          icon: Utensils,
        };
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-orange-500" />
            Oshxona & Faol Buyurtmalar (Realtime KDS)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-vaqt rejimida oshxona va POS buyurtmalari monitoringi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchActiveOrders}
            title="Yangilash"
            className="p-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-orange-400 border border-slate-700/60 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Realtime Faol</span>
          </div>
        </div>
      </div>

      {/* Buyurtmalar Grid ro'yxati */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-sm">Buyurtmalar yuklanmoqda...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/60" />
          <p className="text-lg font-medium text-slate-200">Barcha buyurtmalar tayyor!</p>
          <p className="text-xs text-slate-500 mt-1">Yangi buyurtma tushishi bilan bu yerda real-vaqtda paydo bo'ladi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => {
            const statusConfig = getStatusBadge(order.status);
            const StatusIcon = statusConfig.icon;
            const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);

            return (
              <div
                key={order.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 backdrop-blur-md transition-all"
              >
                <div>
                  {/* Karta Tepasi: ID, Stol, Status */}
                  <div className="flex items-start justify-between gap-2 pb-3.5 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-100">
                          {order.order_number || `Order #${order.id}`}
                        </span>
                        {order.table_number && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            {order.table_number}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Tovarlar Ro'yxati */}
                  <div className="py-4 space-y-2.5">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-orange-400 font-mono text-xs mt-0.5">
                            {item.quantity || 1}x
                          </span>
                          <div>
                            <p className="font-medium text-slate-200">{item.name || item.food_name}</p>
                            {item.notes && (
                              <p className="text-[11px] text-amber-400/90 italic">
                                "{item.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">
                          {((item.price || 0) * (item.quantity || 1)).toLocaleString()} so'm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Karta Tag qismi: Jami Summa & Status O'zgartirish Tugmasi */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-xs text-slate-400">Jami summa:</span>
                    <span className="font-bold text-base text-slate-100">
                      {Number(order.total_amount || 0).toLocaleString()} so'm
                    </span>
                  </div>

                  {statusConfig.nextStatus && (
                    <button
                      onClick={() => updateOrderStatus(order.id, statusConfig.nextStatus)}
                      className={`w-full py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${statusConfig.btnClass}`}
                    >
                      <span>{statusConfig.nextLabel}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
