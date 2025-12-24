import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Mail, Lock, User, Phone } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    // Student specific
    date_of_birth: '',
    gender: '',
    level: 'Qaida',
    // Teacher specific
    qualification: '',
    specialization: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { data, error } = await signUp(formData.email, formData.password, formData);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(`/${formData.role}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
      padding: 'var(--spacing-lg)',
    }}>
      <div className="card" style={{
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 'var(--spacing-xl)',
        }}>
          <div style={{ textAlign: 'center', color: 'var(--primary)' }}>
            <BookOpen size={48} style={{ marginBottom: 'var(--spacing-sm)' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Quran LMS</h1>
          </div>
        </div>

        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: 'var(--spacing-md)',
          textAlign: 'center',
        }}>
          Create an Account
        </h2>

        {error && (
          <div style={{
            padding: 'var(--spacing-md)',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-md)',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="label">I am a</label>
            <select
              name="role"
              className="select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          {/* Common Fields */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="label">
              <User size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              className="input"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="label">
              <Mail size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Email
            </label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="label">
              <Phone size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              className="input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
            />
          </div>

          {/* Student-specific fields */}
          {formData.role === 'student' && (
            <>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  className="input"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">Gender</label>
                <select
                  name="gender"
                  className="select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="label">Current Level</label>
                <select
                  name="level"
                  className="select"
                  value={formData.level}
                  onChange={handleChange}
                  required
                >
                  <option value="Qaida">Qaida</option>
                  <option value="Nazra">Nazra</option>
                  <option value="Hifz">Hifz</option>
                  <option value="Tajweed">Tajweed</option>
                </select>
              </div>
            </>
          )}

          {/* Teacher-specific fields */}
          {formData.role === 'teacher' && (
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="label">Qualification</label>
              <input
                type="text"
                name="qualification"
                className="input"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g., Hafiz, Aalim, Bachelor in Islamic Studies"
                required
              />
            </div>
          )}

          {/* Password Fields */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label className="label">
              <Lock size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Password
            </label>
            <input
              type="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: 'var(--spacing-md)' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--spacing-lg)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
