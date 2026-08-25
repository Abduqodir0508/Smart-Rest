import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import AuthView from '../views/AuthView';

/**
 * ProtectedRoute: Agar foydalanuvchi tizimga kirmagan bo'lsa, uni avtomatik 
 * AuthView (Login/Register) sahifasiga yo'naltiradi, kirgan bo'lsa `children` 
 * ya'ni asosiy dashboardni ko'rsatadi.
 */
const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();

  // Yuklanish jarayoni (Auth holatini tekshirish)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-sm font-medium">Smart Resto yuklanmoqda...</p>
      </div>
    );
  }

  // Agar tizimga kirmagan bo'lsa -> Login / Registratsiya sahifasi (/login o'rniga)
  if (!session) {
    return <AuthView />;
  }

  // Agar tizimga muvaffaqiyatli kirgan bo'lsa -> Asosiy kontent
  return <>{children}</>;
};

export default ProtectedRoute;
