import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import ChooseRole from './pages/ChooseRole';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Medications from './pages/Medications';
import ScanQR from './pages/ScanQR';
import Profile from './pages/Profile';
import ProfileSection from './pages/ProfileSection';
import Help from './pages/Help';
import Settings from './pages/Settings';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Missed from './pages/Missed';
import FollowUps from './pages/FollowUps';
import Summary from './pages/Summary';
import UrgentHelp from './pages/UrgentHelp';
import Progress from './pages/Progress';
import AdminUsers from './pages/AdminUsers';
import AdminActivity from './pages/AdminActivity';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import FirebaseSetupNotice from './components/FirebaseSetupNotice';
import CareSync from './components/CareSync';
import { isFirebaseConfigured } from './firebase/firebaseConfig';
import { watchAuthState } from './features/auth/authService';
import { authStateChanged } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    const unsubscribe = watchAuthState((user) => dispatch(authStateChanged(user)));
    return unsubscribe;
  }, [dispatch]);

  if (!isFirebaseConfigured) return <FirebaseSetupNotice />;

  return (
    <BrowserRouter>
      <CareSync />
      <Routes>
        {/* Signed-out pages */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Any signed-in person */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:section" element={<ProtectedRoute><ProfileSection /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

        {/* Patients only */}
        <Route path="/appointments" element={<ProtectedRoute role="patient"><Appointments /></ProtectedRoute>} />
        <Route path="/appointments/new" element={<ProtectedRoute role="patient"><BookAppointment /></ProtectedRoute>} />
        <Route path="/medications" element={<ProtectedRoute role="patient"><Medications /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute role="patient"><Progress /></ProtectedRoute>} />
        <Route path="/urgent" element={<ProtectedRoute role="patient"><UrgentHelp /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute role="patient"><ScanQR /></ProtectedRoute>} />

        {/* Healthcare workers only */}
        <Route path="/patients" element={<ProtectedRoute role="worker"><Patients /></ProtectedRoute>} />
        <Route path="/patients/:patientId" element={<ProtectedRoute role="worker"><PatientDetails /></ProtectedRoute>} />
        <Route path="/missed" element={<ProtectedRoute role="worker"><Missed /></ProtectedRoute>} />
        <Route path="/followups" element={<ProtectedRoute role="worker"><FollowUps /></ProtectedRoute>} />
        <Route path="/summary" element={<ProtectedRoute role="worker"><Summary /></ProtectedRoute>} />

        {/* Administrators only */}
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/activity" element={<ProtectedRoute role="admin"><AdminActivity /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
