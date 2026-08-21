import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import tablesRoutes from './routes/tables.js';
import menuRoutes from './routes/menu.js';
import ordersRoutes from './routes/orders.js';
import statsRoutes from './routes/stats.js';
import { loadDb } from './data/store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Dastlabki ma'lumotlar bazasini tekshirish/yuklash
loadDb();

// API Marshrutlar
app.use('/api/tables', tablesRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Smart Resto POS & Admin Server',
    time: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server xatoligi:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Serverda ichki xatolik yuz berdi',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Smart Resto Backend server http://localhost:${PORT} portida ishga tushdi`);
  console.log(`📊 REST API endpointlar:`);
  console.log(`   - Stollar:     http://localhost:${PORT}/api/tables`);
  console.log(`   - Menyu:       http://localhost:${PORT}/api/menu`);
  console.log(`   - Buyurtmalar: http://localhost:${PORT}/api/orders`);
  console.log(`   - Statistika:  http://localhost:${PORT}/api/stats`);
});
