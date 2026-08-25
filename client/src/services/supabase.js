import { createClient } from '@supabase/supabase-js';
import { DEFAULT_TABLES, DEFAULT_MENU } from '../utils/defaultData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btoiruovarvoccygwmmf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rOxCGFs24X1LjLd3jRfs0Q_cdZRm_gB';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Yordamchi: Object kalitlarini camelCase <-> snake_case moslashtirish
const normalizeTable = (row) => {
  let num = row.number || row.name || row.table_number || row.stol || row.title || row.table_name || `${row.id}-Stol`;
  if (typeof num === 'number' || (!isNaN(num) && !String(num).toLowerCase().includes('stol') && !String(num).startsWith('T-') && !String(num).startsWith('VIP'))) {
    num = `${num}-Stol`;
  }
  return {
    id: row.id,
    number: String(num),
    zone: row.zone || row.room || 'Asosiy Zal',
    capacity: row.capacity || row.seats || 4,
    status: row.status || 'empty',
    activeOrderId: row.active_order_id || row.activeOrderId || null
  };
};

const normalizeFood = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category || 'Milliy taomlar',
  price: Number(row.price) || 0,
  costPrice: Number(row.cost_price || row.costPrice) || Math.round((row.price || 0) * 0.45),
  prepTime: Number(row.prep_time || row.prepTime) || 15,
  available: row.available !== false,
  description: row.description || '',
  image: row.image || null
});

const normalizeOrder = (row) => ({
  id: row.id,
  orderNumber: row.order_number || row.orderNumber || `ORD-${row.id}`,
  tableId: row.table_id || row.tableId,
  tableNumber: row.table_number || row.tableNumber || '',
  waiterName: row.waiter_name || row.waiterName || 'Alisher',
  items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
  subtotal: Number(row.subtotal) || 0,
  serviceChargeRate: Number(row.service_charge_rate ?? row.serviceChargeRate ?? 10),
  serviceChargeAmount: Number(row.service_charge_amount ?? row.serviceChargeAmount ?? 0),
  discountRate: Number(row.discount_rate ?? row.discountRate ?? 0),
  discountAmount: Number(row.discount_amount ?? row.discountAmount ?? 0),
  totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
  totalCost: Number(row.total_cost ?? row.totalCost ?? 0),
  netProfit: Number(row.net_profit ?? row.netProfit ?? 0),
  status: row.status || 'pending',
  paymentStatus: row.payment_status || row.paymentStatus || 'unpaid',
  paymentMethod: row.payment_method || row.paymentMethod || null,
  notes: row.notes || '',
  createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
});

// ==========================================
// 1. SUPABASE DAN YUKLASH (FETCHING)
// ==========================================

export const fetchSupabaseTables = async () => {
  try {
    const { data, error } = await supabase.from('tables').select('*').order('id', { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(normalizeTable);
    }
    // Agar baza bo'sh bo'lsa, birlamchi stollarni joylash (Auto-Seed)
    const seedData = DEFAULT_TABLES.map(t => ({
      id: t.id,
      number: t.number,
      zone: t.zone,
      capacity: t.capacity,
      status: t.status,
      active_order_id: t.activeOrderId
    }));
    try {
      await supabase.from('tables').insert(seedData);
    } catch (e) {}
    return DEFAULT_TABLES;
  } catch (err) {
    console.warn("Supabase tables xatolik:", err.message);
    return DEFAULT_TABLES;
  }
};

export const fetchSupabaseFoods = async () => {
  try {
    // Avval 'foods' jadvalini tekshirish
    let { data, error } = await supabase.from('foods').select('*').order('id', { ascending: true });
    if (error) {
      // Agar 'foods' bo'lmasa, 'menu' jadvalini tekshirish
      const menuRes = await supabase.from('menu').select('*').order('id', { ascending: true });
      data = menuRes.data;
      error = menuRes.error;
    }
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(normalizeFood);
    }
    // Agar baza bo'sh bo'lsa, birlamchi taomlarni kiritish
    const seedFoods = DEFAULT_MENU.map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
      price: m.price,
      cost_price: m.costPrice,
      prep_time: m.prepTime,
      available: m.available,
      description: m.description
    }));
    try {
      await supabase.from('foods').insert(seedFoods);
    } catch (e) {}
    return DEFAULT_MENU;
  } catch (err) {
    console.warn("Supabase foods xatolik:", err.message);
    return DEFAULT_MENU;
  }
};

export const fetchSupabaseOrders = async () => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false });
    if (error) throw error;
    return (data || []).map(normalizeOrder);
  } catch (err) {
    console.warn("Supabase orders xatolik:", err.message);
    return [];
  }
};

// ==========================================
// 2. SUPABASE AMALLARI (INSERT / UPDATE)
// ==========================================

