import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { playNotificationSound } from '../utils/helpers';

const RestoContext = createContext();

export const RestoProvider = ({ children }) => {
  // Asosiy ma'lumotlar
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState({
    restaurantName: "Smart Resto & Lounge",
    address: "Toshkent sh., Amir Temur shox ko'chasi 45",
    phone: "+998 (71) 200-00-22",
    defaultServiceCharge: 10,
    currency: "so'm"
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'kitchen', 'admin', 'orders'

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
  const [menuModalData, setMenuModalData] = useState(null); // null = yopiq, {} = yangi, {item} = tahrirlash
  const [tableModalOpen, setTableModalOpen] = useState(false);

  // Toast bildirishnoma
  const [toast, setToast] = useState(null);
  const previousPendingCountRef = useRef(0);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.id === toast?.id ? null : prev));
    }, 4000);
  };

  // Barcha ma'lumotlarni serverdan yuklash
  const loadAllData = useCallback(async () => {
    try {
      const [tablesRes, menuRes, ordersRes, statsRes, settingsRes] = await Promise.all([
        api.getTables(),
        api.getMenu(),
        api.getOrders(),
        api.getStats(),
        api.getSettings().catch(() => ({ data: {} }))
      ]);

      if (tablesRes.success) setTables(tablesRes.data);
      if (menuRes.success) setMenu(menuRes.data);
      if (ordersRes.success) {
        setOrders(ordersRes.data);

        // Yangi buyurtma kelganini tekshirish va ovoz chiqarish (KDS uchun)
        const pendingCount = ordersRes.data.filter(o => o.status === 'pending').length;
        if (previousPendingCountRef.current > 0 && pendingCount > previousPendingCountRef.current) {
          playNotificationSound();
          showToast("Oshxonaga yangi buyurtma keldi!", "warning");
        }
        previousPendingCountRef.current = pendingCount;
      }
      if (statsRes.success) setStats(statsRes.data);
      if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data);
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Dastlabki yuklash va har 6 soniyada avto-yangilanish (real-vaqt hissi)
  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadAllData();
    }, 6000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  // Stol tanlanganda, agar unda faol buyurtma bo'lsa uni savatchaga yuklash yoki tozalash
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

    // Yangi bo'sh stol
    setCart([]);
    setDiscountRate(0);
    setOrderNotes("");
  };

  // Savatchaga taom qo'shish
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
            costPrice: menuItem.costPrice,
            quantity: 1,
            note: ""
          }
        ];
      }
    });
  };

  // Savatchadan taomni kamaytirish yoki o'chirish
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

  // Savatchadagi to'liq miqdorni o'rnatish
  const updateCartQuantity = (menuItemId, qty) => {
    const quantity = Math.max(0, parseInt(qty) || 0);
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
    } else {
      setCart(prev => prev.map(item => item.menuItemId === menuItemId ? { ...item, quantity } : item));
    }
  };

  // Taomga maxsus izoh yozish (masalan "piyozsiz")
  const updateCartItemNote = (menuItemId, note) => {
    setCart(prev => prev.map(item => item.menuItemId === menuItemId ? { ...item, note } : item));
  };

  // Savatchani tozalash
  const clearCart = () => {
    setCart([]);
    setOrderNotes("");
  };

  // Buyurtmani oshxonaga yuborish (Saqlash)
  const submitOrder = async () => {
    if (!selectedTable) {
      showToast("Iltimos, avval stolni tanlang!", "error");
      return;
    }
    if (cart.length === 0) {
      showToast("Savatcha bo'sh! Kamida 1 ta taom tanlang", "error");
      return;
    }

    try {
      // Agar stol allaqachon faol buyurtmaga ega bo'lsa - tahrirlash (update)
      if (selectedTable.activeOrderId) {
        const res = await api.updateOrder(selectedTable.activeOrderId, {
          items: cart,
          serviceChargeRate,
          discountRate,
          waiterName,
          notes: orderNotes
        });
        if (res.success) {
          showToast(`Buyurtma #${res.data.orderNumber} muvaffaqiyatli yangilandi`, "success");
          playNotificationSound();
          loadAllData();
        }
      } else {
        // Yangi buyurtma ochish
        const res = await api.createOrder({
          tableId: selectedTable.id,
          waiterName,
          items: cart,
          serviceChargeRate,
          discountRate,
          notes: orderNotes
        });
        if (res.success) {
          showToast(`Yangi buyurtma #${res.data.orderNumber} oshxonaga jo'natildi`, "success");
          playNotificationSound();
          loadAllData();
          // Yangi order ma'lumotini saqlab stolni yangilaymiz
          setSelectedTable(prev => ({ ...prev, status: 'occupied', activeOrderId: res.data.id }));
        }
      }
    } catch (err) {
      showToast(err.message || "Buyurtmani yuborishda xatolik", "error");
    }
  };

  // Oshxona statusini yangilash
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Buyurtma holati "${newStatus}" ga o'zgartirildi`, "success");
        playNotificationSound();
        loadAllData();
      }
    } catch (err) {
      showToast("Statusni yangilashda xatolik", "error");
    }
  };

  // To'lovni amalga oshirish
  const processPayment = async (orderId, paymentMethod, discount) => {
    try {
      const res = await api.payOrder(orderId, {
        paymentMethod,
        discountRate: discount !== undefined ? discount : discountRate
      });
      if (res.success) {
        showToast("Hisob yopildi va stol bo'shatildi!", "success");
        setPaymentOrder(null);
        setReceiptOrder(res.data); // Avtomatik chek oynasini ochish
        loadAllData();
        clearCart();
        setSelectedTable(null);
      }
    } catch (err) {
      showToast(err.message || "To'lovda xatolik", "error");
    }
  };

  // Savatcha hisob-kitoblari
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartServiceAmount = Math.round((cartSubtotal * serviceChargeRate) / 100);
  const cartDiscountAmount = Math.round((cartSubtotal * discountRate) / 100);
  const cartTotal = cartSubtotal + cartServiceAmount - cartDiscountAmount;

  return (
    <RestoContext.Provider
      value={{
        tables,
        menu,
        orders,
        stats,
        settings,
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
