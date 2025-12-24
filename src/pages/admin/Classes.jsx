import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Video, Users } from 'lucide-react';

export const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course_id: '',
    teacher_id: '',
    class_name: '',
    schedule_day: '',
    schedule_time: '',
    duration_minutes: 60,
    meeting_link: '',
    max_students: 10,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes, coursesRes] = await Promise.all([
        supabase
          .from('classes')
          .select(`
            *,
            teachers (
              id,
              profiles!teachers_user_id_fkey (full_name)
            ),
            courses (name, level)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('teachers')
          .select('id, profiles!teachers_user_id_fkey (full_name)')
          .eq('is_active', true),
        supabase.from('courses').select('*'),
      ]);

      setClasses(classesRes.data || []);
      setTeachers(teachersRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('classes').insert([formData]);

      if (error) throw error;

      setShowForm(false);
      setFormData({
        course_id: '',
        teacher_id: '',
        class_name: '',
        schedule_day: '',
        schedule_time: '',
        duration_minutes: 60,
        meeting_link: '',
        max_students: 10,
      });
      fetchData();
    } catch (error) {
      console.error('Error creating class:', error);
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-xl)',
      }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
            Classes Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Schedule and manage Quran classes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Class
        </button>
      </div>

      {/* Add Class Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Create New Class
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-md)',
            }}>
              <div>
                <label className="label">Class Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.class_name}
                  onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Course</label>
                <select
                  className="select"
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Teacher</label>
                <select
                  className="select"
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.profiles?.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Day</label>
                <select
                  className="select"
                  value={formData.schedule_day}
                  onChange={(e) => setFormData({ ...formData, schedule_day: e.target.value })}
                  required
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <div>
                <label className="label">Time</label>
                <input
                  type="time"
                  className="input"
                  value={formData.schedule_time}
                  onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Duration (minutes)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="label">Max Students</label>
                <input
                  type="number"
                  className="input"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="label">Meeting Link (Zoom/Meet)</label>
                <input
                  type="url"
                  className="input"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <button type="submit" className="btn btn-primary">
                Create Class
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes List */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Course/Level</th>
                <th>Teacher</th>
                <th>Schedule</th>
                <th>Duration</th>
                <th>Capacity</th>
                <th>Meeting Link</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <tr key={cls.id}>
                    <td style={{ fontWeight: 600 }}>{cls.class_name}</td>
                    <td>
                      {cls.courses ? (
                        <>
                          {cls.courses.name}
                          <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>
                            {cls.courses.level}
                          </span>
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{cls.teachers?.profiles?.full_name}</td>
                    <td>
                      {cls.schedule_day} {cls.schedule_time}
                    </td>
                    <td>{cls.duration_minutes} min</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={14} />
                        {cls.max_students}
                      </span>
                    </td>
                    <td>
                      {cls.meeting_link ? (
                        <a
                          href={cls.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <Video size={14} />
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {cls.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-error">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No classes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
