import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { playNotificationSound } from '../utils/helpers';
import { DEFAULT_TABLES, DEFAULT_MENU, DEFAULT_SETTINGS } from '../utils/defaultData';
import {
  fetchSupabaseTables,
  fetchSupabaseFoods,
  fetchSupabaseOrders,
  createSupabaseOrder,
  updateSupabaseOrder,
  paySupabaseOrder,
  subscribeToSupabaseRealtimeDB
} from '../services/supabase';
import { broadcastRealtimeUpdate, subscribeToRealtimeUpdates } from '../services/realtime';

const RestoContext = createContext();

// Statistika hisoblash funksiyasi
const computeStats = (orders, menu, tables) => {
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const activeOrders = orders.filter(o => o.paymentStatus === 'unpaid');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCost = paidOrders.reduce((sum, o) => sum + (o.totalCost || 0), 0);
  const netProfit = paidOrders.reduce((sum, o) => sum + (o.netProfit || 0), 0);
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
  const pendingRevenue = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const itemSalesMap = {};
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const key = item.name;
        if (!itemSalesMap[key]) {
          itemSalesMap[key] = { name: item.name, quantity: 0, revenue: 0, profit: 0 };
        }
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const cost = Number(item.costPrice) || Math.round(price * 0.45);
        itemSalesMap[key].quantity += qty;
        itemSalesMap[key].revenue += qty * price;
        itemSalesMap[key].profit += qty * (price - cost);
      });
    }
  });

  const popularDishes = Object.values(itemSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const categoryStats = {};
  menu.forEach(item => {
    const cat = item.category || 'Boshqa';
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  const paymentMethods = {
    cash: paidOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.totalAmount, 0),
    card: paidOrders.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.totalAmount, 0),
    click_payme: paidOrders.filter(o => o.paymentMethod === 'click_payme').reduce((sum, o) => sum + o.totalAmount, 0)
  };

  return {
    totalRevenue,
    totalCost,
    netProfit,
    profitMargin,
    averageOrderValue,
    pendingRevenue,
    totalOrdersCount: orders.length,
    paidOrdersCount: paidOrders.length,
    activeOrdersCount: activeOrders.length,
    popularDishes,
    categoryStats,
    paymentMethods,
    tableOccupancy: {
      total: tables.length,
      empty: tables.filter(t => t.status === 'empty').length,
      occupied: tables.filter(t => t.status === 'occupied').length,
      billed: tables.filter(t => t.status === 'billed').length
    }
  };
};

