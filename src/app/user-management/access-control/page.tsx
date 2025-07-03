'use client';

import React, { useState, useEffect } from 'react';

const PERMISSIONS = [
  {
    label: 'Shopify',
    children: [
      { label: 'Orders' },
      { label: 'Products' },
      { label: 'Create' },
      { label: 'Edit' },
      { label: 'View' },
      { label: 'Delete' },
    ],
  },
  {
    label: 'Pinterest',
    children: [
      { label: 'Pins' },
      { label: 'Boards' },
    ],
  },
  {
    label: 'Design Library',
    children: [
      { label: 'Designs' },
      // { label: 'Upload' },
      // { label: 'Edit' },
      // { label: 'Delete' },
    ],
  },
  {
    label: 'User Management',
    children: [
      { label: 'Register User' },
      { label: 'Existing User' },
      { label: 'Access Control' },
    ],
  },
  {
    label: 'Settings',
    children: [
      { label: 'General' },
      { label: 'Health Check' },
    ],
  },
];

type Permission = {
  label: string;
  children?: Permission[];
};

type User = {
  username: string;
  email: string;
  role: string;
};

function PermissionTree({ permissions, checked, onCheck, parentKey = '' }: {
  permissions: Permission[];
  checked: string[];
  onCheck: (key: string) => void;
  parentKey?: string;
}) {
  return (
    <ul style={{ listStyle: 'none', paddingLeft: 16 }}>
      {permissions.map((perm: Permission, idx: number) => {
        const key = parentKey ? `${parentKey}.${perm.label}` : perm.label;
        const isChecked = checked.includes(key);
        return (
          <li key={key}>
            <label style={{ fontWeight: perm.children ? 'bold' : 'normal' }}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onCheck(key)}
              />
              {perm.label}
            </label>
            {perm.children && (
              <PermissionTree
                permissions={perm.children}
                checked={checked}
                onCheck={onCheck}
                parentKey={key}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function AccessControlPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [checked, setChecked] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users on mount
  useEffect(() => {
    fetch('/api/user-management/users')
      .then(res => res.json())
      .then((data: User[]) => setUsers(data));
  }, []);

  // When a user is selected, populate the name
  useEffect(() => {
    if (!selectedUser) return;
    const user = users.find((u: User) => u.username === selectedUser);
    if (user) {
      setName(user.username);
    }
  }, [selectedUser, users]);

  const handleCheck = (key: string) => {
    setChecked((prev: string[]) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (checked.length === getAllKeys(PERMISSIONS).length) {
      setChecked([]);
    } else {
      setChecked(getAllKeys(PERMISSIONS));
    }
  };

  function getAllKeys(perms: Permission[], parentKey = ''): string[] {
    let keys: string[] = [];
    for (const perm of perms) {
      const key = parentKey ? `${parentKey}.${perm.label}` : perm.label;
      keys.push(key);
      if (perm.children) {
        keys = keys.concat(getAllKeys(perm.children, key));
      }
    }
    return keys;
  }

  // Filter permissions by search
  function filterPermissions(perms: Permission[], query: string): Permission[] {
    if (!query) return perms;
    return perms
      .map((perm: Permission) => {
        if (perm.label.toLowerCase().includes(query.toLowerCase())) return perm;
        if (perm.children) {
          const filteredChildren = filterPermissions(perm.children, query);
          if (filteredChildren.length > 0) return { ...perm, children: filteredChildren };
        }
        return null;
      })
      .filter((p): p is Permission => Boolean(p));
  }

  const filteredPermissions = filterPermissions(PERMISSIONS, search);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user-management/access-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedUser,
          permissions: checked,
          role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Permissions saved successfully!');
        setSelectedUser('');
        setName('');
        setRole('');
        setChecked([]);
        setSearch('');
      } else {
        setError(data.error || 'Failed to save permissions');
        alert('Failed to save permissions: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      alert('Failed to save permissions: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto p-8 mt-1">
      <form className="flex flex-col gap-6" onSubmit={handleSave}>
        <div>
          <label className="block font-semibold mb-1">Email:</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
          >
            <option value="">Select a user</option>
            {users.map((user: User) => (
              <option key={user.email} value={user.email}>
                {user.email} ({user.role || 'User'})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Name:</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="User or Role Name"
            disabled={!!selectedUser}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Role:</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="">Select a role</option>
            <option value="super admin">super admin</option>
            <option value="admin">admin</option>
            <option value="designer">designer</option>
            <option value="developer">developer</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Permissions:</label>
          <input
            className="w-full border rounded px-3 py-2 mb-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions..."
          />
          <div className="border rounded p-2 max-h-64 overflow-auto bg-gray-50">
            <label className="block mb-2">
              <input
                type="checkbox"
                checked={checked.length === getAllKeys(filteredPermissions).length && checked.length > 0}
                onChange={handleSelectAll}
              />
              Select All
            </label>
            <PermissionTree permissions={filteredPermissions} checked={checked} onCheck={handleCheck} />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button type="button" className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold" onClick={() => { /* TODO: handle cancel */ }}>Cancel</button>
          <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white font-semibold" disabled={loading}>Save</button>
        </div>
      </form>
    </div>
  );
} 