"use client";
import { useState, useEffect } from "react";

interface UniversalAnalyticsBarProps {
  section: string;
  tabKey: string;
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

export default function UniversalAnalyticsBar({ section, tabKey, onChange }: UniversalAnalyticsBarProps) {
  const config = configs[section?.toLowerCase()]?.[tabKey?.toLowerCase()];
  const [filter, setFilter] = useState(config?.filter?.[0] || "All");
  const [groupBy, setGroupBy] = useState(config?.groupBy?.[0] || "None");
  const [aggregate, setAggregate] = useState(config?.aggregate?.[0] || "Count");

  useEffect(() => {
    if (onChange) onChange({ filter, groupBy, aggregate });
  }, [filter, groupBy, aggregate, onChange]);

  if (!config) return null;

  return (
    <div className="flex flex-row items-center gap-4 bg-gray-50 border-b border-gray-200 rounded-t-lg px-6 py-3 shadow-sm w-full">
      <span className="font-bold text-primary-700 text-base mr-2">Analytics</span>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 mr-1">Filter:</label>
        <select
          className="input input-sm rounded-full border-gray-300 text-xs px-2 py-1"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {config.filter.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 mr-1">Group By:</label>
        <select
          className="input input-sm rounded-full border-gray-300 text-xs px-2 py-1"
          value={groupBy}
          onChange={e => setGroupBy(e.target.value)}
        >
          {config.groupBy.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 mr-1">Aggregate:</label>
        <select
          className="input input-sm rounded-full border-gray-300 text-xs px-2 py-1"
          value={aggregate}
          onChange={e => setAggregate(e.target.value)}
        >
          {config.aggregate.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
