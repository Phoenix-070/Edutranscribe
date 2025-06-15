import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()

  return (
    <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #1976d2, #90caf9)', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: '#fff', cursor: 'pointer' }} onClick={() => navigate('/')}>
          EduTranscribe
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => navigate('/transcription')} sx={{ '&:hover': { backgroundColor: '#1976d2', color: '#fff' } }}>
            Transcription
          </Button>
          <Button color="inherit" onClick={() => navigate('/summary')} sx={{ '&:hover': { backgroundColor: '#1976d2', color: '#fff' } }}>
            Summary
          </Button>
          <Button color="inherit" onClick={() => navigate('/translate')} sx={{ '&:hover': { backgroundColor: '#1976d2', color: '#fff' } }}>
            Translate
          </Button>
          <Button color="inherit" onClick={() => navigate('/research')} sx={{ '&:hover': { backgroundColor: '#1976d2', color: '#fff' } }}>
            Research
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
