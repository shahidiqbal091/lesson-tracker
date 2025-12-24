import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const ParentFees = () => {
  const { user } = useAuth();
  const [feeRecords, setFeeRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeesData();
  }, [user]);

  const fetchFeesData = async () => {
    if (!user) return;

    try {
      const { data: relations } = await supabase
        .from('parent_student_relation')
        .select('student_id')
        .eq('parent_id', user.id);

      const studentIds = relations?.map((r) => r.student_id) || [];

      const [feesRes, paymentsRes] = await Promise.all([
        supabase
          .from('fee_records')
          .select(`
            *,
            students (
              profiles!students_user_id_fkey (full_name)
            )
          `)
          .in('student_id', studentIds)
          .order('due_date', { ascending: false }),
        supabase
          .from('payments')
          .select(`
            *,
            students (
              profiles!students_user_id_fkey (full_name)
            )
          `)
          .in('student_id', studentIds)
          .order('payment_date', { ascending: false }),
      ]);

      setFeeRecords(feesRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (error) {
      console.error('Error fetching fees data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>;
  }

  const totalPending = feeRecords
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + parseFloat(f.amount), 0);

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xl)' }}>Fees & Payments</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)',
      }}>
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 'var(--spacing-md)' }}>
            Total Paid
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
            ${totalPaid.toFixed(2)}
          </p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 'var(--spacing-md)' }}>
            Pending Amount
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
            ${totalPending.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
          Fee Records
        </h3>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Amount</th>
              <th>Frequency</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {feeRecords.length > 0 ? (
              feeRecords.map((fee) => (
                <tr key={fee.id}>
                  <td style={{ fontWeight: 600 }}>{fee.students?.profiles?.full_name}</td>
                  <td>${parseFloat(fee.amount).toFixed(2)}</td>
                  <td style={{ textTransform: 'capitalize' }}>{fee.frequency.replace('_', ' ')}</td>
                  <td>{new Date(fee.due_date).toLocaleDateString()}</td>
                  <td>
                    {fee.status === 'paid' && <span className="badge badge-success">Paid</span>}
                    {fee.status === 'pending' && <span className="badge badge-warning">Pending</span>}
                    {fee.status === 'overdue' && <span className="badge badge-error">Overdue</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No fee records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
          Payment History
        </h3>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Amount</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>{payment.students?.profiles?.full_name}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                    ${parseFloat(payment.amount).toFixed(2)}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {payment.payment_method.replace('_', ' ')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No payment history
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
