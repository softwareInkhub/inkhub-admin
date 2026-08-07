'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchDashboardData, generateActivityFeed, DashboardData } from '@/utils/analytics';
import {
  ShoppingBagIcon,
  PhotoIcon,
  BookOpenIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  CloudIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PlusIcon,
  ServerIcon,
  GlobeAltIcon,
  CubeIcon,
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  WifiIcon,
  CpuChipIcon,
  ArchiveBoxIcon,
  CommandLineIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TagIcon,
  FolderIcon,
  DocumentIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CubeTransparentIcon,
  SwatchIcon,
  PaintBrushIcon,
  FilmIcon,
  MusicalNoteIcon,
  CameraIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TvIcon,
  HeartIcon,
  StarIcon,
  FireIcon,
  SunIcon,
  MoonIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ForwardIcon,
  BackwardIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  SquaresPlusIcon,
  TrashIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon,
  CheckIcon,
  XMarkIcon,
  MinusIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  NoSymbolIcon,
  HandRaisedIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  FlagIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  ShareIcon,
  LinkIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleBottomCenterIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';

// Default data structure
const defaultData: DashboardData = {
  platform: {
    totalUsers: 1250,
    activeUsers: 180,
    totalNamespaces: 24,
    activeNamespaces: 18,
    totalExecutions: 1289,
    activeExecutions: 12,
    totalWebhooks: 45,
    activeWebhooks: 38,
    systemHealth: 'excellent',
    uptime: 99.98,
    responseTime: 245,
  },
  aws: {
    lambda: { count: 12, status: 'healthy', errors: 0 },
    dynamodb: { count: 8, status: 'healthy', errors: 0 },
    s3: { count: 15, status: 'healthy', errors: 0 },
    sns: { count: 5, status: 'healthy', errors: 0 },
    apigateway: { count: 3, status: 'healthy', errors: 0 },
    stepfunctions: { count: 7, status: 'healthy', errors: 0 },
    cloudwatch: { status: 'healthy', errors: 0 },
    iam: { count: 25, status: 'healthy', errors: 0 },
  },
  shopify: {
    orders: { total: 0, pending: 0, completed: 0, revenue: 0 },
    products: { total: 0, active: 0, draft: 0 },
    customers: { total: 0, active: 0, new: 0 },
  },
  pinterest: {
    pins: { total: 0, saved: 0, created: 0 },
    boards: { total: 0, public: 0, private: 0 },
    followers: { total: 0, new: 0 },
  },
  designLibrary: {
    designs: { total: 0, active: 0, archived: 0 },
    categories: { total: 0 },
    storage: { used: '0 MB', total: '1 GB' },
  },
  performance: {
    cpu: 45,
    memory: 62,
    disk: 28,
    network: 78,
    cache: { hitRate: 94.5, size: '2.3 GB' },
  },
  recentActivity: [
    { id: 1, type: 'execution', message: 'Lambda function deployed successfully', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'user', message: 'New user registered: john.doe@example.com', time: '5 minutes ago', status: 'info' },
    { id: 3, type: 'webhook', message: 'Webhook triggered: order.created', time: '8 minutes ago', status: 'success' },
    { id: 4, type: 'error', message: 'API Gateway timeout detected', time: '12 minutes ago', status: 'warning' },
    { id: 5, type: 'deployment', message: 'New namespace created: ecommerce-v2', time: '15 minutes ago', status: 'success' },
  ],
  quickStats: {
    todayExecutions: 156,
    todayUsers: 23,
    todayErrors: 2,
    todayRevenue: 0,
  }
};

export default function Home() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showSystemDetails, setShowSystemDetails] = useState(false);
  const pathname = usePathname();

  // Refresh data with loading state and timestamp
  const refreshData = async () => {
    setLoading(true);
    try {
      const newData = await fetchDashboardData();
      setData(newData);
      setLastRefresh(new Date());
      
      // Simulate system health check
      const healthCheck = Math.random();
      if (healthCheck > 0.8) {
        setSystemStatus('warning');
      } else if (healthCheck > 0.95) {
        setSystemStatus('error');
      } else {
        setSystemStatus('healthy');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSystemStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    refreshData();
    
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Click outside handler for system details popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSystemDetails && !(event.target as Element).closest('.system-details-popup')) {
        setShowSystemDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSystemDetails]);

  // Get status color and text
  const getSystemStatusInfo = () => {
    switch (systemStatus) {
      case 'healthy':
        return {
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
          dotColor: 'bg-green-500',
          text: 'System Healthy'
        };
      case 'warning':
        return {
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-700',
          dotColor: 'bg-yellow-500',
          text: 'System Warning'
        };
      case 'error':
        return {
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-700',
          dotColor: 'bg-red-500',
          text: 'System Error'
        };
      default:
        return {
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
          dotColor: 'bg-green-500',
          text: 'System Healthy'
        };
    }
  };

  // Format last refresh time
  const formatLastRefresh = () => {
    const now = new Date();
    const diff = now.getTime() - lastRefresh.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h ago`;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'error': return ExclamationTriangleIcon;
      case 'info': return InformationCircleIcon;
      default: return ClockIcon;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="w-full">
        <div className="w-full px-8 py-8">
          {/* Header Section */}
          <div className="mb-10 relative">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-3">
                  INKHUB Admin Dashboard
                </h1>
                <p className="text-gray-600 text-lg mb-2">
                  Comprehensive analytics and management for your entire platform
                </p>
                <p className="text-sm text-gray-500">
                  Last updated: {formatLastRefresh()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  title={loading ? 'Refreshing...' : 'Refresh dashboard data'}
                >
                  <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                
                <button
                  onClick={() => setShowSystemDetails(!showSystemDetails)}
                  className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-lg ${getSystemStatusInfo().color}`}
                  title="Click for system details"
                >
                  <div className={`w-3 h-3 rounded-full animate-pulse ${getSystemStatusInfo().dotColor}`}></div>
                  <span className={`text-sm font-medium ${getSystemStatusInfo().textColor}`}>
                    {getSystemStatusInfo().text}
                  </span>
                </button>
                
                {/* System Details Popup */}
                {showSystemDetails && (
                  <div className="absolute right-0 top-20 mt-2 w-80 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl z-50 p-6 system-details-popup">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">System Status</h3>
                      <button
                        onClick={() => setShowSystemDetails(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`text-sm font-medium ${getSystemStatusInfo().textColor}`}>
                          {getSystemStatusInfo().text}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Uptime:</span>
                        <span className="text-sm font-medium text-gray-900">{data.platform.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Response Time:</span>
                        <span className="text-sm font-medium text-gray-900">{data.platform.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Refresh:</span>
                        <span className="text-sm font-medium text-gray-900">{formatLastRefresh()}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={refreshData}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                        >
                          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                          {loading ? 'Refreshing...' : 'Refresh Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users - Blue/Purple */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-white bg-white/20 px-2 py-1 rounded-full">
                  +80%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{data.platform.totalUsers.toLocaleString()}</h3>
              <p className="text-blue-100 text-sm mb-3">TOTAL USERS</p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-blue-200">80% Increase in 20 Days</p>
            </div>

            {/* Total Executions - Orange */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BoltIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-white bg-white/20 px-2 py-1 rounded-full">
                  +50%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{data.platform.totalExecutions.toLocaleString()}</h3>
              <p className="text-orange-100 text-sm mb-3">NEW EXECUTIONS</p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
              </div>
              <p className="text-xs text-orange-200">50% Increase in 20 Days</p>
            </div>

            {/* Namespaces - Purple */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CubeIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-white bg-white/20 px-2 py-1 rounded-full">
                  +60%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{data.platform.totalNamespaces}</h3>
              <p className="text-purple-100 text-sm mb-3">TOTAL NAMESPACES</p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-purple-200">60% Increase in 20 Days</p>
            </div>

            {/* Webhooks - Red */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BellIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-white bg-white/20 px-2 py-1 rounded-full">
                  +35%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{data.platform.totalWebhooks}</h3>
              <p className="text-red-100 text-sm mb-3">FEES COLLECTION</p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: '35%' }}></div>
              </div>
              <p className="text-xs text-red-200">35% Increase in 20 Days</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* AWS Services Overview */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">AWS Services Status</h2>
                <a
                  href="/aws-services"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All →
                </a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(data.aws).map(([service, info]: [string, any]) => (
                  <div key={service} className="text-center">
                    <div className={`p-3 rounded-lg mb-2 ${
                      info.status === 'healthy' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {service === 'lambda' && <BoltIcon className="w-6 h-6 mx-auto text-green-600" />}
                      {service === 'dynamodb' && <ServerIcon className="w-6 h-6 mx-auto text-green-600" />}
                      {service === 's3' && <ArchiveBoxIcon className="w-6 h-6 mx-auto text-green-600" />}
                      {service === 'sns' && <BellIcon className="w-6 h-6 mx-auto text-green-600" />}
                      {service === 'apigateway' && <GlobeAltIcon className="w-6 h-6 mx-auto text-green-600" />}
                      {service === 'stepfunctions' && <CogIcon className="w-6 h-6 mx-auto text-green-600" />}
                      {service === 'cloudwatch' && <ChartBarIcon className="w-6 h-6 mx-auto text-green-600" />}
                      {service === 'iam' && <ShieldCheckIcon className="w-6 h-6 mx-auto text-green-600" />}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 capitalize">{service}</h3>
                    <p className="text-xs text-gray-500">{info.count || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">CPU Usage</span>
                    <span className="font-medium">{data.performance.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${data.performance.cpu}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Memory</span>
                    <span className="font-medium">{data.performance.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full transition-all duration-500" style={{ width: `${data.performance.memory}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Disk</span>
                    <span className="font-medium">{data.performance.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full transition-all duration-500" style={{ width: `${data.performance.disk}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Network</span>
                    <span className="font-medium">{data.performance.network}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${data.performance.network}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cache Hit Rate</span>
                  <span className="font-medium">{data.performance.cache.hitRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business Data & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Business Data */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Shopify */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-50 rounded-lg mr-3">
                    <ShoppingBagIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Shopify</h3>
                    <p className="text-sm text-gray-500">E-commerce Platform</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Orders</span>
                    <span className="font-medium">{data.shopify.orders.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Products</span>
                    <span className="font-medium">{data.shopify.products.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-medium">${data.shopify.orders.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <a
                  href="/shopify"
                  className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage Shopify →
                </a>
              </div>

              {/* Pinterest */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-red-50 rounded-lg mr-3">
                    <PhotoIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pinterest</h3>
                    <p className="text-sm text-gray-500">Visual Discovery</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pins</span>
                    <span className="font-medium">{data.pinterest.pins.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Boards</span>
                    <span className="font-medium">{data.pinterest.boards.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Followers</span>
                    <span className="font-medium">{data.pinterest.followers.total}</span>
                  </div>
                </div>
                <a
                  href="/pinterest"
                  className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage Pinterest →
                </a>
              </div>

              {/* Design Library */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg mr-3">
                    <SwatchIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Design Library</h3>
                    <p className="text-sm text-gray-500">Asset Management</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Designs</span>
                    <span className="font-medium">{data.designLibrary.designs.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-medium">{data.designLibrary.categories.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Storage</span>
                    <span className="font-medium">{data.designLibrary.storage.used}</span>
                  </div>
                </div>
                <a
                  href="/design-library"
                  className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage Designs →
                </a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href="/user-management"
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">User Management</p>
                    <p className="text-sm text-gray-500">Manage users & permissions</p>
                  </div>
                </a>
                
                <a
                  href="/aws-services"
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CloudIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">AWS Services</p>
                    <p className="text-sm text-gray-500">Monitor cloud resources</p>
                  </div>
                </a>
                
                <a
                  href="/settings"
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CogIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Settings</p>
                    <p className="text-sm text-gray-500">Configure system settings</p>
                  </div>
                </a>
                
                <a
                  href="/system-load"
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <ServerIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">System Load</p>
                    <p className="text-sm text-gray-500">Monitor system health</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Recent Activity & Today's Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {data.recentActivity.map((activity: any) => {
                  const StatusIcon = getStatusIcon(activity.status);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BoltIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Executions</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{data.quickStats.todayExecutions}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">New Users</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{data.quickStats.todayUsers}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-900">Errors</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">{data.quickStats.todayErrors}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Revenue</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">${data.quickStats.todayRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
