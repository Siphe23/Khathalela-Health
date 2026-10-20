import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingScreen from './LoadingScreen';

// Wraps pages that need a signed-in user (like the dashboard).
function ProtectedRoute({ children }) {
  const { isAuthenticated, authInitialized } = useSelector((state) => state.auth);

  // 1. Firebase has not answered yet: wait. Redirecting now would send a
  //    signed-in person to the login page every time they refresh.
  if (!authInitialized) return <LoadingScreen />;

  // 2. Answered, and nobody is signed in: go to login.
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // 3. Signed in: show the page.
  return children;
}

export default ProtectedRoute;
