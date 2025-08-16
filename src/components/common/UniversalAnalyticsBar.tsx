"use client";
import { useState, useEffect } from "react";
import { ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useSidebar } from "@/components/layout/SidebarContext";

interface UniversalAnalyticsBarProps {
  section: string;
  tabKey: string;
  total?: number;
  currentCount?: number;
  onChange?: (options: any) => void;
  algoliaTotal?: number | null;
}

const configs: Record<string, any> = {
  shopify: {
    orders: {
      filter: ["All", "Paid", "Pending", "Refunded", "Partially Refunded", "Voided"],
      groupBy: ["None", "Status", "Customer", "Date"],
      aggregate: ["Count", "Sum Total", "Average Order Value"],
    },
    products: {
      filter: ["All", "Active", "Draft"],
      groupBy: ["None", "Type", "Vendor"],
      aggregate: ["Count", "Sum Inventory"],
    },
    collections: {
      filter: ["All", "Manual", "Automated"],
      groupBy: ["None", "Type"],
      aggregate: ["Count"],
    },
  },
  pinterest: {
    pins: {
      filter: ["All"],
      groupBy: ["None", "Board Owner"],
      aggregate: ["Count"],
    },
    boards: {
      filter: ["All"],
      groupBy: ["None", "Owner"],
      aggregate: ["Count"],
    },
  },
  "design library": {
    designs: {
      filter: ["All", "Active", "Draft"],
      groupBy: ["None", "Type", "Status"],
      aggregate: ["Count"],
    },
  },
};

export default function UniversalAnalyticsBar({ section, tabKey, total, currentCount, onChange, algoliaTotal }: UniversalAnalyticsBarProps) {
  const config = configs[section?.toLowerCase()]?.[tabKey?.toLowerCase()];
  const [filter, setFilter] = useState(config?.filter?.[0] || "All");
  const [groupBy, setGroupBy] = useState(config?.groupBy?.[0] || "None");
  const [aggregate, setAggregate] = useState(config?.aggregate?.[0] || "Count");
  const { secondarySidebarCollapsed } = useSidebar();

  useEffect(() => {
    if (onChange) onChange({ filter, groupBy, aggregate });
  }, [filter, groupBy, aggregate, onChange]);

  if (!config) return null;

  // Calculate responsive card sizes based on sidebar state
  const getCardSize = () => {
    if (secondarySidebarCollapsed) {
      return {
        minWidth: '140px',
        flex: '1 1 auto',
        maxWidth: '180px'
      };
    }
    return {
      minWidth: '120px',
      flex: '1 1 auto',
      maxWidth: '160px'
    };
  };

  const cardStyle = getCardSize();

  return (
    <div className="flex flex-row items-center bg-white border-b border-gray-200 rounded-t-lg px-4 py-3 shadow-sm w-full mb-1 overflow-x-auto">
      <div className="flex flex-row items-center gap-3 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center" style={cardStyle}>
          <div className="border border-blue-200 rounded-xl px-4 py-3 bg-gradient-to-br from-blue-50/60 to-white shadow-sm text-center w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-center mb-1">
              <ChartBarIcon className="w-4 h-4 text-blue-500 mr-1.5" />
              <span className="text-xs font-semibold text-blue-800 tracking-wide">Total Data</span>
            </div>
            <div className="text-lg font-bold text-blue-700 tracking-wide">{typeof total === 'number' ? total : '--'}</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center" style={cardStyle}>
          <div className="border border-green-200 rounded-xl px-4 py-3 bg-gradient-to-br from-green-50/60 to-white shadow-sm text-center w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-center mb-1">
              <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1.5" />
              <span className="text-xs font-semibold text-green-800 tracking-wide">Loaded Data</span>
            </div>
            <div className="text-lg font-bold text-green-700 tracking-wide">{typeof currentCount === 'number' ? currentCount : '--'}</div>
          </div>
        </div>
        {/* Box 3: Algolia Total Records */}
        <div className="flex flex-col items-center justify-center" style={cardStyle}>
          <div className="border border-purple-300 rounded-xl px-4 py-3 bg-gradient-to-br from-purple-500 to-blue-600 shadow-md text-center w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="text-xs font-semibold mb-1 text-white drop-shadow tracking-wide">Algolia Count</div>
            <div className="text-lg font-bold text-white drop-shadow tracking-wide">{typeof algoliaTotal === 'number' ? algoliaTotal : '--'}</div>
          </div>
        </div>
        {/* Render the rest of the boxes as before */}
        {[4,5,6,7,8,9,10,11].map((num) => (
          <div key={num} className="flex flex-col items-center justify-center" style={cardStyle}>
            <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gradient-to-br from-gray-50/60 to-white shadow-sm text-center w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="text-xs font-semibold mb-1 text-gray-700 tracking-wide">Box {num}</div>
              <div className="text-lg font-bold text-gray-600 tracking-wide">--</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 