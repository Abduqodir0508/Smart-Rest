import express from 'express';
import { loadDb, saveDb } from '../data/store.js';

const router = express.Router();

// Yordamchi hisoblash funksiyasi
const calculateOrderTotals = (items, serviceChargeRate = 10, discountRate = 0) => {
  let subtotal = 0;
  let totalCost = 0;

  items.forEach(item => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const cost = Number(item.costPrice) || Math.round(price * 0.45);
    subtotal += qty * price;
    totalCost += qty * cost;
  });

  const serviceChargeAmount = Math.round((subtotal * (Number(serviceChargeRate) || 0)) / 100);
  const discountAmount = Math.round((subtotal * (Number(discountRate) || 0)) / 100);
  const totalAmount = subtotal + serviceChargeAmount - discountAmount;
  const netProfit = totalAmount - totalCost;

  return {
    subtotal,
    serviceChargeRate: Number(serviceChargeRate) || 0,
    serviceChargeAmount,
    discountRate: Number(discountRate) || 0,
    discountAmount,
    totalAmount,
    totalCost,
    netProfit
  };
};

// Barcha buyurtmalarni olish
router.get('/', (req, res) => {
  try {
    const db = loadDb();
    const { status, paymentStatus, tableId } = req.query;

    let orders = [...db.orders];

    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (paymentStatus) {
      orders = orders.filter(o => o.paymentStatus === paymentStatus);
    }
    if (tableId) {
      orders = orders.filter(o => o.tableId === Number(tableId));
    }

    // Eng yangi buyurtmalarni boshida ko'rsatish
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bitta buyurtmani olish
router.get('/:id', (req, res) => {
  try {
    const db = loadDb();
    const orderId = Number(req.params.id);
    const order = db.orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Buyurtma topilmadi" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Yangi buyurtma yaratish yoki mavjud stolga qo'shish
router.post('/', (req, res) => {
  try {
    const db = loadDb();
    const {
      tableId,
      waiterName = "Ofitsiant",
      items = [],
      serviceChargeRate = db.settings?.defaultServiceCharge || 10,
      discountRate = 0,
      notes = ""
    } = req.body;

    if (!tableId || items.length === 0) {
      return res.status(400).json({ success: false, message: "Stol va kamida 1 ta taom tanlanishi shart" });
    }

    const table = db.tables.find(t => t.id === Number(tableId));
    if (!table) {
      return res.status(404).json({ success: false, message: "Bunday stol mavjud emas" });
    }

    const totals = calculateOrderTotals(items, serviceChargeRate, discountRate);
    const newId = db.orders.length > 0 ? Math.max(...db.orders.map(o => o.id)) + 1 : 101;
    const orderNumber = `ORD-${newId}`;

    const newOrder = {
      id: newId,
      orderNumber,
      tableId: Number(tableId),
      tableNumber: table.number,
      waiterName: waiterName || "Ofitsiant",
      items,
      ...totals,
      status: "pending", // pending, preparing, ready, served
      paymentStatus: "unpaid",
      paymentMethod: null,
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.push(newOrder);

    // Stol statusini yangilash
    table.status = "occupied";
    table.activeOrderId = newId;

    saveDb(db);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Oshxona statusini yangilash (pending -> preparing -> ready -> served)
router.put('/:id/status', (req, res) => {
  try {
    const db = loadDb();
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Noto'g'ri status kiritildi" });
    }

    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Buyurtma topilmadi" });
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    saveDb(db);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// To'lovni qabul qilish va stolni bo'shatish (Chek yopish)
router.put('/:id/pay', (req, res) => {
  try {
    const db = loadDb();
    const orderId = Number(req.params.id);
    const { paymentMethod = "cash", discountRate } = req.body;

    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Buyurtma topilmadi" });
    }

    if (discountRate !== undefined) {
      const totals = calculateOrderTotals(order.items, order.serviceChargeRate, discountRate);
      Object.assign(order, totals);
    }

    order.paymentStatus = "paid";
    order.paymentMethod = paymentMethod; // cash, card, click_payme
    order.status = "served";
    order.closedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    // Stolni bo'shatish
    const table = db.tables.find(t => t.id === order.tableId);
    if (table) {
      table.status = "empty";
      table.activeOrderId = null;
    }

    saveDb(db);
    res.json({ success: true, data: order, message: "To'lov muvaffaqiyatli amalga oshirildi va stol bo'shatildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Buyurtmaga yangi taom qo'shish yoki tahrirlash
router.put('/:id', (req, res) => {
  try {
    const db = loadDb();
    const orderId = Number(req.params.id);
    const orderIndex = db.orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: "Buyurtma topilmadi" });
    }

    const { items, serviceChargeRate, discountRate, notes, waiterName } = req.body;
    const currentOrder = db.orders[orderIndex];

    const updatedItems = items || currentOrder.items;
    const updatedServiceChargeRate = serviceChargeRate !== undefined ? serviceChargeRate : currentOrder.serviceChargeRate;
    const updatedDiscountRate = discountRate !== undefined ? discountRate : currentOrder.discountRate;

    const totals = calculateOrderTotals(updatedItems, updatedServiceChargeRate, updatedDiscountRate);

    db.orders[orderIndex] = {
      ...currentOrder,
      items: updatedItems,
      ...totals,
      waiterName: waiterName || currentOrder.waiterName,
      notes: notes !== undefined ? notes : currentOrder.notes,
      updatedAt: new Date().toISOString()
    };

    saveDb(db);
    res.json({ success: true, data: db.orders[orderIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Buyurtmani bekor qilish
router.delete('/:id', (req, res) => {
  try {
    const db = loadDb();
    const orderId = Number(req.params.id);
    const order = db.orders.find(o => o.id === orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Buyurtma topilmadi" });
    }

    // Stolni bo'shatish agar stol ushbu buyurtmaga bog'langan bo'lsa
    const table = db.tables.find(t => t.id === order.tableId);
    if (table && table.activeOrderId === orderId) {
      table.status = "empty";
      table.activeOrderId = null;
    }

    db.orders = db.orders.filter(o => o.id !== orderId);
    saveDb(db);
    res.json({ success: true, message: "Buyurtma bekor qilindi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
