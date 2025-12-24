import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Mail, Lock } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Redirect based on role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileData) {
        navigate(`/${profileData.role}`);
      }
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
        maxWidth: '400px',
        width: '100%',
        position: 'relative',
      }}>
        <div className="islamic-pattern" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'var(--radius-lg)',
          zIndex: 0,
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 'var(--spacing-xl)',
          }}>
            <div style={{
              textAlign: 'center',
              color: 'var(--primary)',
            }}>
              <BookOpen size={48} style={{ marginBottom: 'var(--spacing-sm)' }} />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Quran LMS</h1>
              <p className="arabic-text" style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginTop: 'var(--spacing-xs)',
              }}>
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
            </div>
          </div>

          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: 'var(--spacing-md)',
            textAlign: 'center',
          }}>
            Welcome Back
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
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label className="label">
                <Mail size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Email
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="label">
                <Lock size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Password
              </label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: 'var(--spacing-md)' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 'var(--spacing-lg)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
