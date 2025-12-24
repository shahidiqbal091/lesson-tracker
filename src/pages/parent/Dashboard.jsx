import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, TrendingUp, DollarSign } from 'lucide-react';

export const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalClasses: 0,
    avgAttendance: 0,
    pendingFees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const { data: relations } = await supabase
        .from('parent_student_relation')
        .select(`
          *,
          students (
            *,
            profiles!students_user_id_fkey (full_name),
            enrollments (
              id,
              classes (class_name)
            )
          )
        `)
        .eq('parent_id', user.id);

      const childrenData = relations?.map((r) => r.students) || [];
      setChildren(childrenData);

      const studentIds = childrenData.map((c) => c.id);

      const { count: totalClasses } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .in('student_id', studentIds)
        .eq('status', 'active');

      const { data: attendance } = await supabase
        .from('attendance')
        .select('status')
        .in('student_id', studentIds);

      const avgAttendance = attendance?.length
        ? (attendance.filter((a) => a.status === 'present').length / attendance.length) * 100
        : 0;

      const { data: fees } = await supabase
        .from('fee_records')
        .select('amount')
        .in('student_id', studentIds)
        .eq('status', 'pending');

      const pendingFees = fees?.reduce((sum, f) => sum + parseFloat(f.amount), 0) || 0;

      setStats({
        totalChildren: childrenData.length,
        totalClasses: totalClasses || 0,
        avgAttendance: avgAttendance.toFixed(1),
        pendingFees,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
          Parent Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Monitor your children's progress
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)',
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              My Children
            </h3>
            <Users size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {stats.totalChildren}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Classes
            </h3>
            <BookOpen size={24} style={{ color: 'var(--secondary)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>
            {stats.totalClasses}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Avg Attendance
            </h3>
            <TrendingUp size={24} style={{ color: 'var(--success)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
            {stats.avgAttendance}%
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Pending Fees
            </h3>
            <DollarSign size={24} style={{ color: 'var(--warning)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
            ${stats.pendingFees.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
          My Children
        </h3>
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {children.length > 0 ? (
            children.map((child) => (
              <div key={child.id} style={{
                padding: 'var(--spacing-md)',
                background: 'var(--surface-hover)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{child.profiles?.full_name}</p>
                    <span className="badge badge-primary" style={{ marginTop: '0.5rem' }}>
                      {child.level}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enrolled in</p>
                    <p style={{ fontWeight: 600 }}>{child.enrollments?.length || 0} classes</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              No children linked to your account
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
