// Boshlang'ich default ma'lumotlar (Vercel, mobil va offline rejimlar uchun)
export const DEFAULT_TABLES = [
  { id: 1, number: "1-Stol", zone: "Asosiy Zal", capacity: 4, status: "empty", activeOrderId: null },
  { id: 2, number: "2-Stol", zone: "Asosiy Zal", capacity: 4, status: "occupied", activeOrderId: 101 },
  { id: 3, number: "3-Stol", zone: "Asosiy Zal", capacity: 6, status: "empty", activeOrderId: null },
  { id: 4, number: "4-Stol", zone: "Asosiy Zal", capacity: 2, status: "billed", activeOrderId: 102 },
  { id: 5, number: "5-Stol", zone: "Asosiy Zal", capacity: 8, status: "empty", activeOrderId: null },
  { id: 6, number: "T-1", zone: "Terassa", capacity: 4, status: "empty", activeOrderId: null },
  { id: 7, number: "T-2", zone: "Terassa", capacity: 4, status: "occupied", activeOrderId: 103 },
  { id: 8, number: "T-3", zone: "Terassa", capacity: 6, status: "empty", activeOrderId: null },
  { id: 9, number: "VIP-1", zone: "VIP Xona", capacity: 10, status: "empty", activeOrderId: null },
  { id: 10, number: "VIP-2", zone: "VIP Xona", capacity: 12, status: "empty", activeOrderId: null }
];

export const DEFAULT_MENU = [
  {
    id: 1,
    name: "To'y Oshi (Maxsus)",
    category: "Milliy taomlar",
    price: 45000,
    costPrice: 24000,
    prepTime: 10,
    available: true,
    description: "Dumba yog'i, lahm go'sht, zira, mayiz va bedana tuxumi bilan bezatilgan osh"
  },
  {
    id: 2,
    name: "Choyxona Palov",
    category: "Milliy taomlar",
    price: 42000,
    costPrice: 22000,
    prepTime: 10,
    available: true,
    description: "Qo'y go'shti va qizil sabzi bilan qovurilgan an'anaviy choyxona palovi"
  },
  {
    id: 3,
    name: "Qozon Kabob",
    category: "Milliy taomlar",
    price: 65000,
    costPrice: 38000,
    prepTime: 25,
    available: true,
    description: "Qizargan kartoshka va qovurilgan mayin qo'y qovurg'alari"
  },
  {
    id: 4,
    name: "Uyg'ur Lag'mon",
    category: "Milliy taomlar",
    price: 38000,
    costPrice: 19000,
    prepTime: 15,
    available: true,
    description: "Qo'lda cho'zilgan xamir, shirador go'sht va maxsus say sousi bilan"
  },
  {
    id: 5,
    name: "Qo'y Go'shtli Shashlik",
    category: "Kebab & Gril",
    price: 22000,
    costPrice: 12000,
    prepTime: 20,
    available: true,
    description: "Ko'mirda pishirilgan mayin dumba va qo'y lahm go'shti (1 dona)"
  },
  {
    id: 6,
    name: "Qiyma Shashlik",
    category: "Kebab & Gril",
    price: 18000,
    costPrice: 9500,
    prepTime: 15,
    available: true,
    description: "Kavkaz ziravorlari bilan to'yintirilgan qiyma kabob"
  },
  {
    id: 7,
    name: "Tovuq Qanotchalari Gril",
    category: "Kebab & Gril",
    price: 36000,
    costPrice: 18000,
    prepTime: 20,
    available: true,
    description: "Maxsus marinadlangan qarsildoq tovuq qanotlari (6 dona)"
  },
  {
    id: 8,
    name: "Achichiq-chuchuk Salati",
    category: "Salatlar",
    price: 15000,
    costPrice: 6000,
    prepTime: 5,
    available: true,
    description: "Yupqa to'g'ralgan shirin pomidor, piyoz va qalampir"
  },
  {
    id: 9,
    name: "Sezar Salati (Tovuqli)",
    category: "Salatlar",
    price: 35000,
    costPrice: 16000,
    prepTime: 10,
    available: true,
    description: "Aysberg barglari, parmezan, suxarik va qovurilgan tovuq filesi"
  },
  {
    id: 10,
    name: "Margarita Pitsa",
    category: "Fast Food & Pitsa",
    price: 55000,
    costPrice: 26000,
    prepTime: 20,
    available: true,
    description: "Motsarella pishlog'i, pomidor sousi va rayhon barglari (32 sm)"
  },
  {
    id: 11,
    name: "Go'shtli Tandir Somsa",
    category: "Milliy taomlar",
    price: 12000,
    costPrice: 6500,
    prepTime: 5,
    available: true,
    description: "Qatlama xamir, maydalangan go'sht va piyozli tandir somsa"
  },
  {
    id: 12,
    name: "Ko'k Choy (Limon va Asalli)",
    category: "Ichimliklar",
    price: 12000,
    costPrice: 3000,
    prepTime: 5,
    available: true,
    description: "Chinni choynakda yangi damlangan 95-choy, limon va asal"
  },
  {
    id: 13,
    name: "Uy Limonadi (Yalpizli)",
    category: "Ichimliklar",
    price: 25000,
    costPrice: 8000,
    prepTime: 5,
    available: true,
    description: "Yangi siqilgan limon sharbati, muz va xushbo'y yalpiz (1 litr)"
  },
  {
    id: 14,
    name: "Chizkeyk Nyu-York",
    category: "Desertlar",
    price: 28000,
    costPrice: 12000,
    prepTime: 5,
    available: true,
    description: "Qaymoqli pishloqli nozik desert, malina sousi bilan"
  }
];

