import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminTeachers } from './pages/admin/Teachers';
import { AdminStudents } from './pages/admin/Students';
import { AdminClasses } from './pages/admin/Classes';
import { AdminFees } from './pages/admin/Fees';
import { AdminReports } from './pages/admin/Reports';
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { TeacherClasses } from './pages/teacher/Classes';
import { TeacherStudents } from './pages/teacher/Students';
import { TeacherHomework } from './pages/teacher/Homework';
import { TeacherAttendance } from './pages/teacher/Attendance';
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentClasses } from './pages/student/Classes';
import { StudentHomework } from './pages/student/Homework';
import { StudentProgress } from './pages/student/Progress';
import { ParentDashboard } from './pages/parent/Dashboard';
import { ParentChildren } from './pages/parent/Children';
import { ParentFees } from './pages/parent/Fees';
import { ParentProgress } from './pages/parent/Progress';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/teachers" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminTeachers /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminStudents /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/classes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminClasses /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/fees" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminFees /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><AdminReports /></Layout>
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout><TeacherDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/classes" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout><TeacherClasses /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/students" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout><TeacherStudents /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/homework" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout><TeacherHomework /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/teacher/attendance" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Layout><TeacherAttendance /></Layout>
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/classes" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentClasses /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/homework" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentHomework /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/student/progress" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Layout><StudentProgress /></Layout>
            </ProtectedRoute>
          } />

          {/* Parent Routes */}
          <Route path="/parent" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout><ParentDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/parent/children" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout><ParentChildren /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/parent/fees" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout><ParentFees /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/parent/progress" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <Layout><ParentProgress /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>Unauthorized</h1>
              <p>You don't have permission to access this page.</p>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
