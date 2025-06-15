import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          p: 4,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        }}
        className="scale-in"
      >
        <Typography
          variant="h4"
          component="h1"
          className="gradient-text"
          sx={{ fontWeight: 800, mb: 1 }}
        >
          EduTranscribe
        </Typography>
        <CircularProgress
          size={48}
          thickness={4}
          sx={{
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ mt: 2 }}
          className="loading-dots"
        >
          Loading
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
