import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import {
  LayoutDashboard, CheckSquare, Calendar, Timer,
  BarChart2, Tag, LogOut, Sparkles, Menu, X,
  Pin, Settings
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'tasks',     label: 'All Tasks',  icon: CheckSquare },
  { id: 'pinned',    label: 'Pinned',     icon: Pin },
  { id: 'calendar',  label: 'Calendar',   icon: Calendar },
  { id: 'pomodoro',  label: 'Pomodoro',   icon: Timer },
  { id: 'stats',     label: 'Statistics', icon: BarChart2 },
  { id: 'categories',label: 'Categories', icon: Tag },
  { id: 'about',     label: 'About Us',   icon: User },
];

export default function Sidebar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();
  const { stats }        = useTasks();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const SidebarContent = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', padding: '24px 16px'
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '12px', marginBottom: '32px', padding: '0 8px'
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
          background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(108,99,255,0.4)'
        }}>
          <Sparkles size={20} color="white" />
        </div>
        {!collapsed && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>
              AI Todo
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Smart Productivity
            </p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button key={id} onClick={() => {
              setActivePage(id);
              setMobileOpen(false);
            }} style={{
              display: 'flex', alignItems: 'center',
              gap: '12px', padding: '11px 12px',
              borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: isActive
                ? 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(167,139,250,0.2))'
                : 'transparent',
              color: isActive ? 'var(--accent-secondary)' : 'var(--text-secondary)',
              borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
              transition: 'var(--transition)', width: '100%', textAlign: 'left',
              fontSize: '14px', fontWeight: isActive ? 600 : 400,
            }}
            onMouseEnter={e => {
              if (!isActive) e.currentTarget.style.background = 'var(--glass-hover)';
            }}
            onMouseLeave={e => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && id === 'tasks' && stats.pending > 0 && (
                <span style={{
                  marginLeft: 'auto', background: 'var(--accent-primary)',
                  color: 'white', borderRadius: '10px', padding: '1px 7px',
                  fontSize: '11px', fontWeight: 700
                }}>{stats.pending}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="divider" />

      {/* User Profile */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '10px', padding: '12px', borderRadius: '12px',
        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
        marginBottom: '8px'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #6c63ff, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: 'white'
        }}>
          {initials}
        </div>
        {!collapsed && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </p>
          </div>
        )}
      </div>

      {/* Logout */}
      <button onClick={logout} className="btn btn-ghost" style={{
        width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
        gap: '10px', padding: '10px 12px'
      }}>
        <LogOut size={16} />
        {!collapsed && 'Logout'}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: collapsed ? '72px' : '260px',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--glass-border)',
        transition: 'var(--transition)', zIndex: 100,
        display: 'flex', flexDirection: 'column'
      }}
      className="desktop-sidebar">
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          position: 'absolute', top: '20px', right: '-12px',
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--accent-primary)', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', zIndex: 101,
          boxShadow: '0 2px 8px rgba(108,99,255,0.5)'
        }}>
          {collapsed ? <Menu size={12} /> : <X size={12} />}
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button onClick={() => setMobileOpen(true)} style={{
        position: 'fixed', bottom: '20px', right: '20px',
        width: 52, height: 52, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
        border: 'none', cursor: 'pointer', zIndex: 200,
        display: 'none', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(108,99,255,0.5)',
        color: 'white'
      }} className="mobile-menu-btn">
        <Menu size={22} />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)'
        }} onClick={() => setMobileOpen(false)}>
          <aside style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '260px',
            background: 'rgba(10,10,15,0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid var(--glass-border)'
          }} onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}