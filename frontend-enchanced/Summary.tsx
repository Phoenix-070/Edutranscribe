import React, { useState, useEffect } from 'react'
import { Container, Typography, Button, CircularProgress, Box, Paper } from '@mui/material'
import axios from 'axios'

const Summary = () => {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoUrl, setVideoUrl] = useState<string>('') // Video URL to display
  const [speaking, setSpeaking] = useState(false)  // State to track if speech is playing

  useEffect(() => {
    // Retrieve video URL from localStorage (instead of transcript)
    const storedUrl = localStorage.getItem('videoUrl')
    if (storedUrl) {
      setVideoUrl(storedUrl)  // Set video URL to be displayed
    } else {
      setError('No video URL available. Please transcribe a video first.')
    }
  }, [])

  const handleSummarize = async () => {
    setLoading(true)
    setSummary('')
    setError('')
    try {
      // Call the backend summarize endpoint
      const response = await axios.post('http://127.0.0.1:8000/summarize', { text: videoUrl })

      if (response.data.summary) {
        setSummary(response.data.summary)
      } else {
        setError('Failed to generate summary')
      }
    } catch (err) {
      setError('Something went wrong while summarizing.')
    } finally {
      setLoading(false)
    }
  }

  // Function to clean the text and remove symbols like asterisks and unwanted characters
  const cleanTextForTTS = (text: string) => {
    return text.replace(/[^\w\s]|_/g, "")  // Remove special symbols and asterisks
  }

  const readAloudSummary = () => {
    if (summary) {
      const cleanedText = cleanTextForTTS(summary)  // Clean summary text before reading aloud
      const speech = new SpeechSynthesisUtterance(cleanedText)  // Create a speech synthesis object
      speech.lang = "en-US"  // Set language code
      window.speechSynthesis.speak(speech)  // Speak the summary text

      setSpeaking(true)

      // Listen to when speech ends to reset state
      speech.onend = () => setSpeaking(false)
    }
  }

  const stopReadAloud = () => {
    window.speechSynthesis.cancel()  // Stop the speech immediately
    setSpeaking(false)  // Reset the state
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Summarize Transcript
      </Typography>

      {!videoUrl && !error && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {videoUrl && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Video URL:</Typography>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: '#1e1e2f' }}>
            <Typography variant="body1" color="text.secondary">
              {videoUrl}
            </Typography>
          </Paper>

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSummarize}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Summarize Transcript'}
          </Button>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={readAloudSummary}
              disabled={!summary || speaking}
            >
              {speaking ? 'Stop Read Aloud' : 'Read Aloud Summary'}
            </Button>
          </Box>
        </Box>
      )}

      {summary && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Summary:</Typography>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: '#1e1e2f' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {summary}
            </Typography>
          </Paper>
        </Box>
      )}

    </Container>
  )
}

export default Summary
