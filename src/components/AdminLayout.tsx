import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/teams', label: 'Teams', icon: '⚽' },
    { path: '/admin/matches', label: 'Matches', icon: '🏆' },
    { path: '/admin/competitions', label: 'Competitions', icon: '🏟️' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-page">
      <Header />

      <main>
        <div className="wrap">
          <div style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
            marginTop: '32px'
          }}>
            {/* Admin Navigation Sidebar */}
            <div style={{ minWidth: '140px', flexShrink: 0 }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Admin Panel
              </h2>

              <nav style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: isActive(item.path) ? '600' : '500',
                      color: isActive(item.path) ? '#6366f1' : '#4b5563',
                      background: isActive(item.path) ? '#eef2ff' : 'transparent',
                      border: isActive(item.path) ? '1px solid #c7d2fe' : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div style={{ flex: '1', minWidth: '0' }}>
              <h1 style={{
                margin: '0 0 24px 0',
                fontSize: 'clamp(1.5rem, 5vw, 1.875rem)',
                fontWeight: '700'
              }}>
                {title}
              </h1>

              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;