import { useLayoutEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './layouts/ProtectedRoute'
import PageTransition from './layouts/PageTransition'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import BookDetail from './pages/BookDetail'
import MemoryTimeline from './pages/MemoryTimeline'
import Capture from './pages/Capture'
import Welcome from './pages/Welcome'
import Community from './pages/Community'
import EditProfile from './pages/EditProfile'
import FollowersModal from './components/FollowersModal'
import UserProfileModal from './components/UserProfileModal'
import { useApp } from './context/AppContext'

function AppShell() {
  const location = useLocation()
  const {
    user,
    activeFollowersModal,
    closeFollowersModal,
    activeUserProfileId,
    closeUserProfile,
  } = useApp()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const shouldReserveMobileNavSpace = Boolean(user)

  return (
    <div className="app-shell min-h-dvh overflow-x-hidden">
      <div
        className="app-shell-main"
        style={
          shouldReserveMobileNavSpace
            ? { paddingBottom: 'calc(5.75rem + env(safe-area-inset-bottom))' }
            : undefined
        }
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
            <Route
              path="/welcome"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Welcome />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/capture"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Capture />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Community />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <EditProfile />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/books/:bookId"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <BookDetail />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/books/:bookId/timeline"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <MemoryTimeline />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      <FollowersModal
        isOpen={!!activeFollowersModal}
        onClose={closeFollowersModal}
        userId={activeFollowersModal?.userId}
        initialTab={activeFollowersModal?.tab}
      />
      <UserProfileModal
        isOpen={!!activeUserProfileId}
        onClose={closeUserProfile}
        userId={activeUserProfileId}
      />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  )
}
