import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Layout from './components/layout/Layout';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin-portal/AdminLayout';
import { AdminPortalProvider } from './contexts/AdminPortalContext';
import Home from './pages/Home';
import About from './pages/About';
import Sermons from './pages/Sermons';
import Events from './pages/Events';
import Ministries from './pages/Ministries';
import Give from './pages/Give';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import Safeguarding from './pages/Safeguarding';
import AdminDashboardPage from './pages/admin/Dashboard';
import AdminWebsitePage from './pages/admin/Website';
import AdminSermonsPage from './pages/admin/Sermons';
import AdminEventsPage from './pages/admin/Events';
import AdminMinistriesPage from './pages/admin/Ministries';
import AdminMediaPage from './pages/admin/Media';
import AdminSubmissionsPage from './pages/admin/Submissions';
import AdminDataModelsPage from './pages/admin/DataModels';
import AdminIntegrationPage from './pages/admin/Integration';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={(
            <ProtectedAdminRoute>
              <AdminPortalProvider>
                <AdminLayout />
              </AdminPortalProvider>
            </ProtectedAdminRoute>
          )}
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="website" element={<Navigate to="/admin/website/global" replace />} />
          <Route path="website/:section" element={<AdminWebsitePage />} />
          <Route path="global" element={<Navigate to="/admin/website/global" replace />} />
          <Route path="home" element={<Navigate to="/admin/website/home" replace />} />
          <Route path="about" element={<Navigate to="/admin/website/about" replace />} />
          <Route path="sermons" element={<AdminSermonsPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="ministries" element={<AdminMinistriesPage />} />
          <Route path="give" element={<Navigate to="/admin/website/give" replace />} />
          <Route path="contact" element={<Navigate to="/admin/website/contact" replace />} />
          <Route path="safeguarding" element={<Navigate to="/admin/website/safeguarding" replace />} />
          <Route path="media" element={<Navigate to="/admin/website/global" replace />} />
          <Route path="messages" element={<AdminSubmissionsPage />} />
          <Route path="submissions" element={<Navigate to="/admin/messages" replace />} />
          <Route path="advanced/data-models" element={<AdminDataModelsPage />} />
          <Route path="advanced/integration" element={<AdminIntegrationPage />} />
          <Route path="data-models" element={<Navigate to="/admin/advanced/data-models" replace />} />
          <Route path="integration" element={<Navigate to="/admin/advanced/integration" replace />} />
          <Route path="advanced/media" element={<AdminMediaPage />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/events" element={<Events />} />
          <Route path="/ministries" element={<Ministries />} />
          <Route path="/give" element={<Give />} />
          <Route path="/safeguarding" element={<Safeguarding />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
