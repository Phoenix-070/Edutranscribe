import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Button, alpha, styled, CircularProgress } from '@mui/material';
import { Theme } from '@mui/material/styles';
import axios from 'axios';
import { VolumeUp, VolumeOff } from '@mui/icons-material';

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

const Summary = () => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const storedUrl = localStorage.getItem('videoUrl');
    if (storedUrl) {
      setVideoUrl(storedUrl);
    } else {
      setError('No video URL available. Please transcribe a video first.');
    }
  }, []);

  const handleSummarize = async () => {
    setLoading(true);
    setSummary('');
    setError('');
    try {
      // Retrieve transcript text from localStorage key 'transcript'
      const transcript = localStorage.getItem('transcript') || '';
      if (!transcript) {
        setError('No transcript available to summarize. Please transcribe a video first.');
        setLoading(false);
        return;
      }
      const response = await axios.post('http://127.0.0.1:8000/summarize', { text: transcript });
      if (response.data.summary) {
        setSummary(response.data.summary);
        // Store summary in localStorage for Translate page to use
        localStorage.setItem('videoSummary', response.data.summary);
      } else {
        setError('Failed to generate summary');
      }
    } catch (err) {
      setError('Something went wrong while summarizing.');
    } finally {
      setLoading(false);
    }
  };

  const cleanTextForTTS = (text: string) => {
    return text.replace(/[^\w\s]|_/g, '');
  };

  const readAloudSummary = () => {
    if (summary) {
      const cleanedText = cleanTextForTTS(summary);
      const speech = new SpeechSynthesisUtterance(cleanedText);
      speech.lang = 'en-US';
      window.speechSynthesis.speak(speech);
      setSpeaking(true);
      speech.onend = () => setSpeaking(false);
    }
  };

  const stopReadAloud = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
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
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
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
            📝 Content Summary
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
            Generate intelligent summaries of educational content using advanced AI
          </Typography>
        </AnimatedBox>

        <AnimatedBox>
          <StyledPaper>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            {videoUrl && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Video URL:
                </Typography>
                <Paper elevation={3} sx={{ p: 3, backgroundColor: '#12121b', mb: 3 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                    {videoUrl}
                  </Typography>
                </Paper>
              </>
            )}

            <Button
              variant="contained"
              onClick={handleSummarize}
              disabled={loading || !!error}
              startIcon={loading ? <CircularProgress size={20} /> : null}
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
              {loading ? 'Generating...' : 'Generate Summary'}
            </Button>

            {summary && (
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={speaking ? stopReadAloud : readAloudSummary}
                    startIcon={speaking ? <VolumeOff /> : <VolumeUp />}
                    sx={{ textTransform: 'none' }}
                  >
                    {speaking ? 'Stop Read Aloud' : 'Read Aloud Summary'}
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
                    {summary}
                  </Typography>
                </Paper>
              </Box>
            )}
          </StyledPaper>
        </AnimatedBox>
      </Container>
    </Box>
  )
}

export default Summary;
