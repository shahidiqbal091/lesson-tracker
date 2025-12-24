import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';

export const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, levelFilter, students]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profiles!students_user_id_fkey (full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter((student) =>
        student.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter) {
      filtered = filtered.filter((student) => student.level === levelFilter);
    }

    setFilteredStudents(filtered);
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
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
          Students Management
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          View and manage student profiles
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-md)',
        }}>
          <div>
            <label className="label">Search</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                }}
              />
            </div>
          </div>

          <div>
            <label className="label">Level</label>
            <select
              className="select"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="Qaida">Qaida</option>
              <option value="Nazra">Nazra</option>
              <option value="Hifz">Hifz</option>
              <option value="Tajweed">Tajweed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Level</th>
                <th>Gender</th>
                <th>Enrollment Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 600 }}>{student.profiles?.full_name}</td>
                    <td>{student.profiles?.email}</td>
                    <td>{student.profiles?.phone || '-'}</td>
                    <td>
                      <span className="badge badge-primary">{student.level}</span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{student.gender}</td>
                    <td>{new Date(student.enrollment_date).toLocaleDateString()}</td>
                    <td>
                      {student.is_active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-error">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No students found
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
