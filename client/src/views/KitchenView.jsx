import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Flame, 
  AlertTriangle, 
  ArrowRight, 
  Volume2, 
  MessageSquare,
  Sparkles,
  Filter
} from 'lucide-react';
import { useResto } from '../context/RestoContext';
import { formatTime, getElapsedMinutes, STATUS_CONFIG, playNotificationSound } from '../utils/helpers';

const KitchenView = () => {
  const { orders, updateOrderStatus } = useResto();
  const [filterStatus, setFilterStatus] = useState('active'); // active, pending, preparing, ready, all
  const [, setTick] = useState(0);

  // Vaqt hisoblagichini har 10 soniyada yangilab turish
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  // Oshxona uchun faol buyurtmalar (to'lanmagan yoki hali topshirilmagan)
  const kitchenOrders = orders.filter(order => {
    if (filterStatus === 'active') {
      return ['pending', 'preparing', 'ready'].includes(order.status);
    }
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  return (
    <div className="max-w-7xl mx-auto p-4 flex-1 flex flex-col gap-5 w-full">
      {/* Oshxona Header va Status Filtrlari */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-slate-100">Oshxona Ekrani (KDS)</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Jonli rejim
              </span>
            </div>
            <p className="text-xs text-slate-400">Buyurtmalarni tezkor tayyorlash va statuslarni boshqarish</p>
          </div>
        </div>

        {/* Filtrlar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterStatus === 'active'
                ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Faol navbat ({pendingCount + preparingCount + readyCount})
          </button>

          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterStatus === 'pending'
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                : 'bg-slate-900/60 border-slate-800 text-amber-400 hover:bg-slate-800'
            }`}
          >
            Kutilmoqda ({pendingCount})
          </button>

          <button
            onClick={() => setFilterStatus('preparing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterStatus === 'preparing'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-slate-900/60 border-slate-800 text-blue-400 hover:bg-slate-800'
            }`}
          >
            Pishirilmoqda ({preparingCount})
          </button>

          <button
            onClick={() => setFilterStatus('ready')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterStatus === 'ready'
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-slate-900/60 border-slate-800 text-emerald-400 hover:bg-slate-800'
            }`}
          >
            Tayyor ({readyCount})
          </button>

          <button
            onClick={playNotificationSound}
            title="Ovozni sinab ko'rish"
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-orange-400"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Buyurtmalar Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl min-h-[400px]">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3" />
          <h3 className="font-bold text-lg text-slate-100">Oshxonada barcha buyurtmalar tayyor!</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            Yangi buyurtmalar paydo bo'lganda bu yerda avtomatik ko'rinadi va ovozli signal chalinadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kitchenOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isUrgent = elapsed > 20 && order.status !== 'ready' && order.status !== 'served';

            return (
              <div
                key={order.id}
                className={`glass-panel rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-200 ${
                  order.status === 'pending'
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : order.status === 'preparing'
                    ? 'border-blue-500/40 bg-blue-500/5'
                    : order.status === 'ready'
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-slate-800'
                } ${isUrgent ? 'ring-2 ring-rose-500 animate-pulse' : ''}`}
              >
                {/* Karta Header */}
                <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-100">
                          {order.tableNumber}
                        </span>
                        <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Ofitsiant: {order.waiterName || "Alisher"}</p>
                    </div>

                    {/* Vaqt va Ogohlantirish */}
                    <div className="flex flex-col items-end">
                      <span
                        className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-1 rounded-lg border ${
                          elapsed > 20
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : elapsed > 10
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed} daq</span>
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5 font-mono">{formatTime(order.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Taomlar ro'yxati */}
                <div className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-[300px]">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-100">{item.name}</span>
                        <span className="font-mono font-extrabold text-sm px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          x{item.quantity}
                        </span>
                      </div>
                      {item.note && (
                        <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 font-medium">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                          <span>↳ {item.note}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Umumiy buyurtma izohi */}
                  {order.notes && (
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/60 text-xs text-slate-300 italic">
                      <span className="font-semibold text-slate-400">Izoh:</span> {order.notes}
                    </div>
                  )}
                </div>

                {/* Karta Footer / Boshqaruv Tugmasi */}
                <div className="p-3 border-t border-slate-800 bg-slate-950/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Holati:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {statusCfg.nextStatus && (
                    <button
                      onClick={() => updateOrderStatus(order.id, statusCfg.nextStatus)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                        order.status === 'pending'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/20'
                          : order.status === 'preparing'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      <span>{statusCfg.nextLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
};

export default KitchenView;
