import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../layout/Layout';
import { Login } from '../features/auth/Login';
import { ProtectedRoute } from './ProtectedRoute';

const Spinner = () => (
  <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
  </div>
);

const Dashboard       = lazy(() => import('../features/dashboard/Dashboard'));
const Leads           = lazy(() => import('../features/leads/Leads'));
const Properties      = lazy(() => import('../features/properties/Properties'));
const PropertyDetails = lazy(() => import('../features/properties/PropertyDetails'));
const CalendarView    = lazy(() => import('../features/calendar/CalendarView'));
const UsersManagement = lazy(() => import('../features/users/UsersManagement'));
const Clients         = lazy(() => import('../features/clients/Clients'));
const ClientDetails   = lazy(() => import('../features/clients/ClientDetails'));
const Developers      = lazy(() => import('../features/developers/Developers'));
const Projects        = lazy(() => import('../features/projects/Projects'));
const ProjectDetails  = lazy(() => import('../features/projects/ProjectDetails'));
const Areas           = lazy(() => import('../features/areas/Areas'));
const Reports         = lazy(() => import('../features/reports/Reports'));
const SystemSettings  = lazy(() => import('../features/settings/SystemSettings'));
const Deals           = lazy(() => import('../features/deals/Deals'));
const Profile         = lazy(() => import('../features/users/Profile'));
const Treasury        = lazy(() => import('../features/treasury/Treasury'));

export const AppRoutes = () => (
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="leads"          element={<Leads />} />
          <Route path="properties"     element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          <Route path="deals"          element={<Deals />} />
          <Route path="users"          element={<UsersManagement />} />
          <Route path="clients"        element={<Clients />} />
          <Route path="clients/:id"    element={<ClientDetails />} />
          <Route path="developers"     element={<Developers />} />
          <Route path="projects"       element={<Projects />} />
          <Route path="projects/:id"   element={<ProjectDetails />} />
          <Route path="areas"          element={<Areas />} />
          <Route path="calendar"       element={<CalendarView />} />
          <Route path="reports"        element={<Reports />} />
          <Route path="settings"       element={<SystemSettings />} />
          <Route path="profile"        element={<Profile />} />
          <Route path="treasury"       element={<Treasury />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Suspense>
);