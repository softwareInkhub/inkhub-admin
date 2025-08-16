'use client'

import React, { useState } from 'react'
import { LucideIcon, Package, ShoppingCart, Image, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BaseEntity, ViewMode, TableColumn, KPIMetrics } from './types'
import { 
  PageHeader, 
  SearchControls, 
  DataTable, 
  DataGrid, 
  DataCard,
  KPIGrid,
  BulkActionsBar,
  Pagination,
  ExportModal,
  ImportModal,
  BulkEditModal,
  BulkDeleteModal
} from './index'

interface PageConfig {
  title: string
  description: string
  icon: string
  endpoint: string
  columns: any[]
  kpis: any[]
  filters: any[]
  searchableFields: any[]
  actions: {
    create: () => void
    export: () => void
    import: () => void
    print: () => void
    settings: () => void
  }
}

interface PageTemplateProps<T extends BaseEntity> {
  config: PageConfig
  data: T[]
  loading?: boolean
  error?: string | null
  searchQuery?: string
  setSearchQuery?: (query: string) => void
  searchConditions?: any[]
  setSearchConditions?: (conditions: any[]) => void
  selectedItems?: string[]
  setSelectedItems?: (items: string[]) => void
  viewMode?: ViewMode
  setViewMode?: (mode: ViewMode) => void
  currentPage?: number
  setCurrentPage?: (page: number) => void
  itemsPerPage?: number
  setItemsPerPage?: (items: number) => void
  sortColumn?: string | null
  setSortColumn?: (column: string | null) => void
  sortDirection?: 'asc' | 'desc'
  setSortDirection?: (direction: 'asc' | 'desc') => void
  columnFilters?: Record<string, any>
  setColumnFilters?: (filters: Record<string, any>) => void
  customFilters?: any[]
  setCustomFilters?: (filters: any[]) => void
  advancedFilters?: any
  setAdvancedFilters?: (filters: any) => void
  totalPages?: number
  handleSelectItem?: (id: string, selected: boolean) => void
  handleSelectAll?: () => void
  handlePageChange?: (page: number) => void
  handleItemsPerPageChange?: (items: number) => void
  handleSort?: (column: string) => void
  handleSearch?: (query: string) => void
  handleAdvancedSearch?: () => void
  handleColumnFilter?: (column: string, value: any) => void
  handleCustomFilter?: (filter: any) => void
  handleAdvancedFilter?: (filters: any) => void
  clearAllFilters?: () => void
  clearSearch?: () => void
  clearColumnFilters?: () => void
  clearCustomFilters?: () => void
  clearAdvancedFilters?: () => void
}

// Icon mapping function
const getIconComponent = (iconName: string): LucideIcon => {
  switch (iconName.toLowerCase()) {
    case 'package':
    case 'products':
      return Package
    case 'shopping-cart':
    case 'orders':
      return ShoppingCart
    case 'image':
    case 'pins':
    case 'boards':
      return Image
    case 'palette':
    case 'designs':
      return Palette
    default:
      return Package
  }
}

