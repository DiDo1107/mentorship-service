import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

import HRDashboard from './pages/hr/HRDashboard';
import PairsPage from './pages/hr/PairsPage';
import CreatePairPage from './pages/hr/CreatePairPage';

import MentorDashboard from './pages/mentor/MentorDashboard';
import MenteePage from './pages/mentor/MenteePage';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyTasksPage from './pages/employee/MyTasksPage';

import FeedbackPage from './pages/FeedbackPage';
import PairDetailPage from './pages/PairDetailPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/hr/UsersPage';

function RoleRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'hr') return <Navigate to="/hr/dashboard" replace />;
  if (user.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<RoleRedirect />} />

        {/* HR routes */}
        <Route path="hr">
          <Route
            path="dashboard"
            element={<PrivateRoute roles={['hr']}><HRDashboard /></PrivateRoute>}
          />
          <Route
            path="pairs"
            element={<PrivateRoute roles={['hr']}><PairsPage /></PrivateRoute>}
          />
          <Route
            path="pairs/create"
            element={<PrivateRoute roles={['hr']}><CreatePairPage /></PrivateRoute>}
          />
          <Route
            path="users"
            element={<PrivateRoute roles={['hr']}><UsersPage /></PrivateRoute>}
          />
        </Route>

        {/* Mentor routes */}
        <Route path="mentor">
          <Route
            path="dashboard"
            element={<PrivateRoute roles={['mentor']}><MentorDashboard /></PrivateRoute>}
          />
          <Route
            path="pairs/:id"
            element={<PrivateRoute roles={['mentor']}><MenteePage /></PrivateRoute>}
          />
        </Route>

        {/* Employee routes */}
        <Route path="employee">
          <Route
            path="dashboard"
            element={<PrivateRoute roles={['employee']}><EmployeeDashboard /></PrivateRoute>}
          />
          <Route
            path="tasks"
            element={<PrivateRoute roles={['employee']}><MyTasksPage /></PrivateRoute>}
          />
        </Route>

        {/* Shared routes */}
        <Route path="profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="pairs/:id" element={<PrivateRoute><PairDetailPage /></PrivateRoute>} />
        <Route
          path="pairs/:id/feedback"
          element={<PrivateRoute roles={['mentor', 'employee']}><FeedbackPage /></PrivateRoute>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
