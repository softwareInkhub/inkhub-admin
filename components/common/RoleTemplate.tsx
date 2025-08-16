'use client';

import React from 'react';
import { 
  Shield, 
  Users, 
  Palette, 
  Package, 
  ImageIcon, 
  Settings, 
  CheckCircle,
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RoleTemplate = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: string[];
  category: 'admin' | 'content' | 'technical' | 'viewer';
  isPopular?: boolean;
};

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    icon: Shield,
    category: 'admin',
    permissions: [
      'Shopify.Orders', 'Shopify.Products', 'Shopify.Create', 'Shopify.Edit', 'Shopify.View', 'Shopify.Delete',
      'Pinterest.Pins', 'Pinterest.Boards',
      'Design Library.Designs', 'Design Library.Upload', 'Design Library.Edit', 'Design Library.Delete',
      'User Management.Register User', 'User Management.Existing User', 'User Management.Access Control',
      'Settings.General', 'Settings.Health Check', 'Settings.Caching'
    ],
    isPopular: true,
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Administrative access with limited system control',
    icon: Shield,
    category: 'admin',
    permissions: [
      'Shopify.Orders', 'Shopify.Products', 'Shopify.Create', 'Shopify.Edit', 'Shopify.View',
      'Pinterest.Pins', 'Pinterest.Boards',
      'Design Library.Designs', 'Design Library.Upload', 'Design Library.Edit',
      'User Management.Register User', 'User Management.Existing User',
      'Settings.General', 'Settings.Health Check'
    ],
  },
  {
    id: 'content-manager',
    name: 'Content Manager',
    description: 'Manage content across all platforms',
    icon: Users,
    category: 'content',
    permissions: [
      'Shopify.Products', 'Shopify.Create', 'Shopify.Edit', 'Shopify.View',
      'Pinterest.Pins', 'Pinterest.Boards',
      'Design Library.Designs', 'Design Library.Upload', 'Design Library.Edit'
    ],
    isPopular: true,
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Access to design library and related features',
    icon: Palette,
    category: 'content',
    permissions: [
      'Design Library.Designs', 'Design Library.Upload', 'Design Library.Edit',
      'Pinterest.Pins', 'Pinterest.Boards'
    ],
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Technical access for development tasks',
    icon: Settings,
    category: 'technical',
    permissions: [
      'Settings.General', 'Settings.Health Check', 'Settings.Caching',
      'Shopify.View', 'Pinterest.View', 'Design Library.View'
    ],
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to all content',
    icon: Users,
    category: 'viewer',
    permissions: [
      'Shopify.View', 'Pinterest.View', 'Design Library.View'
    ],
  },
];

interface RoleTemplateProps {
  onSelectTemplate: (template: RoleTemplate) => void;
  selectedTemplate?: string;
}

const categoryConfig = {
  admin: { color: 'text-red-600', bg: 'bg-red-50', label: 'Admin' },
  content: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Content' },
  technical: { color: 'text-purple-600', bg: 'bg-purple-50', label: 'Technical' },
  viewer: { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Viewer' },
};

export default function RoleTemplate({ onSelectTemplate, selectedTemplate }: RoleTemplateProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredTemplates = selectedCategory === 'all' 
    ? ROLE_TEMPLATES 
    : ROLE_TEMPLATES.filter(template => template.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All Templates' },
          { id: 'admin', label: 'Admin' },
          { id: 'content', label: 'Content' },
          { id: 'technical', label: 'Technical' },
          { id: 'viewer', label: 'Viewer' },
        ].map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              selectedCategory === category.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          const category = categoryConfig[template.category];

          return (
            <div
              key={template.id}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                selectedTemplate === template.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", category.bg, category.color)}>
                      {category.label}
                    </span>
                  </div>
                </div>
                {template.isPopular && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Popular
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{template.permissions.length} permissions</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Ready to use</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Shield className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No templates found for the selected category.</p>
        </div>
      )}
    </div>
  );
}
