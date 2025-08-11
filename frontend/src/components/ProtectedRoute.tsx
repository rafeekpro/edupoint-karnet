import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from './ui/spinner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'owner' | 'employee' | 'client' | 'therapist' | 'organization_owner';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  // Map legacy roles to new roles for backward compatibility
  const normalizeRole = (userRole: string): string => {
    const roleMap: { [key: string]: string } = {
      'therapist': 'employee',
      'organization_owner': 'owner'
    };
    return roleMap[userRole] || userRole;
  };

  // Check if user has the required role
  const userRole = normalizeRole(user?.role || '');
  const requiredRole = role ? normalizeRole(role) : null;

  if (requiredRole && userRole !== requiredRole) {
    // Get the correct dashboard for redirect
    const getDashboardPath = (role: string): string => {
      switch (role) {
        case 'admin': return '/admin/dashboard';
        case 'owner': return '/owner/dashboard';
        case 'employee': return '/employee/dashboard';
        case 'client': return '/client/dashboard';
        default: return '/';
      }
    };

    // Auto-redirect after showing message
    setTimeout(() => {
      window.location.href = getDashboardPath(userRole);
    }, 2000);
    
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page. Please contact your administrator if you think this is a mistake.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;