import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Button, alpha, styled, TextField, CircularProgress } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { CloudUpload, ContentCopy, Check } from '@mui/icons-material';
import axios from 'axios';

// Animated components
const AnimatedBox = styled(Box)<{ theme?: Theme }>(({ theme }) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  animation: 'fadeIn 0.6s ease-out forwards',
}));

// Floating SDG Background from Home.tsx
const SDGBackground: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const symbols = ['📚', '🎓', '✏️', '💡', '🔬', '🌍', '📱', '🤖', '👨‍🎓', '👩‍🎓'];
    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      symbol: string;
      size: number;
      opacity: number;
      rotation: number;
    }> = [];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 1,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 16 + Math.random() * 14,
        opacity: 0.1 + Math.random() * 0.3,
        rotation: Math.random() * 360,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.y -= particle.speed;
        particle.rotation += 0.5;
        if (particle.y < -50) particle.y = canvas.height + 50;

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.font = `${particle.size}px Arial`;
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fillText(particle.symbol, -particle.size / 2, particle.size / 2);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();
    return () => window.removeEventListener('resize', setCanvasSize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: `linear-gradient(135deg, ${alpha('#1e1e2f', 0.9)} 0%, ${alpha('#1e1e2f', 0.7)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const Transcription = () => {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTranscribe = async () => {
    if (!url) return;
    setLoading(true);
    setTranscript('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/transcribe', { url });
      if (res.data.transcript) {
        setTranscript(res.data.transcript);
        setSource(res.data.source);
        localStorage.setItem('transcript', res.data.transcript);
        localStorage.setItem('videoUrl', url);
      } else {
        setTranscript('No transcript found or error occurred.');
      }
    } catch (err) {
      setTranscript('Something went wrong while transcribing.');
    } finally {
      setLoading(false);
    }
  };

  const copyTranscriptToClipboard = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        alert('Failed to copy transcript: ' + err);
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        py: 8,
      }}
    >
      <SDGBackground />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <AnimatedBox sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h1"
            sx={{
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🎙️ Video Transcription
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: '800px',
              mx: 'auto',
              mb: 4,
            }}
          >
            Convert educational videos into accurate text transcripts using advanced AI
          </Typography>
        </AnimatedBox>

        <AnimatedBox>
          <StyledPaper>
            <TextField
              fullWidth
              label="Paste YouTube URL"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: alpha('#fff', 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha('#fff', 0.3),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: alpha('#fff', 0.7),
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                },
              }}
            />

            <Button
              variant="contained"
              onClick={handleTranscribe}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                },
              }}
            >
              {loading ? 'Transcribing...' : 'Start Transcription'}
            </Button>

            {transcript && (
              <AnimatedBox sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" color="primary">
                    Transcript Source: {source}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={copied ? <Check /> : <ContentCopy />}
                    onClick={copyTranscriptToClipboard}
                    sx={{ textTransform: 'none' }}
                  >
                    {copied ? 'Copied!' : 'Copy Text'}
                  </Button>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: alpha('#000', 0.2),
                    borderRadius: 2,
                    maxHeight: '400px',
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: alpha('#fff', 0.9),
                      whiteSpace: 'pre-line',
                      lineHeight: 1.8,
                    }}
                  >
                    {transcript}
                  </Typography>
                </Paper>
              </AnimatedBox>
            )}
          </StyledPaper>
        </AnimatedBox>
      </Container>
    </Box>
  )
}

export default Transcription
