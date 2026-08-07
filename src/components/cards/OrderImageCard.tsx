'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface OrderImageCardProps {
  order: any;
}

interface OrderModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

// Order Modal Component
function OrderModal({ order, isOpen, onClose }: OrderModalProps) {
  if (!isOpen) return null;

  const getTitle = (order: any) => {
    return `Order #${order.order_number}` || 'Untitled Order';
  };

  const getCustomerName = (order: any) => {
    if (order.customer?.first_name && order.customer?.last_name) {
      return `${order.customer.first_name} ${order.customer.last_name}`;
    } else if (order.customer?.first_name) {
      return order.customer.first_name;
    } else if (order.customer?.last_name) {
      return order.customer.last_name;
    }
    return order.customer?.email || 'Unknown Customer';
  };

  const getCustomerEmail = (order: any) => {
    return order.customer?.email || 'No email available';
  };

  const getTotal = (order: any) => {
    return order.total_price || order.total || '0.00';
  };

  const getStatus = (order: any) => {
    return order.financial_status || order.status || 'Unknown';
  };

  const getFulfillmentStatus = (order: any) => {
    return order.fulfillment_status || 'Unknown';
  };

  const getLineItems = (order: any) => {
    if (order.line_items && Array.isArray(order.line_items)) {
      return order.line_items;
    }
    return [];
  };

  const title = getTitle(order);
  const customerName = getCustomerName(order);
  const customerEmail = getCustomerEmail(order);
  const total = getTotal(order);
  const status = getStatus(order);
  const fulfillmentStatus = getFulfillmentStatus(order);
  const lineItems = getLineItems(order);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Information Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">Order Information</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="text-gray-600">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="text-gray-600">{customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="text-gray-600">{order.customer?.phone || 'No phone'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Total:</span>
                  <span className="text-gray-600">${total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    status === 'paid' ? 'bg-green-100 text-green-800' :
                    status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Fulfillment:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    fulfillmentStatus === 'fulfilled' ? 'bg-green-100 text-green-800' :
                    fulfillmentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    fulfillmentStatus === 'unfulfilled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {fulfillmentStatus}
                  </span>
                </div>
                {order.created_at && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.updated_at && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Updated:</span>
                    <span className="text-gray-600">
                      {new Date(order.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Line Items Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Order Items</h4>
              {lineItems.length > 0 ? (
                <div className="space-y-2">
                  {lineItems.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.title || item.name}</div>
                          <div className="text-sm text-gray-600">SKU: {item.sku || 'N/A'}</div>
                          <div className="text-sm text-gray-600">Quantity: {item.quantity || 1}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">${item.price || '0.00'}</div>
                          <div className="text-sm text-gray-600">Total: ${(item.price * (item.quantity || 1)).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No items found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderImageCard({ order }: OrderImageCardProps) {
  const [showModal, setShowModal] = useState(false);

  const getTitle = (order: any) => {
    return `Order #${order.order_number}` || 'Order';
  };

  const getCustomerName = (order: any) => {
    if (order.customer?.first_name && order.customer?.last_name) {
      return `${order.customer.first_name} ${order.customer.last_name}`;
    } else if (order.customer?.first_name) {
      return order.customer.first_name;
    } else if (order.customer?.last_name) {
      return order.customer.last_name;
    }
    return order.customer?.email || 'Unknown Customer';
  };

  const title = getTitle(order);
  const customerName = getCustomerName(order);
  const total = order.total_price || order.total || '0.00';
  const status = order.financial_status || order.status || 'Unknown';

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={() => setShowModal(true)}
      >
        <div className="p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold text-lg">#</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-2">{customerName}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-gray-900">${total}</span>
            </div>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                status === 'paid' ? 'bg-green-100 text-green-800' :
                status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <OrderModal
        order={order}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
} 