// src/hooks/useTheme.ts
import { useContext } from 'react';
// This is the corrected import statement
import { ThemeContext } from '../contexts/ThemeContext';

// This custom hook provides an easy way to access the theme context
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // This error will be thrown if the hook is used outside of a ThemeProvider
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default useTheme;