'use client';

import React from 'react';
import { 
  Clock, 
  User, 
  Shield, 
  Edit, 
  Plus, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AuditEvent = {
  id: string;
  timestamp: string;
  user: string;
  action: 'permission_granted' | 'permission_revoked' | 'role_assigned' | 'role_removed' | 'user_created' | 'user_deleted' | 'login' | 'logout';
  resource: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
};

interface AuditLogProps {
  events: AuditEvent[];
  onFilterChange?: (filters: any) => void;
}

const severityConfig = {
  low: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Info },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle },
  critical: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle },
};

const actionConfig = {
  permission_granted: { color: 'text-green-600', icon: CheckCircle },
  permission_revoked: { color: 'text-red-600', icon: Trash2 },
  role_assigned: { color: 'text-blue-600', icon: Shield },
  role_removed: { color: 'text-red-600', icon: Shield },
  user_created: { color: 'text-green-600', icon: Plus },
  user_deleted: { color: 'text-red-600', icon: Trash2 },
  login: { color: 'text-blue-600', icon: User },
  logout: { color: 'text-gray-600', icon: User },
};

export default function AuditLog({ events, onFilterChange }: AuditLogProps) {
  const [filters, setFilters] = React.useState({
    severity: 'all',
    action: 'all',
    user: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const filteredEvents = events.filter(event => {
    if (filters.severity !== 'all' && event.severity !== filters.severity) return false;
    if (filters.action !== 'all' && event.action !== filters.action) return false;
    if (filters.user && !event.user.toLowerCase().includes(filters.user.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Actions</option>
            <option value="permission_granted">Permission Granted</option>
            <option value="permission_revoked">Permission Revoked</option>
            <option value="role_assigned">Role Assigned</option>
            <option value="role_removed">Role Removed</option>
            <option value="user_created">User Created</option>
            <option value="user_deleted">User Deleted</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
          <input
            type="text"
            value={filters.user}
            onChange={(e) => handleFilterChange('user', e.target.value)}
            placeholder="Search user..."
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-96 overflow-auto">
        {filteredEvents.map((event) => {
          const severity = severityConfig[event.severity];
          const action = actionConfig[event.action];
          const SeverityIcon = severity.icon;
          const ActionIcon = action.icon;

          return (
            <div key={event.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className={cn("p-2 rounded-full", severity.bg)}>
                <SeverityIcon className={cn("h-4 w-4", severity.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <ActionIcon className={cn("h-4 w-4", action.color)} />
                  <span className="font-medium text-gray-900">{event.user}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{event.details}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                  <span>{event.resource}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No audit events found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
