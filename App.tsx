
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import PageLoader from './components/common/PageLoader';
import { UserRole } from './types';

// Lazy load all views
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const StudentDetail = lazy(() => import('./pages/StudentDetail'));
const Teachers = lazy(() => import('./pages/Teachers'));
const Staff = lazy(() => import('./pages/Staff'));
const Guardians = lazy(() => import('./pages/Guardians'));
const Classes = lazy(() => import('./pages/Classes'));
const Subjects = lazy(() => import('./pages/Subjects'));
const SubjectAssignments = lazy(() => import('./pages/SubjectAssignments'));
const Sections = lazy(() => import('./pages/Sections'));
const AcademicSessions = lazy(() => import('./pages/AcademicSessions'));
const Enrollments = lazy(() => import('./pages/Enrollments'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Assignments = lazy(() => import('./pages/Assignments'));
const Submissions = lazy(() => import('./pages/Submissions'));
const Attachments = lazy(() => import('./pages/Attachments'));
const Assessments = lazy(() => import('./pages/Assessments'));
const GradingScales = lazy(() => import('./pages/GradingScales'));
const Results = lazy(() => import('./pages/Results'));
const LessonNotes = lazy(() => import('./pages/LessonNotes'));
const Timetables = lazy(() => import('./pages/Timetables'));
const Library = lazy(() => import('./pages/Library'));
const Promotions = lazy(() => import('./pages/Promotions'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Files = lazy(() => import('./pages/Files'));
const GuardianPortal = lazy(() => import('./pages/GuardianPortal'));
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const GlobalUsers = lazy(() => import('./pages/GlobalUsers'));
const Plans = lazy(() => import('./pages/Plans'));
const SystemJobs = lazy(() => import('./pages/SystemJobs'));
const Reports = lazy(() => import('./pages/Reports'));
const Finance = lazy(() => import('./pages/Finance'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Fees = lazy(() => import('./pages/Fees'));
const FeeStructures = lazy(() => import('./pages/FeeStructures'));
const Payments = lazy(() => import('./pages/Payments'));
const Communication = lazy(() => import('./pages/Communication'));
const RolesPermissions = lazy(() => import('./pages/RolesPermissions'));
const Settings = lazy(() => import('./pages/Settings'));
const Noticeboard = lazy(() => import('./pages/Noticeboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: UserRole[] }> = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="students/:id" element={<StudentDetail />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="staff" element={<Staff />} />
              <Route path="guardians" element={<Guardians />} />
              <Route path="classes" element={<Classes />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="subject-assignments" element={<SubjectAssignments />} />
              <Route path="sections" element={<Sections />} />
              <Route path="academic-sessions" element={<AcademicSessions />} />
              <Route path="enrollments" element={<Enrollments />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="assignments/submissions" element={<Submissions />} />
              <Route path="attachments" element={<Attachments />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="grading-scales" element={<GradingScales />} />
              <Route path="results" element={<Results />} />
              <Route path="lesson-notes" element={<LessonNotes />} />
              <Route path="timetables" element={<Timetables />} />
              <Route path="library" element={<Library />} />
              <Route path="promotions" element={<Promotions />} />
              <Route path="noticeboard" element={<Noticeboard />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="files" element={<Files />} />
              <Route path="profile" element={<Profile />} />
              <Route path="guardian-portal" element={<ProtectedRoute roles={[UserRole.GUARDIAN]}><GuardianPortal /></ProtectedRoute>} />
              <Route path="super-admin" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><SuperAdmin /></ProtectedRoute>} />
              <Route path="global-users" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><GlobalUsers /></ProtectedRoute>} />
              <Route path="plans" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><Plans /></ProtectedRoute>} />
              <Route path="system-jobs" element={<ProtectedRoute roles={[UserRole.SUPER_ADMIN]}><SystemJobs /></ProtectedRoute>} />
              <Route path="reports" element={<Reports />} />
              <Route path="finance" element={<Finance />} />
              <Route path="fees" element={<Fees />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="fee-structures" element={<FeeStructures />} />
              <Route path="payments" element={<Payments />} />
              <Route path="communication" element={<Communication />} />
              <Route path="roles-permissions" element={<RolesPermissions />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
