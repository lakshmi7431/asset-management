// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const isAuthenticated = !!localStorage.getItem('token'); // or your auth check
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}