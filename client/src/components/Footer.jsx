import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 py-3 px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 mt-auto shrink-0 z-10 relative">
      <div className="mb-2 sm:mb-0">
        &copy; 2026 Smart Resto. Barcha huquqlar himoyalangan.
      </div>
      <div>
        <a 
          href="https://t.me/A_Husanboyev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-300 hover:text-white hover:underline transition-colors"
        >
          Qo'llab-quvvatlash
        </a>
      </div>
    </footer>
  );
}
