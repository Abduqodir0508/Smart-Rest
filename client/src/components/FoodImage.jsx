import React, { useState } from 'react';
import { UtensilsCrossed, Clock, Flame } from 'lucide-react';

const categoryGradients = {
  "Milliy taomlar": "from-amber-600 to-orange-700",
  "Kebab & Gril": "from-rose-600 to-amber-700",
  "Salatlar": "from-emerald-600 to-teal-700",
  "Fast Food & Pitsa": "from-orange-600 to-red-700",
  "Ichimliklar": "from-cyan-600 to-blue-700",
  "Desertlar": "from-pink-600 to-purple-700",
  "Boshqa": "from-slate-700 to-slate-900"
};

export const FoodImage = ({ src, alt, category, prepTime, available }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const gradient = categoryGradients[category] || "from-orange-600 to-amber-700";

  return (
    <div className="relative w-full h-48 bg-slate-950 overflow-hidden select-none">
      {/* Agar rasm mavjud bo'lsa va xato bo'lmasa */}
      {!imageError && src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoading(false)}
          onError={() => {
            setImageError(true);
            setLoading(false);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      ) : null}

      {/* Rasm yuklanayotganda yoki xato bo'lganda SVG illustratsiya */}
      {(imageError || !src || loading) && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-4 text-white`}
        >
          <div className="w-14 h-14 rounded-2xl bg-black/25 backdrop-blur-md flex items-center justify-center mb-2 border border-white/20 shadow-inner">
            <UtensilsCrossed className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-sm text-white/90 text-center line-clamp-1 px-2">
            {alt}
          </span>
          <span className="text-[11px] text-white/75 mt-0.5">{category}</span>
        </div>
      )}

      {/* Nozik gradient qoplama */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20 pointer-events-none" />

      {/* Toifa nishoni */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-[11px] font-bold text-slate-200 border border-white/10 shadow-md flex items-center gap-1">
        <Flame className="w-3 h-3 text-orange-400" />
        <span>{category}</span>
      </div>

      {/* Tayyorlanish vaqti */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-[11px] font-semibold text-orange-400 flex items-center gap-1 border border-white/10 shadow-md">
        <Clock className="w-3.5 h-3.5" />
        <span>{prepTime || 15} daq</span>
      </div>

      {/* Stop-list indikatori */}
      {!available && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-10">
          <span className="px-4 py-1.5 bg-rose-600 text-white font-black text-xs rounded-xl uppercase tracking-widest shadow-2xl border border-rose-500/50">
            STOP-LIST
          </span>
        </div>
      )}
    </div>
  );
};

export default FoodImage;
