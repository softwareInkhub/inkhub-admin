import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Order, KPIMetric } from '../types'

// Generate sample orders data matching Shopify's structure
export const generateOrders = (count: number): Order[] => {
  const statuses: Order['status'][] = ['paid', 'unpaid', 'refunded', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const fulfillmentStatuses: Order['fulfillmentStatus'][] = ['unfulfilled', 'fulfilled', 'partial']
  const financialStatuses: Order['financialStatus'][] = ['paid', 'pending', 'refunded']
  const channels = ['Gokwik', 'Interakt - Sell on WhatsApp', 'Shopify', 'Manual']
  const deliveryMethods = ['Free Shipping', 'Standard Shipping', 'Express Free Shipping', 'Express Shipping']
  const tags = ['bank-offer', 'GoKwik', 'UPI', 'Cards', 'COD', 'premium', 'influencer', 'custom', 'color-issue']
  
  const customerNames = [
    'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Singh', 'Vikram Malhotra',
    'Anjali Gupta', 'Rajesh Verma', 'Sneha Reddy', 'Arjun Kapoor', 'Meera Iyer',
    'Karan Johar', 'Zara Khan', 'Aditya Roy', 'Ishita Sharma', 'Rohan Mehta',
    'Tanvi Desai', 'Vivek Oberoi', 'Kavya Nair', 'Siddharth Malhotra', 'Ananya Pandey'
  ]
  
  const productNames = [
    'Sacred Mandala Tattoo', 'Mahadev Tattoo Design', '11:11 Manifestation Tattoo',
    'Beyond Death Tattoo', 'Shooting Stars Tattoo', 'Mother\'s Garden Tattoo',
    'Equilibrium Tattoo', 'Angry Tiger Tattoo', 'Mirror Ball Tattoo',
    'Diva Energy Tattoo Pack', 'Monarch Butterfly Tattoo', 'Midnight Wolf Tattoo',
    'Karma Maze Armband Tattoo', 'Sinister Mask Tattoo', 'KALKI Forward Tattoo'
  ]
  
  return Array.from({ length: count }, (_, i) => {
    const seed = i + 1
    const total = Math.floor(Math.random() * 5000) + 100 // More realistic prices
    const statusIndex = seed % statuses.length
    const fulfillmentIndex = seed % fulfillmentStatuses.length
    const financialIndex = seed % financialStatuses.length
    const channelIndex = seed % channels.length
    const deliveryIndex = seed % deliveryMethods.length
    
    // Add some orders with warnings and documents
    const hasWarning = seed % 7 === 0
    const hasDocument = seed % 11 === 0
    
    // Generate realistic customer data
    const customerName = customerNames[seed % customerNames.length]
    const customerEmail = customerName.toLowerCase().replace(' ', '.') + '@example.com'
    const phone = `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`
    
    // Generate realistic product data
    const product1 = productNames[seed % productNames.length]
    const product2 = productNames[(seed + 1) % productNames.length]
    const quantity1 = Math.floor(Math.random() * 3) + 1
    const quantity2 = Math.floor(Math.random() * 2) + 1
    
    // Generate realistic dates
    const daysAgo = Math.floor(Math.random() * 365) + 1
    const createdAt = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString()
    const updatedAt = new Date(Date.now() - (Math.floor(Math.random() * daysAgo) * 24 * 60 * 60 * 1000)).toISOString()
    
    // Generate realistic tags
    const orderTags = []
    if (seed % 3 === 0) orderTags.push(tags[seed % tags.length])
    if (seed % 5 === 0) orderTags.push(tags[(seed + 1) % tags.length])
    if (seed % 7 === 0) orderTags.push(tags[(seed + 2) % tags.length])
    
    return {
      id: `order-${i + 1}`,
      orderNumber: `INK${String(64800 + i).padStart(5, '0')}`,
      customerName,
      customerEmail,
      phone,
      total,
      status: statuses[statusIndex],
      fulfillmentStatus: fulfillmentStatuses[fulfillmentIndex],
      financialStatus: financialStatuses[financialIndex],
      items: [
        { title: product1, quantity: quantity1 },
        { title: product2, quantity: quantity2 }
      ],
      line_items: [
        { title: product1, quantity: quantity1 },
        { title: product2, quantity: quantity2 }
      ],
      createdAt,
      updatedAt,
      totalPrice: total.toFixed(2),
      tags: orderTags.length > 0 ? orderTags : [tags[seed % tags.length]],
      channel: channels[channelIndex],
      deliveryMethod: deliveryMethods[deliveryIndex],
      deliveryStatus: fulfillmentStatuses[fulfillmentIndex] === 'fulfilled' ? 'Tracking added' : '',
      hasWarning,
      hasDocument
    }
  })
}

// Calculate KPI metrics
export const calculateKPIMetrics = (filteredOrders: Order[]) => {
  const total = filteredOrders.length
  const itemsOrdered = filteredOrders.reduce((sum, order) => 
    sum + (order.items?.length || 0), 0)
  const returns = filteredOrders.filter(order => 
    order.status === 'refunded').length
  const fulfilled = filteredOrders.filter(order => 
    order.fulfillmentStatus === 'fulfilled').length
  const delivered = filteredOrders.filter(order => 
    order.deliveryStatus === 'Tracking added').length
  const totalValue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  const avgOrderValue = total > 0 ? totalValue / total : 0
  const avgFulfillmentTime = 12 // Mock data

  return {
    orders: { value: total, change: 6, trend: 'up' as const },
    itemsOrdered: { value: itemsOrdered, change: 11, trend: 'up' as const },
    returns: { value: returns, change: 0, trend: 'neutral' as const },
    fulfilled: { value: fulfilled, change: 7, trend: 'up' as const },
    delivered: { value: delivered, change: 67, trend: 'up' as const },
    fulfillmentTime: { value: avgFulfillmentTime, change: 14, trend: 'up' as const },
    totalValue: { value: totalValue, change: 8, trend: 'up' as const },
    avgOrderValue: { value: avgOrderValue, change: 3, trend: 'up' as const }
  }
}

// Get status badge classes
export const getStatusBadge = (status: string, type: 'fulfillment' | 'payment') => {
  const baseClasses = 'px-2 py-0.5 rounded-full text-xs font-medium'
  
  if (type === 'fulfillment') {
    switch (status) {
      case 'unfulfilled':
        return cn(baseClasses, 'bg-yellow-100 text-yellow-800')
      case 'fulfilled':
        return cn(baseClasses, 'bg-gray-100 text-gray-800')
      case 'partial':
        return cn(baseClasses, 'bg-orange-100 text-orange-800')
      default:
        return cn(baseClasses, 'bg-gray-100 text-gray-800')
    }
  } else {
    switch (status) {
      case 'paid':
        return cn(baseClasses, 'bg-gray-100 text-gray-800')
      case 'pending':
        return cn(baseClasses, 'bg-yellow-100 text-yellow-800')
      case 'refunded':
        return cn(baseClasses, 'bg-red-100 text-red-800')
      default:
        return cn(baseClasses, 'bg-gray-100 text-gray-800')
    }
  }
}

// Get unique values for filter options
export const getUniqueValues = (orders: Order[], field: keyof Order): string[] => {
  const values = orders
    .map(order => order[field])
    .filter((value): value is string => typeof value === 'string' && value !== undefined)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .sort()
  
  return values
}

// Get unique tags from orders
export const getUniqueTags = (orders: Order[]): string[] => {
  const allTags = orders
    .flatMap(order => order.tags || [])
    .filter((tag, index, arr) => arr.indexOf(tag) === index)
    .sort()
  
  return allTags
}

// Filter orders based on multiple criteria
export const filterOrders = (
  orders: Order[],
  activeFilter: string,
  searchQuery: string,
  columnFilters: Record<string, any>,
  advancedFilters?: any
): Order[] => {
  let filtered = orders

  // Apply search query
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase()
    filtered = filtered.filter(order => {
      const searchableText = [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.phone,
        order.total?.toString(),
        order.status,
        order.fulfillmentStatus,
        order.financialStatus,
        order.channel,
        order.deliveryMethod,
        order.deliveryStatus,
        order.tags?.join(' '),
        order.items?.map((item: any) => item.title || item.name).join(' ')
      ].join(' ').toLowerCase()
      
      return searchableText.includes(searchLower)
    })
  }

  // Apply column filters
  Object.entries(columnFilters).forEach(([column, filterValue]) => {
    if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return

    filtered = filtered.filter(order => {
      const productValue = order[column as keyof Order]
      
      if (Array.isArray(filterValue)) {
        // Multi-select filter
        if (Array.isArray(productValue)) {
          return filterValue.some((fv: string) => productValue.includes(fv))
        }
        return filterValue.includes(String(productValue))
      } else if (typeof filterValue === 'object' && filterValue.min !== undefined) {
        // Numeric range filter
        const numValue = Number(productValue)
        const min = Number(filterValue.min)
        const max = Number(filterValue.max)
        return (min === 0 || numValue >= min) && (max === 0 || numValue <= max)
      } else if (typeof filterValue === 'string') {
        // Text filter
        const productValueStr = String(productValue || '').toLowerCase()
        const filterValueStr = filterValue.toLowerCase()
        
        // Handle date filtering
        if (column === 'createdAt' || column === 'updatedAt') {
          const productDate = new Date(productValueStr)
          const filterDate = new Date(filterValueStr)
          return productDate.getFullYear() === filterDate.getFullYear() &&
                 productDate.getMonth() === filterDate.getMonth() &&
                 productDate.getDate() === filterDate.getDate()
        }
        
        return productValueStr.includes(filterValueStr)
      }
      
      return true
    })
  })

  // Apply active filter
  if (activeFilter && activeFilter !== 'all') {
    switch (activeFilter) {
      case 'rto':
        filtered = filtered.filter(order => order.deliveryStatus === 'RTO')
        break
      case 'influencer':
        filtered = filtered.filter(order => order.tags?.includes('influencer'))
        break
      case 'open':
        filtered = filtered.filter(order => order.fulfillmentStatus === 'unfulfilled')
        break
      case 'color-issue':
        filtered = filtered.filter(order => order.tags?.includes('color-issue'))
        break
      case 'custom':
        filtered = filtered.filter(order => order.tags?.includes('custom'))
        break
      case 'partial-paid':
        filtered = filtered.filter(order => order.financialStatus === 'pending')
        break
      case 'unfulfilled':
        filtered = filtered.filter(order => order.fulfillmentStatus === 'unfulfilled')
        break
      default:
        // Handle custom filters
        break
    }
  }

  return filtered
}

// Get page numbers for pagination
export const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = []
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return pages
}
