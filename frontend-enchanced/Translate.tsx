import React, { useState, useEffect } from 'react'
import { Container, Typography, Button, CircularProgress, Box, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import axios from 'axios'

const Translate = () => {
  const [transcript, setTranscript] = useState<string | null>('')  // Transcript stored in localStorage
  const [videoUrl, setVideoUrl] = useState<string>('') // Store the video URL from localStorage
  const [language, setLanguage] = useState('hi') // Default language is Hindi
  const [translatedText, setTranslatedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [method, setMethod] = useState('google') // Default method is Google Translate
  const [audioSrc, setAudioSrc] = useState<string | null>(null)  // Audio file source for playback

  // Retrieve the transcript and video URL from localStorage when the component mounts
  useEffect(() => {
    const storedTranscript = localStorage.getItem('transcript')
    const storedUrl = localStorage.getItem('videoUrl') // Get the video URL from localStorage
    if (storedTranscript) {
      setTranscript(storedTranscript)
    }
    if (storedUrl) {
      setVideoUrl(storedUrl)  // Set video URL to be displayed
    } else {
      setError('No transcript available. Please transcribe a video first.')
    }
  }, [])

  const handleTranslate = async () => {
    if (!transcript) return
    setLoading(true)
    setTranslatedText('')
    setError('') // Reset error state
    try {
      const res = await axios.post('http://127.0.0.1:8000/translate', {
        text: transcript,
        target_language: language,
        method: method // Send the selected method to the backend
      })
      if (res.data.translated_text) {
        setTranslatedText(res.data.translated_text)
      } else {
        setError('Failed to translate.')
      }
    } catch (err) {
      setError('Failed to translate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Function to play the translated text
  const handleReadAloud = async () => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/translate_tts', {
        text: translatedText, 
        target_language: language // Send the translated text's language for TTS
      })
      const audioUrl = URL.createObjectURL(res.data) // Convert the response data to a blob URL
      setAudioSrc(audioUrl)
    } catch (err) {
      setError('Error while generating speech.')
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Translate Transcript
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      {videoUrl && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Video URL:</Typography>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: '#1e1e2f' }}>
            <Typography variant="body1" color="text.secondary">
              {videoUrl}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Language Selection Dropdown */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Select Language</InputLabel>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          label="Select Language"
        >
          <MenuItem value="hi">Hindi</MenuItem>
          <MenuItem value="ta">Tamil</MenuItem>
          <MenuItem value="te">Telugu</MenuItem>
          <MenuItem value="gu">Gujarati</MenuItem>
          <MenuItem value="bn">Bengali</MenuItem>
          <MenuItem value="mr">Marathi</MenuItem>
          <MenuItem value="kn">Kannada</MenuItem>
          <MenuItem value="ml">Malayalam</MenuItem>
          <MenuItem value="pa">Punjabi</MenuItem>
        </Select>
      </FormControl>

      {/* Method Selection: Google or NLLB */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Translation Method</InputLabel>
        <Select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          label="Select Method"
        >
          <MenuItem value="google">Google Translate</MenuItem>
          <MenuItem value="nllb">NLLB-200</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleTranslate}
          disabled={loading || !transcript}
          sx={{ fontWeight: 'bold' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Translate Transcript'}
        </Button>
      </Box>

      {translatedText && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" color="primary">Translated Text:</Typography>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: '#1e1e2f' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {translatedText}
            </Typography>
          </Paper>

          {/* Read Aloud Button */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleReadAloud}
              disabled={loading || !translatedText}
              sx={{ fontWeight: 'bold' }}
            >
              Read Aloud Translated Text
            </Button>
          </Box>
        </Box>
      )}

      {/* Audio Player */}
      {audioSrc && (
        <Box sx={{ mt: 4 }}>
          <audio controls>
            <source src={audioSrc} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </Box>
      )}
    </Container>
  )
}

export default Translate
