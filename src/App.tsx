import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider, useProfile } from './hooks/use-profile';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ConnectionDetail from './pages/ConnectionDetail';
import Landing from './pages/Landing';
import { Toaster } from 'sonner';

function AppRoutes() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={profile ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/onboarding" element={profile ? <Navigate to="/dashboard" /> : <Onboarding />} />
      <Route path="/dashboard" element={profile ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/connection/:id" element={profile ? <ConnectionDetail /> : <Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ProfileProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-center" richColors />
      </Router>
    </ProfileProvider>
  );
}

export default App;
