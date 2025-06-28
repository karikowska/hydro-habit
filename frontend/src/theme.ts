import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // A standard blue, often used for water
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#fff',
    },
    secondary: {
      main: '#00bcd4', // A cyan/teal, like clear water
      light: '#4dd0e1',
      dark: '#00838f',
      contrastText: '#fff',
    },
    info: {
      main: '#03a9f4', // Another shade of blue, great for progress bars
      light: '#4fc3f7',
      dark: '#0288d1',
      contrastText: '#fff',
    },
    error: {
      main: '#f44336', // Standard error red
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
    success: {
      main: '#4caf50', // Standard success green
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#fff',
    },
    background: {
      default: '#e0f2f7', // A very light, almost white blue for card/paper backgrounds
      paper: '#ffffff', // Pure white for paper elements
    },
    text: {
      primary: '#212121', // Dark text for readability
      secondary: '#757575', // Lighter text
    },
    // Removed appBackground from palette as it's not a direct color value
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Standard clean font
    h3: {
      fontWeight: 700,
      color: '#0D47A1', // Darker blue for headings
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    caption: {
      fontSize: '0.75rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
        containedSecondary: {
          boxShadow: '0 4px 8px rgba(0, 188, 212, 0.2)', // Soft shadow for secondary button
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 12,
          borderRadius: 6,
          backgroundColor: '#bbdefb', // Lighter blue for the track
        },
        bar: {
          borderRadius: 6,
          backgroundColor: '#2196f3', // Deeper blue for the progress bar itself
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'standard',
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            textAlign: 'center',
          },
          '& .MuiInput-underline:before': {
            borderBottomColor: '#90CAF9',
          },
          '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
            borderBottomColor: '#2196F3',
          },
          '& .MuiInput-underline:after': {
            borderBottomColor: '#1976D2',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white container
          borderRadius: 15,
          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(5px)', // Frosted glass effect
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Correctly apply the gradient background here
          background: 'linear-gradient(135deg, #a5dff9 0%, #83c6f7 50%, #5ba8ed 100%)',
          minHeight: '100vh',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          // Ensure that the body is a flex container to center the root div if needed
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        '#root': { // Ensure #root takes full width within the centered body
          width: '100%',
          maxWidth: '1280px', // Maintain your desired max-width for the overall app content
          margin: '0 auto', // Re-apply margin auto if body is flexed to center #root
          padding: '2rem', // Maintain your desired padding
          textAlign: 'center', // Maintain your desired text alignment
        }
      },
    },
  },
});