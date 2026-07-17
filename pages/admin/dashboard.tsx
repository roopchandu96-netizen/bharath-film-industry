// pages/admin/dashboard.tsx
import React from 'react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';

export default function AdminDashboard() {
  return (
    <Layout admin>
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <nav className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link href="/admin/users" className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <h2 className="text-xl font-semibold text-white">User Management</h2>
          </Link>
          <Link href="/admin/payments" className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <h2 className="text-xl font-semibold text-white">Payments</h2>
          </Link>
          <Link href="/admin/invoices" className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <h2 className="text-xl font-semibold text-white">Invoices</h2>
          </Link>
          <Link href="/admin/analytics" className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <h2 className="text-xl font-semibold text-white">Analytics</h2>
          </Link>
        </nav>
      </div>
    </Layout>
  );
}
