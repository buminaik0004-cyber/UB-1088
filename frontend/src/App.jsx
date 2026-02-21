import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

import CitizenDashboard from './pages/citizen/CitizenDashboard'
import ReportIssue from './pages/citizen/ReportIssue'
import MyComplaints from './pages/citizen/MyComplaints'
import IssueDetail from './pages/citizen/IssueDetail'

import AuthorityDashboard from './pages/authority/AuthorityDashboard'
import AllIssues from './pages/authority/AllIssues'
import Analytics from './pages/authority/Analytics'

import MapPage from './pages/shared/MapPage'
import Profile from './pages/shared/Profile'

function RootRedirect() {
  const { token, role } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <Navigate to={role === 'authority' ? '/authority/dashboard' : '/citizen/dashboard'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(51,65,85,0.6)', fontFamily: 'DM Sans', fontSize: 14 },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app routes with sidebar layout */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          {/* Citizen routes */}
          <Route path="/citizen/dashboard" element={
            <ProtectedRoute allowedRole="citizen"><CitizenDashboard /></ProtectedRoute>
          } />
          <Route path="/citizen/report" element={
            <ProtectedRoute allowedRole="citizen"><ReportIssue /></ProtectedRoute>
          } />
          <Route path="/citizen/complaints" element={
            <ProtectedRoute allowedRole="citizen"><MyComplaints /></ProtectedRoute>
          } />
          <Route path="/citizen/issue/:id" element={
            <ProtectedRoute allowedRole="citizen"><IssueDetail /></ProtectedRoute>
          } />

          {/* Authority routes */}
          <Route path="/authority/dashboard" element={
            <ProtectedRoute allowedRole="authority"><AuthorityDashboard /></ProtectedRoute>
          } />
          <Route path="/authority/issues" element={
            <ProtectedRoute allowedRole="authority"><AllIssues /></ProtectedRoute>
          } />
          <Route path="/authority/issue/:id" element={
            <ProtectedRoute allowedRole="authority"><IssueDetail /></ProtectedRoute>
          } />
          <Route path="/authority/analytics" element={
            <ProtectedRoute allowedRole="authority"><Analytics /></ProtectedRoute>
          } />

          {/* Shared routes */}
          <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
