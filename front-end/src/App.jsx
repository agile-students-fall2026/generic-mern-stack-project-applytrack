import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components'
import { AuthProvider } from './context/AuthProvider'
import { ThemeProvider } from './context/ThemeProvider'

import AddApplication from './pages/applications/AddApplication'
import ApplicationDetails from './pages/applications/ApplicationDetails'
import Archive from './pages/applications/Archive'
import Dashboard from './pages/applications/Dashboard'
import EditApplication from './pages/applications/EditApplication'
import InterviewRound from './pages/applications/InterviewRound'
import OfferDetails from './pages/applications/OfferDetails'
import ForgotPassword from './pages/auth/ForgotPassword'
import LogIn from './pages/auth/LogIn'
import ResetPassword from './pages/auth/ResetPassword'
import SignUp from './pages/auth/SignUp'
import Welcome from './pages/auth/Welcome'
import ComponentGallery from './pages/dev/ComponentGallery'
import AddEvent from './pages/events/AddEvent'
import EditEvent from './pages/events/EditEvent'
import Upcoming from './pages/events/Upcoming'
import Home from './pages/home/Home'
import NotFound from './pages/NotFound'
import EditAccount from './pages/profile/EditAccount'
import ExportData from './pages/profile/ExportData'
import NotificationSettings from './pages/profile/NotificationSettings'
import Profile from './pages/profile/Profile'
import Statistics from './pages/stats/Statistics'

/** The five main screens share the bottom navigation bar. */
function TabLayout() {
  return (
    <div className="tab-layout">
      <Outlet />
      <BottomNav />
    </div>
  )
}

/**
 * Every screen in the app and its URL.
 * To link to a screen, use one of these paths, e.g. <Button to="/applications/new">.
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Signed-out screens */}
            <Route path="/" element={<Welcome />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Main screens with the bottom navigation bar */}
            <Route element={<TabLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/applications" element={<Dashboard />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="/stats" element={<Statistics />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Applications */}
            <Route path="/applications/new" element={<AddApplication />} />
            <Route path="/applications/:id" element={<ApplicationDetails />} />
            <Route path="/applications/:id/edit" element={<EditApplication />} />
            <Route path="/applications/:id/offer" element={<OfferDetails />} />
            <Route path="/applications/:id/rounds/new" element={<InterviewRound />} />
            <Route path="/applications/:id/rounds/:roundId" element={<InterviewRound />} />
            <Route path="/archive" element={<Archive />} />

            {/* Events */}
            <Route path="/events/new" element={<AddEvent />} />
            <Route path="/events/:id/edit" element={<EditEvent />} />

            {/* Profile */}
            <Route path="/profile/edit" element={<EditAccount />} />
            <Route path="/profile/notifications" element={<NotificationSettings />} />
            <Route path="/profile/export" element={<ExportData />} />

            {/* Developer tools: a live gallery of every shared component */}
            <Route path="/dev/components" element={<ComponentGallery />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
