# summarize.py

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_text(text: str) -> str:
    model = genai.GenerativeModel("models/gemini-1.5-pro-latest")
    
    prompt = f"""
You are a research assistant. Read the following research paper text and provide a detailed summary based on:

1. **Introduction** - What is the research about? What problem does it address?
2. **Methodology** - What methods or experiments were used?
3. **Key Findings** - What are the major results?
4. **Conclusions & Implications** - What do the results mean? How does this research contribute to its field?

Text:
{text}

Provide the summary in a structured, readable format.
"""

    response = model.generate_content(prompt)
    return response.text
