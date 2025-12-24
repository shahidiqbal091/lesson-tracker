import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Video, Upload } from 'lucide-react';

export const TeacherClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const fetchClasses = async () => {
    if (!user) return;

    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!teacher) return;

      const { data } = await supabase
        .from('classes')
        .select(`
          *,
          courses (name, level),
          enrollments (
            id,
            students (
              profiles!students_user_id_fkey (full_name)
            )
          )
        `)
        .eq('teacher_id', teacher.id);

      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xl)' }}>My Classes</h1>

      <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
        {classes.map((cls) => (
          <div key={cls.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {cls.class_name}
                </h3>
                {cls.courses && (
                  <span className="badge badge-primary">{cls.courses.level}</span>
                )}
              </div>
              {cls.meeting_link && (
                <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <Video size={18} />
                  Join Class
                </a>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Schedule</p>
                <p style={{ fontWeight: 600 }}>{cls.schedule_day} at {cls.schedule_time}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Duration</p>
                <p style={{ fontWeight: 600 }}>{cls.duration_minutes} minutes</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enrolled Students</p>
                <p style={{ fontWeight: 600 }}>{cls.enrollments?.length || 0} / {cls.max_students}</p>
              </div>
            </div>

            {cls.enrollments && cls.enrollments.length > 0 && (
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Students:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {cls.enrollments.map((enrollment) => (
                    <span key={enrollment.id} className="badge badge-info">
                      {enrollment.students?.profiles?.full_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {classes.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No classes assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
