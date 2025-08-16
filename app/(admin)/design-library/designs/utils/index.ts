import { Design, KPIMetrics } from '../types';

export const getOptimizedImageUrl = (originalUrl: string, width: number = 400, height: number = 300): string => {
  // For Picsum, we can optimize by using specific dimensions
  if (originalUrl.includes('picsum.photos')) {
    return originalUrl.replace(/\/\d+\/\d+/, `/${width}/${height}`);
  }
  return originalUrl;
};

export const generateDesigns = (count: number = 50): Design[] => {
  const statuses: Design['status'][] = ['completed', 'in_progress', 'pending', 'approved', 'rejected'];
  const types: Design['type'][] = ['logo', 'banner', 'social_media', 'print', 'web', 'illustration'];
  const categories: Design['category'][] = ['branding', 'marketing', 'social', 'print', 'digital'];
  const prices = [50, 100, 150, 200, 300, 500, 750, 1000];
  const sizes = ['1920x1080', '1200x630', '800x600', '600x400', '400x300'];
  const clients = ['Client A', 'Client B', 'Client C', 'Client D', 'Client E'];
  const designers = ['Designer 1', 'Designer 2', 'Designer 3'];
  
  const baseDate = new Date('2024-01-01');
  
  return Array.from({ length: count }, (_, i) => {
    const seed = i + 1;
    const status = statuses[seed % statuses.length];
    const type = types[seed % types.length];
    const category = categories[seed % categories.length];
    const price = prices[seed % prices.length];
    const size = sizes[seed % sizes.length];
    const client = clients[seed % clients.length];
    const designer = designers[seed % designers.length];
    
    // Deterministic dates
    const createdAt = new Date(baseDate.getTime() + seed * 86400000).toISOString();
    const updatedAt = new Date(baseDate.getTime() + seed * 43200000).toISOString();
    
    // Deterministic boolean values
    const isStarred = (seed % 5) === 0;
    const isLiked = (seed % 3) === 0;
    
    // Deterministic numbers
    const views = (seed * 23) % 1000;
    const downloads = (seed * 7) % 100;
    
    return {
      id: `design-${seed}`,
      name: `Design ${seed}`,
      description: `This is a ${type} design for ${category} purposes.`,
      status,
      type,
      category,
      price,
      size,
      image: `https://picsum.photos/seed/design${seed}/400/300`,
      createdAt,
      updatedAt,
      tags: [type, category, status, '2024'].filter((_, idx) => (seed + idx) % 3 !== 0 || idx === 0),
      isStarred,
      isLiked,
      views,
      downloads,
      client,
      designer,
    };
  });
};

export const calculateKPIMetrics = (designs: Design[]): KPIMetrics => {
  const totalDesigns = designs.length;
  const completedDesigns = designs.filter(d => d.status === 'completed').length;
  const inProgressDesigns = designs.filter(d => d.status === 'in_progress').length;
  const totalValue = designs.reduce((sum, d) => sum + d.price, 0);
  const totalViews = designs.reduce((sum, d) => sum + d.views, 0);
  const totalDownloads = designs.reduce((sum, d) => sum + d.downloads, 0);

  return {
    totalDesigns: {
      label: 'Total Designs',
      value: totalDesigns,
      change: 12,
      changeType: 'increase',
      gradient: 'from-blue-500 to-blue-600',
      icon: 'Palette'
    },
    completedDesigns: {
      label: 'Completed',
      value: completedDesigns,
      change: 8,
      changeType: 'increase',
      gradient: 'from-green-500 to-green-600',
      icon: 'CheckCircle'
    },
    inProgressDesigns: {
      label: 'In Progress',
      value: inProgressDesigns,
      change: 3,
      changeType: 'decrease',
      gradient: 'from-yellow-500 to-yellow-600',
      icon: 'Clock'
    },
    totalValue: {
      label: 'Total Value',
      value: totalValue,
      change: 15,
      changeType: 'increase',
      gradient: 'from-purple-500 to-purple-600',
      icon: 'DollarSign'
    },
    totalViews: {
      label: 'Total Views',
      value: totalViews,
      change: 22,
      changeType: 'increase',
      gradient: 'from-indigo-500 to-indigo-600',
      icon: 'Eye'
    },
    totalDownloads: {
      label: 'Total Downloads',
      value: totalDownloads,
      change: 7,
      changeType: 'increase',
      gradient: 'from-pink-500 to-pink-600',
      icon: 'Download'
    }
  };
};

export const getUniqueValues = (designs: Design[], field: keyof Design): string[] => {
  const values = designs.map(d => d[field]).filter(Boolean);
  return Array.from(new Set(values.map(String)));
};

export const getUniqueTags = (designs: Design[]): string[] => {
  const allTags = designs.flatMap(d => d.tags);
  return Array.from(new Set(allTags));
};

