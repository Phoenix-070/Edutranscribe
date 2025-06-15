
# 🎓 EduTranscribe  
**AI-Powered Learning System for Transcription, Summarization, and Translation**

EduTranscribe is a full-stack, AI-driven educational platform designed to make learning materials more accessible and inclusive. It supports automated transcription of YouTube lectures, smart summarization of academic content, multilingual translation, text-to-speech for auditory learners, and a research paper assistant powered by an RAG-based chatbot.

---

## 🌟 Features

- 🎙️ **Real-Time Transcription** of YouTube videos using OpenAI Whisper ASR
- 🧠 **Smart Summarization** via Gemini Pro
- 🌐 **Multilingual Translation** using Deep Translator & NLLB (No Language Left Behind)
- 🔊 **Text-to-Speech (TTS)** playback using gTTS and Web Speech Synthesis
- 📄 **Research Companion** with PDF upload, summarization, and intelligent Q&A using LLaMA-2 + RAG chatbot
- 🔒 **Firebase Authentication** for secure user login via Google or Email
- 📥 **Downloadable Reports** in PDF/Word format
- 🌍 Supports regional languages like Tamil, Hindi, and Telugu

---

## 🛠️ Tech Stack

### Frontend:
- React.js + Material UI
- Axios for API calls
- HTML/CSS/JS

### Backend:
- Flask (Python)
- Hugging Face Transformers
- Google Gemini Pro API
- Whisper ASR
- PyPDF2 for PDF parsing

### AI Tools:
- Whisper (Transcription)
- Gemini Pro (Summarization)
- Deep Translator + NLLB (Translation)
- gTTS + Web Speech Synthesis (TTS)
- LLaMA-2 + RAG for Chatbot

### DevOps:
- Firebase (Authentication)
- GitHub Actions (CI/CD)
- Localhost & Docker-ready

---

## 📁 Folder Structure

```
EduTranscribe/
├── backend/
│   ├── app.py
│   ├── summarizer.py
│   ├── model.py
│   └── utils.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── research.ts
│   │   └── ...
├── uploads/
├── screenshots/
├── requirements.txt
├── README.md
└── .env
```

---

## ⚙️ Installation

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/EduTranscribe.git
cd EduTranscribe
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 📌 Use Cases

- 🧑‍🎓 Students – Convert lectures into notes, summaries, and translations.
- 🧑‍🏫 Educators – Create accessible course content in multiple languages.
- 🧑‍🔬 Researchers – Upload and interact with research papers via chatbot.
- 🎧 Auditory Learners – Use TTS to listen to academic content on the go.
- 🌐 Multilingual Users – Learn in your preferred language with ease.

---

## 🧠 Key Learning Outcomes

- Building an end-to-end full-stack AI application
- Working with multilingual NLP tools
- Speech-to-text integration using Whisper
- Research paper parsing and summarization with LLaMA-2
- Firebase-based secure user authentication

---

## 📈 Future Enhancements

- Real-time collaboration tools for group learning
- Improved summarization for highly technical papers
- Enhanced UI for mobile responsiveness
- Offline mode for low-connectivity areas
- LMS (Learning Management System) integration

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Authors

- [Aravindh M] (https://github.com/Phoenix-070)
- [Srinidhi B S] (https://github.com/srinidhi1109)

