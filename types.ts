export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ApiLogEntry {
  id: string;
  functionName: 'extractTextFromFile' | 'generateSummary' | 'generateQuiz' | 'chatWithAI';
  startTime: number;
  endTime: number;
  duration: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface StudySession {
    id: string;
    name: string;
    createdAt: string; // Changed to ISO date string for local storage
    sourceText: string;
    summary: string;
    quiz: QuizQuestion[];
    chatHistory: ChatMessage[];
}
