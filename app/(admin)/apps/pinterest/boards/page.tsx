'use client'

import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { 
  PageTemplate,
  useDataTable
} from '@/components/shared'
import { Board } from './types'
import { generateBoards } from './utils'

// Define table columns for boards
const boardColumns = [
  {
    key: 'image',
    label: 'Image',
    sortable: false,
    render: (board: Board) => (
      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
        {board.image ? (
          <img 
            src={board.image} 
            alt={board.name || 'Board'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">No image</span>
          </div>
        )}
      </div>
    )
  },
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (board: Board) => (
      <div className="text-sm font-medium text-gray-900">{board.name || 'Untitled Board'}</div>
    )
  },
  {
    key: 'privacy',
    label: 'Privacy',
    sortable: true,
    render: (board: Board) => {
      const getStatusBadge = (privacy: string) => {
        switch (privacy) {
          case 'public':
            return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800", text: "Public" }
          case 'private':
            return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800", text: "Private" }
          case 'secret':
            return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800", text: "Secret" }
          default:
            return { className: "inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800", text: privacy }
        }
      }
      const badge = getStatusBadge(board?.privacy || 'unknown')
      return <span className={badge.className}>{badge.text}</span>
    }
  },
  {
    key: 'owner',
    label: 'Owner',
    sortable: true,
    render: (board: Board) => (
      <div className="text-sm text-gray-900">{board?.owner || 'Unknown'}</div>
    )
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    render: (board: Board) => (
      <div className="text-sm text-gray-900">{board?.category || 'Uncategorized'}</div>
    )
  },
  {
    key: 'pinCount',
    label: 'Pins',
    sortable: true,
    render: (board: Board) => (
      <span className="text-sm text-gray-900">{(board.pinCount || 0).toLocaleString()}</span>
    )
  },
  {
    key: 'followers',
    label: 'Followers',
    sortable: true,
    render: (board: Board) => (
      <span className="text-sm text-gray-900">{(board.followers || 0).toLocaleString()}</span>
    )
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (board: Board) => (
      <span className="text-sm text-gray-500">
        {board.createdAt ? new Date(board.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        }) : 'No date'}
      </span>
    )
  },
  {
    key: 'tags',
    label: 'Tags',
    sortable: false,
    render: (board: Board) => (
      <div className="flex flex-wrap gap-0.5">
        {board.tags?.slice(0, 3).map((tag, index) => (
          <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
            {tag}
          </span>
        ))}
        {board.tags && board.tags.length > 3 && (
          <span className="px-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
            +{board.tags.length - 3}
          </span>
        )}
      </div>
    )
  }
]

// Define KPI metrics for boards
const boardKPIs = [
  {
    key: 'totalBoards',
    label: 'Total Boards',
    value: 0,
    change: 8,
    trend: 'up' as const,
    icon: '📋',
    color: 'blue'
  },
  {
    key: 'totalPins',
    label: 'Total Pins',
    value: 0,
    change: 15,
    trend: 'up' as const,
    icon: '📌',
    color: 'red'
  },
  {
    key: 'totalFollowers',
    label: 'Total Followers',
    value: 0,
    change: 12,
    trend: 'up' as const,
    icon: '👥',
    color: 'green'
  },
  {
    key: 'publicBoards',
    label: 'Public Boards',
    value: 0,
    change: 5,
    trend: 'up' as const,
    icon: '🌐',
    color: 'purple'
  },
  {
    key: 'avgPinsPerBoard',
    label: 'Avg Pins/Board',
    value: 0,
    change: 3,
    trend: 'up' as const,
    icon: '📊',
    color: 'orange'
  },
  {
    key: 'activeCategories',
    label: 'Active Categories',
    value: 0,
    change: 2,
    trend: 'up' as const,
    icon: '🏷️',
    color: 'indigo'
  }
]

// Define filter options for boards
const boardFilters = [
  { key: 'all', label: 'All' },
  { key: 'public', label: 'Public' },
  { key: 'private', label: 'Private' },
  { key: 'secret', label: 'Secret' },
  { key: 'popular', label: 'Popular' },
  { key: 'recent', label: 'Recent' },
  { key: 'trending', label: 'Trending' }
]

