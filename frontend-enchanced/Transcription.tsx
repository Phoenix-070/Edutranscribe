import React, { useState } from 'react'
import { TextField, Button, Typography, Container, CircularProgress, Box, Paper } from '@mui/material'
import axios from 'axios'

const Transcription = () => {
  const [url, setUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('')
  const [copied, setCopied] = useState(false)

  const handleTranscribe = async () => {
    if (!url) return
    setLoading(true)
    setTranscript('')
    try {
      const res = await axios.post('http://127.0.0.1:8000/transcribe', { url })
      if (res.data.transcript) {
        setTranscript(res.data.transcript)
        setSource(res.data.source)

        // Store transcript and url in localStorage
        localStorage.setItem('transcript', res.data.transcript)
        localStorage.setItem('videoUrl', url)

      } else {
        setTranscript('No transcript found or error occurred.')
      }
    } catch (err) {
      setTranscript('Something went wrong while transcribing.')
    } finally {
      setLoading(false)
    }
  }

  const copyTranscriptToClipboard = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript).then(() => {
        setCopied(true)  // Set copied state to true
        setTimeout(() => setCopied(false), 2000)  // Reset copied state after 2 seconds
      }).catch(err => {
        alert('Failed to copy transcript: ' + err)
      })
    }
  }
  

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={4} sx={{ p: 4, backgroundColor: '#1e1e2f' }}>
        <Typography variant="h4" color="primary" fontWeight={600} gutterBottom>
          🎙️ Transcribe YouTube Video
        </Typography>

        <TextField
          fullWidth
          label="Paste YouTube URL"
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          sx={{ my: 2, input: { color: '#fff' }, label: { color: '#90caf9' } }}
        />

        <Button
          variant="contained"
          onClick={handleTranscribe}
          disabled={loading}
          sx={{ mt: 2, textTransform: 'none', fontWeight: 'bold' }}
        >
          {loading ? <CircularProgress size={24} /> : '🎯 Get Transcript'}
        </Button>


        {transcript && (
          <Box mt={4}>
            <Typography variant="subtitle1" color="secondary">
              Transcript Source: {source}
            </Typography>
            <Paper elevation={2} sx={{ mt: 2, p: 2, backgroundColor: '#12121b' }}>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {transcript}
              </Typography>
            </Paper>
          </Box>
          
        )}
      </Paper>
    </Container>
  )
}

export default Transcription
