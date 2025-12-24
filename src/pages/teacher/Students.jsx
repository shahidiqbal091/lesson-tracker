import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const TeacherStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    if (!user) return;

    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!teacher) return;

      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', teacher.id);

      const classIds = classes?.map((c) => c.id) || [];

      const { data } = await supabase
        .from('enrollments')
        .select(`
          *,
          students (
            *,
            profiles!students_user_id_fkey (full_name, email, phone)
          ),
          classes (class_name)
        `)
        .in('class_id', classIds)
        .eq('status', 'active');

      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xl)' }}>My Students</h1>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>Level</th>
              <th>Class</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td style={{ fontWeight: 600 }}>{enrollment.students?.profiles?.full_name}</td>
                  <td>{enrollment.students?.profiles?.email}</td>
                  <td><span className="badge badge-primary">{enrollment.students?.level}</span></td>
                  <td>{enrollment.classes?.class_name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{enrollment.students?.gender}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No students enrolled
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
