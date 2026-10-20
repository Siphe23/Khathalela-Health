import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingScreen from './LoadingScreen';

// Wraps pages for signed-OUT people (splash, onboarding, login, register...).
// A signed-in person who opens them is sent straight to the dashboard.
//
// Why there is no redirect loop: ProtectedRoute only redirects when
// isAuthenticated is false, and this one only redirects when it is true.
// Both wait for authInitialized. They can never both fire for the same state.
function PublicOnlyRoute() {
  const { isAuthenticated, authInitialized } = useSelector((state) => state.auth);

  if (!authInitialized) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default PublicOnlyRoute;
