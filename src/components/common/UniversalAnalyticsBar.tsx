"use client";
import { useState, useEffect } from "react";
import { ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

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

  useEffect(() => {
    if (onChange) onChange({ filter, groupBy, aggregate });
  }, [filter, groupBy, aggregate, onChange]);

  if (!config) return null;

  return (
    <div className="flex flex-row items-center bg-white border-b border-gray-200 rounded-t-lg px-4 py-2 shadow-sm w-full mb-4">
      <div className="flex flex-col items-center justify-center">
        <div className="border-2 border-blue-100 rounded-xl px-4 py-2 bg-gradient-to-br from-blue-50/40 to-white shadow text-center min-w-[80px] transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-center mb-0.5">
            <ChartBarIcon className="w-5 h-5 text-blue-400 mr-1" />
            <span className="text-xs font-semibold text-blue-900">Total Data</span>
          </div>
          <div className="text-lg font-extrabold text-blue-700 tracking-wide">{typeof total === 'number' ? total : '--'}</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center ml-2">
        <div className="border-2 border-green-100 rounded-xl px-4 py-2 bg-gradient-to-br from-green-50/40 to-white shadow text-center min-w-[80px] transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-center mb-0.5">
            <CheckCircleIcon className="w-5 h-5 text-green-400 mr-1" />
            <span className="text-xs font-semibold text-green-900">Loaded Data</span>
          </div>
          <div className="text-lg font-extrabold text-green-700 tracking-wide">{typeof currentCount === 'number' ? currentCount : '--'}</div>
        </div>
      </div>
      {/* Box 3: Algolia Total Records */}
      <div className="flex flex-col items-center justify-center ml-2">
        <div className="border-2 border-purple-400 rounded-xl px-4 py-2 bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg text-center min-w-[120px] transition-transform duration-150 hover:-translate-y-1 hover:shadow-2xl">
          <div className="text-xs font-semibold mb-0.5 text-white drop-shadow">Algolia Count</div>
          <div className="text-lg font-extrabold text-white drop-shadow tracking-wide">{typeof algoliaTotal === 'number' ? algoliaTotal : '--'}</div>
        </div>
      </div>
      {/* Render the rest of the boxes as before */}
      {[4,5,6,7,8,9,10,11].map((num) => (
        <div key={num} className="flex flex-col items-center justify-center ml-2">
          <div className="border-2 border-gray-200 rounded-xl px-4 py-2 bg-gradient-to-br from-gray-50 to-white shadow text-center min-w-[120px] transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg">
            <div className="text-xs font-semibold mb-0.5 text-gray-800">Box {num}</div>
            <div className="text-lg font-bold text-gray-700">--</div>
          </div>
        </div>
      ))}
    </div>
  );
} 