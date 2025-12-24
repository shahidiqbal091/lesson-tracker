import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, CheckCircle, Plus } from 'lucide-react';

export const AdminFees = () => {
  const [feeRecords, setFeeRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fees');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    fee_record_id: '',
    student_id: '',
    amount: 0,
    payment_method: 'cash',
    transaction_id: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feesRes, paymentsRes, studentsRes] = await Promise.all([
        supabase
          .from('fee_records')
          .select(`
            *,
            students (
              id,
              profiles!students_user_id_fkey (full_name)
            )
          `)
          .order('due_date', { ascending: true }),
        supabase
          .from('payments')
          .select(`
            *,
            students (
              id,
              profiles!students_user_id_fkey (full_name)
            )
          `)
          .order('payment_date', { ascending: false }),
        supabase
          .from('students')
          .select('id, profiles!students_user_id_fkey (full_name)')
          .eq('is_active', true),
      ]);

      setFeeRecords(feesRes.data || []);
      setPayments(paymentsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([paymentData]);

      if (paymentError) throw paymentError;

      if (paymentData.fee_record_id) {
        await supabase
          .from('fee_records')
          .update({ status: 'paid' })
          .eq('id', paymentData.fee_record_id);
      }

      setShowPaymentForm(false);
      setPaymentData({
        fee_record_id: '',
        student_id: '',
        amount: 0,
        payment_method: 'cash',
        transaction_id: '',
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const pendingAmount = feeRecords
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + parseFloat(f.amount), 0);

  const collectedAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
          Fee Management
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Track student fees and payments
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)',
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Collected
            </h3>
            <CheckCircle size={24} style={{ color: 'var(--success)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
            ${collectedAmount.toFixed(2)}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Pending Amount
            </h3>
            <DollarSign size={24} style={{ color: 'var(--warning)' }} />
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
            ${pendingAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
        borderBottom: '2px solid var(--border)',
      }}>
        <button
          onClick={() => setActiveTab('fees')}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'fees' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'fees' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          Fee Records
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'payments' ? '2px solid var(--primary)' : 'none',
            color: activeTab === 'payments' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          Payment History
        </button>
      </div>

      {/* Fee Records Tab */}
      {activeTab === 'fees' && (
        <div className="card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-lg)',
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Fee Records</h3>
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              Record Payment
            </button>
          </div>

          {showPaymentForm && (
            <div style={{
              padding: 'var(--spacing-lg)',
              background: 'var(--surface-hover)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)',
            }}>
              <form onSubmit={handlePayment}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-md)',
                }}>
                  <div>
                    <label className="label">Student</label>
                    <select
                      className="select"
                      value={paymentData.student_id}
                      onChange={(e) => setPaymentData({ ...paymentData, student_id: e.target.value })}
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.profiles?.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Payment Method</label>
                    <select
                      className="select"
                      value={paymentData.payment_method}
                      onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Transaction ID</label>
                    <input
                      type="text"
                      className="input"
                      value={paymentData.transaction_id}
                      onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <button type="submit" className="btn btn-primary">
                    Record Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
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
                      No fee records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Payment History
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Transaction ID</th>
                  <th>Notes</th>
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
                      <td>{payment.transaction_id || '-'}</td>
                      <td>{payment.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
