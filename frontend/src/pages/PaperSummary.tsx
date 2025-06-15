import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  IconButton,
  Tooltip,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.02)',
  borderRadius: '12px',
  padding: '20px',
  marginTop: '16px',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.03)',
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
}));

const PaperSummary = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [pdfId, setPdfId] = React.useState('');
  const [pdfList, setPdfList] = React.useState<string[]>([]);

  useEffect(() => {
    // Fetch list of uploaded PDFs from backend API
    const fetchUploadedPapers = async () => {
      try {
        const response = await fetch('http://localhost:8000/list_uploaded_papers');
        const data = await response.json();
        const ids = data.papers.map((p: { id: string }) => p.id);
        setPdfList(ids);
        setPdfId(ids[0] || '');
      } catch (error) {
        console.error('Error fetching uploaded papers:', error);
      }
    };
    fetchUploadedPapers();
  }, []);

  useEffect(() => {
    if (!pdfId) return;
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/paper-summary?pdf_id=${pdfId}`);
        setSummary(response.data.summary);
      } catch (err) {
        setError('Error fetching summary. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [pdfId]);

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            mb: 4,
            background: 'linear-gradient(45deg, #2196F3, #64B5F6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Research Paper Summary
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="pdf-select-label">Select Paper</InputLabel>
          <Select
            labelId="pdf-select-label"
            value={pdfId}
            label="Select Paper"
            onChange={(e) => setPdfId(e.target.value)}
          >
            {pdfList.map((id) => (
              <MenuItem key={id} value={id}>
                Paper {id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography
          variant="h6"
          align="center"
          sx={{
            mb: 6,
            color: 'text.secondary',
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          AI-generated summary of your research paper
        </Typography>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingContainer>
                <CircularProgress />
              </LoadingContainer>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-message': { fontSize: '1rem' },
                }}
              >
                {error}
              </Alert>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StyledCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DescriptionIcon color="primary" sx={{ fontSize: 28 }} />
                    <Typography variant="h6">
                      Summary
                    </Typography>
                  </Box>
                  <Tooltip
                    title={copied ? "Copied!" : "Copy to clipboard"}
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                  >
                    <IconButton onClick={copyToClipboard} color="primary">
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <ContentBox>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-line',
                      lineHeight: 1.8,
                      color: 'text.primary',
                      fontSize: '1.1rem',
                    }}
                  >
                    {summary}
                  </Typography>
                </ContentBox>
              </StyledCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Container>
  );
};

export default PaperSummary;
