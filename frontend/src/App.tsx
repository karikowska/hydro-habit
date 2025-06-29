import React from 'react';
import { Button, Box, Typography, Container, ThemeProvider, CssBaseline, IconButton, CircularProgress, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WaterCup from './components/WaterCup';
import WaterControls from './components/WaterControls';
import { theme } from './theme';
import { HydrationProvider } from './contexts/HydrationContextProvider';
import { AuthProvider } from './contexts/AuthContextProvider';
import { useHydration } from './hooks/useHydration'; // Ensure useHydration is imported directly
import AuthForms from './components/AuthForms';
import { useAuth } from './hooks/useAuth';
import { useFetchEncouragement } from './api/useFetchEncouragement';
import { motion } from 'framer-motion';

// This component contains the core UI that needs hydration state AND authentication state
const HydroHomieAppContent: React.FC = () => {
  const {
    hydrationState,
    fillPercentage,
    handleDrink,
    drinkAmountPerClick,
    handleResetProgress,
    goalError,
    drinkAmountError,
    goalVsDrinkAmountError,
    saveHydrationData,
  } = useHydration(); // Hydration context for main app features

  // destructure hydrationState
  const { currentWaterMl, dailyGoalMl, drinkAmountMl } = hydrationState;

  const { isAuthenticated, currentUser, logout } = useAuth(); // Auth context for login status and logout
  const { data: hydrationPrompt, isLoading: isPromptLoading, error: promptError } = useFetchEncouragement();

  // Disable button if any error exists (input-specific or cross-field)
  const isDrinkButtonDisabled =
    currentWaterMl >= dailyGoalMl ||
    dailyGoalMl <= 0 ||
    drinkAmountMl <= 0 ||
    !!goalError ||
    !!drinkAmountError ||
    !!goalVsDrinkAmountError;

  // Handler for the Logout button
  const handleLogoutClick = () => {
    console.log('Logout button clicked. Saving hydration data...');
    saveHydrationData(); // First, save the current hydration data
    logout(); // Then, proceed with logging out
  };

  // Render AuthForms if not authenticated
  if (!isAuthenticated) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        <AuthForms />
      </Container>
    );
  }

  // Render main app content if authenticated
  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        py: 4,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1">
            👋 Hello, {currentUser?.username || 'Guest'}!
          </Typography>
          <Button variant="outlined" color="primary" size="small" onClick={handleLogoutClick}> {/* UPDATED: Use new handler */}
            Logout
          </Button>
        </Box>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 80 }}
        >
          <Typography variant="h3" sx={{ textAlign: 'center', fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, }}>
            HydroHomie
          </Typography>
        </motion.div>
      </Box>

      <Box sx={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, mt: 2, textAlign: 'center', maxWidth: '80%' }}>
        {isPromptLoading ? (
          <CircularProgress size={30} />
        ) : promptError ? (
          <Alert severity="error" sx={{ width: '100%' }}>{promptError}</Alert>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{ width: '100%' }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              "{hydrationPrompt}"
            </Typography>
          </motion.div>
        )}
      </Box>

      <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: 250, width: '100%' }}>
        <WaterCup fillPercentage={fillPercentage} />
      </Box>

      <WaterControls />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <motion.div whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.04 }} style={{ display: 'inline-block' }}>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            onClick={handleDrink}
            disabled={isDrinkButtonDisabled}
          >
            Drink Water! ({drinkAmountPerClick}ml)
          </Button>
        </motion.div>

        <IconButton
          aria-label="reset progress"
          onClick={handleResetProgress}
          sx={{
            color: theme.palette.primary.main,
          }}
        >
          <RefreshIcon fontSize="large" />
        </IconButton>
      </Box>

      {currentWaterMl >= dailyGoalMl && dailyGoalMl > 0 && (
        <Typography variant="h6" color="primary" sx={{ mt: 2, fontWeight: 'bold' }}>
          Goal Reached! Great Job! 🎉
        </Typography>
      )}
    </Container>
  );
};

// The main App component wraps the HydroHomieAppContent with all necessary Providers
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <HydrationProvider>
          <HydroHomieAppContent />
        </HydrationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;