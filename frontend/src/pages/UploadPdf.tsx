import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

const AnimatedBackgroundCanvas = styled('canvas')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 0,
});

const DropzoneBox = styled(Paper)(({ theme }) => ({
  border: '2px dashed rgba(33, 150, 243, 0.6)',
  borderRadius: '16px',
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: 'rgba(33, 150, 243, 0.05)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderColor: 'rgba(33, 150, 243, 0.8)',
  },
}));

const UploadPdf: React.FC = () => {
  const [uploadedPapers, setUploadedPapers] = useState<{ id: string; filename: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated background effect
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const symbols = ['📚', '🎓', '✏️', '💡', '🔬', '🌍', '📱', '🤖', '👨‍🎓', '👩‍🎓'];
    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      symbol: string;
      size: number;
      opacity: number;
      rotation: number;
    }> = [];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.5 + Math.random() * 1,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 16 + Math.random() * 14,
        opacity: 0.1 + Math.random() * 0.3,
        rotation: Math.random() * 360,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.y -= particle.speed;
        particle.rotation += 0.5;
        if (particle.y < -50) particle.y = height + 50;

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.font = `${particle.size}px Arial`;
        ctx.fillStyle = `rgba(33, 150, 243, ${particle.opacity})`;
        ctx.fillText(particle.symbol, -particle.size / 2, particle.size / 2);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    // Fetch uploaded papers from backend
    fetch('http://localhost:8000/list_uploaded_papers')
      .then((res) => res.json())
      .then((data) => {
        setUploadedPapers(data.papers);
        if (data.papers.length > 0) {
          setSelectedPaperId(data.papers[0].id);
        }
      })
      .catch((err) => {
        console.error('Error fetching uploaded papers:', err);
        setError('Failed to load uploaded papers.');
      });
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload_paper', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('File uploaded successfully');
        // Refresh uploaded papers list
        const updatedResponse = await fetch('http://localhost:8000/list_uploaded_papers');
        const updatedData = await updatedResponse.json();
        setUploadedPapers(updatedData.papers);
        if (updatedData.papers.length > 0) {
          setSelectedPaperId(updatedData.papers[0].id);
        }
        setFile(null);
      } else {
        setError('Upload failed: ' + data.detail);
      }
    } catch (error) {
      setError('Upload error: ' + error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, position: 'relative', zIndex: 1 }}>
      <AnimatedBackgroundCanvas ref={canvasRef} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Upload Research Paper (PDF)
        </Typography>

        <DropzoneBox {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography variant="h6" color="primary">
              Drop the PDF file here...
            </Typography>
          ) : (
            <Typography variant="h6" color="textSecondary">
              Drag & drop a PDF file here, or click to select a file
            </Typography>
          )}
          {file && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Selected file: {file.name}
            </Typography>
          )}
        </DropzoneBox>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
          Uploaded Papers
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="uploaded-papers-label">Select Paper</InputLabel>
          <Select
            labelId="uploaded-papers-label"
            value={selectedPaperId}
            label="Select Paper"
            onChange={(e) => setSelectedPaperId(e.target.value)}
          >
            {uploadedPapers.map((paper) => (
              <MenuItem key={paper.id} value={paper.id}>
                {paper.filename}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            component={Link}
            to="/paper-summary"
            variant="outlined"
            color="primary"
          >
            View Summary
          </Button>
          <Button
            component={Link}
            to="/chatbot"
            variant="outlined"
            color="primary"
          >
            Ask Questions
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default UploadPdf;
