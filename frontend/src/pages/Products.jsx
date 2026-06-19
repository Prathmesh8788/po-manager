import React, { useEffect, useState } from 'react';
import { getProducts, getSuppliers, createProduct } from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: '', supplier: '', price: '' });

  const load = () => getProducts().then(setProducts);
  useEffect(() => {
    load();
    getSuppliers().then(setSuppliers);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.supplier || !form.price) return;
    await createProduct({
      name: form.name,
      supplier: parseInt(form.supplier),
      price: Math.round(parseFloat(form.price) * 100),
      stock_quantity: 0,
      reorder_level: 10,
    });
    setForm({ name: '', supplier: '', price: '' });
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Products</h1>

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2 mb-6">
        <input
          placeholder="Product name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={form.supplier}
          onChange={e => setForm({ ...form, supplier: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select supplier</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input
          placeholder="Price (₹)"
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          className="w-32 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition">
          Add Product
        </button>
      </form>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Supplier</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className={p.is_below_reorder ? 'bg-red-50' : ''}>
                <td className="px-4 py-3 text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-slate-500">{p.supplier_name}</td>
                <td className="px-4 py-3 text-slate-700">₹{p.price_display}</td>
                <td className="px-4 py-3 text-slate-700">{p.stock_quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}