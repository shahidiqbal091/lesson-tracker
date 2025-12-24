import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen, LogOut, Home, Users, Calendar,
  DollarSign, FileText, BarChart, Settings
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (profile?.role) {
      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', path: '/admin' },
          { icon: Users, label: 'Teachers', path: '/admin/teachers' },
          { icon: Users, label: 'Students', path: '/admin/students' },
          { icon: Calendar, label: 'Classes', path: '/admin/classes' },
          { icon: DollarSign, label: 'Fees', path: '/admin/fees' },
          { icon: BarChart, label: 'Reports', path: '/admin/reports' },
        ];
      case 'teacher':
        return [
          { icon: Home, label: 'Dashboard', path: '/teacher' },
          { icon: Calendar, label: 'My Classes', path: '/teacher/classes' },
          { icon: Users, label: 'Students', path: '/teacher/students' },
          { icon: FileText, label: 'Homework', path: '/teacher/homework' },
          { icon: BarChart, label: 'Attendance', path: '/teacher/attendance' },
        ];
      case 'student':
        return [
          { icon: Home, label: 'Dashboard', path: '/student' },
          { icon: Calendar, label: 'My Classes', path: '/student/classes' },
          { icon: FileText, label: 'Homework', path: '/student/homework' },
          { icon: BarChart, label: 'Progress', path: '/student/progress' },
        ];
      case 'parent':
        return [
          { icon: Home, label: 'Dashboard', path: '/parent' },
          { icon: Users, label: 'My Children', path: '/parent/children' },
          { icon: DollarSign, label: 'Fees', path: '/parent/fees' },
          { icon: BarChart, label: 'Progress', path: '/parent/progress' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{
          marginBottom: 'var(--spacing-xl)',
          paddingBottom: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            color: 'var(--primary)',
          }}>
            <BookOpen size={32} />
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quran LMS</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)} Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text)',
                textDecoration: 'none',
                marginBottom: 'var(--spacing-xs)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text)';
              }}
            >
              <item.icon size={20} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User info and logout */}
        <div style={{
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{
            padding: 'var(--spacing-sm)',
            background: 'var(--surface-hover)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-sm)',
          }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              {profile?.full_name}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {profile?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="btn btn-outline"
            style={{ width: '100%' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        padding: 'var(--spacing-xl)',
        overflowY: 'auto',
      }}>
        {children}
      </main>
    </div>
  );
};
