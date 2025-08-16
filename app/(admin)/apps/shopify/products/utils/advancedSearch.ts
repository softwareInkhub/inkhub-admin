import { Product } from '../types'

// Column mapping for search queries - covers all table headers
const COLUMN_MAPPING: Record<string, keyof Product> = {
  // Product column
  'product': 'title',
  'title': 'title',
  'name': 'title',
  'productname': 'title',
  
  // Status column
  'status': 'status',
  'productstatus': 'status',
  
  // Inventory column
  'inventory': 'inventoryQuantity',
  'stock': 'inventoryQuantity',
  'quantity': 'inventoryQuantity',
  'stockquantity': 'inventoryQuantity',
  
  // Price column
  'price': 'price',
  'cost': 'cost',
  'productprice': 'price',
  'productcost': 'cost',
  
  // Type column
  'type': 'productType',
  'producttype': 'productType',
  'product_type': 'productType',
  
  // Vendor column
  'vendor': 'vendor',
  'brand': 'vendor',
  'manufacturer': 'vendor',
  
  // Category column
  'category': 'category',
  'cat': 'category',
  'productcategory': 'category',
  
  // Created column
  'created': 'createdAt',
  'createdat': 'createdAt',
  'created_at': 'createdAt',
  'datecreated': 'createdAt',
  
  // Updated column
  'updated': 'updatedAt',
  'updatedat': 'updatedAt',
  'updated_at': 'updatedAt',
  'dateupdated': 'updatedAt',
  'modified': 'updatedAt',
  
  // Additional fields
  'tag': 'tags',
  'tags': 'tags',
  'handle': 'handle',
  'id': 'id',
  'productid': 'id'
}

interface SearchCondition {
  column: string
  operator: string
  value: string | number | Date
  logicalOp?: 'AND' | 'OR'
}

interface ParsedQuery {
  conditions: SearchCondition[]
  isValid: boolean
  error?: string
}

// Parse advanced search query
export function parseAdvancedSearchQuery(query: string): ParsedQuery {
  if (!query.trim()) {
    return { conditions: [], isValid: false }
  }

  try {
    const conditions: SearchCondition[] = []
    
    // Check if query contains logical operators
    if (query.toUpperCase().includes(' AND ') || query.toUpperCase().includes(' OR ')) {
      const parts = query.split(/\s+(AND|OR)\s+/i)
      console.log('Split parts:', parts)
      
      for (let i = 0; i < parts.length; i += 2) {
        const conditionPart = parts[i]
        const logicalOp = parts[i + 1]?.toUpperCase() as 'AND' | 'OR'
        
        console.log('Processing part:', conditionPart, 'with logical op:', logicalOp)
        
        // Parse individual condition
        const condition = parseCondition(conditionPart)
        if (condition) {
          condition.logicalOp = logicalOp
          conditions.push(condition)
        }
      }
    } else {
      // Single condition without logical operators
      console.log('Single condition:', query)
      const condition = parseCondition(query)
      if (condition) {
        conditions.push(condition)
      }
    }

    // Debug logging
    console.log('Parsed query:', query, 'Conditions:', conditions)

    return {
      conditions,
      isValid: conditions.length > 0
    }
  } catch (error) {
    console.error('Parse error:', error)
    return {
      conditions: [],
      isValid: false,
      error: `Parse error: ${error}`
    }
  }
}