export const createSupabaseOrder = async (orderData) => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  const payload = {
    order_number: orderData.orderNumber,
    table_id: orderData.tableId,
    table_number: orderData.tableNumber,
    waiter_name: orderData.waiterName,
    items: orderData.items,
    subtotal: orderData.subtotal,
    service_charge_rate: orderData.serviceChargeRate,
    service_charge_amount: orderData.serviceChargeAmount,
    discount_rate: orderData.discountRate,
    discount_amount: orderData.discountAmount,
    total_amount: orderData.totalAmount,
    total_cost: orderData.totalCost,
    net_profit: orderData.netProfit,
    status: orderData.status || 'pending',
    payment_status: 'unpaid',
    notes: orderData.notes || '',
    restaurant_id: userId,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('orders').insert(payload).select().single();
  if (error) throw error;

  const insertedOrder = normalizeOrder(data);

  // Stolni band qilish
  await supabase.from('tables').update({
    status: 'occupied',
    active_order_id: insertedOrder.id
  }).eq('id', orderData.tableId);

  return insertedOrder;
};

export const updateSupabaseOrder = async (orderId, updates) => {
  const payload = {};
  if (updates.items) payload.items = updates.items;
  if (updates.subtotal !== undefined) payload.subtotal = updates.subtotal;
  if (updates.serviceChargeRate !== undefined) payload.service_charge_rate = updates.serviceChargeRate;
  if (updates.serviceChargeAmount !== undefined) payload.service_charge_amount = updates.serviceChargeAmount;
  if (updates.discountRate !== undefined) payload.discount_rate = updates.discountRate;
  if (updates.discountAmount !== undefined) payload.discount_amount = updates.discountAmount;
  if (updates.totalAmount !== undefined) payload.total_amount = updates.totalAmount;
  if (updates.totalCost !== undefined) payload.total_cost = updates.totalCost;
  if (updates.netProfit !== undefined) payload.net_profit = updates.netProfit;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
  if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from('orders').update(payload).eq('id', orderId).select().single();
  if (error) throw error;
  return normalizeOrder(data);
};

export const paySupabaseOrder = async (orderId, tableId, paymentMethod, discountRate) => {
  const { data: currentOrder } = await supabase.from('orders').select('*').eq('id', orderId).single();
  const normalized = normalizeOrder(currentOrder);

  const discRate = discountRate !== undefined ? discountRate : normalized.discountRate;
  const discAmount = Math.round((normalized.subtotal * discRate) / 100);
  const finalTotal = normalized.subtotal + normalized.serviceChargeAmount - discAmount;
  const netProfit = finalTotal - normalized.totalCost;

  const { data, error } = await supabase.from('orders').update({
    payment_status: 'paid',
    payment_method: paymentMethod,
    status: 'served',
    discount_rate: discRate,
    discount_amount: discAmount,
    total_amount: finalTotal,
    net_profit: netProfit,
    updated_at: new Date().toISOString()
  }).eq('id', orderId).select().single();

  if (error) throw error;

  // Stolni bo'shatish
  if (tableId) {
    await supabase.from('tables').update({
      status: 'empty',
      active_order_id: null
    }).eq('id', tableId);
  }

  return normalizeOrder(data);
};

export const updateSupabaseTableStatus = async (tableId, status, activeOrderId = null) => {
  const { data, error } = await supabase.from('tables').update({
    status,
    active_order_id: activeOrderId
  }).eq('id', tableId).select().single();

  if (error) throw error;
  return normalizeTable(data);
};

// ==========================================
// 3. REALTIME POSTGRES_CHANGES LISTENER
// ==========================================

export const subscribeToSupabaseRealtimeDB = (onTableChange, onOrderChange, onFoodChange) => {
  const channel = supabase
    .channel('smart-resto-db-changes')
    // 1. Orders o'zgarishlarini tinglash
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
      console.log('⚡ Realtime Order Event:', payload.eventType, payload.new);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        onOrderChange(payload.eventType, normalizeOrder(payload.new));
      } else if (payload.eventType === 'DELETE') {
        onOrderChange('DELETE', { id: payload.old.id });
      }
    })
    // 2. Tables o'zgarishlarini tinglash
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, (payload) => {
      console.log('⚡ Realtime Table Event:', payload.eventType, payload.new);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        onTableChange(payload.eventType, normalizeTable(payload.new));
      }
    })
    // 3. Foods / Menu o'zgarishlarini tinglash
    .on('postgres_changes', { event: '*', schema: 'public', table: 'foods' }, (payload) => {
      console.log('⚡ Realtime Food Event:', payload.eventType, payload.new);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        onFoodChange(payload.eventType, normalizeFood(payload.new));
      }
    })
    .subscribe((status) => {
      console.log('📡 Supabase Database Realtime Ulanish Holati:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
};
