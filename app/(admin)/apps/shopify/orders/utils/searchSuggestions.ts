import { Order } from '../types'

export interface SearchSuggestion {
  id: string
  text: string
  type: 'order' | 'customer' | 'channel' | 'tag' | 'history' | 'status'
  count?: number
  icon?: string
}

export interface SearchHistory {
  query: string
  timestamp: number
  resultCount: number
}

// Get search suggestions based on current input and available data
export const getSearchSuggestions = (
  query: string,
  orders: Order[],
  searchHistory: SearchHistory[],
  maxSuggestions: number = 10
): SearchSuggestion[] => {
  if (!query.trim()) {
    return getRecentSearches(searchHistory, 5)
  }

  const suggestions: SearchSuggestion[] = []
  const queryLower = query.toLowerCase()

  // 1. Order number suggestions
  const orderSuggestions = orders
    .filter(order => 
      order.orderNumber.toLowerCase().includes(queryLower) ||
      order.orderNumber.toLowerCase().startsWith(queryLower)
    )
    .slice(0, 3)
    .map(order => ({
      id: `order-${order.id}`,
      text: `#${order.orderNumber}`,
      type: 'order' as const,
      icon: '📦'
    }))

  suggestions.push(...orderSuggestions)

  // 2. Customer name suggestions
  const customerSuggestions = Array.from(new Set(orders.map(o => o.customerName)))
    .filter(customer => customer.toLowerCase().includes(queryLower))
    .slice(0, 2)
    .map(customer => ({
      id: `customer-${customer}`,
      text: customer,
      type: 'customer' as const,
      icon: '👤'
    }))

  suggestions.push(...customerSuggestions)

  // 3. Channel suggestions
  const channelSuggestions = Array.from(new Set(orders.map(o => o.channel).filter(Boolean)))
    .filter((channel): channel is string => channel !== undefined && channel.toLowerCase().includes(queryLower))
    .slice(0, 2)
    .map(channel => ({
      id: `channel-${channel}`,
      text: channel,
      type: 'channel' as const,
      icon: '🏪'
    }))

  suggestions.push(...channelSuggestions)

  // 4. Status suggestions
  const statusSuggestions = Array.from(new Set(orders.map(o => o.status)))
    .filter(status => status.toLowerCase().includes(queryLower))
    .slice(0, 2)
    .map(status => ({
      id: `status-${status}`,
      text: status,
      type: 'status' as const,
      icon: '📊'
    }))

  suggestions.push(...statusSuggestions)

  // 5. Tag suggestions
  const allTags = orders.flatMap(o => o.tags || [])
  const tagSuggestions = Array.from(new Set(allTags))
    .filter(tag => tag.toLowerCase().includes(queryLower))
    .slice(0, 2)
    .map(tag => ({
      id: `tag-${tag}`,
      text: tag,
      type: 'tag' as const,
      icon: '🏷️'
    }))

  suggestions.push(...tagSuggestions)

  // 6. Search history suggestions
  const historySuggestions = searchHistory
    .filter(history => history.query.toLowerCase().includes(queryLower))
    .slice(0, 2)
    .map(history => ({
      id: `history-${history.query}`,
      text: history.query,
      type: 'history' as const,
      icon: '🕒'
    }))

  suggestions.push(...historySuggestions)

  // Remove duplicates and limit results
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
    index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
  )

  return uniqueSuggestions.slice(0, maxSuggestions)
}

// Get recent searches for empty query
export const getRecentSearches = (
  searchHistory: SearchHistory[],
  maxResults: number = 5
): SearchSuggestion[] => {
  return searchHistory
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxResults)
    .map(history => ({
      id: `history-${history.query}`,
      text: history.query,
      type: 'history' as const,
      icon: '🕒'
    }))
}

// Save search to history
export const saveSearchToHistory = (
  query: string,
  resultCount: number,
  searchHistory: SearchHistory[]
): SearchHistory[] => {
  const newHistory: SearchHistory = {
    query: query.trim(),
    timestamp: Date.now(),
    resultCount
  }

  // Remove existing entry with same query
  const filteredHistory = searchHistory.filter(h => h.query.toLowerCase() !== query.toLowerCase())
  
  // Add new entry at the beginning
  return [newHistory, ...filteredHistory].slice(0, 20) // Keep last 20 searches
}

// Get popular searches (based on frequency)
export const getPopularSearches = (
  searchHistory: SearchHistory[],
  maxResults: number = 5
): SearchSuggestion[] => {
  const queryCounts = searchHistory.reduce((acc, history) => {
    const query = history.query.toLowerCase()
    acc[query] = (acc[query] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(queryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxResults)
    .map(([query, count]) => ({
      id: `popular-${query}`,
      text: query,
      type: 'history' as const,
      icon: '🔥',
      count
    }))
}

// Debounced search with suggestions
export const createDebouncedSearch = (delay: number = 300) => {
  let timeoutId: NodeJS.Timeout | null = null
  let lastQuery = ''

  return {
    search: (
      query: string,
      callback: (results: any[], suggestions: SearchSuggestion[]) => void,
      orders: Order[],
      searchHistory: SearchHistory[]
    ) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // Always show suggestions immediately
      const suggestions = getSearchSuggestions(query, orders, searchHistory)
      
      if (query.trim().length === 0) {
        callback([], suggestions)
        return
      }

      // Debounce the actual search
      timeoutId = setTimeout(() => {
        if (query !== lastQuery) {
          lastQuery = query
          // The actual search will be handled by the existing Algolia search
          callback([], suggestions)
        }
      }, delay)
    },

    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }
  }
}
