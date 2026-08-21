import express from 'express';
import { loadDb, saveDb } from '../data/store.js';

const router = express.Router();

// Asosiy statistika va KPI ko'rsatkichlari
router.get('/', (req, res) => {
  try {
    const db = loadDb();
    const orders = db.orders || [];
    const menu = db.menu || [];
    const tables = db.tables || [];

    // To'langan va barcha buyurtmalar
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const activeOrders = orders.filter(o => o.paymentStatus === 'unpaid');

    // Moliyaviy ko'rsatkichlar
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalCost = paidOrders.reduce((sum, o) => sum + (o.totalCost || 0), 0);
    const netProfit = paidOrders.reduce((sum, o) => sum + (o.netProfit || 0), 0);
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // Kutilayotgan (faol stollardagi) tushum
    const pendingRevenue = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Eng xaridorgir taomlar statistikasi (Popular Items)
    const itemSalesMap = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const key = item.name;
          if (!itemSalesMap[key]) {
            itemSalesMap[key] = {
              name: item.name,
              quantity: 0,
              revenue: 0,
              profit: 0
            };
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

    // Kategoriya bo'yicha taqsimot
    const categoryStats = {};
    menu.forEach(item => {
      const cat = item.category || 'Boshqa';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    // To'lov usullari bo'yicha tushum
    const paymentMethods = {
      cash: paidOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.totalAmount, 0),
      card: paidOrders.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.totalAmount, 0),
      click_payme: paidOrders.filter(o => o.paymentMethod === 'click_payme').reduce((sum, o) => sum + o.totalAmount, 0)
    };

    // Stollar bandligi
    const tableOccupancy = {
      total: tables.length,
      empty: tables.filter(t => t.status === 'empty').length,
      occupied: tables.filter(t => t.status === 'occupied').length,
      billed: tables.filter(t => t.status === 'billed').length
    };

    res.json({
      success: true,
      data: {
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
        tableOccupancy
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restoran sozlamalari
router.get('/settings', (req, res) => {
  try {
    const db = loadDb();
    res.json({ success: true, data: db.settings || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Sozlamalarni yangilash
router.put('/settings', (req, res) => {
  try {
    const db = loadDb();
    const { restaurantName, address, phone, defaultServiceCharge, wifiPassword } = req.body;

    db.settings = {
      ...db.settings,
      ...(restaurantName && { restaurantName }),
      ...(address && { address }),
      ...(phone && { phone }),
      ...(defaultServiceCharge !== undefined && { defaultServiceCharge: Number(defaultServiceCharge) }),
      ...(wifiPassword !== undefined && { wifiPassword })
    };

    saveDb(db);
    res.json({ success: true, data: db.settings, message: "Sozlamalar yangilandi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
