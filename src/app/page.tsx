'use client';
import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageSquare,
  Heart,
  Settings
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Orders',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: <ShoppingCart className="w-6 h-6 text-blue-600" />,
      color: 'blue'
    },
    {
      title: 'Total Revenue',
      value: '$45,231',
      change: '+8.2%',
      changeType: 'positive',
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      color: 'green'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+3.1%',
      changeType: 'positive',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-1.2%',
      changeType: 'negative',
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
      color: 'orange'
    }
  ];

  const recentOrders = [
    {
      id: '#ORD-001',
      customer: 'John Doe',
      amount: '$299.00',
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: '#ORD-002',
      customer: 'Sarah Smith',
      amount: '$199.00',
      status: 'pending',
      date: '2024-01-14'
    },
    {
      id: '#ORD-003',
      customer: 'Mike Johnson',
      amount: '$599.00',
      status: 'processing',
      date: '2024-01-13'
    },
    {
      id: '#ORD-004',
      customer: 'Emily Davis',
      amount: '$399.00',
      status: 'completed',
      date: '2024-01-12'
    }
  ];

  const recentActivity = [
    {
      user: 'Sarah Johnson',
      action: 'placed a new order',
      time: '2 minutes ago',
      avatar: 'SJ'
    },
    {
      user: 'Mike Chen',
      action: 'updated product inventory',
      time: '1 hour ago',
      avatar: 'MC'
    },
    {
      user: 'Alex Rodriguez',
      action: 'completed a task',
      time: '3 hours ago',
      avatar: 'AR'
    },
    {
      user: 'Lisa Wang',
      action: 'added new customer',
      time: '5 hours ago',
      avatar: 'LW'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Calendar size={16} />
            <span>Today</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <TrendingUp size={16} />
            <span>View Reports</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="stats-card stats-card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight size={16} className="inline mr-1" />
                ) : (
                  <ArrowDownRight size={16} className="inline mr-1" />
                )}
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="modern-card">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                View all
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <ShoppingCart size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customer}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.amount}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {order.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="modern-card">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                View all
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {activity.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="modern-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">New Order</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Customer</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">View Reports</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <Settings className="w-8 h-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
          </button>
        </div>
      </div>

      {/* Additional Content Sections for Scrolling Test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Analytics Overview */}
        <div className="modern-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Analytics Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Page Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12,847</p>
              </div>
              <div className="text-green-600">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3.24%</p>
              </div>
              <div className="text-red-600">
                <ArrowDownRight size={20} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$156.78</p>
              </div>
              <div className="text-green-600">
                <ArrowUpRight size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="modern-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Notifications
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Low Inventory Alert</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Product "Premium Widget" is running low on stock</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Order Completed</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Order #ORD-001 has been successfully delivered</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">New Customer</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sarah Johnson has created a new account</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="modern-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Page Views</h3>
            <p className="text-3xl font-bold text-blue-600">12,847</p>
            <p className="text-sm text-green-600">+12.5% from last month</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Satisfaction</h3>
            <p className="text-3xl font-bold text-green-600">4.8/5</p>
            <p className="text-sm text-green-600">+0.2 from last month</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Support Tickets</h3>
            <p className="text-3xl font-bold text-purple-600">23</p>
            <p className="text-sm text-red-600">+5 from last week</p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          © 2024 BRMH Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
