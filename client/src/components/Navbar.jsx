import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  ChefHat, 
  LayoutDashboard, 
  History, 
  Clock, 
  Store,
  RefreshCw,
  LogOut,
  User,
  Package
} from 'lucide-react';
import { useResto } from '../context/RestoContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { activeTab, setActiveTab, orders, tables, settings, loadAllData, activeWaiter, setIsLocked } = useResto();
  const { user, signOut } = useAuth();
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
      shortLabel: 'POS',
      icon: UtensilsCrossed,
      badge: `${occupiedTablesCount}/${tables.length}`
    },
    {
      id: 'kitchen',
      label: 'Oshxona (KDS)',
      shortLabel: 'Oshxona',
      icon: ChefHat,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold animate-pulse'
    },
    {
      id: 'orders',
      label: 'Buyurtmalar',
      shortLabel: 'Cheklar',
      icon: History,
      badge: orders.length
    },
    {
      id: 'products',
      label: 'Tovarlar',
      shortLabel: 'Tovarlar',
      icon: Package,
      badge: null
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      shortLabel: 'Admin',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: true
    },
    {
      id: 'waiters',
      label: 'Xodimlar',
      shortLabel: 'Xodimlar',
      icon: User,
      badge: null,
      adminOnly: true
    }
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-4 py-2 sm:py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Top Header Row (Logo, Restoran Nomi va Mobil Tugmalar) */}
        <div className="w-full md:w-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-bold text-sm sm:text-base md:text-lg text-slate-100 tracking-tight line-clamp-1">
                  {settings.restaurantName || "Smart Resto"}
                </h1>
                <span className="px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                  PRO POS
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden xs:block">Restoran & Kafe boshqaruvi</p>
            </div>
          </div>

          {/* Mobil uchun Jonli Soat va Yangilash */}
          <div className="flex md:hidden items-center gap-1.5">
            <div className="flex items-center gap-1 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono">
              <Clock className="w-3 h-3 text-orange-400" />
              <span>{time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-orange-400"
              title="Yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
            </button>
            <button
              onClick={() => signOut()}
              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 border border-rose-500/30"
              title="Chiqish"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Asosiy Navigatsiya Tugmalari (Gorizontal Scrollable) */}
        <nav className="w-full md:w-auto flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 overflow-x-auto no-scrollbar max-w-full">
          {navItems.map((item) => {
            if (item.adminOnly && activeWaiter?.role !== 'admin') return null;

            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] sm:text-xs font-semibold ${
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

          {/* Desktop Soat, Yangilash va Chiqish */}
          <div className="hidden md:flex items-center gap-2.5 text-slate-300">
            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-mono font-medium">
                {time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              title="Ma'lumotlarni yangilash"
              className="p-2 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 text-slate-300 hover:text-orange-400 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
            </button>

            <button
              onClick={() => signOut()}
              title="Tizimdan Chiqish"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </header>
  );
};

export default Navbar;
