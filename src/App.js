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
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import FirebaseSetupNotice from './components/FirebaseSetupNotice';
import { isFirebaseConfigured } from './firebase/firebaseConfig';
import { watchAuthState } from './features/auth/authService';
import { authStateChanged } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();

  // Start listening to Firebase once, when the app opens.
  // The function we return is the cleanup: it stops listening when App unmounts.
  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    const unsubscribe = watchAuthState((user) => dispatch(authStateChanged(user)));
    return unsubscribe;
  }, [dispatch]);

  if (!isFirebaseConfigured) return <FirebaseSetupNotice />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Pages for signed-out people */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Page for signed-in people */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
