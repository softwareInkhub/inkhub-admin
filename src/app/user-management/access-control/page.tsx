'use client';

import React, { useState } from 'react';

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
      { label: 'Upload' },
      { label: 'Edit' },
      { label: 'Delete' },
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

function PermissionTree({ permissions, checked, onCheck, parentKey = '' }) {
  return (
    <ul style={{ listStyle: 'none', paddingLeft: 16 }}>
      {permissions.map((perm, idx) => {
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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accessType, setAccessType] = useState('User');
  const [checked, setChecked] = useState([]);
  const [search, setSearch] = useState('');

  const handleCheck = (key) => {
    setChecked((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (checked.length === getAllKeys(PERMISSIONS)) {
      setChecked([]);
    } else {
      setChecked(getAllKeys(PERMISSIONS));
    }
  };

  function getAllKeys(perms, parentKey = '') {
    let keys = [];
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
  function filterPermissions(perms, query) {
    if (!query) return perms;
    return perms
      .map((perm) => {
        if (perm.label.toLowerCase().includes(query.toLowerCase())) return perm;
        if (perm.children) {
          const filteredChildren = filterPermissions(perm.children, query);
          if (filteredChildren.length > 0) return { ...perm, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  }

  const filteredPermissions = filterPermissions(PERMISSIONS, search);

  return (
    <div className="max-w-xl w-full mx-auto p-8 mt-1">
      {/* <h2 className="text-3xl font-bold mb-8">Edit Access Control</h2> */}
      <form className="flex flex-col gap-6">
        <div>
          <label className="block font-semibold mb-1">Name:</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="User or Role Name"
          />
        </div>
        {/* <div>
          <label className="block font-semibold mb-1">Description:</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the access for this user or role"
          />
        </div> */}
        <div>
          <label className="block font-semibold mb-1">Access Type:</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={accessType}
            onChange={(e) => setAccessType(e.target.value)}
          >
            <option value="User">User</option>
            <option value="Role">Role</option>
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
          <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white font-semibold" onClick={(e) => { e.preventDefault(); /* TODO: handle save */ }}>Save</button>
        </div>
      </form>
    </div>
  );
} 