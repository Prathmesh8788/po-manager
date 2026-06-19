import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPO, getProducts, addLineItem, transitionPO } from '../api';

const NEXT_STATUS = {
  draft: ['placed', 'cancelled'],
  placed: ['received', 'cancelled'],
  received: [],
  cancelled: [],
};

export default function PODetail() {
  const { id } = useParams();
  const [po, setPo] = useState(null);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const load = () => getPO(id).then(setPo);
  useEffect(() => { load(); getProducts().then(setProducts); }, [id]);

  if (!po) return <p className="text-slate-400">Loading...</p>;

  const handleAdd = async (e) => {
    e.preventDefault();
    await addLineItem(po.id, productId, quantity);
    load();
  };

  const handleStatus = async (newStatus) => {
    await transitionPO(po.id, newStatus);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">PO #{po.id}</h1>
      <p className="text-slate-500 mb-1">Status: <span className="font-medium text-slate-800">{po.status}</span></p>
      <p className="text-slate-500 mb-6">Total: <span className="font-medium text-slate-800">₹{(po.total / 100).toFixed(2)}</span></p>

      <div className="flex gap-2 mb-6">
        {NEXT_STATUS[po.status].map(s => (
          <button
            key={s}
            onClick={() => handleStatus(s)}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-900 transition"
          >
            Mark as {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 mb-6">
        {po.line_items.map(item => (
          <div key={item.id} className="px-4 py-3 flex justify-between text-sm">
            <span className="text-slate-700">{item.product_name} × {item.quantity}</span>
            <span className="text-slate-500">₹{(item.line_total / 100).toFixed(2)}</span>
          </div>
        ))}
        {po.line_items.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-400 text-center">No line items yet.</p>
        )}
      </div>

      {po.status === 'draft' && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <select
            value={productId}
            onChange={e => setProductId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            className="w-20 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition">
            Add item
          </button>
        </form>
      )}
    </div>
  );
}