import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const TeacherAttendance = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

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
        .select('id, class_name')
        .eq('teacher_id', teacher.id)
        .eq('is_active', true);

      setClasses(data || []);
      if (data && data.length > 0) setSelectedClass(data[0].id);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await supabase
        .from('enrollments')
        .select(`
          *,
          students (
            id,
            profiles!students_user_id_fkey (full_name)
          )
        `)
        .eq('class_id', selectedClass)
        .eq('status', 'active');

      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      const attendanceMap = {};
      data?.forEach((record) => {
        attendanceMap[record.student_id] = record.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('class_id', selectedClass)
        .eq('student_id', studentId)
        .eq('date', selectedDate)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('attendance')
          .update({ status })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('attendance')
          .insert([{
            class_id: selectedClass,
            student_id: studentId,
            date: selectedDate,
            status,
          }]);
      }

      setAttendance({ ...attendance, [studentId]: status });
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xl)' }}>Attendance Tracking</h1>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
          <div>
            <label className="label">Select Class</label>
            <select className="select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Select Date</label>
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Mark Attendance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td style={{ fontWeight: 600 }}>{enrollment.students?.profiles?.full_name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => markAttendance(enrollment.student_id, 'present')}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(enrollment.student_id, 'absent')}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => markAttendance(enrollment.student_id, 'late')}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Late
                      </button>
                    </div>
                  </td>
                  <td>
                    {attendance[enrollment.student_id] === 'present' && <span className="badge badge-success">Present</span>}
                    {attendance[enrollment.student_id] === 'absent' && <span className="badge badge-error">Absent</span>}
                    {attendance[enrollment.student_id] === 'late' && <span className="badge badge-warning">Late</span>}
                    {!attendance[enrollment.student_id] && <span className="badge">Not Marked</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
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
