import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Printer, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { useResto } from '../context/RestoContext';
import { formatCurrency, formatDateTime, STATUS_CONFIG } from '../utils/helpers';

const OrdersView = () => {
  const { orders, setReceiptOrder, setPaymentOrder } = useResto();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, unpaid
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
      (order.waiterName && order.waiterName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && order.paymentStatus === 'paid') ||
      (statusFilter === 'unpaid' && order.paymentStatus === 'unpaid');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 flex-1 flex flex-col gap-5 w-full">
      {/* Header va Filtrlar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-100">Buyurtmalar va Cheklar Arxivi</h2>
            <p className="text-xs text-slate-400">Barcha faol va yopilgan buyurtmalar tarixi</p>
          </div>
        </div>

        {/* Qidiruv va Filtr */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Chek №, stol yoki ofitsiant qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-orange-500 rounded-xl pl-10 pr-8 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'all' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Barchasi ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'paid' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              To'langan
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'unpaid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ochiq
            </button>
          </div>
        </div>
      </div>

      {/* Buyurtmalar Jadvali */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Chek №</th>
                <th className="p-4">Stol</th>
                <th className="p-4">Ofitsiant</th>
                <th className="p-4">Taomlar</th>
                <th className="p-4">Summa</th>
                <th className="p-4">To'lov Holati</th>
                <th className="p-4">Vaqt</th>
                <th className="p-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    Buyurtmalar topilmadi
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPaid = order.paymentStatus === 'paid';
                  const totalItemsCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-orange-400">
                        #{order.orderNumber}
                      </td>
                      <td className="p-4 font-semibold text-slate-100">
                        {order.tableNumber}
                      </td>
                      <td className="p-4 text-slate-300">
                        {order.waiterName || "Alisher"}
                      </td>
                      <td className="p-4">
                        <span className="text-slate-200 font-medium">
                          {totalItemsCount} dona taom
                        </span>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-sm text-slate-100">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isPaid ? "To'langan" : "Ochiq hisob"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => setReceiptOrder(order)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border border-slate-700"
                          title="Chekni ko'rish / Chop etish"
                        >
                          <Printer className="w-3.5 h-3.5 text-orange-400" />
                          <span>Chek</span>
                        </button>

                        {!isPaid && (
                          <button
                            onClick={() => setPaymentOrder(order)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                            title="To'lovni qabul qilish"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>To'lash</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersView;