export const RestoProvider = ({ children }) => {
  // To'g'ridan-to'g'ri Supabase dan yuklanadigan holatlar
  const [tables, setTables] = useState(DEFAULT_TABLES);
  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [stats, setStats] = useState(() => computeStats([], DEFAULT_MENU, DEFAULT_TABLES));

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pos');

  // POS Savatcha
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [serviceChargeRate, setServiceChargeRate] = useState(10);
  const [discountRate, setDiscountRate] = useState(0);
  const [waiterName, setWaiterName] = useState("Alisher");
  const [orderNotes, setOrderNotes] = useState("");

  // Modallar
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [menuModalData, setMenuModalData] = useState(null);
  const [tableModalOpen, setTableModalOpen] = useState(false);

  // Toast bildirishnoma
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.id === toast?.id ? null : prev));
    }, 4000);
  };

  // 1. Supabase Bazasidan Ma'lumotlarni Yuklash
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedTables, fetchedFoods, fetchedOrders] = await Promise.all([
        fetchSupabaseTables(),
        fetchSupabaseFoods(),
        fetchSupabaseOrders()
      ]);

      if (fetchedTables && fetchedTables.length > 0) setTables(fetchedTables);
      if (fetchedFoods && fetchedFoods.length > 0) setMenu(fetchedFoods);
      if (fetchedOrders) setOrders(fetchedOrders);

      setStats(computeStats(fetchedOrders || [], fetchedFoods || DEFAULT_MENU, fetchedTables || DEFAULT_TABLES));
    } catch (err) {
      console.warn("Supabase yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Dastlabki yuklash va Supabase Realtime tinglovchisi
  useEffect(() => {
    loadAllData();

    // Supabase Postgres Changes Realtime tinglash
    const unsubscribeSupabase = subscribeToSupabaseRealtimeDB(
      // Table o'zgarganda (masalan: telefon orqali band qilinganda)
      (eventType, updatedTable) => {
        setTables(prev => {
          const exists = prev.some(t => t.id === updatedTable.id);
          if (exists) {
            return prev.map(t => t.id === updatedTable.id ? { ...t, ...updatedTable } : t);
          }
          return [...prev, updatedTable];
        });
      },
      // Order o'zgarganda (yangi buyurtma, status o'zgarishi, to'lov)
      (eventType, orderData) => {
        if (eventType === 'INSERT') {
          setOrders(prev => {
            const exists = prev.some(o => o.id === orderData.id);
            if (exists) return prev;
            return [orderData, ...prev];
          });
          // Yangi buyurtma kelganda ovozli signal (Ding chime)
          playNotificationSound();
          showToast(`⚡ Yangi buyurtma #${orderData.orderNumber} (${orderData.tableNumber})`, "warning");
        } else if (eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === orderData.id ? { ...o, ...orderData } : o));
          playNotificationSound();
          showToast(`Buyurtma #${orderData.orderNumber} holati yangilandi`, "info");
        } else if (eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== orderData.id));
        }
      },
      // Food o'zgarganda (narx yoki stop-list)
      (eventType, foodData) => {
        setMenu(prev => prev.map(m => m.id === foodData.id ? { ...m, ...foodData } : m));
      }
    );

    // Cross-tab broadcast listener
    const unsubscribeBroadcast = subscribeToRealtimeUpdates((msg) => {
      if (msg && msg.type === 'NEW_ORDER') {
        playNotificationSound();
      }
    });

    return () => {
      unsubscribeSupabase();
      unsubscribeBroadcast();
    };
  }, [loadAllData]);

  // Har safar orders o'zgarganda statistikani qayta hisoblash
  useEffect(() => {
    setStats(computeStats(orders, menu, tables));
  }, [orders, menu, tables]);

  // Stol tanlanganda
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    if (!table) {
      setCart([]);
      return;
    }

    if (table.activeOrderId) {
      const activeOrder = orders.find(o => o.id === table.activeOrderId && o.paymentStatus === 'unpaid');
      if (activeOrder) {
        setCart(activeOrder.items.map(item => ({ ...item })));
        setServiceChargeRate(activeOrder.serviceChargeRate ?? 10);
        setDiscountRate(activeOrder.discountRate ?? 0);
        setWaiterName(activeOrder.waiterName || "Alisher");
        setOrderNotes(activeOrder.notes || "");
        return;
      }
    }

    setCart([]);
    setDiscountRate(0);
    setOrderNotes("");
  };

  // Savatchaga qo'shish
  const addToCart = (menuItem) => {
    if (!menuItem.available) {
      showToast(`"${menuItem.name}" taomi stop-listda`, "error");
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.menuItemId === menuItem.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            costPrice: menuItem.costPrice || Math.round(menuItem.price * 0.45),
            quantity: 1,
            note: ""
          }
        ];
      }
    });
  };

  // Savatchadan kamaytirish
  const removeFromCart = (menuItemId) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.menuItemId === menuItemId);
      if (!existing) return prevCart;
      if (existing.quantity > 1) {
        return prevCart.map(item =>
          item.menuItemId === menuItemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevCart.filter(item => item.menuItemId !== menuItemId);
    });
  };

  const updateCartQuantity = (menuItemId, qty) => {
    const quantity = Math.max(0, parseInt(qty) || 0);
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
    } else {
      setCart(prev => prev.map(item => item.menuItemId === menuItemId ? { ...item, quantity } : item));
    }
  };

  const updateCartItemNote = (menuItemId, note) => {
    setCart(prev => prev.map(item => item.menuItemId === menuItemId ? { ...item, note } : item));
  };

  const clearCart = () => {
    setCart([]);
    setOrderNotes("");
  };

  // 3. Buyurtmani Supabase-ga jo'natish
  const submitOrder = async () => {
    if (!selectedTable) {
      showToast("Iltimos, avval stolni tanlang!", "error");
      return;
    }
    if (cart.length === 0) {
      showToast("Savatcha bo'sh! Kamida 1 ta taom tanlang", "error");
      return;
    }

    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const totalCost = cart.reduce((s, i) => s + ((i.costPrice || Math.round(i.price * 0.45)) * i.quantity), 0);
    const serviceChargeAmount = Math.round((subtotal * serviceChargeRate) / 100);
    const discountAmount = Math.round((subtotal * discountRate) / 100);
    const totalAmount = subtotal + serviceChargeAmount - discountAmount;
    const netProfit = totalAmount - totalCost;

    try {
      if (selectedTable.activeOrderId) {
        // Tahrirlash
        const updated = await updateSupabaseOrder(selectedTable.activeOrderId, {
          items: cart,
          subtotal,
          serviceChargeRate,
          serviceChargeAmount,
          discountRate,
          discountAmount,
          totalAmount,
          totalCost,
          netProfit,
          waiterName,
          notes: orderNotes
        });

        setOrders(prev => prev.map(o => o.id === selectedTable.activeOrderId ? updated : o));
        broadcastRealtimeUpdate('ORDER_UPDATED', { order: updated });
        showToast("Buyurtma Supabase bazasida yangilandi", "success");
      } else {
        // Yangi buyurtma yaratish
        const tempOrderNum = `ORD-${Date.now().toString().slice(-4)}`;
        const createdOrder = await createSupabaseOrder({
          orderNumber: tempOrderNum,
          tableId: selectedTable.id,
          tableNumber: selectedTable.number,
          waiterName: waiterName || "Alisher",
          items: cart,
          subtotal,
          totalCost,
          serviceChargeRate,
          serviceChargeAmount,
          discountRate,
          discountAmount,
          totalAmount,
          netProfit,
          status: "pending",
          notes: orderNotes
        });

        setOrders(prev => [createdOrder, ...prev]);
        setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'occupied', activeOrderId: createdOrder.id } : t));
        setSelectedTable(prev => ({ ...prev, status: 'occupied', activeOrderId: createdOrder.id }));

        broadcastRealtimeUpdate('NEW_ORDER', { order: createdOrder });
        showToast(`Yangi buyurtma #${createdOrder.orderNumber} oshxonaga jo'natildi`, "success");
      }

      playNotificationSound();
    } catch (err) {
      showToast(err.message || "Xatolik yuz berdi", "error");
    }
  };

  // 4. Oshxona statusini Supabase-da yangilash
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updated = await updateSupabaseOrder(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      broadcastRealtimeUpdate('STATUS_UPDATED', { orderId, status: newStatus });
      showToast(`Holat yangilandi: ${newStatus}`, "success");
      playNotificationSound();
    } catch (err) {
      showToast("Statusni yangilashda xatolik", "error");
    }
  };

  // 5. To'lovni amalga oshirish va stolni bo'shatish
  const processPayment = async (orderId, paymentMethod, discount) => {
    try {
      const closedOrder = await paySupabaseOrder(orderId, selectedTable?.id, paymentMethod, Number(discount));

      setOrders(prev => prev.map(o => o.id === orderId ? closedOrder : o));
      setTables(prev => prev.map(t => t.id === closedOrder.tableId ? { ...t, status: 'empty', activeOrderId: null } : t));

      broadcastRealtimeUpdate('ORDER_PAID', { orderId, closedOrder, tableId: closedOrder.tableId });

      showToast("Hisob yopildi va stol bo'shatildi!", "success");
      setPaymentOrder(null);
      if (closedOrder) setReceiptOrder(closedOrder);
      clearCart();
      setSelectedTable(null);
    } catch (err) {
      showToast(err.message || "To'lovda xatolik", "error");
    }
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartServiceAmount = Math.round((cartSubtotal * serviceChargeRate) / 100);
  const cartDiscountAmount = Math.round((cartSubtotal * discountRate) / 100);
  const cartTotal = cartSubtotal + cartServiceAmount - cartDiscountAmount;

  return (
    <RestoContext.Provider
      value={{
        tables,
        setTables,
        menu,
        setMenu,
        orders,
        setOrders,
        stats,
        settings,
        setSettings,
        loading,
        activeTab,
        setActiveTab,
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
        waiterName,
        setWaiterName,
        orderNotes,
        setOrderNotes,
        cartSubtotal,
        cartServiceAmount,
        cartDiscountAmount,
        cartTotal,
        submitOrder,
        updateOrderStatus,
        processPayment,
        loadAllData,
        receiptOrder,
        setReceiptOrder,
        paymentOrder,
        setPaymentOrder,
        menuModalData,
        setMenuModalData,
        tableModalOpen,
        setTableModalOpen,
        toast,
        showToast
      }}
    >
      {children}
    </RestoContext.Provider>
  );
};

export const useResto = () => {
  const context = useContext(RestoContext);
  if (!context) {
    throw new Error('useResto faqat RestoProvider ichida ishlatilishi kerak');
  }
  return context;
};
