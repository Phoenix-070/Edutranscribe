# rag_chat.py
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import LlamaCpp
from langchain.chains import RetrievalQA, ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from typing import List, Dict
import os
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGChatBot:
    def __init__(self, model_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        
        default_model = os.path.join(os.path.dirname(__file__), "models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")
        self.model_path = default_model if os.path.exists(default_model) else model_path
        
        self.qa_chain = None
        self.history: List[Dict[str, str]] = []
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key='answer',
            k=2
        )
        logger.info(f"RAGChatBot initialized with model: {self.model_path}")

    def load_pdf(self, pdf_path: str):
        self.reset()
        try:
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=500,
                chunk_overlap=50,
                separators=["\n## ", "\n### ", "\n#### ", "\n\n", "\n", ". "],
                length_function=len,
            )
            split_docs = splitter.split_documents(docs)
            return split_docs
        except Exception as e:
            logger.error(f"Error loading PDF: {str(e)}", exc_info=True)
            raise

    def create_chain(self, docs):
        try:
            embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-mpnet-base-v2",
                model_kwargs={'device': 'cpu'}
            )

            vectorstore_dir = os.path.join(os.path.dirname(__file__), "vectorstore")
            
            if os.path.exists(vectorstore_dir):
                vectorstore = FAISS.load_local(vectorstore_dir, embeddings, allow_dangerous_deserialization=True)
            else:
                vectorstore = FAISS.from_documents(docs, embeddings)
                os.makedirs(vectorstore_dir, exist_ok=True)
                vectorstore.save_local(vectorstore_dir)

            retriever = vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3, "score_threshold": 0.5}
            )

            llm = LlamaCpp(
                model_path=self.model_path,
                n_ctx=2048,
                temperature=0.3,
                top_p=0.95,
                top_k=40,
                n_threads=6,
                repeat_penalty=1.1,
                verbose=False,
                f16_kv=True,
                stop=["Question:", "Context:", "Instructions:"]
            )

            template = r"""You are an expert research assistant having a conversation about a research paper. 
You have deep understanding of the paper's content and can explain complex concepts in a clear, conversational way.

Context from the paper:
{context}

Previous conversation:
{chat_history}

Question:
{question}
Answer:"""

            PROMPT = PromptTemplate(
                template=template,
                input_variables=["context", "chat_history", "question"]
            )

            self.qa_chain = ConversationalRetrievalChain.from_llm(
                llm=llm,
                retriever=retriever,
                memory=self.memory,
                return_source_documents=True,
                combine_docs_chain_kwargs={"prompt": PROMPT}
            )
        except Exception as e:
            logger.error(f"Error creating chain: {str(e)}", exc_info=True)
            raise

    def ask(self, query: str) -> str:
        if not self.qa_chain:
            return "❗ PDF not uploaded or processed yet."
        try:
            response = self.qa_chain.invoke({"question": query})
            if isinstance(response, dict):
                result = response.get("answer", "")
                source_docs = response.get("source_documents", [])
                formatted_response = result + "\n\nSources:"
                seen_pages = set()
                page_sources = {}
                for doc in source_docs:
                    page_num = doc.metadata.get('page', None)
                    if page_num is not None and page_num not in seen_pages:
                        seen_pages.add(page_num)
                        content = doc.page_content.strip()
                        sentences = content.split('.')
                        relevant_quote = None
                        for sentence in sentences:
                            if re.search(r'\d+|accuracy|algorithm|method|result', sentence.lower()):
                                relevant_quote = sentence.strip()
                                break
                        if relevant_quote:
                            page_sources[page_num] = relevant_quote
                for page_num in sorted(page_sources.keys()):
                    formatted_response += f"\n\nPage {page_num}:"
                    formatted_response += f"\n• {page_sources[page_num]}"
                result = formatted_response
            else:
                result = str(response)
            self.history.append({"question": query, "answer": result})
            return result
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}", exc_info=True)
            return f"⚠️ Error while generating answer: {str(e)}"

    def get_history(self) -> List[Dict[str, str]]:
        return self.history

    def reset(self):
        self.qa_chain = None
        self.history = []
        self.memory.clear()

    def get_summary(self) -> str:
        if not self.qa_chain:
            return "❗ PDF not uploaded or processed yet."
        try:
            summary_prompt = r"""You are an expert research assistant. Provide a concise summary of the following context from a research paper:

Context:
{context}

Summary:"""
            retriever = self.qa_chain.retriever
            docs = retriever.invoke("")
            context_text = "\n\n".join([doc.page_content for doc in docs])
            llm = self.qa_chain.llm_chain.llm
            prompt_template = PromptTemplate(
                template=summary_prompt,
                input_variables=["context"]
            )
            prompt = prompt_template.format(context=context_text)
            summary_response = llm(prompt)
            summary_text = summary_response.strip()
            return summary_text
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}", exc_info=True)
            return "⚠️ Error generating summary."
