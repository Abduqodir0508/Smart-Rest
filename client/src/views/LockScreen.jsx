import React, { useState } from 'react';
import { useResto } from '../context/RestoContext';
import { Lock, User, CheckCircle2, XCircle } from 'lucide-react';

export default function LockScreen() {
  const { waiters, setIsLocked, setActiveWaiter, showToast } = useResto();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleLogin = () => {
    if (pin.length !== 4) return;

    // Admin uchun Master PIN (ixtiyoriy, 0000)
    if (pin === '0000') {
      setActiveWaiter({ id: 'admin', name: 'Asosiy Admin', role: 'admin' });
      setIsLocked(false);
      showToast("Admin sifatida kirdingiz", "success");
      return;
    }

    // Ofitsiantni tekshirish
    const foundWaiter = waiters.find((w) => w.pin_code === pin);

    if (foundWaiter) {
      setActiveWaiter({ id: foundWaiter.id, name: foundWaiter.name, role: 'waiter' });
      setIsLocked(false);
      showToast(`Xush kelibsiz, ${foundWaiter.name}!`, "success");
    } else {
      setError(true);
      setPin('');
      showToast("PIN kod noto'g'ri!", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Fon effektlari */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-700">
          <Lock className="w-8 h-8 text-orange-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Tizimga kirish</h2>
        <p className="text-sm text-slate-400 mb-8 text-center">
          Iltimos, shaxsiy PIN-kodingizni kiriting
        </p>

        {/* PIN indikatorlari */}
        <div className="flex gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                pin.length > i
                  ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                  : 'bg-slate-800 border border-slate-700'
              } ${error ? 'bg-rose-500 shadow-[0_0_10px_rgba(243,24,71,0.5)] animate-pulse' : ''}`}
            />
          ))}
        </div>

        {/* Raqamlar klaviaturasi */}
        <div className="grid grid-cols-3 gap-4 w-full mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="h-14 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 rounded-2xl text-xl font-semibold text-slate-200 transition-colors focus:bg-slate-700 active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="h-14 bg-slate-800/50 hover:bg-rose-500/20 border border-slate-700/50 hover:border-rose-500/30 rounded-2xl text-xl font-semibold text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center active:scale-95"
          >
            <XCircle className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="h-14 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 rounded-2xl text-xl font-semibold text-slate-200 transition-colors active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleLogin}
            disabled={pin.length !== 4}
            className="h-14 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl text-xl font-semibold text-white transition-colors flex items-center justify-center shadow-lg shadow-orange-500/25 active:scale-95 disabled:shadow-none"
          >
            <CheckCircle2 className="w-6 h-6" />
          </button>
        </div>
        

      </div>
    </div>
  );
}
