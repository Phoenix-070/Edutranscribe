from fastapi import FastAPI, Request, Form, HTTPException, File, UploadFile
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound
import subprocess
import os
from dotenv import load_dotenv
import whisper
import tempfile
import yt_dlp
from gtts import gTTS
import pyttsx3
from pyttsx3 import init as pyttsx3_init
import re
import google.generativeai as genai
import nltk 
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from sentence_transformers import SentenceTransformer
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
from collections import Counter
import string
from deep_translator import GoogleTranslator
import logging
import fitz
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import LlamaCpp
from langchain.chains import RetrievalQA
from typing import List, Dict
from pathlib import Path
import numpy as np
import faiss  # PyMuPDF
from rag_chatbot import RAGChatBot

# Setup logging for debugging purposes
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model paths
TINY_LLAMA_PATH = os.path.join(os.path.dirname(__file__), "models", "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")
LLAMA_PATH = os.path.join(os.path.dirname(__file__), "models", "llama-2-7b-chat.Q4_K_M.gguf")
# Prefer TinyLlama for faster responses
MODEL_PATH = TINY_LLAMA_PATH if os.path.exists(TINY_LLAMA_PATH) else LLAMA_PATH
logger.info(f"Using model path: {MODEL_PATH}")

# Ensure models directory exists
models_dir = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(models_dir, exist_ok=True)

# Check for required dependencies
try:
    import llama_cpp
    import langchain
    import langchain_community
    logger.info("All required dependencies are installed")
except ImportError as e:
    logger.error(f"Missing required dependency: {str(e)}")
    logger.info("Please install required dependencies: pip install langchain-community langchain llama-cpp-python")

if not os.path.exists(TINY_LLAMA_PATH) and not os.path.exists(LLAMA_PATH):
    logger.warning("No language models found")
    logger.info("Please download either TinyLlama or Llama-2 model and place it in the models directory")

# Download NLTK resources if not already available
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Define the file save path
UPLOAD_DIR = Path("temp_papers")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)  # Ensure the directory exists

app = FastAPI()

# Setup logging for debugging purposes
logging.basicConfig(level=logging.INFO)

from fastapi.responses import StreamingResponse
from io import BytesIO

# CORS to connect with frontend
# CORS setup to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
# Make sure this is called before accessing environment variables

@app.post("/gtts_speech")
async def gtts_speech(text: str = Form(...), lang: str = Form('en')):
    """
    Generate speech audio using gTTS for the given text and language.
    Returns an audio stream (mp3).
    """
    try:
        tts = gTTS(text=text, lang=lang)
        audio_bytes = BytesIO()
        tts.write_to_fp(audio_bytes)
        audio_bytes.seek(0)
        return StreamingResponse(audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"gTTS speech generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"gTTS speech generation failed: {str(e)}")

# Load Whisper model once
whisper_model = whisper.load_model("base")  # You can use "medium" or "large" if needed

# Load NLLB-200 model & tokenizer
model_name = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Set up Gemini Pro API Key
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY) # Make sure to set your Google API key

# Language codes mapping for NLLB-200
language_map = {
    "ta": "tam_Taml",  # Tamil
    "hi": "hin_Deva",  # Hindi
    "bn": "ben_Beng",  # Bengali
    "te": "tel_Telu",  # Telugu
    "ml": "mal_Mlym",  # Malayalam
    "mr": "mar_Deva",  # Marathi
    "gu": "guj_Gujr",  # Gujarati
    "pa": "pan_Guru",  # Punjabi
    "en": "eng_Latn"   # English
}

# Request model for the URL
class TranscribeRequest(BaseModel):
    url: str

class SummarizeRequest(BaseModel):
    text: str

# Request model for translation
class TranslateRequest(BaseModel):
    text: str
    target_language: str  # Include target_language
    method: str  # 'google' for Google Translate, 'nllb' for NLLB-200

# Request model for translation and summary
class TextRequest(BaseModel):
    text: str
    target_language: str = 'en'  # Optional for summary and translation