// Parse individual condition
function parseCondition(conditionStr: string): SearchCondition | null {
  console.log('Parsing condition:', conditionStr)
  
  // Handle quoted strings with column specification
  const quotedMatch = conditionStr.match(/^([^:]+):"([^"]+)"$/)
  if (quotedMatch) {
    const [, column, value] = quotedMatch
    const mappedColumn = COLUMN_MAPPING[column.toLowerCase()]
    if (mappedColumn) {
      console.log('Quoted match:', { column: mappedColumn, value })
      return {
        column: mappedColumn,
        operator: 'contains',
        value: value
      }
    }
  }

  // Handle column:value format
  const colonMatch = conditionStr.match(/^([^:]+):(.+)$/)
  if (colonMatch) {
    const [, column, value] = colonMatch
    const mappedColumn = COLUMN_MAPPING[column.toLowerCase()]
    if (mappedColumn) {
      console.log('Colon match:', { column: mappedColumn, value })
      return {
        column: mappedColumn,
        operator: 'contains',
        value: value.trim()
      }
    }
  }

  // Handle comparison operators with column specification
  const operatorMatch = conditionStr.match(/^([^<>=!]+)\s*(<|<=|>|>=|=|!=)\s*(.+)$/)
  if (operatorMatch) {
    const [, column, operator, value] = operatorMatch
    const mappedColumn = COLUMN_MAPPING[column.toLowerCase()]
    if (mappedColumn) {
      console.log('Operator match:', { column: mappedColumn, operator, value })
      return {
        column: mappedColumn,
        operator,
        value: value.trim()
      }
    }
  }

  // Handle direct data search (no column specification)
  // Check if it's a number (for price, inventory comparisons)
  if (conditionStr.match(/^(<|<=|>|>=|=|!=)\s*\d+$/)) {
    // This is a numeric comparison without column - apply to price by default
    const operatorMatch = conditionStr.match(/^(<|<=|>|>=|=|!=)\s*(\d+)$/)
    if (operatorMatch) {
      const [, operator, value] = operatorMatch
      console.log('Numeric comparison:', { column: 'price', operator, value })
      return {
        column: 'price',
        operator,
        value: parseFloat(value)
      }
    }
  }

  // Check if it's a pure number (for price matching)
  if (conditionStr.match(/^\d+$/)) {
    console.log('Pure number:', { column: 'price', value: conditionStr })
    return {
      column: 'price',
      operator: '=',
      value: parseFloat(conditionStr)
    }
  }

  // Check if it's "X in stock" format
  const inStockMatch = conditionStr.match(/^(\d+)\s+in\s+stock$/i)
  if (inStockMatch) {
    const [, quantity] = inStockMatch
    console.log('In stock match:', { column: 'inventoryQuantity', value: quantity })
    return {
      column: 'inventoryQuantity',
      operator: '=',
      value: parseInt(quantity)
    }
  }

  // Check if it's a date (YYYY-MM-DD format)
  if (conditionStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.log('Date match:', { column: 'createdAt', value: conditionStr })
    return {
      column: 'createdAt',
      operator: '=',
      value: conditionStr
    }
  }

  // Check if it's a date with comparison (e.g., >2024-01-01)
  if (conditionStr.match(/^(<|<=|>|>=|=|!=)\s*\d{4}-\d{2}-\d{2}$/)) {
    const operatorMatch = conditionStr.match(/^(<|<=|>|>=|=|!=)\s*(\d{4}-\d{2}-\d{2})$/)
    if (operatorMatch) {
      const [, operator, value] = operatorMatch
      console.log('Date comparison:', { column: 'createdAt', operator, value })
      return {
        column: 'createdAt',
        operator,
        value: value
      }
    }
  }

  // Handle direct text search (no column specification)
  // This will search across all text fields
  if (conditionStr.trim()) {
    console.log('Direct text search:', { column: 'all', value: conditionStr.trim() })
    return {
      column: 'all', // Special marker for searching all fields
      operator: 'contains',
      value: conditionStr.trim()
    }
  }

  console.log('No match found for:', conditionStr)
  return null
}

// Apply advanced search to products
export function applyAdvancedSearch(products: Product[], parsedQuery: ParsedQuery): Product[] {
  if (!parsedQuery.isValid || parsedQuery.conditions.length === 0) {
    return products
  }

  return products.filter(product => {
    if (parsedQuery.conditions.length === 1) {
      // Single condition
      return evaluateCondition(product, parsedQuery.conditions[0])
    }

    // Multiple conditions with logical operators
    let result = evaluateCondition(product, parsedQuery.conditions[0])
    
    for (let i = 1; i < parsedQuery.conditions.length; i++) {
      const condition = parsedQuery.conditions[i]
      const conditionResult = evaluateCondition(product, condition)
      
      if (condition.logicalOp === 'OR') {
        result = result || conditionResult
      } else {
        result = result && conditionResult
      }
    }

    return result
  })
}

