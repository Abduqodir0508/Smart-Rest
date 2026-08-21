import React from 'react';
import { Printer, X, CheckCircle2, QrCode } from 'lucide-react';
import { useResto } from '../context/RestoContext';
import { formatCurrency, formatDateTime } from '../utils/helpers';

const ReceiptModal = () => {
  const { receiptOrder, setReceiptOrder, settings } = useResto();

  if (!receiptOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentName = (method) => {
    switch (method) {
      case 'cash': return 'Naqd pul';
      case 'card': return 'Plastik karta (Humo/Uzcard)';
      case 'click_payme': return 'Click / Payme (QR)';
      default: return "To'lanmagan";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-slate-100">Elektron Chek (Receipt)</h3>
          </div>
          <button
            onClick={() => setReceiptOrder(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area (80mm Thermal Receipt Preview) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40">
          <div
            id="printable-receipt"
            className="bg-white text-black p-6 rounded-xl font-mono text-xs shadow-inner mx-auto max-w-[320px] border border-gray-200 leading-relaxed"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <h2 className="font-bold text-base uppercase tracking-wider">{settings.restaurantName || "SMART RESTO"}</h2>
              <p className="text-[10px] text-gray-600">{settings.address || "Toshkent shahar"}</p>
              <p className="text-[10px] text-gray-600">Tel: {settings.phone || "+998 71 200 00 22"}</p>
              <div className="mt-1 text-[11px] font-bold">XARID CHEKI / HISOB</div>
            </div>

            {/* Meta */}
            <div className="py-2 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Chek raqami:</span>
                <span className="font-bold">#{receiptOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Stol:</span>
                <span className="font-bold">{receiptOrder.tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Ofitsiant:</span>
                <span>{receiptOrder.waiterName || "Alisher"}</span>
              </div>
              <div className="flex justify-between">
                <span>Vaqt:</span>
                <span>{formatDateTime(receiptOrder.createdAt)}</span>
              </div>
            </div>

            {/* Taomlar ro'yxati */}
            <div className="py-2 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-bold text-[10px] pb-1">
                <span>Nomi</span>
                <span>Miq. x Narxi</span>
                <span>Jami</span>
              </div>
              <div className="space-y-1">
                {receiptOrder.items?.map((item, idx) => (
                  <div key={idx} className="text-[10px]">
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <div className="flex justify-between text-gray-600 pl-1">
                      <span>{item.quantity} dona x {formatCurrency(item.price)}</span>
                      <span className="font-bold text-gray-900">{formatCurrency(item.quantity * item.price)}</span>
                    </div>
                    {item.note && (
                      <div className="text-[9px] italic text-gray-500 pl-1">↳ {item.note}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hisob-kitob qismi */}
            <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between text-gray-700">
                <span>Oraliq hisob:</span>
                <span>{formatCurrency(receiptOrder.subtotal)}</span>
              </div>
              {receiptOrder.serviceChargeAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Xizmat haqi ({receiptOrder.serviceChargeRate}%):</span>
                  <span>+{formatCurrency(receiptOrder.serviceChargeAmount)}</span>
                </div>
              )}
              {receiptOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Chegirma ({receiptOrder.discountRate}%):</span>
                  <span>-{formatCurrency(receiptOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-gray-300 text-black">
                <span>JAMI TO'LOV:</span>
                <span>{formatCurrency(receiptOrder.totalAmount)}</span>
              </div>
            </div>

            {/* To'lov turi va footer */}
            <div className="pt-2 text-center text-[10px] space-y-1">
              <div className="flex justify-between text-gray-700">
                <span>To'lov usuli:</span>
                <span className="font-bold">{getPaymentName(receiptOrder.paymentMethod)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Holati:</span>
                <span className="font-bold text-emerald-700 uppercase">
                  {receiptOrder.paymentStatus === 'paid' ? "TO'LANDI" : "TO'LANMAGAN"}
                </span>
              </div>

              <div className="pt-3 pb-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border border-gray-300 rounded flex items-center justify-center bg-gray-50 mb-1">
                  <QrCode className="w-12 h-12 text-gray-800" />
                </div>
                <p className="text-[9px] text-gray-500">Wi-Fi: {settings.wifiPassword || "SmartResto2026"}</p>
                <p className="font-bold text-[10px] mt-1">Tashrifingiz uchun rahmat!</p>
                <p className="text-[8px] text-gray-400 mt-0.5">Yana kutib qolamiz</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Amallar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            onClick={() => setReceiptOrder(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium"
          >
            Yopish
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Chekni chop etish</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
