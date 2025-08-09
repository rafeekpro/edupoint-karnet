import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminVouchers from './pages/admin/Vouchers';
import AdminVoucherNew from './pages/admin/VoucherNew';
import AdminUsers from './pages/admin/Users';
import AdminClasses from './pages/admin/Classes';
import ClientDashboard from './pages/client/Dashboard';
import ClientActivateCode from './pages/client/ActivateCode';
import ClientSelectClass from './pages/client/SelectClass';
import ClientCalendar from './pages/client/Calendar';
import TherapistDashboard from './pages/therapist/Dashboard';
import TherapistSessions from './pages/therapist/Sessions';
import TherapistCalendar from './pages/therapist/Calendar';
import TherapistClients from './pages/therapist/Clients';

function App() {
  return (
    <NextUIProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              
              {/* Admin routes */}
              <Route
                path="admin/dashboard"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/vouchers"
                element={
                  <ProtectedRoute role="admin">
                    <AdminVouchers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/vouchers/new"
                element={
                  <ProtectedRoute role="admin">
                    <AdminVoucherNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute role="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/classes"
                element={
                  <ProtectedRoute role="admin">
                    <AdminClasses />
                  </ProtectedRoute>
                }
              />
              
              {/* Client routes */}
              <Route
                path="client/dashboard"
                element={
                  <ProtectedRoute role="client">
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="client/activate-code"
                element={
                  <ProtectedRoute role="client">
                    <ClientActivateCode />
                  </ProtectedRoute>
                }
              />
              <Route
                path="client/select-class"
                element={
                  <ProtectedRoute role="client">
                    <ClientSelectClass />
                  </ProtectedRoute>
                }
              />
              <Route
                path="client/calendar"
                element={
                  <ProtectedRoute role="client">
                    <ClientCalendar />
                  </ProtectedRoute>
                }
              />
              
              {/* Therapist routes */}
              <Route
                path="therapist/dashboard"
                element={
                  <ProtectedRoute role="therapist">
                    <TherapistDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="therapist/sessions"
                element={
                  <ProtectedRoute role="therapist">
                    <TherapistSessions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="therapist/calendar"
                element={
                  <ProtectedRoute role="therapist">
                    <TherapistCalendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="therapist/clients"
                element={
                  <ProtectedRoute role="therapist">
                    <TherapistClients />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </NextUIProvider>
  );
}

export default App;