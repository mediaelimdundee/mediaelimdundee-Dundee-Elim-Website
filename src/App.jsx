import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Layout from './components/layout/Layout';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import Home from './pages/Home';
import About from './pages/About';
import Sermons from './pages/Sermons';
import Events from './pages/Events';
import Ministries from './pages/Ministries';
import Give from './pages/Give';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Safeguarding from './pages/Safeguarding';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={(
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          )}
        />
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
