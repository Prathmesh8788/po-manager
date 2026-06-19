import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export const getSuppliers = () => api.get('/suppliers/').then(r => r.data);
export const createSupplier = (data) => api.post('/suppliers/', data).then(r => r.data);

export const getProducts = (supplierId) => {
  const params = supplierId ? { supplier: supplierId } : {};
  return api.get('/products/', { params }).then(r => r.data);
};
export const getLowStockProducts = () => api.get('/products/low-stock/').then(r => r.data);
export const createProduct = (data) => api.post('/products/', data).then(r => r.data);

export const getPOs = () => api.get('/purchase-orders/').then(r => r.data);
export const getPO = (id) => api.get(`/purchase-orders/${id}/`).then(r => r.data);
export const createPO = (data) => api.post('/purchase-orders/', data).then(r => r.data);
export const transitionPO = (id, newStatus) =>
  api.post(`/purchase-orders/${id}/transition/`, { status: newStatus }).then(r => r.data);
export const addLineItem = (poId, productId, quantity) =>
  api.post(`/purchase-orders/${poId}/line-items/`, { product_id: productId, quantity }).then(r => r.data);