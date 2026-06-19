import React, { useEffect, useState } from 'react';
import { getProducts, getLowStockProducts } from '../api';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
    getLowStockProducts().then(setLowStock);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Stock Dashboard</h1>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm font-medium text-amber-800 mb-1">⚠️ Low stock</p>
          <ul className="text-sm text-amber-700 space-y-0.5">
            {lowStock.map(p => <li key={p.id}>{p.name} — stock: {p.stock_quantity}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium">Stock</th>
              <th className="px-4 py-2 font-medium">Reorder Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className={p.is_below_reorder ? 'bg-red-50' : ''}>
                <td className="px-4 py-3 text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-slate-700">{p.stock_quantity}</td>
                <td className="px-4 py-3 text-slate-700">{p.reorder_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}