import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, FileText, Video, Clock } from 'lucide-react';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [teacherData, setTeacherData] = useState(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingHomework: 0,
    todayClasses: 0,
  });
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentHomework, setRecentHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!teacher) return;
      setTeacherData(teacher);

      const { count: totalClasses } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacher.id)
        .eq('is_active', true);

      const { data: classes } = await supabase
        .from('classes')
        .select(`
          id,
          enrollments (student_id)
        `)
        .eq('teacher_id', teacher.id);

      const totalStudents = new Set(
        classes?.flatMap((c) => c.enrollments.map((e) => e.student_id))
      ).size;

      const { count: pendingHomework } = await supabase
        .from('homework_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('homework_id', await getTeacherHomeworkIds(teacher.id));

      const { data: todayClasses } = await supabase
        .from('classes')
        .select('*, enrollments (student_id)')
        .eq('teacher_id', teacher.id)
        .eq('is_active', true)
        .limit(3);

      const { data: homework } = await supabase
        .from('homework')
        .select('*, classes (class_name)')
        .eq('teacher_id', teacher.id)
        .order('assigned_date', { ascending: false })
        .limit(5);

      setStats({
        totalClasses: totalClasses || 0,
        totalStudents,
        pendingHomework: pendingHomework || 0,
        todayClasses: todayClasses?.length || 0,
      });

      setUpcomingClasses(todayClasses || []);
      setRecentHomework(homework || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherHomeworkIds = async (teacherId) => {
    const { data } = await supabase
      .from('homework')
      .select('id')
      .eq('teacher_id', teacherId);
    return data?.map((h) => h.id) || [];
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
          Teacher Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your classes and students
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
              Total Classes
            </h3>
            <Calendar size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {stats.totalClasses}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Students
            </h3>
            <Users size={24} style={{ color: 'var(--secondary)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>
            {stats.totalStudents}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Pending Homework
            </h3>
            <FileText size={24} style={{ color: 'var(--warning)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
            {stats.pendingHomework}
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 'var(--spacing-lg)',
      }}>
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Your Classes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map((cls) => (
                <div key={cls.id} style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--surface-hover)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: 600 }}>{cls.class_name}</p>
                    {cls.meeting_link && (
                      <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        <Video size={14} />
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {cls.schedule_day} at {cls.schedule_time}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    Students: {cls.enrollments?.length || 0}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                No classes scheduled
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Recent Homework
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {recentHomework.length > 0 ? (
              recentHomework.map((hw) => (
                <div key={hw.id} style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--surface-hover)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{hw.title}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {hw.classes?.class_name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    Due: {new Date(hw.due_date).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                No homework assigned
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
