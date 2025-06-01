"use client";
import { useState, useEffect } from "react";

interface UniversalAnalyticsBarProps {
  section: string;
  tabKey: string;
  total?: number;
  currentCount?: number;
  onChange?: (options: any) => void;
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

export default function UniversalAnalyticsBar({ section, tabKey, total, currentCount, onChange }: UniversalAnalyticsBarProps) {
  const config = configs[section?.toLowerCase()]?.[tabKey?.toLowerCase()];
  const [filter, setFilter] = useState(config?.filter?.[0] || "All");
  const [groupBy, setGroupBy] = useState(config?.groupBy?.[0] || "None");
  const [aggregate, setAggregate] = useState(config?.aggregate?.[0] || "Count");

  useEffect(() => {
    if (onChange) onChange({ filter, groupBy, aggregate });
  }, [filter, groupBy, aggregate, onChange]);

  if (!config) return null;

  return (
    <div className="flex flex-row items-center gap-8 bg-gray-50 border-b border-gray-200 rounded-t-lg px-6 py-3 shadow-sm w-full">
      <div className="flex flex-col items-center justify-center">
        <div className="border-2 border-gray-400 rounded-lg px-8 py-4 bg-white shadow text-center min-w-[120px]">
          <div className="text-lg font-semibold mb-1">Total Data</div>
          <div className="text-2xl font-bold text-blue-700">{typeof total === 'number' ? total : '--'}</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="border-2 border-gray-400 rounded-lg px-8 py-4 bg-white shadow text-center min-w-[120px]">
          <div className="text-lg font-semibold mb-1">Loaded Data</div>
          <div className="text-2xl font-bold text-green-700">{typeof currentCount === 'number' ? currentCount : '--'}</div>
        </div>
      </div>
    </div>
  );
} 