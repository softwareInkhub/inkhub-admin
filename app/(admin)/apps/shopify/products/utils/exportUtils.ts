import { Product } from '../types'

// Export format types
export type ExportFormat = 'csv' | 'json' | 'pdf'

// Field mapping for exports
export interface ExportField {
  key: keyof Product
  label: string
  type: 'string' | 'number' | 'date' | 'array' | 'object'
}

export const EXPORT_FIELDS: ExportField[] = [
  { key: 'id', label: 'ID', type: 'string' },
  { key: 'title', label: 'Product Name', type: 'string' },
  { key: 'vendor', label: 'Vendor', type: 'string' },
  { key: 'productType', label: 'Product Type', type: 'string' },
  { key: 'price', label: 'Price', type: 'number' },
  { key: 'compareAtPrice', label: 'Compare Price', type: 'number' },
  { key: 'cost', label: 'Cost', type: 'number' },
  { key: 'inventoryQuantity', label: 'Inventory', type: 'number' },
  { key: 'status', label: 'Status', type: 'string' },
  { key: 'category', label: 'Category', type: 'string' },
  { key: 'tags', label: 'Tags', type: 'array' },
  { key: 'createdAt', label: 'Created Date', type: 'date' },
  { key: 'updatedAt', label: 'Updated Date', type: 'date' },
  { key: 'publishedAt', label: 'Published Date', type: 'date' },
  { key: 'salesChannels', label: 'Sales Channels', type: 'number' }
]

// Format value for export
const formatValue = (value: any, type: string): string => {
  if (value === null || value === undefined) return ''
  
  switch (type) {
    case 'date':
      return value ? new Date(value).toLocaleDateString() : ''
    case 'array':
      return Array.isArray(value) ? value.join(', ') : String(value)
    case 'number':
      return typeof value === 'number' ? value.toString() : String(value)
    case 'object':
      return typeof value === 'object' ? JSON.stringify(value) : String(value)
    default:
      return String(value)
  }
}

// Export to CSV
export const exportToCSV = (products: Product[], selectedFields: string[]): void => {
  // Filter fields based on selection
  const fields = EXPORT_FIELDS.filter(field => selectedFields.includes(field.key))
  
  // Create CSV header
  const headers = fields.map(field => field.label)
  const csvHeader = headers.join(',')
  
  // Create CSV rows
  const csvRows = products.map(product => {
    const row = fields.map(field => {
      const value = product[field.key]
      const formattedValue = formatValue(value, field.type)
      // Escape commas and quotes in CSV
      return `"${formattedValue.replace(/"/g, '""')}"`
    })
    return row.join(',')
  })
  
  // Combine header and rows
  const csvContent = [csvHeader, ...csvRows].join('\n')
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export to JSON
export const exportToJSON = (products: Product[], selectedFields: string[]): void => {
  // Filter fields based on selection
  const fields = EXPORT_FIELDS.filter(field => selectedFields.includes(field.key))
  
  // Create JSON data
  const jsonData = products.map(product => {
    const exportProduct: any = {}
    fields.forEach(field => {
      exportProduct[field.label] = product[field.key]
    })
    return exportProduct
  })
  
  // Create and download file
  const jsonContent = JSON.stringify(jsonData, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export to PDF
export const exportToPDF = async (products: Product[], selectedFields: string[]): Promise<void> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in browser environment')
    }

    // Dynamic import for PDF generation - jsPDF v3 syntax
    let jsPDF: any
    try {
      const { jsPDF: jsPDFClass } = await import('jspdf')
      jsPDF = jsPDFClass
    } catch (importError) {
      console.error('Failed to import jsPDF:', importError)
      throw new Error('jsPDF library not available')
    }
    
    // Import autoTable plugin
    try {
      await import('jspdf-autotable')
    } catch (autoTableError) {
      console.warn('autoTable plugin not available, using fallback PDF generation')
    }
    
    // Filter fields based on selection
    const fields = EXPORT_FIELDS.filter(field => selectedFields.includes(field.key))
    
    // Create PDF document
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Products Export', 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Products: ${products.length}`, 14, 35)
    
    // Prepare table data
    const headers = fields.map(field => field.label)
    const tableData = products.map(product => 
      fields.map(field => formatValue(product[field.key], field.type))
    )
    
    // Try to use autoTable if available
    if (typeof (doc as any).autoTable === 'function') {
      try {
        (doc as any).autoTable({
          head: [headers],
          body: tableData,
          startY: 45,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [59, 130, 246], // Blue color
            textColor: 255
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252] // Light gray
          },
          margin: { top: 45 }
        })
      } catch (autoTableError) {
        console.warn('autoTable failed, using fallback:', autoTableError)
        // Fall through to fallback
      }
    }
    
    // Fallback: create simple text-based PDF
    if (typeof (doc as any).autoTable !== 'function' || !(doc as any).autoTable) {
      let yPosition = 45
      
      // Add headers
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      headers.forEach((header, index) => {
        doc.text(`${header}:`, 14, yPosition)
        yPosition += 10
      })
      
      // Add data
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      tableData.forEach((row, rowIndex) => {
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.text(`Product ${rowIndex + 1}:`, 14, yPosition)
        yPosition += 8
        
        row.forEach((cell, cellIndex) => {
          if (yPosition > 280) {
            doc.addPage()
            yPosition = 20
          }
          doc.text(`  ${headers[cellIndex]}: ${cell}`, 20, yPosition)
          yPosition += 6
        })
        yPosition += 5
      })
    }
    
    // Save PDF
    doc.save(`products_export_${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    // Fallback: show error message
    alert('PDF generation failed. Please try again or use CSV/JSON export.')
  }
}

// Main export function
export const exportProducts = async (
  products: Product[], 
  format: ExportFormat, 
  selectedFields: string[]
): Promise<void> => {
  try {
    switch (format) {
      case 'csv':
        exportToCSV(products, selectedFields)
        break
      case 'json':
        exportToJSON(products, selectedFields)
        break
      case 'pdf':
        await exportToPDF(products, selectedFields)
        break
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  } catch (error) {
    console.error('Export failed:', error)
    alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
