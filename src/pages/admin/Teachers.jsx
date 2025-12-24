import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    experience_years: 0,
    hourly_rate: 0,
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          *,
          profiles!teachers_user_id_fkey (full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (teacher) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ is_active: !teacher.is_active })
        .eq('id', teacher.id);

      if (error) throw error;
      fetchTeachers();
    } catch (error) {
      console.error('Error updating teacher:', error);
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
            Teachers Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage teacher profiles and assignments
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Rate/Hour</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td style={{ fontWeight: 600 }}>{teacher.profiles?.full_name}</td>
                    <td>{teacher.profiles?.email}</td>
                    <td>{teacher.profiles?.phone || '-'}</td>
                    <td>{teacher.qualification || '-'}</td>
                    <td>{teacher.experience_years} years</td>
                    <td>${teacher.hourly_rate}</td>
                    <td>
                      {teacher.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-error">Inactive</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleStatus(teacher)}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        {teacher.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No teachers found
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
