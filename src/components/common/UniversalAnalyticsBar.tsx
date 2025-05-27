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
    <div className="bg-gray-50 border-b px-2 sm:px-4 py-2 sm:py-3 flex flex-row flex-wrap items-center min-h-[56px] gap-2 overflow-x-auto">
      <span className="text-sm sm:text-base font-bold text-primary-700 whitespace-nowrap">
        {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)} Analytics
      </span>
      <select
        className="input text-xs sm:text-sm w-auto min-w-[90px]"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      >
        {config.filter.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <select
        className="input text-xs sm:text-sm w-auto min-w-[90px]"
        value={groupBy}
        onChange={e => setGroupBy(e.target.value)}
      >
        {config.groupBy.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <select
        className="input text-xs sm:text-sm w-auto min-w-[90px]"
        value={aggregate}
        onChange={e => setAggregate(e.target.value)}
      >
        {config.aggregate.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
} 