export const calculateCustomValue = (
  values: number[],
  operation: string,
  customFormula?: string,
  totalProducts?: number
): number => {
  const sum = values.reduce((acc, val) => acc + val, 0)
  const count = values.length
  const min = values.length > 0 ? Math.min(...values) : 0
  const max = values.length > 0 ? Math.max(...values) : 0
  const average = count > 0 ? sum / count : 0

  switch (operation) {
    case 'sum':
      return sum
    case 'average':
      return average
    case 'min':
      return min
    case 'max':
      return max
    case 'count':
      return count
    case 'percentage':
      // Calculate percentage of selected products from total products
      return totalProducts && totalProducts > 0 ? (count / totalProducts) * 100 : 0
    case 'difference':
      return max - min
    case 'custom':
      if (!customFormula) return 0
      try {
        // Safely evaluate custom formula with predefined variables
        const safeFormula = customFormula
          .replace(/sum/g, sum.toString())
          .replace(/count/g, count.toString())
          .replace(/min/g, min.toString())
          .replace(/max/g, max.toString())
          .replace(/average/g, average.toString())
        
        // Only allow basic arithmetic operations
        const sanitizedFormula = safeFormula.replace(/[^0-9+\-*/().\s]/g, '')
        return eval(sanitizedFormula) || 0
      } catch {
        return 0
      }
    default:
      return 0
  }
}

export const formatCardValue = (value: number, field: string): string => {
  const isCurrency = field === 'price' || field === 'cost' || field === 'compareAtPrice'
  
  if (isCurrency) {
    return `₹${value.toFixed(2)}`
  }
  
  return value.toLocaleString()
}
