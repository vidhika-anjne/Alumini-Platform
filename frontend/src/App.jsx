import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Chat from './pages/Chat'
import Mentors from './pages/Mentors'
import Notifications from './pages/Notifications'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ErrorBoundary>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={<Feed />} />
            <Route
              path="/mentors"
              element={
                <ProtectedRoute>
                  <Mentors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:type/:enrollmentNumber"
              element={
                <ProtectedRoute>
                  <PublicProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </ErrorBoundary>
    </div>
  )
}
