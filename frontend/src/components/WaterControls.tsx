import React from 'react';
import { Box, Typography, TextField, InputAdornment, LinearProgress, useTheme } from '@mui/material';
import { useHydration } from '../hooks/useHydration'; // Import the useHydration hook

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
  const { currentWaterMl, goalInput, drinkAmountInput } = hydrationState;
  
  // Determine if the text fields should be disabled
  // They are disabled if currentWaterMl is greater than 0
  const areTextFieldsDisabled = currentWaterMl > 0;


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

      {/* Editable Drink Amount */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, width: '100%' }}>
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