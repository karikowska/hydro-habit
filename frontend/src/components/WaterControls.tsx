import React from 'react';
import { Box, Typography, TextField, InputAdornment, LinearProgress, useTheme, Stack, Paper } from '@mui/material';
import { useHydration } from '../hooks/useHydration'; 

const WaterControls: React.FC = () => {
  const theme = useTheme(); // Access the theme provided by ThemeProvider
  const {
    hydrationState,
    handleGoalChange,
    handleGoalBlur,
    goalError,
    progressBarValue,
    handleDrinkAmountChange,
    handleDrinkAmountBlur,
    drinkAmountError,
    goalVsDrinkAmountError
  } = useHydration(); // Consume the context

  // destructure hydrationState
  const { currentWaterMl, goalInput, drinkAmountInput, dailyGoalMl, sipsTaken } = hydrationState;
  
  // Determine if the text fields should be disabled
  // They are disabled if currentWaterMl is greater than 0
  const areTextFieldsDisabled = currentWaterMl > 0;

  const waterRemaining = Math.max(0, dailyGoalMl - currentWaterMl);


  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Current Progress Display and Editable Goal */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">
            {currentWaterMl}ml /
          </Typography>
          <TextField
            variant="standard"
            size="small"
            type="text"
            inputMode="numeric"
            value={goalInput}
            onChange={handleGoalChange}
            onBlur={handleGoalBlur}
            error={!!goalError}
            disabled={areTextFieldsDisabled}
            sx={{ width: '100px', '& input': { textAlign: 'center' } }}
          />
          <Typography variant="h6">
            ml
          </Typography>
        </Box>
        <Typography variant="caption" color="error" sx={{ height: '1em', mt: 0.5 }}>
          {goalError || goalVsDrinkAmountError || ' '}
        </Typography>
      </Box>

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progressBarValue}
        sx={{
          width: '80%',
          height: 10,
          borderRadius: 5,
          my: 2,
          backgroundColor: theme.palette.grey[300],
          '& .MuiLinearProgress-bar': {
            backgroundColor: theme.palette.info.main,
            borderRadius: 5,
          },
        }}
      />

      {/* Stats Display */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mt: 2,
          justifyContent: 'center',
          width: { xs: '90%', md: '80%' },
        }}
      >
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', flex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            {Math.round(progressBarValue)}%
          </Typography>
          <Typography variant="caption">Hydration</Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', flex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            {sipsTaken || 0}
          </Typography>
          <Typography variant="caption">Sips Taken</Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', flex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            {waterRemaining}ml
          </Typography>
          <Typography variant="caption">Remaining</Typography>
        </Paper>
      </Stack>

      {/* Editable Drink Amount */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1">Drink Amount:</Typography>
          <TextField
            variant="standard"
            size="small"
            type="text"
            inputMode="numeric"
            value={drinkAmountInput}
            onChange={handleDrinkAmountChange}
            onBlur={handleDrinkAmountBlur}
            error={!!drinkAmountError}
            disabled={areTextFieldsDisabled}
            sx={{ width: '100px', '& input': { textAlign: 'center' } }}
            InputProps={{
              endAdornment: <InputAdornment position="end">ml</InputAdornment>,
            }}
          />
        </Box>
        <Typography variant="caption" color="error" sx={{ height: '1em', mt: 0.5 }}>
          {drinkAmountError || ' '}
        </Typography>
      </Box>
    </Box>
  );
};

export default WaterControls;