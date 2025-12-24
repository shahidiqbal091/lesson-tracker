import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';

export const AdminReports = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      // Fetch attendance statistics
      const { data: attendance } = await supabase
        .from('attendance')
        .select('status, date');

      // Process attendance by month
      const attendanceByMonth = {};
      attendance?.forEach((record) => {
        const month = new Date(record.date).toLocaleString('default', { month: 'short' });
        if (!attendanceByMonth[month]) {
          attendanceByMonth[month] = { month, present: 0, absent: 0, late: 0 };
        }
        if (record.status === 'present') attendanceByMonth[month].present++;
        if (record.status === 'absent') attendanceByMonth[month].absent++;
        if (record.status === 'late') attendanceByMonth[month].late++;
      });

      setAttendanceData(Object.values(attendanceByMonth));

      // Fetch enrollment trends
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('enrollment_date, status');

      const enrollmentByMonth = {};
      enrollments?.forEach((record) => {
        const month = new Date(record.enrollment_date).toLocaleString('default', { month: 'short' });
        if (!enrollmentByMonth[month]) {
          enrollmentByMonth[month] = { month, enrollments: 0 };
        }
        if (record.status === 'active') enrollmentByMonth[month].enrollments++;
      });

      setEnrollmentTrends(Object.values(enrollmentByMonth));

      // Fetch performance data
      const { data: progress } = await supabase
        .from('progress_reports')
        .select('quran_memorization, tajweed_score, attendance_percentage');

      const avgPerformance = {
        memorization: progress?.reduce((sum, p) => sum + p.quran_memorization, 0) / (progress?.length || 1),
        tajweed: progress?.reduce((sum, p) => sum + p.tajweed_score, 0) / (progress?.length || 1),
        attendance: progress?.reduce((sum, p) => sum + p.attendance_percentage, 0) / (progress?.length || 1),
      };

      setPerformanceData([
        { metric: 'Memorization', score: avgPerformance.memorization.toFixed(1) },
        { metric: 'Tajweed', score: avgPerformance.tajweed.toFixed(1) },
        { metric: 'Attendance', score: avgPerformance.attendance.toFixed(1) },
      ]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
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
            Reports & Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            View comprehensive performance reports
          </p>
        </div>
        <button className="btn btn-primary">
          <Download size={18} />
          Export Reports
        </button>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: 'var(--spacing-lg)',
      }}>
        {/* Attendance Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Attendance Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#22c55e" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollment Trends */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Enrollment Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="enrollments" stroke="#1e7e5c" strokeWidth={3} name="New Enrollments" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
            Average Performance Metrics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#c9a961" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
