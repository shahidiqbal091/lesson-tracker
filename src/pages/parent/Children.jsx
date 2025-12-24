import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const ParentChildren = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('parent_student_relation')
        .select(`
          *,
          students (
            *,
            profiles!students_user_id_fkey (full_name, email, phone),
            enrollments (
              id,
              classes (class_name, schedule_day, schedule_time)
            )
          )
        `)
        .eq('parent_id', user.id);

      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xl)' }}>My Children</h1>

      <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
        {children.length > 0 ? (
          children.map((relation) => (
            <div key={relation.id} className="card">
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {relation.students?.profiles?.full_name}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span className="badge badge-primary">{relation.students?.level}</span>
                  <span className="badge" style={{ textTransform: 'capitalize' }}>
                    {relation.students?.gender}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
              }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</p>
                  <p style={{ fontWeight: 600 }}>{relation.students?.profiles?.email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Phone</p>
                  <p style={{ fontWeight: 600 }}>{relation.students?.profiles?.phone || '-'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Date of Birth</p>
                  <p style={{ fontWeight: 600 }}>
                    {relation.students?.date_of_birth
                      ? new Date(relation.students.date_of_birth).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enrollment Date</p>
                  <p style={{ fontWeight: 600 }}>
                    {new Date(relation.students?.enrollment_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {relation.students?.enrollments && relation.students.enrollments.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                    Enrolled Classes
                  </h4>
                  <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                    {relation.students.enrollments.map((enrollment) => (
                      <div key={enrollment.id} style={{
                        padding: 'var(--spacing-sm)',
                        background: 'var(--surface-hover)',
                        borderRadius: 'var(--radius-md)',
                      }}>
                        <p style={{ fontWeight: 600 }}>{enrollment.classes?.class_name}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {enrollment.classes?.schedule_day} at {enrollment.classes?.schedule_time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
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
