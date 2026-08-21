# 🍽️ Smart Resto POS & Admin — Full-Stack Tizimi

Restoran va kafelar uchun to'liq funksional, zamonaviy va qulay **Smart Resto POS & Admin** tizimi.

---

## 📌 Tizim Imkoniyatlari

### 1. 🧾 POS (Ofitsiant & Kassa Paneli)
- **Stollar Xaritasi:** Zallar (Asosiy Zal, Terassa, VIP Xona) bo'yicha stollar, ularning sig'imi va real-vaqt statusi (Bo'sh, Band, Hisob so'ralgan).
- **Interaktiv Menyu:** Rasmlar, toifalar (Milliy taomlar, Kebab, Salatlar, Pitsa, Ichimliklar, Desertlar) va tezkor qidiruv.
- **Savatcha & Buyurtma:** Taom miqdorini boshqarish (+/-), har bir taomga maxsus izoh yozish (*"piyozsiz"*, *"achchiq"*), xizmat haqi (%) va chegirma (%) kiritish.
- **Oshxonaga Jo'natish:** 1 ta tugma bilan buyurtmani oshxona (KDS) ekraniga yuborish.
- **Termal Chek:** 80mm/58mm termal printerlar uchun moslashtirilgan chek formati va printerga chiqarish.
- **Kassa & To'lov:** Naqd pul (qaytim hisoblagichi bilan), Bank kartalari va Click/Payme (QR) orqali to'lov qabul qilish.

### 2. 👨‍🍳 Oshxona Ekrani (KDS — Kitchen Display System)
- Jonli rejimda yangi buyurtmalarni qabul qilish.
- **Ovozli Signal (Chime):** Yangi buyurtma kelganda avtomatik bildirishnoma ovozi.
- **Tayyorlanish Taymeri:** Har bir buyurtma necha daqiqadan beri tayyorlanayotganini ko'rsatuvchi rangli taymer.
- **Statuslarni Boshqarish:** 1 ta bosish orqali: `Kutilmoqda` ➔ `Tayyorlanmoqda` ➔ `Tayyor` ➔ `Topshirildi`.

### 3. 📊 Admin Panel & Menyu Boshqaruvi
- **Real-vaqt KPI Analitika:** Jami tushum, Sof foyda (Marja), O'rtacha chek miqdori, Kutilayotgan tushum.
- **Menyu Boshqaruvi (CRUD):** Yangi taom qo'shish, tahrirlash, o'chirish, stop-listga kiritish.
- **Tannarx va Foyda Kalkulyatori:** Har bir taomning sotish narxi va tannarxini belgilash orqali rentabellik foizi (%) hamda 1 dona taomdan qoladigan sof foydani avtomatik hisoblash.
- **Top 5 Xaridorgir Taomlar:** Eng ko'p sotilgan taomlar va keltirgan sof foyda reytingi.
- **Restoran Sozlamalari:** Restoran nomi, telefon, manzil, Wi-Fi paroli va xizmat haqi foizini sozlash.

### 4. 📜 Buyurtmalar Arxivi
- Barcha to'langan va ochiq hisoblarning to'liq tarixi.
- Qidiruv, to'lov turi va vaqt bo'yicha saralash, istalgan chekni qayta chop etish.

---

## 🚀 O'rnatish va Ishga Tushirish Yo'riqnomasi

Loyihada backend va frontend qismlari alohida papkalarda joylashgan:
- `server/` (Node.js + Express API)
- `client/` (React + Vite + Tailwind CSS)

### 1-Qadam: Paketlarni o'rnatish (Dependencies)

Har ikkala papkadagi kutubxonalarni o'rnatish:

```bash
# Backend uchun:
cd server
npm install

# Frontend uchun:
cd ../client
npm install
```

*(Yoki loyiha asosiy papkasidan `npm run install-all` buyrug'i orqali ikkalasini bir vaqtda o'rnatishingiz mumkin)*

---

### 2-Qadam: Tizimni Ishga Tushirish

#### Variant A: Ikkalasini alohida terminallarda ishga tushirish (Tavsiya etiladi)

**1-Terminalda (Backend):**
```bash
cd server
npm run dev
```
*Server: `http://localhost:5000` portida ishga tushadi.*

**2-Terminalda (Frontend):**
```bash
cd client
npm run dev
```
*Frontend: `http://localhost:5173` manzilida ochiladi.*

---

#### Variant B: Root papkadan bir vaqtda ishga tushirish
```bash
npm install
npm run dev
```

---

## 📡 REST API Endpointlar Ro'yxati

| Metod | Marshrut | Vazifasi |
|---|---|---|
| `GET` | `/api/tables` | Barcha stollar va ularning statusini olish |
| `POST` | `/api/tables` | Yangi stol qo'shish |
| `PUT` | `/api/tables/:id` | Stol holatini yangilash |
| `DELETE` | `/api/tables/:id` | Stolni o'chirish |
| `GET` | `/api/menu` | Barcha taomlar va narxlarni olish |
| `POST` | `/api/menu` | Yangi taom qo'shish (tannarxi bilan) |
| `PUT` | `/api/menu/:id` | Taomni tahrirlash |
| `POST` | `/api/menu/toggle/:id` | Stop-list (mavjudlikni) almashtirish |
| `DELETE` | `/api/menu/:id` | Taomni o'chirish |
| `GET` | `/api/orders` | Buyurtmalar ro'yxati (filtrlash bilan) |
| `POST` | `/api/orders` | Yangi buyurtma yaratish |
| `PUT` | `/api/orders/:id/status` | Oshxona statusini yangilash |
| `PUT` | `/api/orders/:id/pay` | To'lovni qabul qilish va chek yopish |
| `GET` | `/api/stats` | Tushum, sof foyda va sotuv statistikasi |
| `GET/PUT` | `/api/stats/settings` | Restoran ma'lumotlari va sozlamalar |
