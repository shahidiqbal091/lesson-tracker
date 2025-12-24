import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Calendar, FileText, TrendingUp, Video } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enrolledClasses: 0,
    pendingHomework: 0,
    attendanceRate: 0,
  });
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentProgress, setRecentProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!student) return;

      const { count: enrolledClasses } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', student.id)
        .eq('status', 'active');

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          classes (
            *,
            teachers (
              profiles!teachers_user_id_fkey (full_name)
            )
          )
        `)
        .eq('student_id', student.id)
        .eq('status', 'active')
        .limit(3);

      const { data: homework } = await supabase
        .from('homework')
        .select('id')
        .in('class_id', enrollments?.map((e) => e.class_id) || []);

      const homeworkIds = homework?.map((h) => h.id) || [];

      const { count: pendingHomework } = await supabase
        .from('homework_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', student.id)
        .eq('status', 'pending');

      const { data: attendance } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', student.id);

      const attendanceRate = attendance?.length
        ? (attendance.filter((a) => a.status === 'present').length / attendance.length) * 100
        : 0;

      const { data: progress } = await supabase
        .from('progress_reports')
        .select('*')
        .eq('student_id', student.id)
        .order('report_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      setStats({
        enrolledClasses: enrolledClasses || 0,
        pendingHomework: pendingHomework || 0,
        attendanceRate: attendanceRate.toFixed(1),
      });

      setUpcomingClasses(enrollments || []);
      setRecentProgress(progress);
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
          Student Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track your learning progress
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
              Enrolled Classes
            </h3>
            <BookOpen size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {stats.enrolledClasses}
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

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Attendance Rate
            </h3>
            <TrendingUp size={24} style={{ color: 'var(--success)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
            {stats.attendanceRate}%
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
            My Classes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map((enrollment) => (
                <div key={enrollment.id} style={{
                  padding: 'var(--spacing-md)',
                  background: 'var(--surface-hover)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: 600 }}>{enrollment.classes?.class_name}</p>
                    {enrollment.classes?.meeting_link && (
                      <a href={enrollment.classes.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        <Video size={14} />
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Teacher: {enrollment.classes?.teachers?.profiles?.full_name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    {enrollment.classes?.schedule_day} at {enrollment.classes?.schedule_time}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                No classes enrolled
              </p>
            )}
          </div>
        </div>

        {recentProgress && (
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
              Latest Progress Report
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div style={{
                padding: 'var(--spacing-md)',
                background: 'var(--surface-hover)',
                borderRadius: 'var(--radius-md)',
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Quran Memorization
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {recentProgress.quran_memorization}%
                </p>
              </div>
              <div style={{
                padding: 'var(--spacing-md)',
                background: 'var(--surface-hover)',
                borderRadius: 'var(--radius-md)',
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Tajweed Score
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>
                  {recentProgress.tajweed_score}%
                </p>
              </div>
              <div style={{
                padding: 'var(--spacing-md)',
                background: 'var(--surface-hover)',
                borderRadius: 'var(--radius-md)',
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Teacher's Comments
                </p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {recentProgress.teacher_comments || 'No comments yet'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
