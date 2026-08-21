import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  ChefHat, 
  LayoutDashboard, 
  History, 
  Clock, 
  Store,
  RefreshCw,
  Bell
} from 'lucide-react';
import { useResto } from '../context/RestoContext';

const Navbar = () => {
  const { activeTab, setActiveTab, orders, tables, settings, loadAllData } = useResto();
  const [time, setTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Faol buyurtmalar va oshxona navbati hisobi
  const activeOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const occupiedTablesCount = tables.filter(t => t.status === 'occupied').length;

  const navItems = [
    {
      id: 'pos',
      label: 'POS & Kassa',
      icon: UtensilsCrossed,
      badge: `${occupiedTablesCount}/${tables.length} Stol`
    },
    {
      id: 'kitchen',
      label: 'Oshxona (KDS)',
      icon: ChefHat,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold animate-pulse'
    },
    {
      id: 'orders',
      label: 'Buyurtmalar',
      icon: History,
      badge: orders.length
    },
    {
      id: 'admin',
      label: 'Admin & Menyu',
      icon: LayoutDashboard,
      badge: null
    }
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Restoran Nomi */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                {settings.restaurantName || "Smart Resto"}
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                PRO POS
              </span>
            </div>
            <p className="text-xs text-slate-400">Restoran va Kafelar boshqaruv tizimi</p>
          </div>
        </div>

        {/* Asosiy Navigatsiya Tugmalari */}
        <nav className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-xs font-semibold ${
                      item.badgeColor || (isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Vaqt va Qo'shimcha Amallar */}
        <div className="flex items-center gap-3 text-slate-300">
          {/* Jonli Soat */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-mono font-medium">
              {time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Yangilash tugmasi */}
          <button
            onClick={handleRefresh}
            title="Ma'lumotlarni yangilash"
            className="p-2 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 text-slate-300 hover:text-orange-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
