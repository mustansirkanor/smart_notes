import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import NotesView from './components/NotesView';
import NoteEditor from './components/NoteEditor';
import FloatingButton from './components/FloatingButton';
import './App.css';
import './Styles/animations.css';
import './Styles/themes.css'
import { ThemeProvider } from './ThemeContext';
import ThemeToggle from './components/ThemeToggle';
function App() {
  return (
   
    <Router>
      <ThemeProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/topic/:id" element={<NotesView />} />
        </Routes>
        
      </div>
      </ThemeProvider>
    </Router>
  
  );
}

export default App;