export const DEFAULT_ORDERS = [
  {
    id: 101,
    orderNumber: "ORD-101",
    tableId: 2,
    tableNumber: "2-Stol",
    waiterName: "Alisher",
    items: [
      { menuItemId: 1, name: "To'y Oshi (Maxsus)", quantity: 2, price: 45000, costPrice: 24000, note: "Piyozi kamroq bo'lsin" },
      { menuItemId: 8, name: "Achichiq-chuchuk Salati", quantity: 2, price: 15000, costPrice: 6000, note: "" },
      { menuItemId: 12, name: "Ko'k Choy (Limon va Asalli)", quantity: 1, price: 12000, costPrice: 3000, note: "" }
    ],
    subtotal: 132000,
    serviceChargeRate: 10,
    serviceChargeAmount: 13200,
    discountRate: 0,
    discountAmount: 0,
    totalAmount: 145200,
    totalCost: 63000,
    netProfit: 82200,
    status: "preparing",
    paymentStatus: "unpaid",
    paymentMethod: null,
    notes: "Tezroq olib kelinsin",
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 102,
    orderNumber: "ORD-102",
    tableId: 4,
    tableNumber: "4-Stol",
    waiterName: "Jasur",
    items: [
      { menuItemId: 5, name: "Qo'y Go'shtli Shashlik", quantity: 4, price: 22000, costPrice: 12000, note: "Yaxshi qizarsin" },
      { menuItemId: 13, name: "Uy Limonadi (Yalpizli)", quantity: 1, price: 25000, costPrice: 8000, note: "Muzli" }
    ],
    subtotal: 113000,
    serviceChargeRate: 10,
    serviceChargeAmount: 11300,
    discountRate: 5,
    discountAmount: 5650,
    totalAmount: 118650,
    totalCost: 56000,
    netProfit: 62650,
    status: "ready",
    paymentStatus: "unpaid",
    paymentMethod: null,
    notes: "Hisob so'ralgan",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: 103,
    orderNumber: "ORD-103",
    tableId: 7,
    tableNumber: "T-2",
    waiterName: "Madina",
    items: [
      { menuItemId: 10, name: "Margarita Pitsa", quantity: 1, price: 55000, costPrice: 26000, note: "Issiq kelsin" },
      { menuItemId: 9, name: "Sezar Salati (Tovuqli)", quantity: 1, price: 35000, costPrice: 16000, note: "" }
    ],
    subtotal: 90000,
    serviceChargeRate: 10,
    serviceChargeAmount: 9000,
    discountRate: 0,
    discountAmount: 0,
    totalAmount: 99000,
    totalCost: 42000,
    netProfit: 57000,
    status: "pending",
    paymentStatus: "unpaid",
    paymentMethod: null,
    notes: "",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString()
  },
  {
    id: 99,
    orderNumber: "ORD-99",
    tableId: 1,
    tableNumber: "1-Stol",
    waiterName: "Alisher",
    items: [
      { menuItemId: 3, name: "Qozon Kabob", quantity: 2, price: 65000, costPrice: 38000, note: "" },
      { menuItemId: 8, name: "Achichiq-chuchuk Salati", quantity: 1, price: 15000, costPrice: 6000, note: "" },
      { menuItemId: 13, name: "Uy Limonadi (Yalpizli)", quantity: 1, price: 25000, costPrice: 8000, note: "" }
    ],
    subtotal: 170000,
    serviceChargeRate: 10,
    serviceChargeAmount: 17000,
    discountRate: 0,
    discountAmount: 0,
    totalAmount: 187000,
    totalCost: 90000,
    netProfit: 97000,
    status: "served",
    paymentStatus: "paid",
    paymentMethod: "click_payme",
    notes: "",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    closedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }
];

export const DEFAULT_SETTINGS = {
  restaurantName: "Smart Resto & Lounge",
  address: "Toshkent sh., Amir Temur shox ko'chasi 45",
  phone: "+998 (71) 200-00-22",
  defaultServiceCharge: 10,
  currency: "so'm",
  wifiPassword: "SmartResto2026"
};