export const getStatusBadge = (status: string, type: 'status' | 'type' = 'status') => {
  if (type === 'status') {
    switch (status) {
      case 'completed':
        return { className: 'bg-green-100 text-green-800', text: 'Completed' };
      case 'in_progress':
        return { className: 'bg-blue-100 text-blue-800', text: 'In Progress' };
      case 'pending':
        return { className: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      case 'approved':
        return { className: 'bg-green-100 text-green-800', text: 'Approved' };
      case 'rejected':
        return { className: 'bg-red-100 text-red-800', text: 'Rejected' };
      default:
        return { className: 'bg-gray-100 text-gray-800', text: status };
    }
  } else {
    switch (status) {
      case 'logo':
        return { className: 'bg-blue-100 text-blue-800', text: 'Logo' };
      case 'banner':
        return { className: 'bg-purple-100 text-purple-800', text: 'Banner' };
      case 'social_media':
        return { className: 'bg-pink-100 text-pink-800', text: 'Social Media' };
      case 'print':
        return { className: 'bg-orange-100 text-orange-800', text: 'Print' };
      case 'web':
        return { className: 'bg-indigo-100 text-indigo-800', text: 'Web' };
      case 'illustration':
        return { className: 'bg-teal-100 text-teal-800', text: 'Illustration' };
      default:
        return { className: 'bg-gray-100 text-gray-800', text: status };
    }
  }
};

export const filterDesigns = (
  designs: Design[],
  searchTerm: string,
  statusFilter: string,
  typeFilter: string,
  categoryFilter: string,
  priceFilter: string,
  searchConditions: any[],
  advancedFilters: any
): Design[] => {
  let filtered = designs;

  // Basic search
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(design => {
      const searchableFields = [
        design.name,
        design.description,
        design.status,
        design.type,
        design.category,
        design.client,
        design.designer,
        ...design.tags
      ];
      return searchableFields.some(field => 
        String(field).toLowerCase().includes(term)
      );
    });
  }

  // Status filter
  if (statusFilter !== 'All') {
    filtered = filtered.filter(design => design.status === statusFilter);
  }

  // Type filter
  if (typeFilter !== 'All') {
    filtered = filtered.filter(design => design.type === typeFilter);
  }

  // Category filter
  if (categoryFilter !== 'All') {
    filtered = filtered.filter(design => design.category === categoryFilter);
  }

  // Price filter
  if (priceFilter !== 'All') {
    filtered = filtered.filter(design => {
      const price = design.price;
      switch (priceFilter) {
        case 'Under $100':
          return price < 100;
        case '$100-$300':
          return price >= 100 && price <= 300;
        case '$300-$500':
          return price > 300 && price <= 500;
        case 'Over $500':
          return price > 500;
        default:
          return true;
      }
    });
  }

  // Advanced search conditions
  if (searchConditions.length > 0) {
    filtered = filtered.filter(design => {
      return searchConditions.every(condition => {
        const { field, operator, value } = condition;
        const fieldValue = design[field as keyof Design];
        
        if (!fieldValue) return false;
        
        const fieldStr = String(fieldValue).toLowerCase();
        const valueStr = value.toLowerCase();
        
        switch (operator) {
          case 'contains':
            return fieldStr.includes(valueStr);
          case 'equals':
            return fieldStr === valueStr;
          case 'starts_with':
            return fieldStr.startsWith(valueStr);
          case 'ends_with':
            return fieldStr.endsWith(valueStr);
          case 'greater_than':
            return Number(fieldValue) > Number(value);
          case 'less_than':
            return Number(fieldValue) < Number(value);
          default:
            return true;
        }
      });
    });
  }

  // Advanced filters
  if (advancedFilters) {
    if (advancedFilters.status && advancedFilters.status.length > 0) {
      filtered = filtered.filter(design => advancedFilters.status.includes(design.status));
    }
    if (advancedFilters.type && advancedFilters.type.length > 0) {
      filtered = filtered.filter(design => advancedFilters.type.includes(design.type));
    }
    if (advancedFilters.category && advancedFilters.category.length > 0) {
      filtered = filtered.filter(design => advancedFilters.category.includes(design.category));
    }
    if (advancedFilters.priceRange) {
      const [min, max] = advancedFilters.priceRange;
      filtered = filtered.filter(design => design.price >= min && design.price <= max);
    }
    if (advancedFilters.dateRange) {
      const [start, end] = advancedFilters.dateRange;
      filtered = filtered.filter(design => {
        const createdDate = new Date(design.createdAt);
        return createdDate >= start && createdDate <= end;
      });
    }
    if (advancedFilters.tags && advancedFilters.tags.length > 0) {
      filtered = filtered.filter(design => 
        design.tags.some(tag => advancedFilters.tags.includes(tag))
      );
    }
    if (advancedFilters.clients && advancedFilters.clients.length > 0) {
      filtered = filtered.filter(design => advancedFilters.clients.includes(design.client));
    }
    if (advancedFilters.designers && advancedFilters.designers.length > 0) {
      filtered = filtered.filter(design => advancedFilters.designers.includes(design.designer));
    }
  }

  return filtered;
};
