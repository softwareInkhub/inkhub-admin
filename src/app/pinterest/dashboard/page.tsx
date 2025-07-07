'use client';
import React, { useState, useEffect } from 'react';

export default function PinterestDashboardSignup() {
  const [email, setEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [tag, setTag] = useState('');
  const [accounts, setAccounts] = useState<{ email: string; accountName: string; active?: boolean; tag?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch accounts from DynamoDB
  const fetchAccounts = async () => {
    setLoading(true);
    const res = await fetch('/api/pinterest/accounts');
    const data = await res.json();
    setAccounts(data.accounts || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !accountName.trim()) return;

    const res = await fetch('/api/pinterest/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, accountName, tag }),
    });
    if (!res.ok) {
      alert('Failed to create account.');
      return;
    }

    setEmail('');
    setAccountName('');
    setTag('');
    fetchAccounts(); // Refresh cards from DynamoDB
  };

  const handleDelete = async (email: string) => {
    await fetch('/api/pinterest/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    fetchAccounts();
  };

  const handleToggleActive = async (email: string, currentActive: boolean) => {
    await fetch('/api/pinterest/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, active: !currentActive }),
    });
    fetchAccounts();
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'flex-start', background: '#fff', flexDirection: 'row' }}>
      {/* Create Account Button */}
      <button
        onClick={() => setModalOpen(true)}
        style={{
          position: 'absolute',
          top: 32,
          right: 40,
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 32px',
          fontWeight: 600,
          fontSize: 18,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(16,30,54,0.08)',
          transition: 'background 0.2s',
          zIndex: 10,
        }}
      >
        Create Account
      </button>

      {/* Modal Overlay */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Modal Content */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 4px 24px rgba(16,30,54,0.16)',
              padding: '36px 32px 32px 32px',
              minWidth: 370,
              maxWidth: '90vw',
              position: 'relative',
            }}
          >
            {/* Close Icon */}
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 22,
                color: '#888',
              }}
              aria-label="Close"
            >
              ×
            </button>
            {/* Account Creation Form */}
            <form
              onSubmit={handleSubmit}
              style={{
                width: 350,
                background: '#fff',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 24, marginBottom: 2 }}>Create your account</div>
              <div style={{ color: '#6B7280', fontSize: 15, marginBottom: 8 }}>
                Signing up for Pinterest Dashboard is fast and 100% free.
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  padding: '12px 14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  marginBottom: 4,
                }}
              />
              <input
                type="text"
                placeholder="Account name"
                required
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                style={{
                  padding: '12px 14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  marginBottom: 4,
                }}
              />
              <input
                type="text"
                placeholder="Tag (optional)"
                value={tag}
                onChange={e => setTag(e.target.value)}
                style={{
                  padding: '12px 14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 15,
                  outline: 'none',
                  marginBottom: 8,
                }}
              />
              <button
                type="submit"
                style={{
                  marginTop: 10,
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 0',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ margin: '40px 0 0 40px', fontSize: 18 }}>Loading accounts...</div>
      ) : (
        <div style={{ display: 'flex', gap: 32, margin: '40px 0 0 40px' }}>
          {accounts.map((acc, idx) => (
            <div key={acc.email} style={{
              width: 240,
              height: 180,
              background: acc.active !== false ? '#7C3AED' : '#A1A1AA',
              borderRadius: 18,
              boxShadow: '0 2px 8px rgba(16,30,54,0.08)',
              padding: '22px 22px 18px 22px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              color: '#fff',
              opacity: acc.active !== false ? 1 : 0.7,
              transition: 'background 0.2s, opacity 0.2s',
            }}>
              {/* Avatars and badge */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  marginRight: 8,
                }}>
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar1" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', position: 'relative', zIndex: 3 }} />
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="avatar2" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', position: 'absolute', left: 18, zIndex: 2 }} />
                  <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="avatar3" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff', position: 'absolute', left: 36, zIndex: 1 }} />
                  <div style={{
                    position: 'absolute',
                    left: 54,
                    top: 0,
                    background: '#5B21B6',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 15,
                    border: '2px solid #fff',
                    zIndex: 0,
                  }}>+7</div>
                </div>
                {/* Toggle Switch (active) */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{acc.active !== false ? 'Active' : 'Inactive'}</span>
                  <label style={{ display: 'inline-block', position: 'relative', width: 38, height: 22, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={acc.active !== false}
                      onChange={() => handleToggleActive(acc.email, acc.active !== false)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 38,
                      height: 22,
                      background: acc.active !== false ? '#34D399' : '#D1D5DB',
                      borderRadius: 12,
                      transition: 'background 0.2s',
                      display: 'block',
                    }}></span>
                    <span style={{
                      position: 'absolute',
                      top: 3,
                      left: acc.active !== false ? 20 : 3,
                      width: 16,
                      height: 16,
                      background: '#fff',
                      borderRadius: '50%',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      transition: 'left 0.2s',
                      display: 'block',
                    }}></span>
                  </label>
                </div>
              </div>
              {/* Account Name */}
              <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 2 }}>{acc.accountName}</div>
              {/* Tag (if present) */}
              {acc.tag && (
                <div style={{ fontSize: 14, color: '#FBBF24', fontWeight: 500, marginBottom: 2 }}>
                  #{acc.tag}
                </div>
              )}
              {/* Email */}
              <div style={{ fontSize: 15, opacity: 0.92, marginBottom: 16 }}>{acc.email}</div>
              {/* Delete button at lower right */}
              <button
                onClick={() => handleDelete(acc.email)}
                style={{
                  position: 'absolute',
                  right: 12,
                  bottom: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  outline: 'none',
                  opacity: 1,
                }}
                title="Delete"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.10)"/>
                  <path d="M9.5 9.5L14.5 14.5M14.5 9.5L9.5 14.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 