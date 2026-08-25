import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CreditCard, 
  Printer, 
  Armchair, 
  User, 
  Clock, 
  MessageSquare,
  Sparkles,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useResto } from '../context/RestoContext';
import { formatCurrency } from '../utils/helpers';

const PosView = () => {
  const {
    tables,
    menu,
    orders,
    selectedTable,
    handleSelectTable,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartItemNote,
    clearCart,
    serviceChargeRate,
    setServiceChargeRate,
    discountRate,
    setDiscountRate,
    activeWaiter,
    orderNotes,
    setOrderNotes,
    cartSubtotal,
    cartServiceAmount,
    cartDiscountAmount,
    cartTotal,
    submitOrder,
    setPaymentOrder,
    setReceiptOrder,
    setMenuModalData,
    setTableModalOpen
  } = useResto();

  const [selectedZone, setSelectedZone] = useState('Barchasi');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemNoteId, setActiveItemNoteId] = useState(null);

  // Zallar ro'yxati
  const zones = ['Barchasi', ...new Set(tables.map(t => t.zone))];

  // Kategoriyalar
  const categories = ['Barchasi', ...new Set(menu.map(m => m.category))];

  // Filterlangan stollar
  const filteredTables = tables.filter(t => selectedZone === 'Barchasi' || t.zone === selectedZone);

  // Filterlangan menyu
  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'Barchasi' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Stolga tegishli faol order ma'lumoti
  const currentTableOrder = selectedTable && selectedTable.activeOrderId
    ? orders.find(o => o.id === selectedTable.activeOrderId && o.paymentStatus === 'unpaid')
    : null;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-2.5 sm:p-4 max-w-7xl mx-auto w-full">
      {/* Chap va O'rta qism: Stollar va Menyu */}
      <div className="flex-1 flex flex-col gap-3 sm:gap-4 overflow-y-auto">
        
        {/* 1. Stollar Xaritasi (Table Map) */}
        <div className="glass-panel p-3 sm:p-4 rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              <h2 className="font-bold text-slate-100 text-sm sm:text-base">Zallar va Stollar</h2>
              <span className="text-[11px] sm:text-xs text-slate-400">({tables.length} ta)</span>
            </div>

            {/* Zallar filtri */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-0.5">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedZone === zone
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {zone}
                </button>
              ))}
              <button
                onClick={() => setTableModalOpen(true)}
                className="p-1 px-2 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 shrink-0"
                title="Yangi stol qo'shish"
              >
                <Plus className="w-3.5 h-3.5 text-orange-400" />
                <span>Stol</span>
              </button>
            </div>
          </div>

          {/* Stollar Grid (Mobil: 2-3 ustun, Katta ekranda: 5 ustun) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {filteredTables.map((table) => {
              const isSelected = selectedTable?.id === table.id;
              const tableOrder = orders.find(o => o.id === table.activeOrderId && o.paymentStatus === 'unpaid');
              const isOccupied = table.status === 'occupied' || Boolean(tableOrder);
              const isBilled = table.status === 'billed';

              return (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  className={`relative p-2.5 sm:p-3 rounded-xl border transition-all duration-200 text-left flex flex-col justify-between h-20 sm:h-24 ${
                    isSelected
                      ? 'ring-2 ring-orange-500 bg-orange-500/15 border-orange-500 shadow-glow'
                      : isBilled
                      ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-400'
                      : isOccupied
                      ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-400'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-100">
                      {table.number || `${table.id}-Stol`}
                    </span>
                    <span
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                        isBilled
                          ? 'bg-amber-400 animate-pulse'
                          : isOccupied
                          ? 'bg-rose-500'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>

                  <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate max-w-[60px]">{table.zone}</span>
                    <span>{table.capacity} kishi</span>
                  </div>

                  {tableOrder ? (
                    <div className="text-[10px] sm:text-[11px] font-mono font-bold text-orange-400 truncate">
                      {formatCurrency(tableOrder.totalAmount)}
                    </div>
                  ) : (
                    <div className="text-[9px] sm:text-[10px] text-emerald-400 font-medium">Bo'sh</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Menyu Boshqaruvi: Qidiruv, Toifalar va Taomlar */}
        <div className="glass-panel p-3 sm:p-4 rounded-2xl flex flex-col gap-3 sm:gap-4">
          
          {/* Qidiruv va Yangi Taom Qo'shish */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Taom yoki toifa qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-700/80 hover:border-slate-600 focus:border-orange-500 rounded-xl pl-9 pr-16 sm:pr-20 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 rounded-md"
                  >
                    Tozalash
                  </button>
                )}
              </div>

              {/* Yangi Taom Qo'shish Tugmasi */}
              <button
                type="button"
                onClick={() => setMenuModalData({})}
                className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md whitespace-nowrap active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Taom Qo'shish</span>
                <span className="sm:hidden">Taom</span>
              </button>
            </div>

            {/* Toifalar listi (Gorizontal Scroll) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
              {categories.map((cat) => {
                const count = cat === 'Barchasi' ? menu.length : menu.filter(m => m.category === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                        : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                        isSelected ? 'bg-black/25 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qidiruv natijasi hisobi */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 border-b border-slate-800/80 pb-2">
            <span>
              Topildi: <strong className="text-orange-400 font-mono">{filteredMenu.length}</strong> ta taom
            </span>
            {selectedCategory !== 'Barchasi' && (
              <button
                onClick={() => setSelectedCategory('Barchasi')}
                className="text-orange-400 hover:underline"
              >
                Barchasini ko'rsatish
              </button>
            )}
          </div>

          {/* Menyu Kartalari Grid (Mobil: 1-2 ustun, Katta ekranda: 3-4 ustun) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredMenu.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                <Search className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-sm">Bunday taom topilmadi</p>
                <p className="text-xs text-slate-500 mt-1">Boshqa so'z bilan qidirib ko'ring</p>
              </div>
            ) : (
              filteredMenu.map((dish) => {
                const inCartItem = cart.find(item => item.menuItemId === dish.id);
                const inCartQty = inCartItem?.quantity || 0;

                return (
                  <div
                    key={dish.id}
                    className={`group relative rounded-2xl border p-3 sm:p-4 flex flex-col justify-between gap-2.5 sm:gap-3 transition-all duration-200 ${
                      !dish.available
                        ? 'bg-slate-950/40 border-slate-900 opacity-60'
                        : inCartQty > 0
                        ? 'bg-slate-900 border-orange-500 shadow-md ring-1 ring-orange-500/30'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {/* Taom Nomi va Tavsifi */}
                    <div
                      className="cursor-pointer select-none"
                      onClick={() => dish.available && addToCart(dish)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-orange-400 transition-colors"
                          title={dish.name}
                        >
                          {dish.name}
                        </h3>
                        {!dish.available && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 uppercase">
                            Stop-list
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {dish.description || `${dish.category} bo'limidan sara taom`}
                      </p>
                    </div>

                    {/* Narxi va Qo'shish Tugmasi */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">NARXI</span>
                        <span className="font-mono font-bold text-xs sm:text-sm text-orange-400">
                          {formatCurrency(dish.price)}
                        </span>
                      </div>

                      {/* Savatchadagi soni yoki Qo'shish */}
                      {dish.available && (
                        inCartQty > 0 ? (
                          <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/50 p-1 rounded-xl">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(dish.id);
                              }}
                              className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold text-xs transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-xs text-orange-300">
                              {inCartQty}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(dish);
                              }}
                              className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold text-xs transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(dish)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white font-semibold text-xs border border-orange-500/30 hover:border-orange-500 transition-all shadow-sm active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Qo'shish</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* O'ng taraf: Savatcha va Buyurtma boshqaruvi (Mobil moslashuvchan) */}
      <div className="w-full lg:w-96 glass-panel rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl shrink-0">
        {/* Savatcha Header */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Armchair className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-100 text-sm sm:text-base">
                  {selectedTable ? `${selectedTable.number} (${selectedTable.zone})` : "Stol tanlanmagan"}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <User className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-300 font-medium">
                    {activeWaiter ? activeWaiter.name : "Admin"}
                  </span>
                </div>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                title="Tozalash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Savatchadagi Taomlar Ro'yxati */}
        <div className="flex-1 p-2.5 sm:p-3 overflow-y-auto space-y-2 max-h-[300px] sm:max-h-[360px]">
          {!selectedTable ? (
            <div className="h-40 flex flex-col items-center justify-center p-4 text-center text-slate-500">
              <Armchair className="w-10 h-10 stroke-1 mb-2 text-slate-600" />
              <p className="text-xs sm:text-sm font-medium">Buyurtma uchun yuqoridagi stollardan birini tanlang</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center p-4 text-center text-slate-500">
              <Sparkles className="w-8 h-8 stroke-1 mb-2 text-orange-400/50" />
              <p className="text-xs sm:text-sm font-medium text-slate-400">Savatcha bo'sh</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Menyudan taomlarni qo'shing</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.menuItemId}
                className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200 line-clamp-1">{item.name}</span>
                  <span className="font-mono font-bold text-xs text-orange-400">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.menuItemId, e.target.value)}
                      className="w-8 text-center bg-transparent font-mono text-xs font-bold text-white focus:outline-none"
                    />
                    <button
                      onClick={() => addToCart({ id: item.menuItemId, name: item.name, price: item.price, available: true })}
                      className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-800"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveItemNoteId(activeItemNoteId === item.menuItemId ? null : item.menuItemId)}
                    className={`text-[10px] sm:text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-colors ${
                      item.note
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{item.note ? 'Izoh' : '+Izoh'}</span>
                  </button>
                </div>

                {(activeItemNoteId === item.menuItemId || item.note) && (
                  <input
                    type="text"
                    placeholder="Izoh (masalan: piyozsiz)..."
                    value={item.note || ''}
                    onChange={(e) => updateCartItemNote(item.menuItemId, e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/60 rounded-lg px-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Hisob-kitob va Amallar Bloki */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 space-y-2.5 sm:space-y-3">
          {/* Xizmat haqi va Chegirma foizi */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block mb-1">Xizmat haqi:</span>
              <div className="flex items-center gap-1">
                {[0, 10, 15].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setServiceChargeRate(rate)}
                    className={`flex-1 py-1 rounded-lg border text-center text-[11px] font-medium ${
                      serviceChargeRate === rate
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block mb-1">Chegirma:</span>
              <div className="flex items-center gap-1">
                {[0, 5, 10].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setDiscountRate(rate)}
                    className={`flex-1 py-1 rounded-lg border text-center text-[11px] font-medium ${
                      discountRate === rate
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Umumiy buyurtma izohi */}
          <input
            type="text"
            placeholder="Buyurtma uchun umumiy izoh..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />

          {/* Xulosa Hisob */}
          <div className="space-y-1 text-xs pt-1 border-t border-slate-800/80">
            <div className="flex justify-between text-slate-400">
              <span>Oraliq summa:</span>
              <span>{formatCurrency(cartSubtotal)}</span>
            </div>
            {cartServiceAmount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Xizmat haqi ({serviceChargeRate}%):</span>
                <span>+{formatCurrency(cartServiceAmount)}</span>
              </div>
            )}
            {cartDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Chegirma ({discountRate}%):</span>
                <span>-{formatCurrency(cartDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1.5 text-sm font-extrabold text-white">
              <span>JAMI:</span>
              <span className="text-base sm:text-lg text-orange-400 font-mono">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          {/* Asosiy Amallar Tugmalari */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Oshxonaga jo'natish */}
            <button
              onClick={submitOrder}
              disabled={!selectedTable || cart.length === 0}
              className="col-span-2 flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{selectedTable?.activeOrderId ? "Buyurtmani yangilash" : "Oshxonaga Jo'natish"}</span>
            </button>

            {/* Chek ko'rish */}
            <button
              onClick={() => {
                if (currentTableOrder) {
                  setReceiptOrder(currentTableOrder);
                } else if (cart.length > 0) {
                  setReceiptOrder({
                    orderNumber: "PREVIEW",
                    tableNumber: selectedTable?.number || "Stol",
                    waiterName: activeWaiter?.name || "Admin",
                    items: cart,
                    subtotal: cartSubtotal,
                    serviceChargeRate,
                    serviceChargeAmount: cartServiceAmount,
                    discountRate,
                    discountAmount: cartDiscountAmount,
                    totalAmount: cartTotal,
                    createdAt: new Date().toISOString(),
                    paymentStatus: 'unpaid'
                  });
                }
              }}
              disabled={!selectedTable || cart.length === 0}
              className="flex items-center justify-center gap-1.5 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 disabled:opacity-40"
            >
              <Printer className="w-3.5 h-3.5 text-orange-400" />
              <span>Chek</span>
            </button>

            {/* To'lov */}
            <button
              onClick={() => {
                if (currentTableOrder) {
                  setPaymentOrder(currentTableOrder);
                } else if (cart.length > 0) {
                  submitOrder().then(() => {
                    const freshOrder = orders.find(o => o.tableId === selectedTable.id && o.paymentStatus === 'unpaid');
                    if (freshOrder) setPaymentOrder(freshOrder);
                  });
                }
              }}
              disabled={!selectedTable || cart.length === 0}
              className="flex items-center justify-center gap-1.5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-40"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>To'lash</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosView;
