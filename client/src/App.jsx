import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RestoProvider, useResto } from './context/RestoContext';
import AuthView from './views/AuthView';
import Navbar from './components/Navbar';
import PosView from './views/PosView';
import KitchenView from './views/KitchenView';
import AdminView from './views/AdminView';
import OrdersView from './views/OrdersView';
import ProductsView from './views/ProductsView';
import ReceiptModal from './components/ReceiptModal';
import PaymentModal from './components/PaymentModal';
import MenuItemModal from './components/MenuItemModal';
import TableModal from './components/TableModal';
import WaitersView from './views/WaitersView';
import LockScreen from './views/LockScreen';
import Footer from './components/Footer';
import { CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute';

const Dashboard = () => {
  const { activeTab, toast, isLocked } = useResto();

  if (isLocked) {
    return (
      <>
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                  : toast.type === 'error'
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500/40 shadow-rose-500/10'
                  : toast.type === 'warning'
                  ? 'bg-amber-950/90 text-amber-300 border-amber-500/40 shadow-amber-500/10'
                  : 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-black/40'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
        <LockScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/40 shadow-rose-500/10'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/40 shadow-amber-500/10'
                : 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-black/40'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'pos' && <PosView />}
        {activeTab === 'kitchen' && <KitchenView />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'admin' && <AdminView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'waiters' && <WaitersView />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <ReceiptModal />
      <PaymentModal />
      <MenuItemModal />
      <TableModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <RestoProvider>
          <Dashboard />
        </RestoProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}
