import React from 'react'
import { Box, Container, Typography, Button } from '@mui/material'
import { styled } from '@mui/system'

const ResearchContainer = styled(Box)(({ theme }) => ({
  padding: '2rem',
  backgroundColor: '#1e1e2f',
  borderRadius: '12px',
  boxShadow: '0 3px 15px rgba(0, 0, 0, 0.2)',
  color: '#fff',
}))

const ResearchAssistant = () => {
  return (
    <Container>
      <ResearchContainer>
        <Typography variant="h4" gutterBottom>
          Research Assistant
        </Typography>
        <Typography variant="body1" paragraph>
          The Research Assistant feature helps you gather and summarize information efficiently. 
          You can transcribe, summarize, and translate educational content to enhance your learning experience.
        </Typography>
        <Button variant="contained" color="primary">
          Get Started
        </Button>
      </ResearchContainer>
    </Container>
  )
}

export default ResearchAssistant
