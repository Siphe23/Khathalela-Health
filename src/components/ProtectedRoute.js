import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingScreen from './LoadingScreen';

// Wraps pages that need a signed-in user.
// Optional `role`: only people with that role may open the page.
function ProtectedRoute({ children, role }) {
  const { isAuthenticated, authInitialized, user } = useSelector((state) => state.auth);

  // 1. Firebase has not answered yet: wait.
  if (!authInitialized) return <LoadingScreen />;

  // 2. Nobody is signed in: go to login.
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // 3. Signed in but the wrong role for this page (e.g. a patient opening
  //    a worker page): send them to their own dashboard. /dashboard has no
  //    role rule, so this cannot loop.
  if (role && (!user || user.role !== role)) return <Navigate to="/dashboard" replace />;

  return children;
}

export default ProtectedRoute;