# Function to extract video ID from YouTube URL
def extract_video_id(url: str) -> str:
    # Check for 'youtu.be' and 'youtube.com' formats
    match = re.search(r"(?:v=|youtu.be\/)([a-zA-Z0-9_-]{11})", url)
    if match:
        return match.group(1)
    raise ValueError("Invalid YouTube URL")

# Function to download audio from YouTube using yt-dlp
import glob

def download_audio_from_youtube(youtube_url: str) -> str:
    temp_dir = tempfile.mkdtemp()
    # Use wildcard in outtmpl to let yt-dlp name the file
    outtmpl = os.path.join(temp_dir, "%(id)s.%(ext)s")

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': outtmpl,
        'quiet': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])

    # After download, find the mp3 file in temp_dir
    audio_files = glob.glob(os.path.join(temp_dir, "*.mp3"))
    if not audio_files:
        logger.error(f"No audio file found in {temp_dir} after download")
        raise FileNotFoundError(f"No audio file found in {temp_dir} after download")

    audio_path = audio_files[0]
    logger.info(f"Audio file downloaded successfully: {audio_path}")
    return audio_path

@app.post("/transcribe")
async def transcribe(request: TranscribeRequest):
    video_url = request.url
    logger.info(f"Received transcription request for URL: {video_url}")

    try:
        # Extract video ID from YouTube URL
        video_id = extract_video_id(video_url)
        logger.info(f"Extracted video ID: {video_id}")

        # Try to extract from YouTube transcript
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            transcript = " ".join([item["text"] for item in transcript_list])
            logger.info("Transcript obtained from YouTube captions")
            return {"transcript": transcript, "source": "captions"}
        except Exception as e:
            logger.warning(f"Failed to get transcript from YouTube captions: {str(e)}")
            logger.info("Falling back to Whisper transcription")

        # Use Whisper for transcription regardless of YouTube transcript availability
        try:
            audio_path = download_audio_from_youtube(video_url)
            logger.info(f"Audio downloaded to {audio_path}, starting Whisper transcription")
            result = whisper_model.transcribe(audio_path)
            logger.info("Whisper transcription completed successfully")
            return {"transcript": result["text"], "source": "whisper"}

        except Exception as e:
            logger.error(f"Whisper transcription failed: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Whisper transcription failed: {str(e)}")

    except ValueError as e:
        logger.error(f"Invalid YouTube URL: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid YouTube URL: {str(e)}")

    except Exception as e:
        logger.error(f"Error processing the video: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing the video: {str(e)}")


# Function to extract key sentences as a fallback when API fails
def local_extractive_summary(text, num_sentences=15):
    """Create a simple extractive summary when API is unavailable."""
    print("Using local extractive summarization as fallback method")
    
    # Split into sentences
    sentences = sent_tokenize(text)
    
    if len(sentences) <= num_sentences:
        return "\n\n".join(sentences)
    
    # Calculate sentence scores using a simple frequency-based approach
    stop_words = set(stopwords.words('english'))
    word_frequencies = Counter()
    
    # Preprocess and count word frequencies
    for sentence in sentences:
        for word in nltk.word_tokenize(sentence.lower()):
            if word not in stop_words and word not in string.punctuation:
                word_frequencies[word] += 1
    
    # Normalize frequencies
    max_frequency = max(word_frequencies.values()) if word_frequencies else 1
    normalized_frequencies = {word: freq/max_frequency for word, freq in word_frequencies.items()}
    
    # Score sentences based on word frequencies
    sentence_scores = {}
    for i, sentence in enumerate(sentences):
        score = 0
        for word in nltk.word_tokenize(sentence.lower()):
            if word in normalized_frequencies:
                score += normalized_frequencies[word]
        # Normalize by sentence length to avoid favoring long sentences
        sentence_scores[i] = score / max(1, len(nltk.word_tokenize(sentence)))
    
    # Get indices of top sentences
    top_indices = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:num_sentences]
    
    # Extract sentences in original order
    top_indices.sort()
    summary_sentences = [sentences[i] for i in top_indices]
    
    # Create bullet point summary
    bullet_summary = []
    for sentence in summary_sentences:
        cleaned = sentence.strip()
        if cleaned:
            bullet_summary.append(f"• {cleaned}")
    
    return "\n\n".join(bullet_summary)

