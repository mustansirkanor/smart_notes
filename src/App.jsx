import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './ThemeContext';

// Import existing components
import Dashboard from './components/Dashboard';
import NotesView from './components/NotesView';
import NoteEditor from './components/NoteEditor';
import FloatingButton from './components/FloatingButton';
import ThemeToggle from './components/ThemeToggle';

// Import authentication components
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

// Import styles
import './App.css';
import './Styles/animations.css';
import './Styles/themes.css';
import './components/Auth.css';

// App Routes Component
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Smart Notes...</p>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
          />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/topic/:id" element={
            <ProtectedRoute>
              <NotesView />
            </ProtectedRoute>
          } />
          
          <Route path="/editor/:topicId/:noteId?" element={
            <ProtectedRoute>
              <NoteEditor />
            </ProtectedRoute>
          } />

          {/* Quiz Routes (if you have them) */}
          {/* 
          <Route path="/quiz" element={
            <ProtectedRoute>
              <QuizDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/quiz/topic/:topicId" element={
            <ProtectedRoute>
              <QuizTopicView />
            </ProtectedRoute>
          } />
          */}

          {/* Catch all route */}
          <Route path="*" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } />
        </Routes>
        
        {/* Floating Button - only show when authenticated */}
        {isAuthenticated }
      </div>
    </>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
