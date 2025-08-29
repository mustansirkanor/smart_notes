// src/components/ThemeToggle.js
import React, { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      style={{
        fontSize: 22,
        padding: 8,
        borderRadius: 30,
        border: 'none',
        background: '#8A2D3B',
        color: 'var(--button-text)'
      }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark/light theme"
    >
      {theme === 'dark' ? '🌙' : '🌞'}
    </button>
  );
};

export default ThemeToggle;
