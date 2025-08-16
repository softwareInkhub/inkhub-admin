import { Order, SearchCondition } from '../types'

// Column mapping for advanced search
const COLUMN_MAPPING: Record<string, keyof Order> = {
  'order': 'orderNumber',
  'order_number': 'orderNumber',
  'orderNumber': 'orderNumber',
  'customer': 'customerName',
  'customer_name': 'customerName',
  'customerName': 'customerName',
  'email': 'customerEmail',
  'customer_email': 'customerEmail',
  'customerEmail': 'customerEmail',
  'phone': 'phone',
  'total': 'total',
  'status': 'status',
  'fulfillment': 'fulfillmentStatus',
  'fulfillment_status': 'fulfillmentStatus',
  'fulfillmentStatus': 'fulfillmentStatus',
  'financial': 'financialStatus',
  'financial_status': 'financialStatus',
  'financialStatus': 'financialStatus',
  'channel': 'channel',
  'delivery': 'deliveryMethod',
  'delivery_method': 'deliveryMethod',
  'deliveryMethod': 'deliveryMethod',
  'delivery_status': 'deliveryStatus',
  'deliveryStatus': 'deliveryStatus',
  'tags': 'tags',
  'created': 'createdAt',
  'created_at': 'createdAt',
  'createdAt': 'createdAt',
  'updated': 'updatedAt',
  'updated_at': 'updatedAt',
  'updatedAt': 'updatedAt'
}

// Parse advanced search query
export const parseAdvancedSearchQuery = (query: string): SearchCondition[] => {
  const conditions: SearchCondition[] = []
  const lines = query.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    const parts = line.split(' ').filter(part => part.trim())
    if (parts.length < 3) continue
    
    const field = parts[0].toLowerCase()
    const operator = parts[1].toLowerCase()
    const value = parts.slice(2).join(' ')
    const connector = parts[parts.length - 1] === 'AND' || parts[parts.length - 1] === 'OR' 
      ? parts[parts.length - 1] as 'AND' | 'OR' 
      : 'AND'
    
    if (COLUMN_MAPPING[field]) {
      conditions.push({
        field: COLUMN_MAPPING[field],
        operator: operator as 'contains' | 'equals' | 'starts_with' | 'ends_with',
        value,
        connector
      })
    }
  }
  
  return conditions
}

// Apply advanced search to orders
export const applyAdvancedSearch = (orders: Order[], conditions: SearchCondition[]): Order[] => {
  if (conditions.length === 0) return orders
  
  return orders.filter(order => {
    return conditions.every((condition, index) => {
      const productValue = order[condition.field as keyof Order]
      const value = String(productValue || '').toLowerCase()
      const searchValue = condition.value.toLowerCase()
      
      let matches = false
      switch (condition.operator) {
        case 'contains':
          matches = value.includes(searchValue)
          break
        case 'equals':
          matches = value === searchValue
          break
        case 'starts_with':
          matches = value.startsWith(searchValue)
          break
        case 'ends_with':
          matches = value.endsWith(searchValue)
          break
        default:
          matches = value.includes(searchValue)
      }
      
      // Apply connector logic (AND/OR)
      if (index === 0) return matches
      const prevCondition = conditions[index - 1]
      if (prevCondition.connector === 'AND') {
        return matches
      } else if (prevCondition.connector === 'OR') {
        // For OR, we need to check if any previous condition was true
        const prevMatches = conditions.slice(0, index).some((_, i) => {
          const prevProductValue = order[conditions[i].field as keyof Order]
          const prevValue = String(prevProductValue || '').toLowerCase()
          const prevSearchValue = conditions[i].value.toLowerCase()
          
          switch (conditions[i].operator) {
            case 'contains':
              return prevValue.includes(prevSearchValue)
            case 'equals':
              return prevValue === prevSearchValue
            case 'starts_with':
              return prevValue.startsWith(prevSearchValue)
            case 'ends_with':
              return prevValue.endsWith(prevSearchValue)
            default:
              return true
          }
        })
        return prevMatches || matches
      }
      
      return matches
    })
  })
}

// Debounce function for search
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
