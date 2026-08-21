const BASE_URL = '/api';

// Umumiy fetch wrapper
async function request(endpoint, options = {}) {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Xatolik: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`API so'rovida xatolik [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Stollar
  getTables: () => request('/tables'),
  createTable: (data) => request('/tables', { method: 'POST', body: data }),
  updateTable: (id, data) => request(`/tables/${id}`, { method: 'PUT', body: data }),
  deleteTable: (id) => request(`/tables/${id}`, { method: 'DELETE' }),

  // Menyu
  getMenu: () => request('/menu'),
  createMenuItem: (data) => request('/menu', { method: 'POST', body: data }),
  updateMenuItem: (id, data) => request(`/menu/${id}`, { method: 'PUT', body: data }),
  toggleMenuItem: (id) => request(`/menu/toggle/${id}`, { method: 'POST' }),
  deleteMenuItem: (id) => request(`/menu/${id}`, { method: 'DELETE' }),

  // Buyurtmalar
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },
  getOrderById: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders', { method: 'POST', body: data }),
  updateOrder: (id, data) => request(`/orders/${id}`, { method: 'PUT', body: data }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: { status } }),
  payOrder: (id, paymentData) => request(`/orders/${id}/pay`, { method: 'PUT', body: paymentData }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  // Statistika va sozlamalar
  getStats: () => request('/stats'),
  getSettings: () => request('/stats/settings'),
  updateSettings: (data) => request('/stats/settings', { method: 'PUT', body: data }),
};

export default api;
