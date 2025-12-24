import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Send } from 'lucide-react';

export const StudentHomework = () => {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [submissionText, setSubmissionText] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomework();
  }, [user]);

  const fetchHomework = async () => {
    if (!user) return;

    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!student) return;

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('class_id')
        .eq('student_id', student.id)
        .eq('status', 'active');

      const classIds = enrollments?.map((e) => e.class_id) || [];

      const { data: hw } = await supabase
        .from('homework')
        .select(`
          *,
          classes (class_name)
        `)
        .in('class_id', classIds)
        .order('due_date', { ascending: true });

      const { data: subs } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('student_id', student.id);

      const subsMap = {};
      subs?.forEach((sub) => {
        subsMap[sub.homework_id] = sub;
      });

      setHomework(hw || []);
      setSubmissions(subsMap);
    } catch (error) {
      console.error('Error fetching homework:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitHomework = async (homeworkId) => {
    try {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const { error } = await supabase
        .from('homework_submissions')
        .insert([{
          homework_id: homeworkId,
          student_id: student.id,
          submission_text: submissionText[homeworkId] || '',
          status: 'pending',
        }]);

      if (error) throw error;

      setSubmissionText({ ...submissionText, [homeworkId]: '' });
      fetchHomework();
    } catch (error) {
      console.error('Error submitting homework:', error);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>;
  }

  const today = new Date();
  const pendingHomework = homework.filter((hw) => !submissions[hw.id] && new Date(hw.due_date) >= today);
  const submittedHomework = homework.filter((hw) => submissions[hw.id]);

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xl)' }}>Homework</h1>

      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>Pending</h2>
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {pendingHomework.length > 0 ? (
            pendingHomework.map((hw) => (
              <div key={hw.id} className="card">
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{hw.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{hw.classes?.class_name}</p>
                </div>
                <p style={{ marginBottom: 'var(--spacing-md)' }}>{hw.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                  <span className="badge badge-warning">
                    Due: {new Date(hw.due_date).toLocaleDateString()}
                  </span>
                  <span className="badge badge-info">Max Score: {hw.max_score}</span>
                </div>
                <textarea
                  className="textarea"
                  placeholder="Enter your submission..."
                  value={submissionText[hw.id] || ''}
                  onChange={(e) => setSubmissionText({ ...submissionText, [hw.id]: e.target.value })}
                  style={{ marginBottom: 'var(--spacing-sm)' }}
                />
                <button onClick={() => submitHomework(hw.id)} className="btn btn-primary">
                  <Send size={16} />
                  Submit
                </button>
              </div>
            ))
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No pending homework</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>Submitted</h2>
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {submittedHomework.length > 0 ? (
            submittedHomework.map((hw) => {
              const submission = submissions[hw.id];
              return (
                <div key={hw.id} className="card">
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{hw.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{hw.classes?.class_name}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                    {submission.status === 'graded' ? (
                      <>
                        <span className="badge badge-success">Graded</span>
                        <span className="badge badge-info">Score: {submission.score}/{hw.max_score}</span>
                      </>
                    ) : (
                      <span className="badge badge-warning">Pending Review</span>
                    )}
                  </div>
                  {submission.feedback && (
                    <div style={{
                      padding: 'var(--spacing-md)',
                      background: 'var(--surface-hover)',
                      borderRadius: 'var(--radius-md)',
                    }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Teacher's Feedback:</p>
                      <p style={{ fontSize: '0.875rem' }}>{submission.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No submitted homework</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
