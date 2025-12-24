import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, BookOpen, DollarSign, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
    totalRevenue: 0,
    pendingFees: 0,
  });
  const [levelDistribution, setLevelDistribution] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch students count
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { count: activeStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch teachers count
      const { count: totalTeachers } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      // Fetch active classes
      const { count: activeClasses } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch revenue
      const { data: payments } = await supabase
        .from('payments')
        .select('amount');

      const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;

      // Fetch pending fees
      const { data: pendingFees } = await supabase
        .from('fee_records')
        .select('amount')
        .eq('status', 'pending');

      const totalPending = pendingFees?.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0) || 0;

      // Fetch level distribution
      const { data: students } = await supabase
        .from('students')
        .select('level');

      const distribution = students?.reduce((acc, s) => {
        acc[s.level] = (acc[s.level] || 0) + 1;
        return acc;
      }, {});

      const levelData = Object.entries(distribution || {}).map(([name, value]) => ({
        name,
        value,
      }));

      // Fetch recent enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          students (
            user_id,
            profiles!students_user_id_fkey (full_name)
          ),
          classes (class_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch upcoming classes
      const { data: classes } = await supabase
        .from('classes')
        .select(`
          *,
          teachers (
            user_id,
            profiles!teachers_user_id_fkey (full_name)
          )
        `)
        .eq('is_active', true)
        .limit(5);

      setStats({
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalTeachers: totalTeachers || 0,
        activeClasses: activeClasses || 0,
        totalRevenue,
        pendingFees: totalPending,
      });

      setLevelDistribution(levelData);
      setRecentEnrollments(enrollments || []);
      setUpcomingClasses(classes || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#1e7e5c', '#c9a961', '#8b5a3c', '#22c55e'];

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
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Overview of your Quran LMS platform
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)',
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Students
            </h3>
            <Users size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {stats.totalStudents}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
            {stats.activeStudents} active
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Teachers
            </h3>
            <BookOpen size={24} style={{ color: 'var(--secondary)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>
            {stats.totalTeachers}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Active Classes
            </h3>
            <Calendar size={24} style={{ color: 'var(--info)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>
            {stats.activeClasses}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Revenue
            </h3>
            <DollarSign size={24} style={{ color: 'var(--success)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Pending Fees
            </h3>
            <AlertCircle size={24} style={{ color: 'var(--warning)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
            ${stats.pendingFees.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)',
      }}>
        {/* Level Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Student Level Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={levelDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {levelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 'var(--spacing-lg)',
      }}>
        {/* Recent Enrollments */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Recent Enrollments
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {recentEnrollments.length > 0 ? (
              recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--surface-hover)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {enrollment.students?.profiles?.full_name || 'Unknown'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {enrollment.classes?.class_name || 'Unknown Class'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    {new Date(enrollment.enrollment_date).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                No recent enrollments
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Active Classes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map((cls) => (
                <div key={cls.id} style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--surface-hover)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {cls.class_name}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Teacher: {cls.teachers?.profiles?.full_name || 'Unknown'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    {cls.schedule_day} at {cls.schedule_time}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                No active classes
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
