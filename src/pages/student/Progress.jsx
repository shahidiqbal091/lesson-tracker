import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const StudentProgress = () => {
  const { user } = useAuth();
  const [progressReports, setProgressReports] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!student) return;

      const { data: reports } = await supabase
        .from('progress_reports')
        .select(`
          *,
          teachers (
            profiles!teachers_user_id_fkey (full_name)
          )
        `)
        .eq('student_id', student.id)
        .order('report_date', { ascending: false });

      const { data: att } = await supabase
        .from('attendance')
        .select('status, date')
        .eq('student_id', student.id)
        .order('date', { ascending: false })
        .limit(30);

      setProgressReports(reports || []);
      setAttendance(att || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>;
  }

  const chartData = progressReports.slice(0, 5).reverse().map((report) => ({
    date: new Date(report.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    memorization: report.quran_memorization,
    tajweed: report.tajweed_score,
    attendance: report.attendance_percentage,
  }));

  const attendanceStats = {
    present: attendance.filter((a) => a.status === 'present').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    late: attendance.filter((a) => a.status === 'late').length,
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xl)' }}>My Progress</h1>

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Performance Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="memorization" stroke="#1e7e5c" strokeWidth={2} name="Memorization %" />
              <Line type="monotone" dataKey="tajweed" stroke="#c9a961" strokeWidth={2} name="Tajweed %" />
              <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {attendance.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Recent Attendance (Last 30 Days)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
            <div style={{
              padding: 'var(--spacing-md)',
              background: 'var(--surface-hover)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{attendanceStats.present}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Present</p>
            </div>
            <div style={{
              padding: 'var(--spacing-md)',
              background: 'var(--surface-hover)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>{attendanceStats.absent}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Absent</p>
            </div>
            <div style={{
              padding: 'var(--spacing-md)',
              background: 'var(--surface-hover)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{attendanceStats.late}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Late</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
          Progress Reports
        </h3>
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {progressReports.length > 0 ? (
            progressReports.map((report) => (
              <div key={report.id} style={{
                padding: 'var(--spacing-md)',
                background: 'var(--surface-hover)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>Report Date: {new Date(report.report_date).toLocaleDateString()}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Teacher: {report.teachers?.profiles?.full_name}
                    </p>
                  </div>
                  <span className="badge badge-primary">{report.overall_performance}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Memorization</p>
                    <p style={{ fontWeight: 600 }}>{report.quran_memorization}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tajweed</p>
                    <p style={{ fontWeight: 600 }}>{report.tajweed_score}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attendance</p>
                    <p style={{ fontWeight: 600 }}>{report.attendance_percentage}%</p>
                  </div>
                </div>
                {report.teacher_comments && (
                  <div style={{
                    padding: 'var(--spacing-sm)',
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Comments:</p>
                    <p style={{ fontSize: '0.875rem' }}>{report.teacher_comments}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              No progress reports available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
