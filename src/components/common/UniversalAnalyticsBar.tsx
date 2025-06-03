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
    <div className="flex flex-row items-center bg-white border-b border-gray-200 rounded-t-lg px-4 py-2 shadow-sm w-full mb-4">
      <div className="flex flex-col items-center justify-center">
        <div className="border-2 border-gray-400 rounded-lg px-4 py-2 bg-white shadow text-center min-w-[80px]">
          <div className="text-xs font-semibold mb-0.5">Total Data</div>
          <div className="text-lg font-bold text-blue-700">{typeof total === 'number' ? total : '--'}</div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center ml-2">
        <div className="border-2 border-gray-400 rounded-lg px-4 py-2 bg-white shadow text-center min-w-[80px]">
          <div className="text-xs font-semibold mb-0.5">Loaded Data</div>
          <div className="text-lg font-bold text-green-700">{typeof currentCount === 'number' ? currentCount : '--'}</div>
        </div>
      </div>
      {[3,4,5,6,7,8,9,10,11].map((num) => (
        <div key={num} className="flex flex-col items-center justify-center ml-2">
          <div className="border-2 border-gray-400 rounded-lg px-4 py-2 bg-white shadow text-center min-w-[120px]">
            <div className="text-xs font-semibold mb-0.5">Box {num}</div>
            <div className="text-lg font-bold text-gray-700">--</div>
          </div>
        </div>
      ))}
    </div>
  );
} 