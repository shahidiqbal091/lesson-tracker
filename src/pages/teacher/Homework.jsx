import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus } from 'lucide-react';

export const TeacherHomework = () => {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    class_id: '',
    title: '',
    description: '',
    due_date: '',
    max_score: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!teacher) return;

      const [hwRes, classesRes] = await Promise.all([
        supabase
          .from('homework')
          .select(`
            *,
            classes (class_name),
            homework_submissions (id, status)
          `)
          .eq('teacher_id', teacher.id)
          .order('assigned_date', { ascending: false }),
        supabase
          .from('classes')
          .select('id, class_name')
          .eq('teacher_id', teacher.id)
          .eq('is_active', true),
      ]);

      setHomework(hwRes.data || []);
      setClasses(classesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const { error } = await supabase.from('homework').insert([{
        ...formData,
        teacher_id: teacher.id,
      }]);

      if (error) throw error;

      setShowForm(false);
      setFormData({ class_id: '', title: '', description: '', due_date: '', max_score: 100 });
      fetchData();
    } catch (error) {
      console.error('Error creating homework:', error);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Homework Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={18} />
          Create Homework
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
              <div>
                <label className="label">Class</label>
                <select className="select" value={formData.class_id} onChange={(e) => setFormData({ ...formData, class_id: e.target.value })} required>
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input type="text" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input type="date" className="input" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} required />
              </div>
              <div>
                <label className="label">Max Score</label>
                <input type="number" className="input" value={formData.max_score} onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) })} required />
              </div>
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="label">Description</label>
              <textarea className="textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Create Homework</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Class</th>
              <th>Due Date</th>
              <th>Submissions</th>
              <th>Max Score</th>
            </tr>
          </thead>
          <tbody>
            {homework.length > 0 ? (
              homework.map((hw) => (
                <tr key={hw.id}>
                  <td style={{ fontWeight: 600 }}>{hw.title}</td>
                  <td>{hw.classes?.class_name}</td>
                  <td>{new Date(hw.due_date).toLocaleDateString()}</td>
                  <td>
                    <span className="badge badge-info">
                      {hw.homework_submissions?.filter((s) => s.status === 'graded').length || 0} graded / {hw.homework_submissions?.length || 0} total
                    </span>
                  </td>
                  <td>{hw.max_score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No homework created yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
