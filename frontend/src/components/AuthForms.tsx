// src/components/AuthForms.tsx

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth'; 
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { motion } from 'framer-motion';

const AuthForms: React.FC = () => {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [loginString, setLoginString] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [generatedLoginString, setGeneratedLoginString] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tab index: 0 = Sign Up, 1 = Sign In
  const [tabIndex, setTabIndex] = useState(0);

  // Keep isNewUser in sync with tabIndex for minimal code changes
  const isNewUser = tabIndex === 0;

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setGeneratedLoginString(null);
    setIsLoading(true);

    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Please enter a username.' });
      setIsLoading(false);
      return;
    }

    if (!isNewUser && !loginString.trim()) {
      setMessage({ type: 'error', text: 'Please enter your login string.' });
      setIsLoading(false);
      return;
    }

    if (isNewUser) {
      const result = await register(username.trim());
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });
      if (result.success && result.loginString) {
        setGeneratedLoginString(result.loginString);
      }
    } else {
      const result = await login(username.trim(), loginString.trim());
      setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    }
    setIsLoading(false);
  };

  // Copy login string to clipboard
  const handleCopyLoginString = async () => {
    if (generatedLoginString) {
      try {
        await navigator.clipboard.writeText(generatedLoginString);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        setCopied(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
    >
      <Paper elevation={6} sx={{ p: 4, borderRadius: 2, maxWidth: 450, width: '100%' }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ mb: 3 }}>
          💧 HydroHabit 💧
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 3 }}>
          Welcome! The only app where more water equals less effort!
        </Typography>

        {/* Tabs for Sign Up / Sign In */}
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          centered
          sx={{ mb: 3 }}
          aria-label="auth tabs"
        >
          <Tab label="Sign Up" />
          <Tab label="Sign In" />
        </Tabs>

        <Typography variant="h6" align="center" gutterBottom>
          {isNewUser ? '📝 New User Registration' : '🔑 Returning User Login'}
        </Typography>

        <Box component="form" onSubmit={handleAuth} sx={{ mt: 2 }}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoComplete="username"
          />

          {!isNewUser && (
            <TextField
              label="Login String"
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              value={loginString}
              onChange={(e) => setLoginString(e.target.value)}
              placeholder="Enter your login string"
              autoComplete="current-password"
            />
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isNewUser ? 'Get My Login String!' : 'Login'}
          </Button>

          {message && (
            <Alert severity={message.type} sx={{ mt: 2 }}>
              {message.text}
            </Alert>
          )}

          {generatedLoginString && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                🎫 Your Login String:
                <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'} placement="top">
                  <IconButton size="small" onClick={handleCopyLoginString} aria-label="copy login string">
                    <ContentCopyIcon fontSize="small" color={copied ? 'success' : 'inherit'} />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Typography sx={{ wordBreak: 'break-all', mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 0.5 }}>
                {generatedLoginString}
              </Typography>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                ⚠️ **Save this login string immediately!** You'll need it to access your account.
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* <Typography variant="body2" color="text.secondary" align="center">
          **ℹ️ Demo Information:** This is a frontend-only demonstration.
          User data is stored in your browser's local storage and is NOT secure for a real application.
          A real app needs a backend for secure authentication and data storage.
        </Typography> */}
      </Paper>
    </motion.div>
  );
};

export default AuthForms;