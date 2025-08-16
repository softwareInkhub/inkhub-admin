import React from 'react';
import { Order } from '../types';
import { Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrdersGridProps {
  orders: Order[];
  selectedOrders: string[];
  onSelectOrder: (orderId: string) => void;
  onOrderClick: (order: Order, event?: React.MouseEvent) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  // Filter props
  activeColumnFilter: string | null;
  columnFilters: any;
  onFilterClick: (column: string) => void;
  onColumnFilterChange: (column: string, value: any) => void;
  onClearFilter: (column: string, filterType: string) => void;
  getUniqueValues: (field: string) => string[];
  getUniqueTags: () => string[];
}

const OrdersGrid: React.FC<OrdersGridProps> = ({
  orders,
  selectedOrders,
  onSelectOrder,
  onOrderClick,
  getStatusBadge,
  activeColumnFilter,
  columnFilters,
  onFilterClick,
  onColumnFilterChange,
  onClearFilter,
  getUniqueValues,
  getUniqueTags
}) => {
  const ColumnHeader = ({ 
    title, 
    column, 
    hasFilter = false, 
    filterType = 'text',
    options = []
  }: {
    title: string
    column: string
    hasFilter?: boolean
    filterType?: 'text' | 'select' | 'multi-select' | 'date'
    options?: string[]
  }) => {
    const [dropdownPosition, setDropdownPosition] = React.useState<'left' | 'right'>('right')
    
    const handleFilterClick = () => {
      const isLastColumn = column === 'paymentStatus' || column === 'deliveryMethod'
      setDropdownPosition(isLastColumn ? 'left' : 'right')
      onFilterClick(column)
    }

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {hasFilter && (
          <div className="relative">
            <button
              onClick={handleFilterClick}
              className={cn(
                "ml-1 p-1 rounded hover:bg-gray-200 transition-colors",
                activeColumnFilter === column ? "bg-blue-50 text-blue-600" : "text-gray-400",
                columnFilters[column] && 
                (typeof columnFilters[column] === 'string' ? 
                  (columnFilters[column] as string) : 
                  Array.isArray(columnFilters[column]) ?
                    (columnFilters[column] as string[])?.length > 0 :
                    (columnFilters[column] as any)?.min || (columnFilters[column] as any)?.max || (columnFilters[column] as any)?.start || (columnFilters[column] as any)?.end
                ) ? "text-blue-600" : "text-gray-400"
              )}
            >
              <Filter className="h-3 w-3" />
            </button>
            
            {/* Filter Dropdown */}
            {activeColumnFilter === column && (
              <div className={cn(
                "absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[100] column-filter-dropdown",
                dropdownPosition === 'right' ? 'right-0' : 'left-0'
              )}
              style={{
                position: 'absolute',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto',
                transform: 'translateZ(0)'
              }}>
                <div className="p-2">
                  {filterType === 'text' && (
                    <input
                      type="text"
                      placeholder={`Filter ${title.toLowerCase()}...`}
                      value={columnFilters[column] as string || ''}
                      onChange={(e) => onColumnFilterChange(column, e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  )}
                  
                  {filterType === 'select' && (
                    <select
                      value={columnFilters[column] as string || ''}
                      onChange={(e) => onColumnFilterChange(column, e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All {title}</option>
                      {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  
                  {filterType === 'multi-select' && (
                    <select
                      multiple
                      value={columnFilters[column] as string[] || []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value)
                        onColumnFilterChange(column, selected)
                      }}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  
                  {filterType === 'date' && (
                    <input
                      type="date"
                      value={columnFilters[column] as string || ''}
                      onChange={(e) => onColumnFilterChange(column, e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                  
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => onClearFilter(column, filterType)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Grid Header with Filters */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
          {/* Order Column */}
          <ColumnHeader 
            title="Order" 
            column="orderNumber" 
            hasFilter={true} 
            filterType="text"
          />
          
          {/* Customer Column */}
          <ColumnHeader 
            title="Customer" 
            column="customer" 
            hasFilter={true} 
            filterType="text"
          />
          
          {/* Status Column */}
          <ColumnHeader 
            title="Fulfillment Status" 
            column="fulfillmentStatus" 
            hasFilter={true} 
            filterType="multi-select"
            options={['unfulfilled', 'fulfilled', 'partial']}
          />
          
          {/* Total Column */}
          <ColumnHeader 
            title="Total" 
            column="total" 
            hasFilter={true} 
            filterType="text"
          />
          
          {/* Date Column */}
          <ColumnHeader 
            title="Date" 
            column="date" 
            hasFilter={true} 
            filterType="date"
          />
          
          {/* Items Column */}
          <ColumnHeader 
            title="Items" 
            column="items" 
            hasFilter={true} 
            filterType="text"
          />
          
          {/* Payment Status Column */}
          <ColumnHeader 
            title="Payment Status" 
            column="paymentStatus" 
            hasFilter={true} 
            filterType="multi-select"
            options={['paid', 'pending', 'refunded']}
          />
          
          {/* Tags Column */}
          <ColumnHeader 
            title="Tags" 
            column="tags" 
            hasFilter={true} 
            filterType="multi-select"
            options={getUniqueTags()}
          />
          
          {/* Channel Column */}
          <ColumnHeader 
            title="Channel" 
            column="channel" 
            hasFilter={true} 
            filterType="multi-select"
            options={getUniqueValues('channel')}
          />
          
          {/* Delivery Method Column */}
          <ColumnHeader 
            title="Delivery Method" 
            column="deliveryMethod" 
            hasFilter={true} 
            filterType="multi-select"
            options={getUniqueValues('deliveryMethod')}
          />
          
          {/* Delivery Status Column */}
          <ColumnHeader 
            title="Delivery Status" 
            column="deliveryStatus" 
            hasFilter={true} 
            filterType="multi-select"
            options={['Tracking added', 'In Transit', 'Delivered']}
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={(e) => onOrderClick(order, e)}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelectOrder(order.id);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                </div>
                {getStatusBadge(order.fulfillmentStatus)}
              </div>
              <div className="text-sm text-gray-500">
                {order.customerName}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
              <div className="space-y-3">
                {/* Total */}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-medium text-gray-900">${order.total}</span>
                </div>

                {/* Date */}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="text-sm text-gray-900">{order.createdAt}</span>
                </div>

                {/* Items */}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Items</span>
                  <span className="text-sm text-gray-900">{order.items.length} items</span>
                </div>

                {/* Payment Status */}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    order.financialStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.financialStatus}
                  </span>
                </div>

                {/* Tags */}
                {order.tags && order.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {order.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {order.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{order.tags.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{order.channel}</span>
                <span className="text-gray-500">{order.deliveryMethod}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersGrid;
