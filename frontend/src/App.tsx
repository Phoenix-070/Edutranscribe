import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Transcription from './pages/Transcription';
import Summary from './pages/Summary';
import Translate from './pages/Translate';
import ResearchAssistant from './pages/ResearchAssistant';
import ResearchChatbot from './pages/ResearchChatbot';
import PaperUpload from './pages/UploadPdf';
import PaperSummary from './pages/PaperSummary';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import Profile from './pages/auth/Profile';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import { useAuth } from './hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

interface PublicRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" />;
};

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/transcription"
          element={
            <PrivateRoute>
              <Transcription />
            </PrivateRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <PrivateRoute>
              <Summary />
            </PrivateRoute>
          }
        />
        <Route
          path="/translate"
          element={
            <PrivateRoute>
              <Translate />
            </PrivateRoute>
          }
        />
        <Route
          path="/research"
          element={
            <PrivateRoute>
              <ResearchAssistant />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload-pdf"
          element={
            <PrivateRoute>
              <PaperUpload />
            </PrivateRoute>
          }
        />
        <Route
          path="/paper-summary"
          element={
            <PrivateRoute>
              <PaperSummary />
            </PrivateRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <PrivateRoute>
              <ResearchChatbot />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
