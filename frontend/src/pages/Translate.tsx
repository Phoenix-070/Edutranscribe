import React, { useState, useEffect } from 'react'
import { Container, Typography, Button, CircularProgress, Box, Paper, alpha, styled, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { Theme } from '@mui/material/styles';
import axios from 'axios'

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
}))

// Floating SDG Background from Home.tsx
const SDGBackground: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    const symbols = ['📚', '🎓', '✏️', '💡', '🔬', '🌍', '📱', '🤖', '👨‍🎓', '👩‍🎓']
    const particles: Array<{
      x: number
      y: number
      speed: number
      symbol: string
      size: number
      opacity: number
      rotation: number
    }> = []

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 1,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 16 + Math.random() * 14,
        opacity: 0.1 + Math.random() * 0.3,
        rotation: Math.random() * 360,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        particle.y -= particle.speed
        particle.rotation += 0.5
        if (particle.y < -50) particle.y = canvas.height + 50

        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)
        ctx.font = `${particle.size}px Arial`
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`
        ctx.fillText(particle.symbol, -particle.size / 2, particle.size / 2)
        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    animate()
    return () => window.removeEventListener('resize', setCanvasSize)
  }, [])

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
  )
}

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
}))

const Translate = () => {
  const [videoUrl, setVideoUrl] = React.useState('')
  const [transcript, setTranscript] = React.useState('')
  const [engine, setEngine] = React.useState('google')
  const [targetLanguage, setTargetLanguage] = React.useState('en')
  const [translatedText, setTranslatedText] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [speaking, setSpeaking] = React.useState(false)

  // New state for translation mode: 'transcript' or 'summary'
  const [translationMode, setTranslationMode] = React.useState('transcript')

  React.useEffect(() => {
    const storedTranscript = localStorage.getItem('transcript')
    const storedUrl = localStorage.getItem('videoUrl')
    if (storedTranscript) {
      setTranscript(storedTranscript)
    }
    if (storedUrl) {
      setVideoUrl(storedUrl)
    }
  }, [])

  const handleTranslate = async () => {
    if (!transcript) return
    setLoading(true)
    setTranslatedText('')
    try {
      let textToTranslate = transcript
      if (translationMode === 'summary') {
        // Read summary from localStorage instead of backend
        const summary = localStorage.getItem('videoSummary')
        if (!summary) {
          setTranslatedText('No video summary available for translation. Please generate summary first.')
          setLoading(false)
          return
        }
        textToTranslate = summary
      }
      const res = await axios.post('http://127.0.0.1:8000/translate', {
        text: textToTranslate,
        target_language: targetLanguage,
        method: engine,
      })
      if (res.data.translated_text) {
        setTranslatedText(res.data.translated_text)
      }
    } catch (err) {
      setTranslatedText('Translation failed.')
    } finally {
      setLoading(false)
    }
  }

  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const readAloud = async () => {
    if (translatedText) {
      setSpeaking(true)
      try {
        // Call backend gtts_speech endpoint
        const formData = new FormData()
        formData.append('text', translatedText)
        formData.append('lang', targetLanguage)

        const response = await axios.post('http://127.0.0.1:8000/gtts_speech', formData, {
          responseType: 'blob',
        })

        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        if (audioRef.current) {
          audioRef.current.pause()
          URL.revokeObjectURL(audioRef.current.src)
          audioRef.current = null
        }

        const audio = new Audio(url)
        audioRef.current = audio
        audio.play()
        audio.onended = () => {
          setSpeaking(false)
          URL.revokeObjectURL(url)
          setAudioUrl(null)
          audioRef.current = null
        }
      } catch (error) {
        setSpeaking(false)
        console.error('Error playing speech:', error)
      }
    }
  }

  const stopReadAloud = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      URL.revokeObjectURL(audioRef.current.src)
      setAudioUrl(null)
      audioRef.current = null
    }
    setSpeaking(false)
  }

  const downloadTranslation = () => {
    if (!translatedText) return
    const blob = new Blob([translatedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'translation.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

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
            🌐 Language Translation
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
            Translate the transcript using your preferred engine
          </Typography>
        </AnimatedBox>

        <AnimatedBox>
          <StyledPaper>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Video URL:
            </Typography>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: '#12121b', mb: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                {videoUrl}
              </Typography>
            </Paper>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#fff' }}>Translation Engine</InputLabel>
              <Select
                value={engine}
                label="Translation Engine"
                onChange={(e) => setEngine(e.target.value)}
                sx={{ color: '#fff' }}
              >
                <MenuItem value="google">Google Translate</MenuItem>
                <MenuItem value="nllb">NLLB-200</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#fff' }}>Translation Mode</InputLabel>
              <Select
                value={translationMode}
                label="Translation Mode"
                onChange={(e) => setTranslationMode(e.target.value)}
                sx={{ color: '#fff' }}
              >
                <MenuItem value="transcript">Translate Full Transcript</MenuItem>
                <MenuItem value="summary">Translate Video Summary</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#fff' }}>Target Language</InputLabel>
              <Select
                value={targetLanguage}
                label="Target Language"
                onChange={(e) => setTargetLanguage(e.target.value)}
                sx={{ color: '#fff' }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="ta">Tamil</MenuItem>
                <MenuItem value="bn">Bengali</MenuItem>
                <MenuItem value="te">Telugu</MenuItem>
                <MenuItem value="ml">Malayalam</MenuItem>
                <MenuItem value="mr">Marathi</MenuItem>
                <MenuItem value="gu">Gujarati</MenuItem>
                <MenuItem value="pa">Punjabi</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={handleTranslate} disabled={loading}>
                {loading ? 'Translating...' : 'Translate'}
              </Button>
              <Button variant="outlined" onClick={speaking ? stopReadAloud : readAloud} disabled={!translatedText}>
                {speaking ? 'Stop Read Aloud' : 'Read Aloud'}
              </Button>
              <Button variant="outlined" onClick={downloadTranslation} disabled={!translatedText}>
                Download
              </Button>
            </Box>

            {translatedText && (
              <Paper
                elevation={0}
                sx={{
                  mt: 4,
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
                  {translatedText}
                </Typography>
              </Paper>
            )}
          </StyledPaper>
        </AnimatedBox>
      </Container>
    </Box>
  )
}

export default Translate
