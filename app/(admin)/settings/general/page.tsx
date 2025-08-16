'use client';

import React, { useEffect, useState } from 'react';
import { Store, Mail, Phone, MapPin, Globe, Scale, Clock, Hash, Save } from 'lucide-react';

interface StoreDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface StoreDefaults {
  currency: string;
  unitSystem: string;
  weightUnit: string;
  timezone: string;
}

interface OrderSettings {
  prefix: string;
  suffix: string;
  autoFulfill: string;
  autoArchive: boolean;
}

export default function GeneralSettingsPage() {
  const [storeDetails, setStoreDetails] = useState<StoreDetails>({
    name: 'INKHUB',
    email: 'inkhub123@gmail.com',
    phone: '07739991248',
    address: 'INKHUB, DEVI MANDAP ROAD, Ranchi, NEAR JORA MANDIR, RATU ROAD, Jharkhand, 834005 ranchi Jharkhand, India'
  });

  const [storeDefaults, setStoreDefaults] = useState<StoreDefaults>({
    currency: 'Indian Rupee (INR ₹)',
    unitSystem: 'Metric system',
    weightUnit: 'Kilogram (kg)',
    timezone: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi'
  });

  const [orderSettings, setOrderSettings] = useState<OrderSettings>({
    prefix: '#INK',
    suffix: '',
    autoFulfill: 'Don\'t fulfill any of the order\'s line items automatically',
    autoArchive: true
  });

  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Add tab for this page
  useEffect(() => {
    const path = window.location.pathname;
    const { addTab } = require('@/lib/store').useAppStore.getState();
    addTab({
      title: 'General Settings',
      path,
      pinned: false,
      closable: true,
    });
  }, []);

  const handleEdit = (field: string) => {
    setIsEditing(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing({});
    // Here you would typically save to your backend
  };

  const handleCancel = (field: string) => {
    setIsEditing(prev => ({ ...prev, [field]: false }));
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Store className="w-6 h-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">General</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>

        {/* Store Details Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Store className="w-5 h-5 mr-2" />
              Store details
            </h2>
            
            <div className="space-y-4">
              {/* Store Name */}
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center space-x-3">
                  <Store className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">{storeDetails.name}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{storeDetails.email}</span>
                  </div>
                  <button
                    onClick={() => handleEdit('email')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{storeDetails.phone}</span>
                  </div>
                  <button
                    onClick={() => handleEdit('phone')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Billing Address */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">Billing address</div>
                      <div className="text-sm text-gray-600">{storeDetails.address}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit('address')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Defaults Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Store defaults
            </h2>
            
            <div className="space-y-4">
              {/* Currency */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  To manage the currencies customers see, go to <a href="#" className="text-blue-600 hover:underline">Markets</a>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{storeDefaults.currency}</span>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Unit System */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Unit system</label>
                <select 
                  value={storeDefaults.unitSystem}
                  onChange={(e) => setStoreDefaults(prev => ({ ...prev, unitSystem: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Metric system">Metric system</option>
                  <option value="Imperial system">Imperial system</option>
                </select>
              </div>

              {/* Weight Unit */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Default weight unit</label>
                <select 
                  value={storeDefaults.weightUnit}
                  onChange={(e) => setStoreDefaults(prev => ({ ...prev, weightUnit: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Kilogram (kg)">Kilogram (kg)</option>
                  <option value="Pound (lb)">Pound (lb)</option>
                  <option value="Ounce (oz)">Ounce (oz)</option>
                </select>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Time zone</label>
                <select 
                  value={storeDefaults.timezone}
                  onChange={(e) => setStoreDefaults(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                  <option value="(GMT+00:00) London">(GMT+00:00) London</option>
                  <option value="(GMT-05:00) New York">(GMT-05:00) New York</option>
                </select>
                <div className="text-sm text-gray-500">
                  Sets the time for when orders and analytics are recorded
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600">
                  To change your user level time zone and language visit your <a href="#" className="text-blue-600 hover:underline">account settings</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order ID Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Hash className="w-5 h-5 mr-2" />
              Order ID
            </h2>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Shown on the order page, customer pages, and customer order notifications to identify order
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Prefix</label>
                  <input
                    type="text"
                    value={orderSettings.prefix}
                    onChange={(e) => setOrderSettings(prev => ({ ...prev, prefix: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#INK"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Suffix</label>
                  <input
                    type="text"
                    value={orderSettings.suffix}
                    onChange={(e) => setOrderSettings(prev => ({ ...prev, suffix: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Your order ID will appear as {orderSettings.prefix}1001, {orderSettings.prefix}1002, {orderSettings.prefix}1003 ...
              </div>
            </div>
          </div>
        </div>

        {/* Order Processing Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Order processing
            </h2>
            
            <div className="space-y-6">
              {/* After payment */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900">After an order has been paid</div>
                <div className="space-y-2">
                  {[
                    'Automatically fulfill the order\'s line items',
                    'Automatically fulfill only the gift cards of the order',
                    'Don\'t fulfill any of the order\'s line items automatically'
                  ].map((option, index) => (
                    <label key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="autoFulfill"
                        value={option}
                        checked={orderSettings.autoFulfill === option}
                        onChange={(e) => setOrderSettings(prev => ({ ...prev, autoFulfill: e.target.value }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* After fulfillment */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900">
                  After an order has been fulfilled and paid, or when all items have been refunded
                </div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={orderSettings.autoArchive}
                    onChange={(e) => setOrderSettings(prev => ({ ...prev, autoArchive: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Automatically archive the order</span>
                </label>
                <div className="text-sm text-gray-500 ml-7">
                  The order will be removed from your list of open orders
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Assets Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store assets</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Metafields</div>
                    <div className="text-sm text-gray-500">Available in themes and configurable for Storefront API</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Brand</div>
                    <div className="text-sm text-gray-500">Integrate brand assets across sales channels, themes and apps</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Change log</div>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  View change log
                </button>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Shopify Help Center</div>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Get help
                </button>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Hire a Shopify Partner</div>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Hire a Partner
                </button>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Keyboard shortcuts</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Store activity log</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

