import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0e101c',
      paper: '#1e1e2f',
    },
    primary: {
      main: '#4CAF50', // Updated to a green color representing education
    },
    secondary: {
      main: '#FFEB3B', // Updated to a yellow color for visibility
    },
    text: {
      primary: '#ffffff',
      secondary: '#a9a9b3',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
})

export default theme
