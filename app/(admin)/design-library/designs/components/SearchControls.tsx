import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Edit, 
  Download, 
  Trash,
  X,
  ChevronDown
} from 'lucide-react';
import { Design, CustomFilter } from '../types';

interface SearchControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  priceFilter: string;
  onPriceFilterChange: (value: string) => void;
  viewMode: 'table' | 'grid' | 'list';
  onViewModeChange: (mode: 'table' | 'grid' | 'list') => void;
  showAdvancedSearch: boolean;
  onAdvancedSearchToggle: () => void;
  showAdvancedFilter: boolean;
  onAdvancedFilterToggle: () => void;
  customFilters: CustomFilter[];
  onAddCustomFilter: (filter: CustomFilter) => void;
  onRemoveCustomFilter: (index: number) => void;
  selectedDesigns: string[];
  onBulkEdit: () => void;
  onExportSelected: () => void;
  onBulkDelete: () => void;
  designs: Design[];
}

export const SearchControls = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  priceFilter,
  onPriceFilterChange,
  viewMode,
  onViewModeChange,
  showAdvancedSearch,
  onAdvancedSearchToggle,
  showAdvancedFilter,
  onAdvancedFilterToggle,
  customFilters,
  onAddCustomFilter,
  onRemoveCustomFilter,
  selectedDesigns,
  onBulkEdit,
  onExportSelected,
  onBulkDelete,
  designs
}: SearchControlsProps) => {
  const statusOptions = ['All', ...Array.from(new Set(designs.map(d => d.status)))];
  const typeOptions = ['All', ...Array.from(new Set(designs.map(d => d.type)))];
  const categoryOptions = ['All', ...Array.from(new Set(designs.map(d => d.category)))];
  const priceOptions = ['All', 'Under $100', '$100-$300', '$300-$500', 'Over $500'];

  const getCustomFilterOptions = () => [
    { key: 'name', label: 'Name', field: 'name', operator: 'contains', value: '' },
    { key: 'status', label: 'Status', field: 'status', operator: 'equals', value: '' },
    { key: 'type', label: 'Type', field: 'type', operator: 'equals', value: '' },
    { key: 'category', label: 'Category', field: 'category', operator: 'equals', value: '' },
    { key: 'price', label: 'Price', field: 'price', operator: 'greater_than', value: '' },
    { key: 'client', label: 'Client', field: 'client', operator: 'contains', value: '' },
    { key: 'designer', label: 'Designer', field: 'designer', operator: 'contains', value: '' }
  ];

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search designs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {typeOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {categoryOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <select
          value={priceFilter}
          onChange={(e) => onPriceFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {priceOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        {/* Advanced Search Toggle */}
        <button
          onClick={onAdvancedSearchToggle}
          className={`px-3 py-2 border rounded-lg transition-all ${
            showAdvancedSearch 
              ? 'bg-blue-50 border-blue-300 text-blue-700' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Advanced Search
        </button>

        {/* Advanced Filter Toggle */}
        <button
          onClick={onAdvancedFilterToggle}
          className={`px-3 py-2 border rounded-lg transition-all ${
            showAdvancedFilter 
              ? 'bg-purple-50 border-purple-300 text-purple-700' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4 inline mr-1" />
          Advanced Filter
        </button>

        {/* Custom Filters Dropdown */}
        <div className="relative">
          <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
            Custom Filters
            <ChevronDown className="h-4 w-4 inline ml-1" />
          </button>
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3">
              <h4 className="font-medium text-gray-900 mb-2">Add Custom Filter</h4>
              {getCustomFilterOptions().map((option) => (
                <button
                  key={option.key}
                  onClick={() => onAddCustomFilter({ 
                    name: option.label, 
                    field: option.field, 
                    operator: option.operator, 
                    value: option.value 
                  })}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex border border-gray-300 rounded-lg">
          <button
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-2 transition-all ${
              viewMode === 'table' 
                ? 'bg-blue-50 text-blue-700 border-r border-gray-300' 
                : 'text-gray-600 hover:bg-gray-50 border-r border-gray-300'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-2 transition-all ${
              viewMode === 'grid' 
                ? 'bg-blue-50 text-blue-700 border-r border-gray-300' 
                : 'text-gray-600 hover:bg-gray-50 border-r border-gray-300'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-2 transition-all ${
              viewMode === 'list' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onBulkEdit}
            disabled={selectedDesigns.length === 0}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Bulk Edit {selectedDesigns.length > 0 && `(${selectedDesigns.length})`}
          </button>
          
          <button
            onClick={onExportSelected}
            disabled={selectedDesigns.length === 0}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Selected {selectedDesigns.length > 0 && `(${selectedDesigns.length})`}
          </button>
          
          <button
            onClick={onBulkDelete}
            disabled={selectedDesigns.length === 0}
            className="px-3 py-2 border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            Delete Selected {selectedDesigns.length > 0 && `(${selectedDesigns.length})`}
          </button>
        </div>
      </div>

      {/* Custom Filters Display */}
      {customFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {customFilters.map((filter, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <span>{filter.name}: {filter.operator} {filter.value}</span>
              <button
                onClick={() => onRemoveCustomFilter(index)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
