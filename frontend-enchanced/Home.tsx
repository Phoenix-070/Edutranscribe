import React from 'react'
import { Box, Container, Grid, Typography, Button, Paper } from '@mui/material'
import { styled } from '@mui/system'
import SchoolIcon from '@mui/icons-material/School'; // Importing icons
import TranslateIcon from '@mui/icons-material/Translate';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VideoLabelIcon from '@mui/icons-material/VideoLabel';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #66ccff, #99ff99)',
  padding: '50px 0',
  textAlign: 'center',
  color: 'white',
  marginBottom: '30px',
}))

const FeatureCard = styled(Paper)(({ theme }) => ({
  backgroundColor: '#2C3E50',
  color: 'white',
  borderRadius: '10px',
  padding: '20px',
  '&:hover': {
    backgroundColor: '#34495E',
    transform: 'scale(1.05)', // Adding scale effect on hover
    transition: 'transform 0.3s',
  },
}))

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection>
        <Container>
          <Typography variant="h3" gutterBottom>
            Empowering Education with Technology
          </Typography>
          <Typography variant="h5" paragraph>
            EduTranscribe helps students and educators by transcribing, summarizing, translating, and reading aloud educational content.
          </Typography>
          <Button variant="contained" size="large" color="primary">
            Start Learning Now
          </Button>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Key Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <FeatureCard>
              <SchoolIcon fontSize="large" />
              <Typography variant="h6">Transcribe Videos</Typography>
              <Typography variant="body2">
                Convert educational videos into text for easier understanding and learning.
              </Typography>
              <Button size="small" color="primary" variant="contained">
                Try Now
              </Button>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <FeatureCard>
              <TranslateIcon fontSize="large" />
              <Typography variant="h6">Summarize Content</Typography>
              <Typography variant="body2">
                Get summaries of long transcripts to grasp key concepts faster.
              </Typography>
              <Button size="small" color="primary" variant="contained">
                Try Now
              </Button>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <FeatureCard>
              <VideoLabelIcon fontSize="large" />
              <Typography variant="h6">Translate Transcripts</Typography>
              <Typography variant="body2">
                Translate transcripts into multiple languages for better accessibility.
              </Typography>
              <Button size="small" color="primary" variant="contained">
                Try Now
              </Button>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <FeatureCard>
              <RecordVoiceOverIcon fontSize="large" />
              <Typography variant="h6">Read Aloud Transcripts</Typography>
              <Typography variant="body2">
                Enable audio for transcripts to listen while you learn.
              </Typography>
              <Button size="small" color="primary" variant="contained">
                Try Now
              </Button>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

export default Home
