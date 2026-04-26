/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Test } from './pages/Test';
import { Result } from './pages/Result';
import { Onboarding } from './pages/Onboarding';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { SongLibrary } from './pages/SongLibrary';
import { SongDetail } from './pages/SongDetail';
import { SongTest } from './pages/SongTest';
import { RequestSong } from './pages/RequestSong';
import { TestProvider, useTest } from './context/TestContext';

import { Loader2 } from 'lucide-react';

// Auth guard using context
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading, user } = useTest();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="atmosphere-luxury" />
        <Loader2 className="animate-spin text-[#C8A96B]/40" size={32} />
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // Redirect to onboarding if profile is pending
  if (!user?.onboardingCompleted && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen text-[#F3EBDD] font-sans selection:bg-[#C8A96B] selection:text-white relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/library" 
            element={
              <ProtectedRoute>
                <SongLibrary />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/request-song" 
            element={
              <ProtectedRoute>
                <RequestSong />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/songs/:slug/test" 
            element={
              <ProtectedRoute>
                <SongTest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/songs/:slug" 
            element={
              <ProtectedRoute>
                <SongDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/songs" 
            element={
              <ProtectedRoute>
                <Test />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/result" 
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <TestProvider>
      <AppContent />
    </TestProvider>
  );
}
