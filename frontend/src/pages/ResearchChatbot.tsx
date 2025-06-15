import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
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
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

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

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.03)',
    },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)',
    },
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: '12px 32px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.2s ease',
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

const Chatbot = () => {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  };

  const [pdfId, setPdfId] = React.useState('');
  const [pdfList, setPdfList] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Fetch list of uploaded PDFs from backend API
    const fetchUploadedPapers = async () => {
      try {
        const response = await fetch('http://localhost:8000/list_uploaded_papers');
        const data = await response.json();
        setPdfList(data.papers.map((p: { id: string }) => p.id));
        setPdfId(data.papers.length > 0 ? data.papers[0].id : '');
      } catch (error) {
        console.error('Error fetching uploaded papers:', error);
      }
    };
    fetchUploadedPapers();
  }, []);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/ask_question', { question, pdf_id: pdfId });
      setAnswer(response.data.answer);
    } catch (err) {
      setError('Failed to get an answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const copyToClipboard = () => {
    if (answer) {
      navigator.clipboard.writeText(answer);
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
          Research Assistant Chatbot
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
            mx: 'auto'
          }}
        >
          Ask questions about your research paper and get AI-powered answers
        </Typography>

        <StyledCard>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <StyledTextField
              label="Ask a question about the research paper..."
              variant="outlined"
              value={question}
              onChange={handleQuestionChange}
              onKeyPress={handleKeyPress}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <ActionButton
              variant="contained"
              onClick={handleAskQuestion}
              disabled={loading || !question.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{ mt: 1 }}
            >
              {loading ? 'Thinking...' : 'Ask'}
            </ActionButton>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                '& .MuiAlert-message': { fontSize: '1rem' }
              }}
            >
              {error}
            </Alert>
          )}

          <AnimatePresence>
            {answer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <QuestionAnswerIcon color="primary" sx={{ fontSize: 28 }} />
                      <Typography variant="h6">
                        Answer
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
                      {answer}
                    </Typography>
                  </ContentBox>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </StyledCard>
      </motion.div>
    </Container>
  );
};

export default Chatbot;
