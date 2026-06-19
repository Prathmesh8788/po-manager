import React, { useEffect, useState } from 'react';
import { getSuppliers, createSupplier } from '../api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState('');

  const load = () => getSuppliers().then(setSuppliers);
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    await createSupplier({ name });
    setName('');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Suppliers</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          placeholder="Supplier name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition">
          Add Supplier
        </button>
      </form>

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
        {suppliers.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-400 text-center">No suppliers yet.</p>
        )}
        {suppliers.map(s => (
          <div key={s.id} className="px-4 py-3 text-sm text-slate-700">{s.name}</div>
        ))}
      </div>
    </div>
  );
}