# Function to extract key points from text as a fallback
def extract_key_points(text, max_length=10000):
    """Extract key points from transcript when API quota is exceeded."""
    
    # If text is already short enough, return it directly
    if len(text) <= max_length:
        return text
    
    # First try to extract meaningful sections
    # Look for patterns like "Topic:", "Chapter", "Section", or time markers
    section_patterns = [
        r'(?:Section|Chapter|Part|Topic|Module)\s*\d+:.*?(?=(?:Section|Chapter|Part|Topic|Module)\s*\d+:|$)',
        r'\[\d+:\d+\].*?(?=\[\d+:\d+\]|$)',
        r'\(\d+:\d+\).*?(?=\(\d+:\d+\)|$)',
        r'\d+:\d+\s*-.*?(?=\d+:\d+\s*-|$)'
    ]
    
    for pattern in section_patterns:
        sections = re.findall(pattern, text, re.DOTALL)
        if sections:
            print(f"Found {len(sections)} sections using pattern")
            # Take the beginning, a sample from the middle, and the end
            if len(sections) > 3:
                selected = [sections[0], sections[len(sections)//2], sections[-1]]
                combined = "\n\n".join(selected)
                if len(combined) <= max_length:
                    return combined
    
    # If that didn't work or result is still too long, create local extractive summary
    return local_extractive_summary(text)

# Request body model for /summarize endpoint
class SummarizeRequest(BaseModel):
    text: str

# Summarize endpoint using Gemini Pro
@app.post("/summarize")
async def summarize(request: SummarizeRequest):
    try:
        # Define a more detailed prompt to guide the model's summary
        prompt = f"""You are a helpful assistant that summarizes educational video transcripts.
            Summarize the following transcript in 200-250 words using bullet points, covering all key topics clearly:
        Transcript:
        {request.text}

        Summary (brief, concise, and focused on the key points):
        """

        # Request to Gemini Pro API for summarization
        model = genai.GenerativeModel("models/gemini-1.5-pro-latest")
        response = model.generate_content(prompt)

        # Extract the summarized content from the response
        summary = response.text.strip()
        return {"summary": summary}
    
    except Exception as e:
        error_str = str(e)
        print(f"Gemini summarization error: {error_str}")
        
        # If error is related to quota or rate limit, fallback to local extractive summary
        if "429" in error_str or "quota" in error_str.lower() or "rate limit" in error_str.lower():
            local_summary = extract_key_points(request.text)
            return {
                "summary": f"""
# Transcript Summary 
(Generated using local extraction due to API quota limits)

{local_summary}

---
*Note: This is an extractive summary created without AI due to API quota limitations. 
For full AI summarization, please try again later when API quota resets, or with a shorter video.*
"""
            }
        else:
            raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

# -------------------------------
# ✅ 1. Google Translate (Fast)
# -------------------------------
def split_text(text, max_length=5000):
    chunks = []
    while len(text) > max_length:
        split_at = text[:max_length].rfind(" ")
        if split_at == -1:
            split_at = max_length
        chunks.append(text[:split_at])
        text = text[split_at:].lstrip()
    chunks.append(text)
    return chunks

def translate_deep(text, target_language_code):
    try:
        chunks = split_text(text)
        translated_chunks = [
            GoogleTranslator(source='auto', target=target_language_code).translate(chunk)
            for chunk in chunks
        ]
        return "\n\n".join(translated_chunks)
    except Exception as e:
        print("Deep Translate error:", e)
        return "Translation failed using Google Translate."

# -----------------------------------
# ✅ 2. NLLB-200 (Offline, Accurate)
# -----------------------------------
def translate_nllb(text, target_language_code):
    try:
        if target_language_code not in language_map:
            return "Unsupported language."

        target_lang = language_map[target_language_code]
        sentences = sent_tokenize(text)
        translated_sentences = []

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            tokenizer.src_lang = "eng_Latn"
            encoded = tokenizer(sentence, return_tensors="pt", truncation=True)
            generated_tokens = model.generate(
                **encoded,
                forced_bos_token_id=tokenizer.lang_code_to_id[target_lang],
                max_length=512
            )
            translated = tokenizer.decode(generated_tokens[0], skip_special_tokens=True)
            translated_sentences.append(translated)

        return " ".join(translated_sentences)

    except Exception as e:
        print("NLLB Translation Error:", e)
        return "Translation failed using NLLB."

# Translation endpoint
@app.post("/translate")
async def translate(request: TranslateRequest):
    try:
        text = request.text
        target_language = request.target_language
        method = request.method

        if not text or not target_language:
            raise HTTPException(status_code=400, detail="Text and target language are required")

        if method == 'google':
            # Use Google Translate
            translated_text = translate_deep(text, target_language)
        elif method == 'nllb':
            # Use NLLB-200 for translation
            translated_text = translate_nllb(text, target_language)
        else:
            raise HTTPException(status_code=400, detail="Invalid translation method. Use 'google' or 'nllb'.")

        return {"translated_text": translated_text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error translating text: {str(e)}")


# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize Gemini model
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("models/gemini-1.5-pro-latest")

# Initialize sentence transformer for embeddings
sentence_model = SentenceTransformer("all-MiniLM-L6-v2")

# Global variables to store RAGChatBot instances
uploaded_pdfs = {}  # Store RAGChatBot instances for each PDF
uploaded_papers_metadata = {}  # Store metadata for persistence (in-memory for now)

# Route for uploading research papers
@app.post("/upload_paper")
async def upload_research_paper(file: UploadFile = File(...)):
    """Upload and process a research paper for RAG-based chatbot."""
    logger = logging.getLogger(__name__)
    logger.info(f"Received file upload: {file.filename}")

    if not file.filename.endswith('.pdf'):
        logger.warning(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # Create a temporary file to save the uploaded PDF
        logger.info("Creating temporary file for PDF")
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
            logger.info(f"PDF saved to temporary file: {temp_file_path}")

        # Extract preview text (250-500 words) from PDF
        loader = PyPDFLoader(temp_file_path)
        docs = loader.load()
        full_text = " ".join([doc.page_content for doc in docs])
        words = full_text.split()
        preview_words = words[:500] if len(words) > 500 else words
        preview_text = " ".join(preview_words)

        try:
            # Check if model file exists
            if not os.path.exists(MODEL_PATH):
                logger.error(f"Model file not found at {MODEL_PATH}")
                raise HTTPException(
                    status_code=500,
                    detail="LLM model not found. Please ensure the model file is present in the models directory."
                )

            # Create a new RAGChatBot instance for this PDF
            logger.info(f"Initializing RAGChatBot with model: {MODEL_PATH}")
            chatbot = RAGChatBot(MODEL_PATH)
            
            # Process the PDF
            logger.info("Loading and processing PDF")
            docs = chatbot.load_pdf(temp_file_path)
            logger.info(f"PDF processed into {len(docs)} document chunks")
            
            logger.info("Creating QA chain")
            chatbot.create_chain(docs)

            # Store the processed PDF
            pdf_id = str(len(uploaded_pdfs) + 1)
            uploaded_pdfs[pdf_id] = chatbot
            uploaded_papers_metadata[pdf_id] = {
                "filename": file.filename,
                "path": temp_file_path
            }
            logger.info(f"PDF stored with ID: {pdf_id}")

            return JSONResponse(
                content={
                    "message": "Research paper uploaded and processed successfully",
                    "pdf_id": pdf_id,
                    "preview_text": preview_text
                },
                status_code=200
            )

        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

    except Exception as e:
        logger.error(f"Error handling file upload: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error handling file upload: {str(e)}")

# Request models
class ChatRequest(BaseModel):
    pdf_id: str
    question: str

# Get chat history for a specific PDF
@app.get("/chat_history/{pdf_id}")
async def get_chat_history(pdf_id: str):
    """Get the chat history for a specific PDF."""
    logger = logging.getLogger(__name__)
    logger.info(f"Retrieving chat history for PDF {pdf_id}")

    if pdf_id not in uploaded_pdfs:
        logger.warning(f"PDF ID {pdf_id} not found")
        raise HTTPException(status_code=404, detail="PDF not found")
    
    try:
        chatbot = uploaded_pdfs[pdf_id]
        history = chatbot.get_history()
        logger.info(f"Retrieved {len(history)} chat history entries")
        return JSONResponse(content={"history": history})
    except Exception as e:
        logger.error(f"Error retrieving chat history: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")

@app.post("/answer")
async def chat_with_paper(request: ChatRequest):
    """Handle chat interactions with the uploaded research paper."""
    logger = logging.getLogger(__name__)
    logger.info(f"Received question for PDF {request.pdf_id}: {request.question}")

    if request.pdf_id not in uploaded_pdfs:
        logger.warning(f"PDF ID {request.pdf_id} not found")
        raise HTTPException(status_code=404, detail="PDF not found. Please upload the paper first.")

    try:
        # Get the RAGChatBot instance for this PDF
        logger.info("Retrieving chatbot instance")
        chatbot = uploaded_pdfs[request.pdf_id]
        
        # Get response from the chatbot
        logger.info("Generating response")
        response = chatbot.ask(request.question)
        logger.info("Response generated successfully")
        
        # Get updated history
        history = chatbot.get_history()
        logger.info(f"Chat history updated, total entries: {len(history)}")
        
        return JSONResponse(
            content={
                "answer": response,
                "history": history
            },
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error generating response: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

from fastapi import Query, Body

@app.get("/list_uploaded_papers")
async def list_uploaded_papers():
    """Return a list of uploaded papers with metadata."""
    logger = logging.getLogger(__name__)
    logger.info("Received request to list uploaded papers")

    try:
        papers = []
        for pdf_id, metadata in uploaded_papers_metadata.items():
            papers.append({
                "id": pdf_id,
                "filename": metadata.get("filename", "Unknown")
            })
        logger.info(f"Returning {len(papers)} uploaded papers")
        return JSONResponse(content={"papers": papers}, status_code=200)
    except Exception as e:
        logger.error(f"Error listing uploaded papers: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error listing uploaded papers: {str(e)}")

@app.get("/paper-summary")
async def get_paper_summary(pdf_id: str = Query(..., description="ID of the uploaded PDF")):
    """Return a summary of the uploaded research paper."""
    logger = logging.getLogger(__name__)
    logger.info(f"Received request for paper summary for PDF ID: {pdf_id}")

    if pdf_id not in uploaded_pdfs:
        logger.warning(f"PDF ID {pdf_id} not found")
        raise HTTPException(status_code=404, detail="PDF not found")

    try:
        chatbot = uploaded_pdfs[pdf_id]

        # Use summarizer.py's summarize_text on combined text
        loader = PyPDFLoader(uploaded_papers_metadata[pdf_id]["path"])
        docs = loader.load()
        full_text = " ".join([doc.page_content for doc in docs])
        from summarizer import summarize_text
        summary = summarize_text(full_text)

        logger.info("Returning paper summary")
        return JSONResponse(content={"summary": summary}, status_code=200)

    except Exception as e:
        logger.error(f"Error retrieving paper summary: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving paper summary: {str(e)}")

@app.post("/ask_question")
async def ask_question(request: dict = Body(...)):
    """Handle question asking about the uploaded research paper."""
    logger = logging.getLogger(__name__)
    question = request.get("question")
    pdf_id = request.get("pdf_id")
    logger.info(f"Received question: {question} for PDF ID: {pdf_id}")

    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    if not pdf_id:
        raise HTTPException(status_code=400, detail="PDF ID is required")

    if pdf_id not in uploaded_pdfs:
        logger.warning(f"PDF ID {pdf_id} not found")
        raise HTTPException(status_code=404, detail="PDF not found")

    try:
        chatbot = uploaded_pdfs[pdf_id]

        # Get response from chatbot
        response = chatbot.ask(question)
        logger.info("Generated answer successfully")

        # Get updated history
        history = chatbot.get_history()

        return JSONResponse(content={"answer": response, "history": history}, status_code=200)

    except Exception as e:
        logger.error(f"Error generating answer: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")
