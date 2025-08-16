'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { debounce } from '../products/utils/advancedSearch'
import { debouncedAlgoliaSearch } from './utils/algoliaSearch'
import HighlightedText from '../products/components/HighlightedText'
import { SearchHistory, saveSearchToHistory, SearchSuggestion } from './utils/searchSuggestions'

import KPIGrid from '../products/components/KPIGrid'
import OrderKPIGrid from './components/OrderKPIGrid'
import OrderTable from './components/OrderTable'
import OrderCardView from './components/OrderCardView'
import GridCardFilterHeader from '../products/components/GridCardFilterHeader'
import Pagination from '../products/components/Pagination'
import SearchControls from '../products/components/SearchControls'
import ProductImage from '../products/components/ProductImage'
import BulkActionsBar from '../products/components/BulkActionsBar'
import ExportModal from '../products/components/ExportModal'
import CardsPerRowDropdown from '../products/components/CardsPerRowDropdown'
import { Order, SearchCondition, CustomFilter } from './types'
import { 
  generateOrders as generateOrdersData
} from './utils'
import { getTransformedOrders } from './services/orderService'

interface OrdersClientProps {
  initialData?: {
    items: any[]
    lastEvaluatedKey: any
    total: number
  }
}

function OrdersClient({ initialData }: OrdersClientProps) {
  const { addTab, tabs } = useAppStore()
  const [orderData, setOrderData] = useState<Order[]>([])
  const [chunkData, setChunkData] = useState<{ [key: string]: Order[] }>({})
  const [chunkKeys, setChunkKeys] = useState<string[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalOrders, setTotalOrders] = useState(0)
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [searchConditions, setSearchConditions] = useState<SearchCondition[]>([])
  const [showSearchBuilder, setShowSearchBuilder] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  
  // Algolia search states
  const [algoliaSearchResults, setAlgoliaSearchResults] = useState<Order[]>([])
  const [isAlgoliaSearching, setIsAlgoliaSearching] = useState(false)
  const [useAlgoliaSearch, setUseAlgoliaSearch] = useState(false)

  // Search history state
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])

  // Search suggestions state
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Advanced Filter states
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    orderStatus: [] as string[],
    priceRange: { min: '', max: '' },
    dateRange: { start: '', end: '' },
    tags: [] as string[],
    channels: [] as string[]
  })

  // Column Header Filter states
  const [columnFilters, setColumnFilters] = useState({
    orderNumber: '',
    customerName: '',
    status: [] as string[],
    fulfillmentStatus: [] as string[],
    financialStatus: [] as string[],
    channel: [] as string[],
    deliveryMethod: [] as string[],
    tags: [] as string[],
    total: '',
    createdAt: '',
    updatedAt: ''
  })
  const [activeColumnFilter, setActiveColumnFilter] = useState<string | null>(null)

  // Custom Filter states
  const [showCustomFilterDropdown, setShowCustomFilterDropdown] = useState(false)
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([])
  
  // Default filter states
  const [hiddenDefaultFilters, setHiddenDefaultFilters] = useState<Set<string>>(new Set())
  
  // View and control states
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'card'>('table')
  const [showAdditionalControls, setShowAdditionalControls] = useState(false)
  
  // Header dropdown states
  const [showHeaderDropdown, setShowHeaderDropdown] = useState(false)
  
  // Modal states
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  
  // Cards per row state for grid/card views
  const [cardsPerRow, setCardsPerRow] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orders-cards-per-row')
      return saved ? parseInt(saved, 10) : 4
    }
    return 4
  })
  
  // Settings state management with localStorage persistence
  interface OrderSettings {
    defaultViewMode: 'table' | 'grid' | 'card'
    itemsPerPage: number
    showAdvancedFilters: boolean
    autoSaveFilters: boolean
    defaultExportFormat: 'csv' | 'json' | 'pdf'
    includeImagesInExport: boolean
    showImages: boolean
  }

  const [settings, setSettings] = useState<OrderSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('orders-settings')
      return savedSettings ? JSON.parse(savedSettings) : {
        defaultViewMode: 'table',
        itemsPerPage: 25,
        showAdvancedFilters: true,
        autoSaveFilters: false,
        defaultExportFormat: 'csv',
        includeImagesInExport: false,
        showImages: true
      }
    }
    return {
      defaultViewMode: 'table',
      itemsPerPage: 25,
      showAdvancedFilters: true,
      autoSaveFilters: false,
      defaultExportFormat: 'csv',
      includeImagesInExport: false,
      showImages: true
    }
  })

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orders-settings', JSON.stringify(settings))
    }
  }, [settings])

  // Apply default view mode on component mount
  useEffect(() => {
    if (settings.defaultViewMode && settings.defaultViewMode !== viewMode) {
      setViewMode(settings.defaultViewMode)
    }
  }, [settings.defaultViewMode])

  // Apply items per page setting
  useEffect(() => {
    if (settings.itemsPerPage && settings.itemsPerPage !== itemsPerPage) {
      setItemsPerPage(settings.itemsPerPage)
    }
  }, [settings.itemsPerPage])

  // Apply advanced filter setting
  useEffect(() => {
    if (settings.showAdvancedFilters !== showAdvancedFilter) {
      setShowAdvancedFilter(settings.showAdvancedFilters)
    }
  }, [settings.showAdvancedFilters])

  // Auto-save filters functionality
  useEffect(() => {
    if (settings.autoSaveFilters) {
      // Save current filter state to localStorage
      const filterState = {
        activeFilter,
        columnFilters,
        advancedFilters,
        customFilters,
        searchConditions,
        timestamp: Date.now()
      }
      localStorage.setItem('orders-saved-filters', JSON.stringify(filterState))
    }
  }, [settings.autoSaveFilters, activeFilter, columnFilters, advancedFilters, customFilters, searchConditions])

  // Load saved filters on component mount
  useEffect(() => {
    if (settings.autoSaveFilters) {
      const savedFilters = localStorage.getItem('orders-saved-filters')
      if (savedFilters) {
        try {
          const filterState = JSON.parse(savedFilters)
          // Only restore if filters are less than 24 hours old
          if (Date.now() - filterState.timestamp < 24 * 60 * 60 * 1000) {
            setActiveFilter(filterState.activeFilter || 'all')
            setColumnFilters(filterState.columnFilters || {})
            setAdvancedFilters(filterState.advancedFilters || {})
            setCustomFilters(filterState.customFilters || [])
            setSearchConditions(filterState.searchConditions || [])
          }
        } catch (error) {
          console.error('Error loading saved filters:', error)
        }
      }
    }
  }, [settings.autoSaveFilters])

  // Load search history on component mount
  useEffect(() => {
    const history = localStorage.getItem('orders-search-history')
    if (history) {
      try {
        setSearchHistory(JSON.parse(history))
      } catch (error) {
        console.error('Error loading search history:', error)
      }
    }
  }, [])

  // Fetch real orders data from server
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('Fetching real orders from server...')
        const orders = await getTransformedOrders()
        console.log('Real orders fetched:', orders.slice(0, 5)) // Log first 5 orders for debugging
        console.log('Total orders fetched:', orders.length)
        console.log('Sample order structure:', orders[0])
        setOrderData(orders)
        setTotalOrders(orders.length)
        setIsDataLoaded(true)
      } catch (error) {
        console.error('Error fetching orders from server:', error)
        setError('Failed to fetch orders from server. Using dummy data as fallback.')
        // Fallback to dummy data if server fetch fails
        const fallbackOrders = generateOrdersData(100)
        setOrderData(fallbackOrders)
        setTotalOrders(fallbackOrders.length)
        setIsDataLoaded(true)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Debounced search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  // Algolia search effect
  useEffect(() => {
    if (debouncedSearchQuery && useAlgoliaSearch) {
      debouncedAlgoliaSearch(debouncedSearchQuery, orderData, setAlgoliaSearchResults, setIsAlgoliaSearching)
    } else {
      setAlgoliaSearchResults([])
    }
  }, [debouncedSearchQuery, useAlgoliaSearch, orderData])

  // Tab management
  const hasAddedTab = useRef(false)
  useEffect(() => {
    if (!hasAddedTab.current) {
      addTab({
        title: 'Orders',
        path: '/apps/shopify/orders',
        pinned: false,
        closable: true,
      })
      hasAddedTab.current = true
    }
  }, [addTab])

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = orderData
    console.log('Filtering data, total orders:', orderData.length)

    // Apply search query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query) ||
        (order.channel || '').toLowerCase().includes(query)
      )
    }

    // Apply column filters with enhanced logic
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
        filtered = filtered.filter(order => {
          const orderValue = order[key as keyof Order]
          
          // Handle multi-select filters
          if (Array.isArray(value)) {
            if (key === 'tags') {
              return order.tags?.some(tag => value.includes(tag))
            }
            return value.includes(String(orderValue))
          }
          
          // Handle numeric filters (total)
          if (key === 'total' && typeof value === 'string') {
            const total = order.total || 0
            if (value.startsWith('>')) {
              const threshold = parseFloat(value.substring(1))
              return total > threshold
            } else if (value.startsWith('<')) {
              const threshold = parseFloat(value.substring(1))
              return total < threshold
            } else if (value.startsWith('=')) {
              const threshold = parseFloat(value.substring(1))
              return total === threshold
            }
          }
          
          // Handle date filters
          if (key === 'createdAt' && typeof value === 'string') {
            const orderDate = new Date(order.createdAt)
            const filterDate = new Date(value)
            return orderDate.toDateString() === filterDate.toDateString()
          }
          
          // Handle text filters
          return String(orderValue).toLowerCase().includes(String(value).toLowerCase())
        })
      }
    })

    // Apply advanced filters
    if (advancedFilters.orderStatus.length > 0) {
      filtered = filtered.filter(order => advancedFilters.orderStatus.includes(order.status))
    }
    if (advancedFilters.priceRange.min || advancedFilters.priceRange.max) {
      filtered = filtered.filter(order => {
        const total = order.total || 0
        const min = advancedFilters.priceRange.min ? parseFloat(advancedFilters.priceRange.min) : 0
        const max = advancedFilters.priceRange.max ? parseFloat(advancedFilters.priceRange.max) : Infinity
        return total >= min && total <= max
      })
    }
    if (advancedFilters.dateRange.start || advancedFilters.dateRange.end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        const start = advancedFilters.dateRange.start ? new Date(advancedFilters.dateRange.start) : new Date(0)
        const end = advancedFilters.dateRange.end ? new Date(advancedFilters.dateRange.end) : new Date()
        return orderDate >= start && orderDate <= end
      })
    }
    if (advancedFilters.tags.length > 0) {
      filtered = filtered.filter(order => 
        order.tags?.some(tag => advancedFilters.tags.includes(tag))
      )
    }
    if (advancedFilters.channels.length > 0) {
      filtered = filtered.filter(order => 
        order.channel && advancedFilters.channels.includes(order.channel)
      )
    }

    console.log('Filtered data result:', filtered.length, 'orders')
    return filtered
  }, [orderData, debouncedSearchQuery, columnFilters, advancedFilters])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  // KPI calculations
  const kpiMetrics = useMemo(() => {
    const total = filteredData.length
    const paid = filteredData.filter(order => order.financialStatus === 'paid').length
    const pending = filteredData.filter(order => order.financialStatus === 'pending').length
    const fulfilled = filteredData.filter(order => order.fulfillmentStatus === 'fulfilled').length
    const totalValue = filteredData.reduce((sum, order) => sum + (order.total || 0), 0)
    const avgOrderValue = total > 0 ? totalValue / total : 0

    console.log('KPI Calculations:', {
      total,
      paid,
      pending,
      fulfilled,
      totalValue,
      avgOrderValue,
      sampleOrder: filteredData[0]
    })

    return {
      totalOrders: {
        label: 'Total Orders',
        metric: {
          value: total,
          change: 6.0,
          trend: 'up' as const
        },
        icon: '📦',
        color: 'blue'
      },
      paidOrders: {
        label: 'Paid Orders',
        metric: {
          value: paid,
          change: 11.0,
          trend: 'up' as const
        },
        icon: '💰',
        color: 'green'
      },
      pendingOrders: {
        label: 'Pending Orders',
        metric: {
          value: pending,
          change: 0.0,
          trend: 'neutral' as const
        },
        icon: '⏳',
        color: 'yellow'
      },
      fulfilledOrders: {
        label: 'Fulfilled Orders',
        metric: {
          value: fulfilled,
          change: 7.0,
          trend: 'up' as const
        },
        icon: '✅',
        color: 'purple'
      },
      totalValue: {
        label: 'Total Value',
        metric: {
          value: totalValue,
          change: 14.0,
          trend: 'up' as const
        },
        icon: '💎',
        color: 'indigo'
      },
      avgOrderValue: {
        label: 'Avg Order Value',
        metric: {
          value: avgOrderValue,
          change: 3.31,
          trend: 'up' as const
        },
        icon: '📊',
        color: 'orange'
      }
    }
  }, [filteredData])

  // Event handlers
  const handleSelectItem = useCallback((id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }, [])

  // Utility function for getting unique values from order data
  const getUniqueValues = useCallback((field: string) => {
    const values = new Set<string>()
    orderData.forEach(order => {
      const value = order[field as keyof Order]
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => values.add(String(item)))
      } else {
          values.add(String(value))
        }
      }
    })
    return Array.from(values).sort()
  }, [orderData])

  const handleSelectAll = useCallback(() => {
    if (selectedOrders.length === currentData.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(currentData.map(order => order.id))
    }
  }, [selectedOrders.length, currentData])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const updatedHistory = saveSearchToHistory(query, filteredData.length, searchHistory)
      setSearchHistory(updatedHistory)
      localStorage.setItem('orders-search-history', JSON.stringify(updatedHistory))
    }
  }, [filteredData.length, searchHistory])

  // Search suggestion handlers
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text)
    setShowSuggestions(false)
  }, [])

  const handleClearHistory = useCallback(() => {
    localStorage.removeItem('orders-search-history')
    setSearchHistory([])
  }, [])

  const handleAdvancedSearch = useCallback((conditions: SearchCondition[]) => {
    setSearchConditions(conditions)
  }, [])

  const handleColumnFilter = useCallback((column: string, value: any) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }))
  }, [])

  const handleCustomFilter = useCallback((filter: { name: string; field: string; operator: string; value: string }) => {
    const customFilter: CustomFilter = {
      id: Date.now().toString(),
      ...filter
    }
    setCustomFilters(prev => [...prev, customFilter])
  }, [])

  const handleAdvancedFilter = useCallback((filterType: string, value: any) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchQuery('')
    setSearchConditions([])
    setColumnFilters({
      orderNumber: '',
      customerName: '',
      status: [],
      fulfillmentStatus: [],
      financialStatus: [],
      channel: [],
      deliveryMethod: [],
      tags: [],
      total: '',
      createdAt: '',
      updatedAt: ''
    })
    setAdvancedFilters({
      orderStatus: [],
      priceRange: { min: '', max: '' },
      dateRange: { start: '', end: '' },
      tags: [],
      channels: []
    })
    setCustomFilters([])
    setActiveFilter('all')
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchConditions([])
  }, [])

  const clearColumnFilters = useCallback(() => {
    setColumnFilters({
      orderNumber: '',
      customerName: '',
      status: [],
      fulfillmentStatus: [],
      financialStatus: [],
      channel: [],
      deliveryMethod: [],
      tags: [],
      total: '',
      createdAt: '',
      updatedAt: ''
    })
  }, [])

  const clearCustomFilters = useCallback(() => {
    setCustomFilters([])
  }, [])

  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({
      orderStatus: [],
      priceRange: { min: '', max: '' },
      dateRange: { start: '', end: '' },
      tags: [],
      channels: []
    })
  }, [])

  // Define table columns for orders
  const orderColumns = [
    {
      key: 'orderNumber',
      label: 'Order',
      sortable: true,
      render: (order: Order) => (
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-900">#{order.orderNumber}</span>
          {order.hasWarning && (
            <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">!</span>
          </div>
            )}
          {order.hasDocument && (
            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">D</span>
        </div>
        )}
      </div>
      )
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (order: Order) => (
        <div className="text-sm text-gray-900">{order.customerName}</div>
      )
    },
    {
      key: 'fulfillmentStatus',
      label: 'Fulfillment Status',
      sortable: true,
      render: (order: Order) => {
        const getStatusBadge = (status: string) => {
          switch (status) {
            case 'fulfilled':
              return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800", text: "Fulfilled" }
            case 'unfulfilled':
              return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800", text: "Unfulfilled" }
            case 'partial':
              return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800", text: "Partial" }
            default:
              return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800", text: status }
          }
        }
        const badge = getStatusBadge(order.fulfillmentStatus)
        return <span className={badge.className}>{badge.text}</span>
      }
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (order: Order) => (
        <span className="text-sm font-medium text-gray-900">₹{(order.total || 0).toFixed(2)}</span>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (order: Order) => (
        <span className="text-sm text-gray-500">
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }) : 'No date'}
        </span>
      )
    },
    {
      key: 'items',
      label: 'Items',
      sortable: true,
      render: (order: Order) => (
        <span className="text-sm text-gray-900">{order.items?.length || 0} items</span>
      )
    },
    {
      key: 'deliveryStatus',
      label: 'Delivery Status',
      sortable: true,
      render: (order: Order) => (
        <div className="text-sm text-gray-900">{order.deliveryStatus || 'Pending'}</div>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      sortable: false,
      render: (order: Order) => (
        <div className="flex flex-wrap gap-0.5">
          {order.tags?.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
              {tag}
                  </span>
          ))}
          {order.tags && order.tags.length > 2 && (
            <span className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
              +{order.tags.length - 2}
                </span>
              )}
        </div>
      )
    },
    {
      key: 'channel',
      label: 'Channel',
      sortable: true,
      render: (order: Order) => (
        <div className="text-sm text-gray-900">{order.channel}</div>
      )
    },
    {
      key: 'deliveryMethod',
      label: 'Delivery Method',
      sortable: true,
      render: (order: Order) => (
        <div className="text-sm text-gray-900">{order.deliveryMethod}</div>
      )
    },
    {
      key: 'financialStatus',
      label: 'Payment Status',
      sortable: true,
      render: (order: Order) => {
        const getStatusBadge = (status: string) => {
          switch (status) {
            case 'paid':
              return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800", text: "Paid" }
            case 'pending':
              return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800", text: "Pending" }
            case 'refunded':
              return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800", text: "Refunded" }
            default:
              return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800", text: status }
          }
        }
        const badge = getStatusBadge(order.financialStatus)
        return <span className={badge.className}>{badge.text}</span>
      }
    }
  ]

  if (loading && orderData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading orders...</div>
        </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Orders</div>
          <div className="text-gray-600 mb-4">{error}</div>
                <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
                </button>
            </div>
                    </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      isFullScreen && "fixed inset-0 z-50 bg-white"
    )}>
      {/* KPI Cards */}
      <div className="px-6 py-6">
        <OrderKPIGrid kpiMetrics={kpiMetrics} orders={filteredData} />
        </div>

      {/* Search and Filter Controls */}
      <div className="px-6 pb-4">
        <SearchControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchConditions={searchConditions}
          showSearchBuilder={showSearchBuilder}
          setShowSearchBuilder={setShowSearchBuilder}
          showAdditionalControls={showAdditionalControls}
          setShowAdditionalControls={setShowAdditionalControls}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          customFilters={customFilters}
          onAddCustomFilter={handleCustomFilter}
          onRemoveCustomFilter={(filterId) => setCustomFilters(prev => prev.filter(f => f.id !== filterId))}
          showCustomFilterDropdown={showCustomFilterDropdown}
          setShowCustomFilterDropdown={setShowCustomFilterDropdown}
          hiddenDefaultFilters={hiddenDefaultFilters}
          onShowAllFilters={() => setHiddenDefaultFilters(new Set())}
          onClearSearch={clearSearch}
          onClearSearchConditions={() => setSearchConditions([])}
          selectedProducts={selectedOrders}
          onBulkEdit={() => setShowBulkEditModal(true)}
          onExportSelected={() => setShowExportModal(true)}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          currentProducts={currentData}
          onSelectAll={handleSelectAll}
          activeColumnFilter={activeColumnFilter}
          columnFilters={columnFilters}
          onFilterClick={setActiveColumnFilter}
          onColumnFilterChange={handleColumnFilter}
          getUniqueValues={getUniqueValues}
          onExport={() => setShowExportModal(true)}
          onImport={() => setShowImportModal(true)}
          onPrint={() => setShowPrintModal(true)}
          onSettings={() => setShowSettingsModal(true)}
          showHeaderDropdown={showHeaderDropdown}
          setShowHeaderDropdown={setShowHeaderDropdown}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showAdvancedFilter={showAdvancedFilter}
          setShowAdvancedFilter={setShowAdvancedFilter}
          isFullScreen={isFullScreen}
          onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
          isAlgoliaSearching={isAlgoliaSearching}
          useAlgoliaSearch={useAlgoliaSearch}
        />
                </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <BulkActionsBar
          selectedProducts={selectedOrders}
          totalProducts={filteredData.length}
          onBulkEdit={() => setShowBulkEditModal(true)}
          onExportSelected={() => setShowExportModal(true)}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
        />
      )}

              {/* Main Content */}
        <div className="px-6 pb-6">
          {/* Data Source Indicator */}
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-yellow-800 text-sm">
                  <strong>Note:</strong> {error} Using fallback data for demonstration.
                      </div>
                    </div>
        </div>
          )}
          
          {viewMode === 'table' ? (
          <OrderTable
            currentOrders={currentData}
            selectedItems={selectedOrders}
            onSelectItem={handleSelectItem}
            onSelectAll={handleSelectAll}
            columns={orderColumns}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            isFullScreen={isFullScreen}
            activeColumnFilter={activeColumnFilter}
            columnFilters={columnFilters}
            onFilterClick={setActiveColumnFilter}
            onColumnFilterChange={handleColumnFilter}
            getUniqueValues={getUniqueValues}
            showImages={false}
          />
        ) : (
          <OrderCardView
            data={currentData}
            columns={orderColumns}
            selectedItems={selectedOrders}
            onSelectItem={handleSelectItem}
            viewMode={viewMode}
            cardsPerRow={cardsPerRow}
            onCardsPerRowChange={setCardsPerRow}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            isFullScreen={isFullScreen}
          />
        )}

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredData.length}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
                </div>
                </div>
                
      {/* Modals */}
        {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          products={filteredData as any}
          selectedProducts={selectedOrders}
        />
      )}

        {showBulkEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Bulk Edit Orders</h3>
            <p className="text-gray-600 mb-4">Edit {selectedOrders.length} selected orders</p>
            <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowBulkEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                onClick={() => setShowBulkEditModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {showBulkDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Orders</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete {selectedOrders.length} orders? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                  setSelectedOrders([])
                  setShowBulkDeleteModal(false)
                  }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                Delete
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default function ShopifyOrdersPage() {
  return (
    <div className="h-full">
      <OrdersClient />
    </div>
  )
} 