export default function PageTemplate<T extends BaseEntity>({
  config,
  data,
  loading = false,
  error = null,
  searchQuery = '',
  setSearchQuery = () => {},
  searchConditions = [],
  setSearchConditions = () => {},
  selectedItems = [],
  setSelectedItems = () => {},
  viewMode = 'table',
  setViewMode = () => {},
  currentPage = 1,
  setCurrentPage = () => {},
  itemsPerPage = 25,
  setItemsPerPage = () => {},
  sortColumn = null,
  setSortColumn = () => {},
  sortDirection = 'desc',
  setSortDirection = () => {},
  columnFilters = {},
  setColumnFilters = () => {},
  customFilters = [],
  setCustomFilters = () => {},
  advancedFilters = {},
  setAdvancedFilters = () => {},
  totalPages = 1,
  handleSelectItem = () => {},
  handleSelectAll = () => {},
  handlePageChange = () => {},
  handleItemsPerPageChange = () => {},
  handleSort = () => {},
  handleSearch = () => {},
  handleAdvancedSearch = () => {},
  handleColumnFilter = () => {},
  handleCustomFilter = () => {},
  handleAdvancedFilter = () => {},
  clearAllFilters = () => {},
  clearSearch = () => {},
  clearColumnFilters = () => {},
  clearCustomFilters = () => {},
  clearAdvancedFilters = () => {}
}: PageTemplateProps<T>) {
  // Modal states
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  // Get the icon component
  const IconComponent = getIconComponent(config.icon)

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title={config.title}
        description={config.description}
        icon={IconComponent}
      />

      {/* KPI Grid */}
      <div className="px-4 py-3">
        <KPIGrid 
          kpiMetrics={config.kpis.reduce((acc, kpi) => {
            acc[kpi.key] = kpi
            return acc
          }, {} as KPIMetrics)} 
          data={data} 
        />
      </div>

      {/* Search Controls */}
      <div className="px-4 pb-2">
        <SearchControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchConditions={searchConditions}
          showSearchBuilder={false}
          setShowSearchBuilder={() => {}}
          showAdditionalControls={false}
          setShowAdditionalControls={() => {}}
          activeFilter="all"
          setActiveFilter={() => {}}
          customFilters={customFilters}
          onAddCustomFilter={handleCustomFilter}
          onRemoveCustomFilter={() => {}}
          showCustomFilterDropdown={false}
          setShowCustomFilterDropdown={() => {}}
          hiddenDefaultFilters={new Set()}
          onShowAllFilters={() => {}}
          onClearSearch={clearSearch}
          onClearSearchConditions={() => {}}
          selectedItems={selectedItems}
          onBulkEdit={() => setShowBulkEditModal(true)}
          onExportSelected={() => setShowExportModal(true)}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          currentItems={data}
          onSelectAll={handleSelectAll}
          activeColumnFilter={null}
          columnFilters={columnFilters}
          onFilterClick={() => {}}
          onColumnFilterChange={handleColumnFilter}
          getUniqueValues={() => []}
          onExport={() => setShowExportModal(true)}
          onImport={() => setShowImportModal(true)}
          onPrint={() => window.print()}
          onSettings={() => {}}
          showHeaderDropdown={false}
          setShowHeaderDropdown={() => {}}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showAdvancedFilter={false}
          setShowAdvancedFilter={() => {}}
          isFullScreen={false}
          onToggleFullScreen={() => {}}
          isAlgoliaSearching={false}
          useAlgoliaSearch={false}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <BulkActionsBar
          selectedItems={selectedItems}
          totalItems={data.length}
          onBulkEdit={() => setShowBulkEditModal(true)}
          onExportSelected={() => setShowExportModal(true)}
          onBulkDelete={() => setShowBulkDeleteModal(true)}
          onClearSelection={() => setSelectedItems([])}
        />
      )}

      {/* Main Content */}
      <div className="px-4 pb-4">
        {viewMode === 'table' && (
          <DataTable
            data={data}
            columns={config.columns}
            selectedItems={selectedItems}
            onSelectItem={(id: string) => handleSelectItem(id, !selectedItems.includes(id))}
            onSelectAll={handleSelectAll}
            searchQuery={searchQuery}
          />
        )}

        {viewMode === 'grid' && (
          <DataGrid
            data={data}
            columns={4}
            gap="md"
            renderItem={(item: T) => (
              <DataCard
                item={item}
                selected={selectedItems.includes(item.id)}
                onSelect={(id: string) => handleSelectItem(id, !selectedItems.includes(id))}
                searchQuery={searchQuery}
              />
            )}
          />
        )}

        {viewMode === 'card' && (
          <DataGrid
            data={data}
            columns={3}
            gap="lg"
            renderItem={(item: T) => (
              <DataCard
                item={item}
                selected={selectedItems.includes(item.id)}
                onSelect={(id: string) => handleSelectItem(id, !selectedItems.includes(id))}
                searchQuery={searchQuery}
                variant="large"
              />
            )}
          />
        )}
      </div>

      {/* Pagination */}
      <div className="px-4 pb-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={data.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Modals */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={data}
          selectedItems={selectedItems}
          onExport={(config: any) => {
            console.log('Export config:', config)
            setShowExportModal(false)
          }}
        />
      )}

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={(file: File) => {
            console.log('Import file:', file)
            setShowImportModal(false)
          }}
        />
      )}

      {showBulkEditModal && (
        <BulkEditModal
          isOpen={showBulkEditModal}
          onClose={() => setShowBulkEditModal(false)}
          selectedItems={selectedItems}
          onBulkEdit={(updates: Record<string, any>) => {
            console.log('Bulk edit updates:', updates)
            setShowBulkEditModal(false)
          }}
        />
      )}

      {showBulkDeleteModal && (
        <BulkDeleteModal
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          selectedItems={selectedItems}
          onBulkDelete={() => {
            console.log('Bulk delete confirmed')
            setShowBulkDeleteModal(false)
          }}
        />
      )}
    </div>
  )
}
