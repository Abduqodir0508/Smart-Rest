import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { playNotificationSound } from '../utils/helpers';
import { DEFAULT_TABLES, DEFAULT_MENU, DEFAULT_ORDERS, DEFAULT_SETTINGS } from '../utils/defaultData';
import { 
  broadcastRealtimeUpdate, 
  subscribeToRealtimeUpdates, 
  initSupabase, 
  getCloudConfig 
} from '../services/realtime';

const RestoContext = createContext();

// LocalStorage kalitlari
const LS_TABLES = 'smart_resto_tables_v1';
const LS_MENU = 'smart_resto_menu_v1';
const LS_ORDERS = 'smart_resto_orders_v1';
const LS_SETTINGS = 'smart_resto_settings_v1';

// Yordamchi: LocalStorage dan yuklash
const getInitial = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) return parsed;
    }
  } catch (e) {
    console.warn(`LocalStorage o'qishda xatolik (${key}):`, e);
  }
  return fallback;
};

// Client-side statistika hisoblash
const computeLocalStats = (orders, menu, tables) => {
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
  // Asosiy ma'lumotlar
  const [tables, setTables] = useState(() => getInitial(LS_TABLES, DEFAULT_TABLES));
  const [menu, setMenu] = useState(() => getInitial(LS_MENU, DEFAULT_MENU));
  const [orders, setOrders] = useState(() => getInitial(LS_ORDERS, DEFAULT_ORDERS));
  const [settings, setSettings] = useState(() => getInitial(LS_SETTINGS, DEFAULT_SETTINGS));
  const [stats, setStats] = useState(() => computeLocalStats(
    getInitial(LS_ORDERS, DEFAULT_ORDERS),
    getInitial(LS_MENU, DEFAULT_MENU),
    getInitial(LS_TABLES, DEFAULT_TABLES)
  ));

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');

  // POS Savatcha holati
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [serviceChargeRate, setServiceChargeRate] = useState(10);
  const [discountRate, setDiscountRate] = useState(0);
  const [waiterName, setWaiterName] = useState("Alisher");
  const [orderNotes, setOrderNotes] = useState("");

  // Modallar holati
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

  // LocalStorage ga doimiy saqlash
  useEffect(() => {
    try {
      localStorage.setItem(LS_TABLES, JSON.stringify(tables));
      localStorage.setItem(LS_MENU, JSON.stringify(menu));
      localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
      localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
      setStats(computeLocalStats(orders, menu, tables));
    } catch (e) {
      console.warn("LocalStorage saqlashda xatolik:", e);
    }
  }, [tables, menu, orders, settings]);

  // Real-time listener: Barcha ulangan qurilmalar (Oshxona, Kassa, Ofitsiant) o'rtasida jonli sinxronizatsiya
  useEffect(() => {
    const cloudCfg = getCloudConfig();
    if (cloudCfg.supabaseUrl && cloudCfg.supabaseAnonKey) {
      initSupabase(cloudCfg.supabaseUrl, cloudCfg.supabaseAnonKey, (msg) => {
        handleRealtimeEvent(msg);
      });
    }

    const unsubscribe = subscribeToRealtimeUpdates((msg) => {
      handleRealtimeEvent(msg);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time xabarni qabul qilish va state-ga qo'llash
  const handleRealtimeEvent = (msg) => {
    if (!msg || !msg.type) return;

    if (msg.type === 'NEW_ORDER') {
      const newOrder = msg.payload.order;
      setOrders(prev => {
        const exists = prev.some(o => o.id === newOrder.id);
        if (exists) return prev.map(o => o.id === newOrder.id ? newOrder : o);
        return [newOrder, ...prev];
      });

      // Stolni band qilish
      setTables(prev => prev.map(t => t.id === newOrder.tableId ? { ...t, status: 'occupied', activeOrderId: newOrder.id } : t));

      // Oshxona va Kassa uchun audio qo'ng'iroq
      playNotificationSound();
      showToast(`Oshxonaga yangi buyurtma keldi! (${newOrder.tableNumber})`, "warning");
    }

    if (msg.type === 'ORDER_UPDATED') {
      const updatedOrder = msg.payload.order;
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      playNotificationSound();
      showToast(`Buyurtma #${updatedOrder.orderNumber} yangilandi`, "info");
    }

    if (msg.type === 'STATUS_UPDATED') {
      const { orderId, status } = msg.payload;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
      playNotificationSound();
      showToast(`Buyurtma holati "${status}" ga o'zgartirildi`, "info");
    }

    if (msg.type === 'ORDER_PAID') {
      const { orderId, closedOrder, tableId } = msg.payload;
      setOrders(prev => prev.map(o => o.id === orderId ? closedOrder : o));
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'empty', activeOrderId: null } : t));
      showToast(`Stol ${closedOrder.tableNumber} hisobi yopildi`, "success");
    }

    if (msg.type === 'STORAGE_SYNC') {
      // Boshqa tabdan ma'lumotlar yangilanganda
      const latestOrders = getInitial(LS_ORDERS, null);
      const latestTables = getInitial(LS_TABLES, null);
      if (latestOrders) setOrders(latestOrders);
      if (latestTables) setTables(latestTables);
    }
  };

  // Serverdan yuklash
  const loadAllData = useCallback(async () => {
    try {
      const [tablesRes, menuRes, ordersRes, statsRes, settingsRes] = await Promise.all([
        api.getTables().catch(() => null),
        api.getMenu().catch(() => null),
        api.getOrders().catch(() => null),
        api.getStats().catch(() => null),
        api.getSettings().catch(() => null)
      ]);

      if (tablesRes && tablesRes.success && tablesRes.data && tablesRes.data.length > 0) {
        setTables(tablesRes.data);
      }
      if (menuRes && menuRes.success && menuRes.data && menuRes.data.length > 0) {
        setMenu(menuRes.data);
      }
      if (ordersRes && ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      }
      if (statsRes && statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (settingsRes && settingsRes.success && settingsRes.data && Object.keys(settingsRes.data).length > 0) {
        setSettings(settingsRes.data);
      }
    } catch (error) {
      console.log("Serverga ulanish offline:", error.message);
    }
  }, []);

  // Dastlabki yuklash
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Stol tanlanganda
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    if (!table) {
      setCart([]);
      return;
    }

    if (table.activeOrderId) {
      const activeOrder = orders.find(o => o.id === table.activeOrderId);
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

  // Buyurtmani jo'natish (Real-time Broadcast bilan)
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
        try {
          await api.updateOrder(selectedTable.activeOrderId, {
            items: cart,
            serviceChargeRate,
            discountRate,
            waiterName,
            notes: orderNotes
          });
        } catch (e) {}

        const updatedOrder = {
          ...orders.find(o => o.id === selectedTable.activeOrderId),
          items: cart,
          subtotal,
          totalCost,
          serviceChargeRate,
          serviceChargeAmount,
          discountRate,
          discountAmount,
          totalAmount,
          netProfit,
          waiterName,
          notes: orderNotes,
          updatedAt: new Date().toISOString()
        };

        setOrders(prev => prev.map(o => o.id === selectedTable.activeOrderId ? updatedOrder : o));

        // Real-time tarqatish
        broadcastRealtimeUpdate('ORDER_UPDATED', { order: updatedOrder });
        showToast("Buyurtma muvaffaqiyatli yangilandi", "success");
      } else {
        // Yangi buyurtma
        const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 101;
        const newOrder = {
          id: newId,
          orderNumber: `ORD-${newId}`,
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
          paymentStatus: "unpaid",
          paymentMethod: null,
          notes: orderNotes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        try {
          await api.createOrder({
            tableId: selectedTable.id,
            waiterName,
            items: cart,
            serviceChargeRate,
            discountRate,
            notes: orderNotes
          });
        } catch (e) {}

        setOrders(prev => [newOrder, ...prev]);
        setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'occupied', activeOrderId: newId } : t));
        setSelectedTable(prev => ({ ...prev, status: 'occupied', activeOrderId: newId }));

        // Real-time tarqatish (Oshxona va barcha qurilmalarga)
        broadcastRealtimeUpdate('NEW_ORDER', { order: newOrder });
        showToast(`Yangi buyurtma #${newOrder.orderNumber} oshxonaga jo'natildi`, "success");
      }

      playNotificationSound();
    } catch (err) {
      showToast(err.message || "Xatolik yuz berdi", "error");
    }
  };

  // Oshxona statusini yangilash (Real-time Broadcast bilan)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus).catch(() => null);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o));

      // Real-time tarqatish
      broadcastRealtimeUpdate('STATUS_UPDATED', { orderId, status: newStatus });
      showToast(`Buyurtma holati yangilandi`, "success");
      playNotificationSound();
    } catch (err) {
      showToast("Statusni yangilashda xatolik", "error");
    }
  };

  // To'lovni amalga oshirish (Real-time Broadcast bilan)
  const processPayment = async (orderId, paymentMethod, discount) => {
    try {
      await api.payOrder(orderId, { paymentMethod, discountRate: discount }).catch(() => null);

      let closedOrder = null;
      let targetTableId = null;

      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          targetTableId = o.tableId;
          const disc = discount !== undefined ? discount : o.discountRate;
          const discAmount = Math.round((o.subtotal * disc) / 100);
          const totalAmount = o.subtotal + o.serviceChargeAmount - discAmount;
          const netProfit = totalAmount - o.totalCost;

          closedOrder = {
            ...o,
            paymentStatus: "paid",
            paymentMethod,
            status: "served",
            discountRate: disc,
            discountAmount: discAmount,
            totalAmount,
            netProfit,
            closedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          return closedOrder;
        }
        return o;
      }));

      // Stolni bo'shatish
      setTables(prev => prev.map(t => t.activeOrderId === orderId ? { ...t, status: 'empty', activeOrderId: null } : t));

      // Real-time tarqatish
      if (closedOrder) {
        broadcastRealtimeUpdate('ORDER_PAID', { 
          orderId, 
          closedOrder, 
          tableId: targetTableId || closedOrder.tableId 
        });
      }

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
