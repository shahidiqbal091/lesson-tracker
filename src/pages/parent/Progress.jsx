import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const ParentProgress = () => {
  const { user } = useAuth();
  const [childrenProgress, setChildrenProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const { data: relations } = await supabase
        .from('parent_student_relation')
        .select('student_id')
        .eq('parent_id', user.id);

      const studentIds = relations?.map((r) => r.student_id) || [];

      const progressData = await Promise.all(
        studentIds.map(async (studentId) => {
          const [studentRes, reportsRes, attendanceRes] = await Promise.all([
            supabase
              .from('students')
              .select('*, profiles!students_user_id_fkey (full_name)')
              .eq('id', studentId)
              .maybeSingle(),
            supabase
              .from('progress_reports')
              .select(`
                *,
                teachers (
                  profiles!teachers_user_id_fkey (full_name)
                )
              `)
              .eq('student_id', studentId)
              .order('report_date', { ascending: false })
              .limit(3),
            supabase
              .from('attendance')
              .select('status')
              .eq('student_id', studentId),
          ]);

          const attendanceRate = attendanceRes.data?.length
            ? (attendanceRes.data.filter((a) => a.status === 'present').length / attendanceRes.data.length) * 100
            : 0;

          return {
            student: studentRes.data,
            reports: reportsRes.data || [],
            attendanceRate: attendanceRate.toFixed(1),
          };
        })
      );

      setChildrenProgress(progressData);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xl)' }}>
        Children's Progress
      </h1>

      <div style={{ display: 'grid', gap: 'var(--spacing-xl)' }}>
        {childrenProgress.length > 0 ? (
          childrenProgress.map((data, index) => (
            <div key={index} className="card">
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {data.student?.profiles?.full_name}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-primary">{data.student?.level}</span>
                  <span className="badge badge-info">Attendance: {data.attendanceRate}%</span>
                </div>
              </div>

              {data.reports.length > 0 ? (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                    Recent Progress Reports
                  </h4>
                  <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    {data.reports.map((report) => (
                      <div key={report.id} style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--surface-hover)',
                        borderRadius: 'var(--radius-md)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                          <div>
                            <p style={{ fontWeight: 600 }}>
                              {new Date(report.report_date).toLocaleDateString()}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              Teacher: {report.teachers?.profiles?.full_name}
                            </p>
                          </div>
                          <span className="badge badge-primary">{report.overall_performance}</span>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: 'var(--spacing-sm)',
                          marginBottom: 'var(--spacing-md)',
                        }}>
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
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                              Comments:
                            </p>
                            <p style={{ fontSize: '0.875rem' }}>{report.teacher_comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  No progress reports available
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No children linked to your account</p>
          </div>
        )}
      </div>
    </div>
  );
};
