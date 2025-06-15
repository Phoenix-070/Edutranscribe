import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface UploadResponse {
  message: string;
  pdf_id: string;
}

export interface ChatHistoryItem {
  question: string;
  answer: string;
}

export interface ChatResponse {
  answer: string;
  history: ChatHistoryItem[];
}

export interface ChatHistoryResponse {
  history: ChatHistoryItem[];
}

export const uploadPdf = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<UploadResponse>(
    `${API_BASE_URL}/upload_paper`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const sendQuestion = async (pdf_id: string, question: string): Promise<ChatResponse> => {
  const response = await axios.post<ChatResponse>(`${API_BASE_URL}/answer`, {
    pdf_id,
    question,
  });
  return response.data;
};

export const getChatHistory = async (pdf_id: string): Promise<ChatHistoryResponse> => {
  const response = await axios.get<ChatHistoryResponse>(`${API_BASE_URL}/chat_history/${pdf_id}`);
  return response.data;
};
