import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  Alert,
  Container,
  CircularProgress,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Password reset link has been sent to your email');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        py: 12,
      }}
      className="page-transition"
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 8 }} className="fade-in">
          <Typography
            variant="h3"
            component="h1"
            className="gradient-text"
            sx={{ mb: 2, fontWeight: 800 }}
          >
            Reset Password
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Enter your email to receive password reset instructions
          </Typography>
        </Box>

        <Card
          className="scale-in"
          sx={{
            borderRadius: 4,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                type="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={loading}
                className="hover-button"
                sx={{
                  mt: 3,
                  mb: 2,
                  height: 48,
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/signin"
                  color="primary"
                  underline="hover"
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <ArrowBack sx={{ mr: 1, fontSize: 20 }} />
                  Back to Sign In
                </Link>
              </Box>
            </form>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/signup"
              color="primary"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
