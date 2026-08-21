import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Check, 
  Percent, 
  Receipt,
  Calculator
} from 'lucide-react';
import { useResto } from '../context/RestoContext';
import { formatCurrency } from '../utils/helpers';

const PaymentModal = () => {
  const { paymentOrder, setPaymentOrder, processPayment } = useResto();
  const [selectedMethod, setSelectedMethod] = useState('cash'); // cash, card, click_payme
  const [discountRate, setDiscountRate] = useState(0);
  const [receivedCash, setReceivedCash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (paymentOrder) {
      setDiscountRate(paymentOrder.discountRate || 0);
      setSelectedMethod('cash');
      setReceivedCash('');
    }
  }, [paymentOrder]);

  if (!paymentOrder) return null;

  // Qayta hisoblash
  const subtotal = paymentOrder.subtotal || 0;
  const serviceChargeRate = paymentOrder.serviceChargeRate || 10;
  const serviceChargeAmount = Math.round((subtotal * serviceChargeRate) / 100);
  const discountAmount = Math.round((subtotal * Number(discountRate)) / 100);
  const finalTotal = Math.max(0, subtotal + serviceChargeAmount - discountAmount);

  const receivedAmount = parseFloat(receivedCash) || 0;
  const changeAmount = receivedAmount >= finalTotal ? receivedAmount - finalTotal : 0;

  const handleQuickCash = (amount) => {
    setReceivedCash(amount.toString());
  };

  const handlePay = async () => {
    setIsProcessing(true);
    await processPayment(paymentOrder.id, selectedMethod, Number(discountRate));
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-400" />
              <span>Hisobni to'lash: {paymentOrder.tableNumber}</span>
            </h3>
            <p className="text-xs text-slate-400">Buyurtma raqami: #{paymentOrder.orderNumber}</p>
          </div>
          <button
            onClick={() => setPaymentOrder(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* To'lov usuli tanlash */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              To'lov turi:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMethod('cash')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedMethod === 'cash'
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-md shadow-orange-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Banknote className="w-6 h-6" />
                <span>Naqd pul</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedMethod === 'card'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span>Bank kartasi</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('click_payme')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedMethod === 'click_payme'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <QrCode className="w-6 h-6" />
                <span>Click / Payme</span>
              </button>
            </div>
          </div>

          {/* Chegirma tanlash */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                <span>Chegirma berish:</span>
              </label>
              <span className="text-xs font-medium text-emerald-400">{discountRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              {[0, 5, 10, 15, 20].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setDiscountRate(rate)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    discountRate === rate
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rate === 0 ? "Yo'q" : `${rate}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Naqd pul kalkulyatori (agar naqd tanlangan bo'lsa) */}
          {selectedMethod === 'cash' && (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5" /> Mijoz bergan summa:
                </span>
                <input
                  type="number"
                  placeholder="Summani kiriting..."
                  value={receivedCash}
                  onChange={(e) => setReceivedCash(e.target.value)}
                  className="w-40 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-right text-sm font-semibold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Tezkor kupyuralar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[50000, 100000, 200000, 500000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickCash(val)}
                    className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                  >
                    {val / 1000}k
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleQuickCash(finalTotal)}
                  className="px-2.5 py-1 text-xs bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg font-medium"
                >
                  Aniq summa
                </button>
              </div>

              {/* Qaytim */}
              {receivedAmount > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm">
                  <span className="text-slate-400">Mijozga qaytim:</span>
                  <span className={`font-bold font-mono text-base ${changeAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Xulosa quti */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Taomlar qiymati:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Xizmat haqi ({serviceChargeRate}%):</span>
              <span>+{formatCurrency(serviceChargeAmount)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Chegirma ({discountRate}%):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-base font-extrabold text-white">
              <span>Jami To'lov:</span>
              <span className="text-xl text-orange-400 font-mono">{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            onClick={() => setPaymentOrder(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium"
          >
            Bekor qilish
          </button>
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? "To'lanmoqda..." : "To'lovni qabul qilish"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
