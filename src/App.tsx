import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { CovenantPage } from '@/pages/CovenantPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { JourneyPage } from '@/pages/JourneyPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { useJourney } from '@/hooks/useJourney';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { user } = useJourney();

  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public/Onboarding Routes */}
          <Route path="/" element={!user.role ? <OnboardingPage /> : <Navigate to="/dashboard" />} />
          <Route path="/covenant" element={user.role && !user.isCovenantSigned ? <CovenantPage /> : <Navigate to="/dashboard" />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={user.isCovenantSigned ? <DashboardPage /> : <Navigate to={!user.role ? "/" : "/covenant"} />} 
          />
          <Route 
            path="/journey" 
            element={user.isCovenantSigned ? <JourneyPage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/messages" 
            element={user.isCovenantSigned ? <MessagesPage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/notifications" 
            element={user.isCovenantSigned ? <NotificationsPage /> : <Navigate to="/" />} 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppLayout>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;
