'use client';
import React from 'react';

export default function OrderCard({ order }: { order: any }) {
  return (
    <div className="p-4 rounded-lg border bg-white shadow flex flex-col gap-2">
      <div className="font-bold text-lg text-blue-700 mb-1">Order #{order.order_number}</div>
      <div className="text-sm text-gray-700">
        <span className="font-semibold">Customer:</span> {order.customer?.first_name} {order.customer?.last_name}
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-semibold">Email:</span> {order.customer?.email}
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-semibold">Total:</span> {order.total_price}
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-semibold">Status:</span> {order.financial_status}
      </div>
      <div className="text-xs text-gray-400 mt-2">Created: {order.created_at}</div>
    </div>
  );
}