// Evaluate single condition
function evaluateCondition(product: Product, condition: SearchCondition): boolean {
  const operator = condition.operator
  const searchValue = condition.value

  console.log('Evaluating condition:', { column: condition.column, operator, searchValue, productTitle: product.title })

  // Handle 'all' column search (search across all text fields)
  if (condition.column === 'all') {
    const searchLower = String(searchValue).toLowerCase()
    
    const result = (
      product.title.toLowerCase().includes(searchLower) ||
      product.vendor.toLowerCase().includes(searchLower) ||
      product.productType.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower) ||
      product.handle.toLowerCase().includes(searchLower) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
      product.collections?.some(collection => collection.toLowerCase().includes(searchLower)) ||
      product.status.toLowerCase().includes(searchLower) ||
      String(product.price).includes(searchLower) ||
      String(product.cost).includes(searchLower) ||
      String(product.inventoryQuantity).includes(searchLower) ||
      new Date(product.createdAt).toLocaleDateString().toLowerCase().includes(searchLower) ||
      new Date(product.updatedAt).toLocaleDateString().toLowerCase().includes(searchLower)
    )
    
    console.log('All column search result:', result, 'for search:', searchLower)
    return result
  }

  const productValue = product[condition.column as keyof Product]
  
  if (productValue === undefined || productValue === null) {
    return false
  }

  // Handle different data types
  const column = condition.column as keyof Product
  
  // Date fields (Created, Updated)
  if (column === 'createdAt' || column === 'updatedAt') {
    const productDate = new Date(productValue as string)
    const searchDate = new Date(searchValue as string)
    
    switch (operator) {
      case '=':
      case ':':
        return productDate.toDateString() === searchDate.toDateString()
      case '!=':
        return productDate.toDateString() !== searchDate.toDateString()
      case '<':
        return productDate < searchDate
      case '<=':
        return productDate <= searchDate
      case '>':
        return productDate > searchDate
      case '>=':
        return productDate >= searchDate
      case 'contains':
      default:
        return productDate.toLocaleDateString().toLowerCase().includes(String(searchValue).toLowerCase())
    }
  }
  
  // Numeric fields (Price, Cost, Inventory)
  if (column === 'price' || column === 'cost' || column === 'inventoryQuantity') {
    const productNum = Number(productValue)
    const searchNum = Number(searchValue)
    
    switch (operator) {
      case '=':
      case ':':
        return productNum === searchNum
      case '!=':
        return productNum !== searchNum
      case '<':
        return productNum < searchNum
      case '<=':
        return productNum <= searchNum
      case '>':
        return productNum > searchNum
      case '>=':
        return productNum >= searchNum
      case 'contains':
      default:
        return String(productNum).includes(String(searchValue))
    }
  }
  
  // Array fields (Tags)
  if (Array.isArray(productValue)) {
    switch (operator) {
      case '=':
      case ':':
        return productValue.some(item => String(item).toLowerCase() === String(searchValue).toLowerCase())
      case '!=':
        return !productValue.some(item => String(item).toLowerCase() === String(searchValue).toLowerCase())
      case 'contains':
      default:
        return productValue.some(item => String(item).toLowerCase().includes(String(searchValue).toLowerCase()))
    }
  }
  
  // String fields (Title, Vendor, Type, Category, Status, etc.)
  switch (operator) {
    case '=':
    case ':':
      return String(productValue).toLowerCase() === String(searchValue).toLowerCase()
    case '!=':
      return String(productValue).toLowerCase() !== String(searchValue).toLowerCase()
    case 'contains':
    default:
      return String(productValue).toLowerCase().includes(String(searchValue).toLowerCase())
  }
}

// Get search suggestions
export function getSearchSuggestions(query: string): string[] {
  if (!query.trim()) {
    return [
      'shiv AND 555',
      'active AND >500',
      'Nike OR INKHUB',
      '>100 AND <1000',
      '2024-01-01 AND active',
      'featured OR trending'
    ]
  }
  return []
}

// Debounce function with cancel method
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout
  
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
  
  debounced.cancel = () => {
    clearTimeout(timeout)
  }
  
  return debounced
}
