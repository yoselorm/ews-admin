import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardShell from './components/layout/DashboardShell';
import Overview from './pages/dashboard/Overview';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLogin from './pages/Login';
import AdminForgotPassword from './pages/ForgotPassword';
import AdminResetPassword from './pages/ResetPassword';
import WeatherData from './pages/dashboard/WeatherData';
import Thresholds from './pages/dashboard/Thresholds';
import AuditLogs from './pages/dashboard/AuditLogs';
import Precautions from './pages/dashboard/Precautions';
import SafetyGuides from './pages/dashboard/SafetyGuide';
import SafetyCategories from './pages/dashboard/SafetyCategories';
import GeographyPage from './pages/dashboard/Geography';
import UserManagement from './pages/dashboard/Users';
import AlertsManagement from './pages/dashboard/Alert';
import LanguageManagement from './pages/dashboard/Languages';
import AudioTranslationManagement from './pages/dashboard/AudioTranslation';
import AdminManagement from './pages/dashboard/AdminManagement';

function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<AdminLogin />} />
      <Route path="/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/reset-password" element={<AdminResetPassword />} />
      {/* --- Private Dashboard Routes --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        }
      >

        <Route index element={<Overview />} />
        {/* Other nested pages */}
        <Route path="weather-data" element={<WeatherData />} />
        <Route path="thresholds" element={<Thresholds />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="precautions" element={<Precautions />} />
        <Route path="safety-guides" element={<SafetyGuides />} />
        <Route path="safety-categories" element={<SafetyCategories />} />
        <Route path="geography" element={<GeographyPage />} />
        <Route path="users" element={<UserManagement />}  /> 
        <Route path="alerts" element={<AlertsManagement />}  />
        <Route path="languages" element={<LanguageManagement />}  />
        <Route path="audio-translations" element={<AudioTranslationManagement />}  />
        <Route path="admin" element={<AdminManagement />}  />

      </Route>

      {/* Catch-all: If no route matches, go to dashboard */}
      {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
    </Routes>
  );
}

export default App;