import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  useTheme,
  alpha,
  styled,
  Stack,
  LinearProgress,
  Tabs,
  Tab,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  CloudUpload,
  Download,
  Science,
  Search,
  TrendingUp,
  Lightbulb,
  MenuBook,
  Timeline,
  Chat,
} from '@mui/icons-material';

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
  animation: 'fadeIn 0.6s ease-out forwards',
}));

const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: theme.spacing(2),
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-5px)',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`research-tabpanel-${index}`}
      aria-labelledby={`research-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ResearchAssistant: React.FC = () => {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState<{
    summary: string;
    keyFindings: string[];
    methodology: string;
    conclusions: string[];
    references: string[];
  } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    // TODO: Implement paper analysis logic using Gemini Pro
    setIsAnalyzing(false);
    // Mock data
    setAnalysis({
      summary: "This research paper presents a novel approach...",
      keyFindings: [
        "Finding 1: Improved accuracy by 25%",
        "Finding 2: Reduced computational cost",
        "Finding 3: Better scalability"
      ],
      methodology: "The study employed a mixed-methods approach...",
      conclusions: [
        "The proposed method outperforms existing solutions",
        "Further research is needed in specific areas"
      ],
      references: [
        "Smith et al. (2023) - AI in Education",
        "Johnson (2022) - Machine Learning Applications"
      ]
    });
  };

  const downloadAnalysis = () => {
    if (!analysis) return;
    const content = `
Research Paper Analysis

Summary:
${analysis.summary}

Key Findings:
${analysis.keyFindings.join('\n')}

Methodology:
${analysis.methodology}

Conclusions:
${analysis.conclusions.join('\n')}

References:
${analysis.references.join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        py: 8,
      }}
    >
      <Container maxWidth="lg">
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
            Research Assistant
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}
          >
            Your AI-powered research companion for analyzing papers and generating insights
          </Typography>
        </AnimatedBox>

        <Stack spacing={4}>
          {/* Upload Section */}
          <AnimatedBox>
            <UploadBox
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Box sx={{ cursor: 'pointer' }}>
                  <CloudUpload
                    sx={{
                      fontSize: 60,
                      color: theme.palette.primary.main,
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {file ? file.name : 'Drag and drop or click to upload'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports PDF, DOC, and DOCX files
                  </Typography>
                </Box>
              </label>
            </UploadBox>
          </AnimatedBox>

          {/* Analysis Section */}
          {file && (
            <AnimatedBox>
              <Paper
                sx={{
                  borderRadius: 2,
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab icon={<MenuBook />} label="Overview" />
                    <Tab icon={<TrendingUp />} label="Key Findings" />
                    <Tab icon={<Science />} label="Methodology" />
                    <Tab icon={<Lightbulb />} label="Conclusions" />
                    <Tab icon={<Timeline />} label="References" />
                    <Tab icon={<Chat />} label="Ask Questions" />
                  </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                  {!analysis ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        startIcon={<Science />}
                        onClick={startAnalysis}
                        disabled={isAnalyzing}
                      >
                        Analyze Paper
                      </Button>
                      {isAnalyzing && (
                        <Box sx={{ mt: 2 }}>
                          <LinearProgress />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Analyzing paper... Please wait
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <>
                      <TabPanel value={activeTab} index={0}>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                          {analysis.summary}
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={downloadAnalysis}
                        >
                          Download Full Analysis
                        </Button>
                      </TabPanel>

                      <TabPanel value={activeTab} index={1}>
                        <List>
                          {analysis.keyFindings.map((finding, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <TrendingUp color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={finding} />
                            </ListItem>
                          ))}
                        </List>
                      </TabPanel>

                      <TabPanel value={activeTab} index={2}>
                        <Typography variant="body1">
                          {analysis.methodology}
                        </Typography>
                      </TabPanel>

                      <TabPanel value={activeTab} index={3}>
                        <List>
                          {analysis.conclusions.map((conclusion, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Lightbulb color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={conclusion} />
                            </ListItem>
                          ))}
                        </List>
                      </TabPanel>

                      <TabPanel value={activeTab} index={4}>
                        <List>
                          {analysis.references.map((reference, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <MenuBook color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={reference} />
                            </ListItem>
                          ))}
                        </List>
                      </TabPanel>

                      <TabPanel value={activeTab} index={5}>
                        <Stack spacing={3}>
                          <TextField
                            fullWidth
                            label="Ask a question about the paper"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            InputProps={{
                              endAdornment: (
                                <Button
                                  variant="contained"
                                  startIcon={<Search />}
                                  sx={{ ml: 1 }}
                                >
                                  Ask
                                </Button>
                              ),
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Ask questions about methodology, findings, or any specific aspect of the paper
                          </Typography>
                        </Stack>
                      </TabPanel>
                    </>
                  )}
                </Box>
              </Paper>
            </AnimatedBox>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default ResearchAssistant;
