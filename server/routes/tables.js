import express from 'express';
import { loadDb, saveDb } from '../data/store.js';

const router = express.Router();

// Barcha stollarni olish
router.get('/', (req, res) => {
  try {
    const db = loadDb();
    res.json({ success: true, data: db.tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Yangi stol qo'shish
router.post('/', (req, res) => {
  try {
    const db = loadDb();
    const { number, zone, capacity } = req.body;
    
    if (!number) {
      return res.status(400).json({ success: false, message: "Stol raqami kiritilishi shart" });
    }

    const newId = db.tables.length > 0 ? Math.max(...db.tables.map(t => t.id)) + 1 : 1;
    const newTable = {
      id: newId,
      number: number.trim(),
      zone: zone || "Asosiy Zal",
      capacity: Number(capacity) || 4,
      status: "empty",
      activeOrderId: null
    };

    db.tables.push(newTable);
    saveDb(db);
    res.status(201).json({ success: true, data: newTable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stol statusi yoki ma'lumotini yangilash
router.put('/:id', (req, res) => {
  try {
    const db = loadDb();
    const tableId = Number(req.params.id);
    const tableIndex = db.tables.findIndex(t => t.id === tableId);

    if (tableIndex === -1) {
      return res.status(404).json({ success: false, message: "Stol topilmadi" });
    }

    const { number, zone, capacity, status, activeOrderId } = req.body;

    if (number !== undefined) db.tables[tableIndex].number = number;
    if (zone !== undefined) db.tables[tableIndex].zone = zone;
    if (capacity !== undefined) db.tables[tableIndex].capacity = Number(capacity);
    if (status !== undefined) db.tables[tableIndex].status = status; // empty, occupied, billed
    if (activeOrderId !== undefined) db.tables[tableIndex].activeOrderId = activeOrderId;

    saveDb(db);
    res.json({ success: true, data: db.tables[tableIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stolni o'chirish
router.delete('/:id', (req, res) => {
  try {
    const db = loadDb();
    const tableId = Number(req.params.id);
    const table = db.tables.find(t => t.id === tableId);

    if (!table) {
      return res.status(404).json({ success: false, message: "Stol topilmadi" });
    }

    if (table.status === 'occupied' || table.activeOrderId) {
      return res.status(400).json({ success: false, message: "Band bo'lgan stolni o'chirib bo'lmaydi" });
    }

    db.tables = db.tables.filter(t => t.id !== tableId);
    saveDb(db);
    res.json({ success: true, message: "Stol muvaffaqiyatli o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
