import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children, redirectPath = '/login' }) => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Render children directly since routes in App.js wrap content inside <ProtectedRoute> ... </ProtectedRoute>
  return children;
};

export default ProtectedRoute;
