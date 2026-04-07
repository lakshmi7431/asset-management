// src/components/PublicRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

export default function PublicRoute() {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}