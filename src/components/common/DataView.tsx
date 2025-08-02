'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table, 
  Grid3X3, 
  List, 
  LayoutGrid, 
  Maximize2, 
  Minimize2,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft, ChevronRight, Download, Copy, Filter, Search, X
} from 'lucide-react';
import ArrowPagination from './ArrowPagination';
import ImageCell from './ImageCell';
import ActionButtons from './ActionButtons';

// Detailed Modal Component
interface DetailedModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  columns: any[];
}

function DetailedModal({ item, isOpen, onClose, columns }: DetailedModalProps) {
  if (!isOpen) return null;

  const getImageUrl = (item: any) => {
    // Handle different image field names
    if (item.image) {
      if (typeof item.image === 'string') {
        try {
          const parsedImage = JSON.parse(item.image);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          return item.image;
        }
      } else if (typeof item.image === 'object') {
        return item.image.src || item.image.url;
      }
    }
    
    if (item.images && Array.isArray(item.images) && item.images[0]) {
      if (typeof item.images[0] === 'string') {
        try {
          const parsedImage = JSON.parse(item.images[0]);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          return item.images[0];
        }
      } else if (typeof item.images[0] === 'object') {
        return item.images[0].src || item.images[0].url;
      } else {
        return item.images[0];
      }
    }
    
    if (item.Item?.image) {
      if (typeof item.Item.image === 'string') {
        try {
          const parsedImage = JSON.parse(item.Item.image);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          return item.Item.image;
        }
      } else if (typeof item.Item.image === 'object') {
        return item.Item.image.src || item.Item.image.url;
      }
    }
    
    if (item.Item?.images && Array.isArray(item.Item.images) && item.Item.images[0]) {
      if (typeof item.Item.images[0] === 'string') {
        try {
          const parsedImage = JSON.parse(item.Item.images[0]);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          return item.Item.images[0];
        }
      } else if (typeof item.Item.images[0] === 'object') {
        return item.Item.images[0].src || item.Item.images[0].url;
      } else {
        return item.Item.images[0];
      }
    }
    
    if (item.designImageUrl) return item.designImageUrl;
    
    return item.image?.src || item.images?.[0]?.src || item.Item?.image?.src || item.Item?.images?.[0]?.src ||
           item.src || item.Item?.src || item.featured_image || item.Item?.featured_image;
  };

  const getTitle = (item: any) => {
    return item.title || item.name || item.Item?.title || item.Item?.name || item.designName || item.product_title || item.Item?.product_title || 'Untitled';
  };

  const getDescription = (item: any) => {
    return item.description || item.Item?.description || item.designDescription || item.body_html || item.Item?.body_html || item.product_description || item.Item?.product_description || 'No description available';
  };

  const renderCellValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return '[Object]';
    return String(value);
  };

  const imageUrl = getImageUrl(item);
  const title = getTitle(item);
  const description = getDescription(item);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Item Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="space-y-4">
              {imageUrl ? (
                <div className="flex justify-center">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                  <span className="text-gray-400">No Image Available</span>
                </div>
              )}
            </div>
            
            {/* Details Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
              
              <div className="space-y-3">
                {columns.map((column) => {
                  if (column.accessor?.includes('image') || 
                      column.accessor?.includes('Image') ||
                      column.header?.toLowerCase().includes('image')) {
                    return null;
                  }
                  
                  const value = item[column.accessor];
                  if (value === null || value === undefined) return null;
                  
                  return (
                    <div key={column.accessor} className="flex justify-between items-start">
                      <span className="font-medium text-gray-700 min-w-[120px]">{column.header}:</span>
                      <span className="text-gray-600 text-right flex-1 ml-4">
                        {renderCellValue(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DataViewProps {
  data: any[];
  columns: any[];
  viewType?: 'table' | 'grid' | 'card' | 'list';
  onViewTypeChange?: (viewType: 'table' | 'grid' | 'card' | 'list') => void;
  enablePagination?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  selectedRows?: string[];
  onRowSelect?: (rowId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  className?: string;
  renderCard?: (row: any) => React.ReactNode;
  visibleColumns?: string[];
  onVisibleColumnsChange?: (columns: string[]) => void;
  // Action handlers
  onViewItem?: (item: any) => void;
  onEditItem?: (item: any) => void;
  onDeleteItem?: (item: any) => void;
  showActions?: boolean;
  // Card click handler
  onCardClick?: (item: any) => void;
  // Infinite scroll props
  enableInfiniteScroll?: boolean;
  hasMoreData?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

// Helper function to safely render cell values
const renderCellValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    // Check if it's DynamoDB marshalled format
    if (value.S !== undefined) {
      return String(value.S);
    }
    if (value.N !== undefined) {
      return String(value.N);
    }
    if (value.BOOL !== undefined) {
      return String(value.BOOL);
    }
    // Don't display other JSON objects - just show a placeholder
    return '[Object]';
  }
  return String(value);
};

// Helper function to check if a value is an image URL
const isImageUrl = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const url = value.toLowerCase();
  return imageExtensions.some(ext => url.includes(ext)) || url.includes('cdn.shopify.com');
};

// Helper function to render cell content
const renderCellContent = (value: any, column: any, row: any, viewType?: string): React.ReactNode => {
  // If column has a custom render function, use it
  if (column.render) {
    return column.render(value, row, viewType);
  }
  
  // If column has a custom Cell component, use it
  if (column.Cell) {
    return column.Cell({ value });
  }
  
  // Check if it's an image URL
  if (isImageUrl(value)) {
    return <ImageCell src={value} alt={column.header || 'Image'} viewType={viewType as 'table' | 'grid' | 'card' | 'list'} />;
  }
  
  // For object values, check if it's DynamoDB marshalled format first
  if (typeof value === 'object' && value !== null) {
    // Check if it's DynamoDB marshalled format
    if (value.S !== undefined) {
      return (
        <div className="truncate" title={String(value.S)}>
          {String(value.S)}
        </div>
      );
    }
    if (value.N !== undefined) {
      return (
        <div className="truncate" title={String(value.N)}>
          {String(value.N)}
        </div>
      );
    }
    if (value.BOOL !== undefined) {
      return (
        <div className="truncate" title={String(value.BOOL)}>
          {String(value.BOOL)}
        </div>
      );
    }
    
    // If it's a small object, show key-value pairs in a compact format
    const keys = Object.keys(value);
    if (keys.length <= 2) {
      return (
        <div className="text-xs">
          {keys.map(key => (
            <div key={key} className="flex justify-between gap-1">
              <span className="font-medium text-gray-600 truncate">{key}:</span>
              <span className="text-gray-800 truncate">{String(value[key])}</span>
            </div>
          ))}
        </div>
      );
    }
    // For larger objects, don't display them at all - just show a placeholder
    return (
      <div className="text-xs text-gray-400">
        [Object]
      </div>
    );
  }
  
  // For regular values, render as string with truncation
  const stringValue = renderCellValue(value);
  return (
    <div className="truncate" title={stringValue}>
      {stringValue}
    </div>
  );
};

export default function DataView({
  data,
  columns,
  viewType = 'table',
  onViewTypeChange,
  enablePagination = false,
  totalItems,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  className = '',
  renderCard,
  visibleColumns: propVisibleColumns,
  onVisibleColumnsChange,
  onViewItem,
  onEditItem,
  onDeleteItem,
  showActions = true,
  onCardClick,
  enableInfiniteScroll = false,
  hasMoreData = false,
  isLoadingMore = false,
  onLoadMore,
}: DataViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    propVisibleColumns || columns.map(col => String(col.accessor))
  );
  const [isDetailedModalOpen, setIsDetailedModalOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<any>(null);

  // Infinite scroll functionality
  useEffect(() => {
    if (!enableInfiniteScroll || !hasMoreData || isLoadingMore) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Load more when user is near the bottom (within 100px)
      if (scrollTop + windowHeight >= documentHeight - 100) {
        onLoadMore?.();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableInfiniteScroll, hasMoreData, isLoadingMore, onLoadMore]);

  // Use prop if provided, otherwise use internal state
  const effectiveVisibleColumns = propVisibleColumns || visibleColumns;
  const effectiveSetVisibleColumns = onVisibleColumnsChange || setVisibleColumns;

  const filteredColumns = columns.filter(col => 
    effectiveVisibleColumns.includes(String(col.accessor))
  );

  const handleViewTypeChange = (newViewType: 'table' | 'grid' | 'card' | 'list') => {
    onViewTypeChange?.(newViewType);
  };

  const handleRowSelect = (rowId: string) => {
    const isSelected = selectedRows.includes(rowId);
    onRowSelect?.(rowId, !isSelected);
  };

  const handleSelectAll = () => {
    const allSelected = selectedRows.length === data.length;
    onSelectAll?.(!allSelected);
  };

  const getViewIcon = (type: 'table' | 'grid' | 'card' | 'list') => {
    switch (type) {
      case 'table':
        return <Table size={16} />;
      case 'grid':
        return <Grid3X3 size={16} />;
      case 'card':
        return <LayoutGrid size={16} />;
      case 'list':
        return <List size={16} />;
      default:
        return <Table size={16} />;
    }
  };

  const renderTableView = () => (
    <div className="relative overflow-x-auto shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm text-left table-fixed">
        <thead className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
          <tr>
            {onRowSelect && (
              <th className="sticky left-0 bg-white dark:bg-gray-800 px-3 py-2 text-left font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 z-20 w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            )}
            {filteredColumns.map((column, index) => {
              // Define column widths based on content type
              let columnWidth = 'w-24'; // Default width
              
              if (column.accessor?.includes('email')) {
                columnWidth = 'w-48'; // Email columns need more space
              } else if (column.accessor?.includes('phone')) {
                columnWidth = 'w-32'; // Phone columns
              } else if (column.accessor?.includes('total') || column.accessor?.includes('price')) {
                columnWidth = 'w-20'; // Price columns
              } else if (column.accessor?.includes('status')) {
                columnWidth = 'w-16'; // Status columns
              } else if (column.accessor?.includes('order') || column.accessor?.includes('id')) {
                columnWidth = 'w-20'; // ID columns
              } else if (column.accessor?.includes('customer') || column.accessor?.includes('name')) {
                columnWidth = 'w-32'; // Name columns
              } else if (column.accessor?.includes('created') || column.accessor?.includes('updated')) {
                columnWidth = 'w-28'; // Date columns
              }

  return (
                <th 
                  key={column.accessor} 
                  className={`px-3 py-2 text-left font-medium text-gray-900 dark:text-white ${columnWidth} ${
                    index === 0 && !onRowSelect ? 'sticky left-0 bg-white dark:bg-gray-800 z-20' : ''
                  }`}
                >
                  <div className="truncate" title={column.header}>
                    {column.header}
                </div>
                </th>
              );
            })}
            {showActions && (
              <th className="sticky right-0 bg-white dark:bg-gray-800 px-3 py-2 text-left font-medium text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-700 z-20 w-24">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {data.map((row, index) => (
            <tr 
              key={index} 
              className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={(e) => {
                // Don't trigger modal if clicking on checkbox or action buttons
                const target = e.target as HTMLElement;
                if (target.closest('input[type="checkbox"]') || target.closest('button')) {
                  return;
                }
                onCardClick?.(row);
                setSelectedItemForModal(row);
                setIsDetailedModalOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCardClick?.(row);
                  setSelectedItemForModal(row);
                  setIsDetailedModalOpen(true);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${row[filteredColumns[0]?.accessor] || `item ${index + 1}`}`}
            >
              {onRowSelect && (
                <td className="sticky left-0 bg-white dark:bg-gray-900 px-3 py-2 border-r border-gray-200 dark:border-gray-700 z-20 w-12">
                    <input
                      type="checkbox"
                    checked={selectedRows.includes(String(row.id || index))}
                    onChange={() => handleRowSelect(String(row.id || index))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
              )}
              {filteredColumns.map((column, colIndex) => {
                // Define column widths based on content type (same as header)
                let columnWidth = 'w-24'; // Default width
                
                if (column.accessor?.includes('email')) {
                  columnWidth = 'w-48'; // Email columns need more space
                } else if (column.accessor?.includes('phone')) {
                  columnWidth = 'w-32'; // Phone columns
                } else if (column.accessor?.includes('total') || column.accessor?.includes('price')) {
                  columnWidth = 'w-20'; // Price columns
                } else if (column.accessor?.includes('status')) {
                  columnWidth = 'w-16'; // Status columns
                } else if (column.accessor?.includes('order') || column.accessor?.includes('id')) {
                  columnWidth = 'w-20'; // ID columns
                } else if (column.accessor?.includes('customer') || column.accessor?.includes('name')) {
                  columnWidth = 'w-32'; // Name columns
                } else if (column.accessor?.includes('created') || column.accessor?.includes('updated')) {
                  columnWidth = 'w-28'; // Date columns
                }
                
                return (
                  <td 
                    key={column.accessor} 
                    className={`px-3 py-2 text-gray-900 dark:text-white ${columnWidth} ${
                      colIndex === 0 && !onRowSelect ? 'sticky left-0 bg-white dark:bg-gray-900 z-20' : ''
                    }`}
                  >
                    <div className="truncate" title={renderCellValue(row[column.accessor])}>
                      {renderCellContent(row[column.accessor], column, row, viewType)}
                            </div>
                  </td>
                );
              })}
              {showActions && (
                <td className="sticky right-0 bg-white dark:bg-gray-900 px-3 py-2 border-l border-gray-200 dark:border-gray-700 z-20 w-24">
                  <ActionButtons
                    item={row}
                    onView={onViewItem}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    showView={true}
                    showEdit={true}
                    showDelete={true}
                  />
                </td>
              )}
              </tr>
            ))}
          </tbody>
        </table>
                    </div>
                  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((row, index) => (
        <div 
          key={index} 
          className="modern-card p-4 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => {
            onCardClick?.(row);
            setSelectedItemForModal(row);
            setIsDetailedModalOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onCardClick?.(row);
              setSelectedItemForModal(row);
              setIsDetailedModalOpen(true);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View details for ${row[filteredColumns[0]?.accessor] || `item ${index + 1}`}`}
        >
          {/* Image Section - Show image prominently at the top */}
          {(() => {
            const imageColumn = filteredColumns.find(col => 
              col.accessor?.includes('image') || 
              col.accessor?.includes('Image') ||
              col.header?.toLowerCase().includes('image')
            );
            if (imageColumn) {
              // Use the same comprehensive image extraction logic as the column render function
              let imageSrc = null;
              
              // First, check if the image field is a JSON string that needs to be parsed
              if (row.image && typeof row.image === 'string') {
                try {
                  const parsedImage = JSON.parse(row.image);
                  imageSrc = parsedImage.src || parsedImage.url;
                } catch (e) {
                  // If it's not valid JSON, treat it as a direct URL
                  imageSrc = row.image;
                }
              } else if (row.image && typeof row.image === 'object') {
                imageSrc = row.image.src || row.image.url;
              } else if (row.images && Array.isArray(row.images) && row.images[0]) {
                if (typeof row.images[0] === 'string') {
                  try {
                    const parsedImage = JSON.parse(row.images[0]);
                    imageSrc = parsedImage.src || parsedImage.url;
                  } catch (e) {
                    imageSrc = row.images[0];
                  }
                } else if (typeof row.images[0] === 'object') {
                  imageSrc = row.images[0].src || row.images[0].url;
      } else {
                  imageSrc = row.images[0];
                }
              } else if (row.Item?.image && typeof row.Item.image === 'string') {
                try {
                  const parsedImage = JSON.parse(row.Item.image);
                  imageSrc = parsedImage.src || parsedImage.url;
                } catch (e) {
                  imageSrc = row.Item.image;
                }
              } else if (row.Item?.image && typeof row.Item.image === 'object') {
                imageSrc = row.Item.image.src || row.Item.image.url;
              } else if (row.Item?.images && Array.isArray(row.Item.images) && row.Item.images[0]) {
                if (typeof row.Item.images[0] === 'string') {
                  try {
                    const parsedImage = JSON.parse(row.Item.images[0]);
                    imageSrc = parsedImage.src || parsedImage.url;
                  } catch (e) {
                    imageSrc = row.Item.images[0];
                  }
                } else if (typeof row.Item.images[0] === 'object') {
                  imageSrc = row.Item.images[0].src || row.Item.images[0].url;
                } else {
                  imageSrc = row.Item.images[0];
                }
              } else if (row.designImageUrl && typeof row.designImageUrl === 'string') {
                // Design Library specific field
                imageSrc = row.designImageUrl;
              } else {
                // Fallback to direct properties
                imageSrc = row.image?.src || row.images?.[0]?.src || row.Item?.image?.src || row.Item?.images?.[0]?.src ||
                          row.src || row.Item?.src || row.featured_image || row.Item?.featured_image || row.designImageUrl;
              }
              
              if (imageSrc && (imageSrc.includes('.jpg') || imageSrc.includes('.png') || imageSrc.includes('cdn.shopify.com') || imageSrc.includes('s3.amazonaws.com'))) {
                return (
                  <div className="flex justify-center mb-3">
                    <ImageCell src={imageSrc} alt={imageColumn.header || 'Image'} viewType="grid" />
                  </div>
                );
              }
            }
            return null;
          })()}
          
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {renderCellValue(row[filteredColumns[0]?.accessor]) || `Item ${index + 1}`}
            </h3>
            <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <MoreHorizontal size={16} />
          </button>
                </div>
          <div className="space-y-2">
            {filteredColumns.slice(1).map((column) => {
              // Skip image column since we already displayed it at the top
              if (column.accessor?.includes('image') || 
                  column.accessor?.includes('Image') ||
                  column.header?.toLowerCase().includes('image')) {
                return null;
              }
                  return (
                <div key={column.accessor} className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{column.header}:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {renderCellContent(row[column.accessor], column, row, viewType)}
                  </span>
                </div>
                  );
                })}
              </div>
                  </div>
                ))}
              </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {data.map((row, index) => (
        <div 
          key={index} 
          className="modern-card p-6 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => onCardClick?.(row)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onCardClick?.(row);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View details for ${row[filteredColumns[0]?.accessor] || `item ${index + 1}`}`}
        >
          {renderCard ? renderCard(row) : (
            <div className="text-xs text-gray-400">
              No card renderer provided
                          </div>
                        )}
                      </div>
                              ))}
                            </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {data.map((row, index) => (
        <div 
          key={index} 
          className="modern-card p-4 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => {
            onCardClick?.(row);
            setSelectedItemForModal(row);
            setIsDetailedModalOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onCardClick?.(row);
              setSelectedItemForModal(row);
              setIsDetailedModalOpen(true);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View details for ${row[filteredColumns[0]?.accessor] || `item ${index + 1}`}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onRowSelect && (
                  <input
                    type="checkbox"
                  checked={selectedRows.includes(String(row.id || index))}
                  onChange={() => handleRowSelect(String(row.id || index))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              )}
              
              {/* Image Section - Show image on the left */}
              {(() => {
                const imageColumn = filteredColumns.find(col => 
                  col.accessor?.includes('image') || 
                  col.accessor?.includes('Image') ||
                  col.header?.toLowerCase().includes('image')
                );
                if (imageColumn) {
                  // Use the same comprehensive image extraction logic as the column render function
                  let imageSrc = null;
                  
                  // First, check if the image field is a JSON string that needs to be parsed
                  if (row.image && typeof row.image === 'string') {
                    try {
                      const parsedImage = JSON.parse(row.image);
                      imageSrc = parsedImage.src || parsedImage.url;
                    } catch (e) {
                      // If it's not valid JSON, treat it as a direct URL
                      imageSrc = row.image;
                    }
                  } else if (row.image && typeof row.image === 'object') {
                    imageSrc = row.image.src || row.image.url;
                  } else if (row.images && Array.isArray(row.images) && row.images[0]) {
                    if (typeof row.images[0] === 'string') {
                      try {
                        const parsedImage = JSON.parse(row.images[0]);
                        imageSrc = parsedImage.src || parsedImage.url;
                      } catch (e) {
                        imageSrc = row.images[0];
                      }
                    } else if (typeof row.images[0] === 'object') {
                      imageSrc = row.images[0].src || row.images[0].url;
                    } else {
                      imageSrc = row.images[0];
                    }
                  } else if (row.Item?.image && typeof row.Item.image === 'string') {
                    try {
                      const parsedImage = JSON.parse(row.Item.image);
                      imageSrc = parsedImage.src || parsedImage.url;
                    } catch (e) {
                      imageSrc = row.Item.image;
                    }
                  } else if (row.Item?.image && typeof row.Item.image === 'object') {
                    imageSrc = row.Item.image.src || row.Item.image.url;
                  } else if (row.Item?.images && Array.isArray(row.Item.images) && row.Item.images[0]) {
                    if (typeof row.Item.images[0] === 'string') {
                      try {
                        const parsedImage = JSON.parse(row.Item.images[0]);
                        imageSrc = parsedImage.src || parsedImage.url;
                      } catch (e) {
                        imageSrc = row.Item.images[0];
                      }
                    } else if (typeof row.Item.images[0] === 'object') {
                      imageSrc = row.Item.images[0].src || row.Item.images[0].url;
                    } else {
                      imageSrc = row.Item.images[0];
                    }
                  } else if (row.designImageUrl && typeof row.designImageUrl === 'string') {
                    // Design Library specific field
                    imageSrc = row.designImageUrl;
                  } else {
                    // Fallback to direct properties
                    imageSrc = row.image?.src || row.images?.[0]?.src || row.Item?.image?.src || row.Item?.images?.[0]?.src ||
                              row.src || row.Item?.src || row.featured_image || row.Item?.featured_image || row.designImageUrl;
                  }
                  
                  if (imageSrc && (imageSrc.includes('.jpg') || imageSrc.includes('.png') || imageSrc.includes('cdn.shopify.com') || imageSrc.includes('s3.amazonaws.com'))) {
            return (
                      <div className="flex-shrink-0">
                        <ImageCell src={imageSrc} alt={imageColumn.header || 'Image'} viewType="list" />
                </div>
                    );
                  }
                }
                return null;
              })()}
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {renderCellValue(row[filteredColumns[0]?.accessor]) || `Item ${index + 1}`}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  {filteredColumns.slice(1).map((column) => {
                    // Skip image column since we already displayed it on the left
                    if (column.accessor?.includes('image') || 
                        column.accessor?.includes('Image') ||
                        column.header?.toLowerCase().includes('image')) {
                      return null;
                    }
                  return (
                      <span key={column.accessor} className="text-sm text-gray-500 dark:text-gray-400">
                        {column.header}: {renderCellContent(row[column.accessor], column, row, viewType)}
                      </span>
                  );
                })}
              </div>
        </div>
                  </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                <Eye size={16} />
              </button>
              <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                <Edit size={16} />
              </button>
              <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
                  </div>
                  </div>
                        </div>
                      ))}
              </div>
            );

  const renderContent = () => {
    switch (viewType) {
      case 'table':
        return renderTableView();
      case 'grid':
        return renderGridView();
      case 'card':
        return renderCardView();
      case 'list':
        return renderListView();
      default:
        return renderTableView();
    }
  };

  return (
    <div className={`modern-card ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {/* Selected Data Counter - Left Side */}
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedRows.length > 0 ? `${selectedRows.length}/${data.length}` : `${data.length} items`}
          </span>
        </div>
        
        {/* View Mode Toggle Buttons - Right Side */}
        <div className="flex gap-2 items-center">
          {/* Fullscreen Button */}
            <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

          {/* View Type Buttons */}
          {(['table', 'grid', 'card', 'list'] as const).map((type) => (
              <button
              key={type}
              onClick={() => handleViewTypeChange(type)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewType === type
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={`${type.charAt(0).toUpperCase() + type.slice(1)} View`}
            >
              {getViewIcon(type)}
              </button>
          ))}
            </div>
          </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>

      {/* Load More Button for Infinite Scroll */}
      {enableInfiniteScroll && hasMoreData && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingMore ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Arrow Pagination - Only show if infinite scroll is disabled */}
      {enablePagination && !enableInfiniteScroll && totalItems && totalItems > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <ArrowPagination
            currentPage={currentPage || 1}
            totalPages={Math.ceil((totalItems || data.length) / (pageSize || 10))}
            onPageChange={onPageChange || (() => {})}
            disabled={false}
          />
        </div>
      )}

      {/* Detailed Modal */}
      <DetailedModal
        item={selectedItemForModal}
        isOpen={isDetailedModalOpen}
        onClose={() => {
          setIsDetailedModalOpen(false);
          setSelectedItemForModal(null);
        }}
        columns={filteredColumns}
      />
    </div>
  );
} 