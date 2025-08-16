import { log } from 'console'
import { Order } from '../types'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://brmh.in'



// Helper function to parse dates
const parseDate = (dateStr: any): string => {
  if (!dateStr) return new Date().toISOString()
  try {
    const date = new Date(dateStr)
    return date.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

// Helper function to map raw order data to Order type
const mapRecordToOrder = (raw: any, idx: number): Order => {
  const orderNumber = String(raw?.order_number ?? raw?.orderNumber ?? raw?.name ?? `#INK${Math.floor(Math.random() * 90000) + 10000}`)
  const customerName = String(raw?.customer?.first_name ?? raw?.customer?.last_name ?? raw?.customer_name ?? raw?.customerName ?? `Customer ${idx + 1}`)
  const customerEmail = String(raw?.customer?.email ?? raw?.customer_email ?? raw?.customerEmail ?? `customer${idx + 1}@example.com`)
  
  const financialStatus = String(raw?.financial_status ?? raw?.financialStatus ?? 'pending').toLowerCase()
  const fulfillmentStatus = String(raw?.fulfillment_status ?? raw?.fulfillmentStatus ?? 'unfulfilled').toLowerCase()
  
  const total = Number(raw?.total_price ?? raw?.totalPrice ?? raw?.total ?? 0) || 0
  const itemsCount = Array.isArray(raw?.line_items) ? raw.line_items.length : 1
  
  const tags = Array.isArray(raw?.tags) ? raw.tags : (typeof raw?.tags === 'string' ? raw.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [])
  
  const channel = String(raw?.source_name ?? raw?.sourceName ?? raw?.channel ?? 'Shopify')
  const deliveryMethod = String(raw?.shipping_lines?.[0]?.title ?? raw?.delivery_method ?? raw?.deliveryMethod ?? 'Standard Shipping')
  
  const deliveryStatus = fulfillmentStatus === 'fulfilled' ? 'Tracking added' : 'Pending'
  
  return {
    id: String(raw?.id ?? raw?.order_id ?? raw?.gid ?? `order-${Date.now()}-${idx}`),
    orderNumber,
    customerName,
    customerEmail,
    status: financialStatus as 'paid' | 'pending' | 'refunded',
    fulfillmentStatus: fulfillmentStatus as 'unfulfilled' | 'fulfilled' | 'partial',
    financialStatus: financialStatus as 'paid' | 'pending' | 'refunded',
    total,
    currency: String(raw?.currency ?? 'INR'),
    items: itemsCount,
    deliveryStatus,
    tags,
    channel,
    deliveryMethod,
    paymentStatus: financialStatus as 'paid' | 'pending' | 'refunded',
    createdAt: parseDate(raw?.created_at ?? raw?.createdAt),
    updatedAt: parseDate(raw?.updated_at ?? raw?.updatedAt),
    lineItems: Array.isArray(raw?.line_items) ? raw.line_items.map((item: any) => ({
      id: String(item?.id ?? `item-${Date.now()}-${idx}`),
      title: String(item?.title ?? item?.name ?? 'Unknown Product'),
      quantity: Number(item?.quantity ?? 1),
      price: Number(item?.price ?? 0),
      sku: String(item?.sku ?? ''),
      variantId: String(item?.variant_id ?? item?.variantId ?? '')
    })) : [],
    shippingAddress: raw?.shipping_address ? {
      firstName: String(raw.shipping_address?.first_name ?? ''),
      lastName: String(raw.shipping_address?.last_name ?? ''),
      address1: String(raw.shipping_address?.address1 ?? ''),
      address2: String(raw.shipping_address?.address2 ?? ''),
      city: String(raw.shipping_address?.city ?? ''),
      province: String(raw.shipping_address?.province ?? ''),
      country: String(raw.shipping_address?.country ?? ''),
      zip: String(raw.shipping_address?.zip ?? ''),
      phone: String(raw.shipping_address?.phone ?? '')
    } : undefined,
    billingAddress: raw?.billing_address ? {
      firstName: String(raw.billing_address?.first_name ?? ''),
      lastName: String(raw.billing_address?.last_name ?? ''),
      address1: String(raw.billing_address?.address1 ?? ''),
      address2: String(raw.billing_address?.address2 ?? ''),
      city: String(raw.billing_address?.city ?? ''),
      province: String(raw.billing_address?.province ?? ''),
      country: String(raw.billing_address?.country ?? ''),
      zip: String(raw.billing_address?.zip ?? ''),
      phone: String(raw.billing_address?.phone ?? '')
    } : undefined
  }
}

export const getTransformedOrders = async (): Promise<Order[]> => {
  console.log('🔄 Starting getTransformedOrders...')
  console.log('📍 BACKEND_URL:', BACKEND_URL)
  
  try {
    // Step 1: Fetch all chunk keys
    const keysUrl = `${BACKEND_URL}/cache/data?project=my-app&table=shopify-inkhub-get-orders`
    console.log('🔑 Fetching chunk keys from:', keysUrl)
    
    const keysRes = await fetch(keysUrl)
    console.log('📡 Keys response status:', keysRes.status)
    console.log('📡 Keys response ok:', keysRes.ok)
    
    if (!keysRes.ok) {
      console.error('❌ Keys fetch failed:', keysRes.status, keysRes.statusText)
      throw new Error(`Cache API error (${keysRes.status}): ${keysRes.statusText}`)
    }
    
    const keysJson = await keysRes.json()
    console.log('📋 Keys response data:', keysJson)

    if (!keysJson?.keys || !Array.isArray(keysJson.keys)) {
      console.error('❌ No valid keys found in response:', keysJson)
      throw new Error('No chunk keys found')
    }

    console.log('✅ Found chunk keys:', keysJson.keys)

    // Step 2: Fetch each chunk's data
    const allOrders: Order[] = []
    let totalItems = 0
    
    for (const key of keysJson.keys) {
      // Extract just the chunk number from the full key
      const chunkNumber = key.split(':').pop() // Gets 'chunk:0' from 'my-app:shopify-inkhub-get-orders:chunk:0'
      const chunkUrl = `${BACKEND_URL}/cache/data?project=my-app&table=shopify-inkhub-get-orders&key=chunk:${chunkNumber}`
      console.log(`🔗 Fetching chunk data for key: ${key}`)
      console.log(`🔗 Extracted chunk number: ${chunkNumber}`)
      console.log(`🔗 Chunk URL: ${chunkUrl}`)
      
      const chunkRes = await fetch(chunkUrl)
      console.log(`📡 Chunk ${key} response status:`, chunkRes.status)
      console.log(`📡 Chunk ${key} response ok:`, chunkRes.ok)
      
      if (chunkRes.ok) {
        const chunkJson = await chunkRes.json()
        console.log(`📋 Chunk ${key} response data:`, chunkJson)
        
        if (chunkJson?.data && Array.isArray(chunkJson.data)) {
          console.log(`✅ Chunk ${key} has ${chunkJson.data.length} items`)
          const mappedChunk: Order[] = chunkJson.data.map(mapRecordToOrder)
          allOrders.push(...mappedChunk)
          totalItems += mappedChunk.length
          console.log(`✅ Mapped ${mappedChunk.length} orders from chunk ${key}`)
        } else {
          console.warn(`⚠️ Chunk ${key} has no valid data array:`, chunkJson)
        }
      } else {
        console.error(`❌ Chunk ${key} fetch failed:`, chunkRes.status, chunkRes.statusText)
      }
    }

    console.log('📊 Total items across all chunks:', totalItems)
    console.log('✅ Successfully loaded orders:', allOrders.length)

    if (totalItems === 0) {
      console.error('❌ No order data found in any chunks')
      throw new Error('No order data found in chunks')
    }

    return allOrders
    
  } catch (error: any) {
    console.error('💥 Error in getTransformedOrders:', error)
    console.error('💥 Error name:', error?.name)
    console.error('💥 Error message:', error?.message)
    console.error('💥 Error stack:', error?.stack)
    
    if (error?.name === 'AbortError') {
      console.log('🛑 Request was aborted')
      throw error
    }
    
    // Check if it's a connection error
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
      console.warn('⚠️ Backend connection failed')
      throw new Error('Backend connection failed')
    }
    
    throw error
  }
}
