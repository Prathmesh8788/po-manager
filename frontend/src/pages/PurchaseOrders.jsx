import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPOs, getSuppliers, createPO } from '../api';

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-600',
  placed: 'bg-blue-100 text-blue-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function PurchaseOrders() {
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState('');

  const load = () => getPOs().then(setPos);
  useEffect(() => {
    load();
    getSuppliers().then(setSuppliers);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!supplierId) return;
    await createPO({ supplier: parseInt(supplierId), notes: '' });
    setSupplierId('');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Purchase Orders</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <select
          value={supplierId}
          onChange={e => setSupplierId(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select supplier</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition">
          + New Draft PO
        </button>
      </form>

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
        {pos.map(po => (
          <Link
            key={po.id}
            to={`/purchase-orders/${po.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
          >
            <span className="text-sm text-slate-800">PO #{po.id} — {po.supplier_name}</span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[po.status]}`}>
              {po.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}