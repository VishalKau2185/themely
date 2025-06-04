// src/pages/AuthPage.tsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Link } from '@mui/material';
import { signInWithEmail, signUpWithEmail } from '../services/authService';
// REMOVED: import { createProfile } from '../services/dbService'; // No longer needed here

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (isLogin) {
        // For login
        const { error: loginError } = await signInWithEmail(email, password);
        if (loginError) throw loginError;
        setMessage('Logged in successfully!');
        // onAuthStateChange listener in App.tsx will handle redirection
      } else {
        // For registration
        const { user, error: signupError } = await signUpWithEmail(email, password);
        if (signupError) throw signupError;

        // --- IMPORTANT: Removed direct createProfile call here ---
        // The database trigger 'handle_new_user_profile' will automatically
        // create the profile row after successful user signup in auth.users.
        // This bypasses client-side RLS timing issues.

        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {isLogin ? 'Login' : 'Register'} to Themely
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </Button>
        </Box>
        {message && <Typography color="success.main" align="center" sx={{ mt: 1 }}>{message}</Typography>}
        {error && <Typography color="error" align="center" sx={{ mt: 1 }}>{error}</Typography>}

        <Typography align="center" sx={{ mt: 2 }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <Link href="#" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default AuthPage;