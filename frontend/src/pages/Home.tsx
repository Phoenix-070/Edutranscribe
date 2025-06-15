import React, { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
  alpha,
  Paper,
  Stack,
  Divider,
  styled,
} from '@mui/material';
import {
  AutoStories,
  Translate,
  Science,
  PlayCircleOutline,
  SummarizeOutlined,
  CloudUpload,
  Chat,
  AccessTime,
  AutoGraph,
  EmojiObjects,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Theme } from '@mui/material/styles';

// Styled components
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
  '@keyframes float': {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
    '100%': { transform: 'translateY(0px)' },
  },
  animation: 'fadeIn 0.6s ease-out forwards',
}));

// Grid components
const GridContainer = styled(Box)<{ theme?: Theme }>(({ theme }) => ({
  display: 'grid',
  gap: theme?.spacing(4),
  gridTemplateColumns: 'repeat(12, 1fr)',
  width: '100%',
}));

interface GridItemProps {
  xs?: number;
  sm?: number;
  md?: number;
  children?: React.ReactNode;
}

const GridItem = styled(Box)<GridItemProps>(({ theme, xs = 12, sm, md }) => ({
  gridColumn: `span ${xs}`,
  [theme.breakpoints.up('sm')]: {
    gridColumn: sm ? `span ${sm}` : undefined,
  },
  [theme.breakpoints.up('md')]: {
    gridColumn: md ? `span ${md}` : undefined,
  },
}));

// SDG Background Component
const SDGBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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
        ctx.fillText(particle.symbol, -particle.size/2, particle.size/2);
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

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, path, index }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <AnimatedBox sx={{ style: { animationDelay: `${index * 0.1}s` } }}>
      <Card
        onClick={() => navigate(path)}
        sx={{
          height: '100%',
          cursor: 'pointer',
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              mb: 3,
              display: 'inline-flex',
              p: 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {description}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            endIcon={<PlayCircleOutline />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.1),
                transform: 'translateX(5px)',
              },
            }}
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </AnimatedBox>
  );
};

const AboutSection: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: 8, position: 'relative' }}>
      <Container maxWidth="lg">
        <GridContainer>
          <GridItem xs={12} md={6}>
            <AnimatedBox>
              <Typography variant="h2" sx={{ mb: 4, fontWeight: 700 }}>
                What is{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  EduTranscribe?
                </Box>
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
                EduTranscribe is an innovative educational platform that breaks down barriers in learning through advanced AI technology. We combine state-of-the-art models like Whisper, Gemini Pro, and NLLB to make educational content accessible to everyone, regardless of language or learning style.
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
                Our platform provides real-time transcription, translation, and summarization of educational videos, making learning materials more accessible and comprehensible for students worldwide.
              </Typography>
            </AnimatedBox>
          </GridItem>
          <GridItem xs={12} md={6}>
            <Box sx={{ pl: { md: 6 } }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                  Powered by Advanced AI
                </Typography>
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <AutoStories sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Whisper AI</Typography>
                      <Typography variant="body2" color="text.secondary">
                        State-of-the-art transcription for accurate content conversion
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <Science sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Gemini Pro</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Advanced summarization and content understanding
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <Translate sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>NLLB & Deep Translator</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Multilingual support for global accessibility
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </GridItem>
        </GridContainer>
      </Container>
    </Box>
  );
};

const Home: React.FC = () => {
  const theme = useTheme();

  const features = [
    {
      title: 'Video Transcription',
      description: 'Convert educational videos and lectures into accurate text transcripts. Perfect for study materials and accessibility.',
      icon: <AutoStories sx={{ fontSize: 32 }} />,
      path: '/transcription',
    },
    {
      title: 'Content Summary',
      description: 'Generate concise, intelligent summaries of educational content, helping you grasp key concepts quickly.',
      icon: <SummarizeOutlined sx={{ fontSize: 32 }} />,
      path: '/summary',
    },
    {
      title: 'Language Translation',
      description: 'Break language barriers by translating educational content into multiple languages with high accuracy.',
      icon: <Translate sx={{ fontSize: 32 }} />,
      path: '/translate',
    },
    {
      title: 'Research Assistant',
      description: 'Your AI-powered research companion for analyzing papers and generating insights.',
      icon: <Science sx={{ fontSize: 32 }} />,
      path: '/research',
    },
    {
      title: 'Paper Upload',
      description: 'Upload and analyze research papers, get summaries, and extract key findings effortlessly.',
      icon: <CloudUpload sx={{ fontSize: 32 }} />,
      path: '/upload-pdf',
    },
    {
      title: 'Research Chatbot',
      description: 'Engage in intelligent discussions about your research papers with our AI chatbot.',
      icon: <Chat sx={{ fontSize: 32 }} />,
      path: '/chatbot',
    },
  ] as const;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        overflow: 'hidden',
      }}
    >
      <SDGBackground />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 8 } }}>
        {/* Hero Section */}
        <AnimatedBox sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
          <Typography
            variant="h1"
            sx={{
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 800,
            }}
          >
            Supporting{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SDG 4: Quality Education
            </Box>
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}
          >
            Transforming education through AI-powered content accessibility
          </Typography>
        </AnimatedBox>

        {/* About Section */}
        <AboutSection />

        {/* Features Grid */}
        <GridContainer>
          {features.map((feature, index) => (
            <GridItem xs={12} sm={6} md={4} key={feature.title}>
              <FeatureCard {...feature} index={index} />
            </GridItem>
          ))}
        </GridContainer>

        {/* SDG 4 Mission Section */}
        <AnimatedBox sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ mb: 4, fontWeight: 700 }}>
            Our Commitment to SDG 4
          </Typography>
          <GridContainer>
            <GridItem xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  background: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                }}
              >
                <AccessTime sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Inclusive Learning
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Making education accessible to all through AI-powered content transformation
                </Typography>
              </Paper>
            </GridItem>
            <GridItem xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  background: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                }}
              >
                <AutoGraph sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Quality Assurance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ensuring high-quality educational content through advanced AI processing
                </Typography>
              </Paper>
            </GridItem>
            <GridItem xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  background: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                }}
              >
                <EmojiObjects sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Innovation in Education
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Leveraging cutting-edge AI to transform how we learn and teach
                </Typography>
              </Paper>
            </GridItem>
          </GridContainer>
        </AnimatedBox>
      </Container>
    </Box>
  );
};

export default Home;
