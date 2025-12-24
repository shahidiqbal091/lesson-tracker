import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Video, Clock } from 'lucide-react';

export const StudentClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [recordedLessons, setRecordedLessons] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const fetchClasses = async () => {
    if (!user) return;

    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!student) return;

      const { data } = await supabase
        .from('enrollments')
        .select(`
          *,
          classes (
            *,
            courses (name, level),
            teachers (
              profiles!teachers_user_id_fkey (full_name)
            )
          )
        `)
        .eq('student_id', student.id)
        .eq('status', 'active');

      setClasses(data || []);

      const classIds = data?.map((e) => e.classes.id) || [];
      if (classIds.length > 0) {
        const { data: lessons } = await supabase
          .from('recorded_lessons')
          .select('*')
          .in('class_id', classIds)
          .order('recorded_date', { ascending: false });

        const lessonsMap = {};
        lessons?.forEach((lesson) => {
          if (!lessonsMap[lesson.class_id]) {
            lessonsMap[lesson.class_id] = [];
          }
          lessonsMap[lesson.class_id].push(lesson);
        });
        setRecordedLessons(lessonsMap);
      }
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
        {classes.map((enrollment) => (
          <div key={enrollment.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {enrollment.classes?.class_name}
                </h3>
                {enrollment.classes?.courses && (
                  <span className="badge badge-primary">{enrollment.classes.courses.level}</span>
                )}
              </div>
              {enrollment.classes?.meeting_link && (
                <a href={enrollment.classes.meeting_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <Video size={18} />
                  Join Class
                </a>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Teacher</p>
                <p style={{ fontWeight: 600 }}>{enrollment.classes?.teachers?.profiles?.full_name}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Schedule</p>
                <p style={{ fontWeight: 600 }}>
                  <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  {enrollment.classes?.schedule_day} at {enrollment.classes?.schedule_time}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Duration</p>
                <p style={{ fontWeight: 600 }}>{enrollment.classes?.duration_minutes} minutes</p>
              </div>
            </div>

            {recordedLessons[enrollment.classes?.id] && recordedLessons[enrollment.classes.id].length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                  Recorded Lessons
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {recordedLessons[enrollment.classes.id].map((lesson) => (
                    <div key={lesson.id} style={{
                      padding: 'var(--spacing-sm)',
                      background: 'var(--surface-hover)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{lesson.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {new Date(lesson.recorded_date).toLocaleDateString()} • {lesson.duration_minutes} min
                        </p>
                      </div>
                      <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        <Video size={14} />
                        Watch
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {classes.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>You are not enrolled in any classes yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