function BoardsClient() {
  const { addTab } = useAppStore()
  const hasAddedTab = useRef(false)

  // Initialize data table hook
  const {
    data: boardData,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchConditions,
    setSearchConditions,
    selectedItems,
    setSelectedItems,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    columnFilters,
    setColumnFilters,
    customFilters,
    setCustomFilters,
    advancedFilters,
    setAdvancedFilters,
    filteredData,
    totalPages,
    currentData,
    handleSelectItem,
    handleSelectAll,
    handlePageChange,
    handleItemsPerPageChange,
    handleSort,
    handleSearch,
    handleAdvancedSearch,
    handleColumnFilter,
    handleCustomFilter,
    handleAdvancedFilter,
    clearAllFilters,
    clearSearch,
    clearColumnFilters,
    clearCustomFilters,
    clearAdvancedFilters
  } = useDataTable<Board>({
    initialData: generateBoards(100),
    columns: boardColumns,
    searchableFields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'tags', label: 'Tags', type: 'text' },
      { key: 'privacy', label: 'Privacy', type: 'text' }
    ],
    filterOptions: boardFilters,
    defaultViewMode: 'grid',
    defaultItemsPerPage: 25
  })

  // Calculate KPI metrics based on filtered data
  const calculatedKPIs = boardKPIs.map(kpi => {
    switch (kpi.key) {
      case 'totalBoards':
        return { ...kpi, value: filteredData.length }
      case 'totalPins':
        return { ...kpi, value: filteredData.reduce((sum, board) => sum + (board.pinCount || 0), 0) }
      case 'totalFollowers':
        return { ...kpi, value: filteredData.reduce((sum, board) => sum + (board.followers || 0), 0) }
      case 'publicBoards':
        return { ...kpi, value: filteredData.filter(board => (board.privacy || 'unknown') === 'public').length }
      case 'avgPinsPerBoard':
        return { ...kpi, value: filteredData.length > 0 ? Math.round(filteredData.reduce((sum, board) => sum + (board.pinCount || 0), 0) / filteredData.length) : 0 }
      case 'activeCategories':
        const uniqueCategories = new Set(filteredData.map(board => board.category || 'Uncategorized'))
        return { ...kpi, value: uniqueCategories.size }
      default:
        return kpi
    }
  })

  // Tab management
  useEffect(() => {
    if (!hasAddedTab.current) {
    addTab({
      title: 'Pinterest Boards',
      path: '/apps/pinterest/boards',
      pinned: false,
      closable: true,
    })
      hasAddedTab.current = true
    }
  }, [addTab])

  // Page configuration
  const pageConfig = {
    title: 'Pinterest Boards',
    description: 'Manage and analyze your Pinterest boards',
    icon: '📋',
    endpoint: '/api/boards',
    columns: boardColumns,
    kpis: calculatedKPIs,
    filters: boardFilters,
    searchableFields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'tags', label: 'Tags', type: 'text' },
      { key: 'privacy', label: 'Privacy', type: 'text' }
    ],
    actions: {
      create: () => console.log('Create board'),
      export: () => console.log('Export boards'),
      import: () => console.log('Import boards'),
      print: () => console.log('Print boards'),
      settings: () => console.log('Board settings')
    }
  }

  if (loading && boardData.length === 0) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading boards...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Boards</div>
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
    <PageTemplate
      config={pageConfig}
      data={currentData}
      loading={loading}
      error={error}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchConditions={searchConditions}
      setSearchConditions={setSearchConditions}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
        viewMode={viewMode}
        setViewMode={setViewMode}
              currentPage={currentPage}
      setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
      setItemsPerPage={setItemsPerPage}
      sortColumn={sortColumn}
      setSortColumn={setSortColumn}
      sortDirection={sortDirection}
      setSortDirection={setSortDirection}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
      customFilters={customFilters}
      setCustomFilters={setCustomFilters}
      advancedFilters={advancedFilters}
      setAdvancedFilters={setAdvancedFilters}
                totalPages={totalPages}
      handleSelectItem={handleSelectItem}
      handleSelectAll={handleSelectAll}
      handlePageChange={handlePageChange}
      handleItemsPerPageChange={handleItemsPerPageChange}
      handleSort={handleSort}
      handleSearch={handleSearch}
      handleAdvancedSearch={handleAdvancedSearch}
      handleColumnFilter={handleColumnFilter}
      handleCustomFilter={handleCustomFilter}
      handleAdvancedFilter={handleAdvancedFilter}
      clearAllFilters={clearAllFilters}
      clearSearch={clearSearch}
      clearColumnFilters={clearColumnFilters}
      clearCustomFilters={clearCustomFilters}
      clearAdvancedFilters={clearAdvancedFilters}
    />
  )
}

export default function PinterestBoardsPage() {
  return (
    <div className="h-full">
      <BoardsClient />
    </div>
  )
}
