import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Suppliers from './pages/Suppliers';
import Products from './pages/Products';
import PurchaseOrders from './pages/PurchaseOrders';
import PODetail from './pages/PODetail';
import Stock from './pages/Stock';

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition ${
    isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-slate-900 px-6 py-3 flex items-center gap-2">
          <span className="text-white font-semibold mr-4">📦 PO Manager</span>
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/suppliers" className={linkClass}>Suppliers</NavLink>
          <NavLink to="/products" className={linkClass}>Products</NavLink>
          <NavLink to="/purchase-orders" className={linkClass}>Purchase Orders</NavLink>
        </nav>

        <main className="max-w-5xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Stock />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/purchase-orders/:id" element={<PODetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;