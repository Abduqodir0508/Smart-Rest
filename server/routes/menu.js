import express from 'express';
import { loadDb, saveDb } from '../data/store.js';

const router = express.Router();

// Barcha menyu taomlarini olish
router.get('/', (req, res) => {
  try {
    const db = loadDb();
    res.json({ success: true, data: db.menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Yangi taom qo'shish
router.post('/', (req, res) => {
  try {
    const db = loadDb();
    const { name, category, price, costPrice, prepTime, image, description, available } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "Taom nomi va narxi kiritilishi shart" });
    }

    const newId = db.menu.length > 0 ? Math.max(...db.menu.map(m => m.id)) + 1 : 1;
    const newMenuItem = {
      id: newId,
      name: name.trim(),
      category: category || "Boshqa",
      price: Number(price),
      costPrice: costPrice !== undefined ? Number(costPrice) : Math.round(Number(price) * 0.45),
      prepTime: Number(prepTime) || 15,
      available: available !== undefined ? available : true,
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      description: description || ""
    };

    db.menu.push(newMenuItem);
    saveDb(db);
    res.status(201).json({ success: true, data: newMenuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Taom ma'lumotlarini yangilash
router.put('/:id', (req, res) => {
  try {
    const db = loadDb();
    const itemId = Number(req.params.id);
    const itemIndex = db.menu.findIndex(m => m.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Taom topilmadi" });
    }

    const { name, category, price, costPrice, prepTime, image, description, available } = req.body;

    if (name !== undefined) db.menu[itemIndex].name = name.trim();
    if (category !== undefined) db.menu[itemIndex].category = category;
    if (price !== undefined) db.menu[itemIndex].price = Number(price);
    if (costPrice !== undefined) db.menu[itemIndex].costPrice = Number(costPrice);
    if (prepTime !== undefined) db.menu[itemIndex].prepTime = Number(prepTime);
    if (image !== undefined) db.menu[itemIndex].image = image;
    if (description !== undefined) db.menu[itemIndex].description = description;
    if (available !== undefined) db.menu[itemIndex].available = Boolean(available);

    saveDb(db);
    res.json({ success: true, data: db.menu[itemIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Taom mavjudligini (active/stop-list) tezkor almashtirish
router.post('/toggle/:id', (req, res) => {
  try {
    const db = loadDb();
    const itemId = Number(req.params.id);
    const item = db.menu.find(m => m.id === itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: "Taom topilmadi" });
    }

    item.available = !item.available;
    saveDb(db);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Taomni o'chirish
router.delete('/:id', (req, res) => {
  try {
    const db = loadDb();
    const itemId = Number(req.params.id);
    const exists = db.menu.some(m => m.id === itemId);

    if (!exists) {
      return res.status(404).json({ success: false, message: "Taom topilmadi" });
    }

    db.menu = db.menu.filter(m => m.id !== itemId);
    saveDb(db);
    res.json({ success: true, message: "Taom muvaffaqiyatli o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
