const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface UploadResumeResponse {
  success: boolean;
  message: string;
  name: string;
  chunks_stored: number;
  text_length: number;
}

export interface GenerateQuestionsResponse {
  success: boolean;
  name: string;
  job_title: string;
  questions: string[];
  total_questions: number;
}

export interface StartInterviewResponse {
  success: boolean;
  session_id: string;
  message: string;
}

export interface SubmitAnswerResponse {
  success: boolean;
  question_index: number;
  is_complete: boolean;
  message?: string;
}

export interface InterviewStatusResponse {
  session_id: string;
  current_question_index: number;
  total_questions: number;
  status: string;
  is_complete: boolean;
}

export interface AnalyzeInterviewResponse {
  success: boolean;
  interview_id: string;
  scores: {
    overall: number;
    content: number;
    delivery: number;
    technical: number;
    communication: number;
  };
  feedback: string[];
}

export interface InterviewHistoryResponse {
  success: boolean;
  interviews: Array<{
    interview_id: string;
    job_title: string;
    completed_at: string;
    overall_score: number;
    scores: any;
  }>;
}

export interface InterviewResultsResponse {
  success: boolean;
  interview: {
    interview_id: string;
    job_title: string;
    completed_at: string;
    questions_answers: Array<{
      question: string;
      answer: string;
    }>;
    scores: any;
    feedback: string[];
  };
}

export interface STTResponse {
  success: boolean;
  transcription: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface ApiError {
  error: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Check if we're online
    if (!navigator.onLine) {
      throw new Error("You appear to be offline. Please check your internet connection and try again.");
    }

    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      throw new Error('Authentication required. Please sign in again.');
    }

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ error: 'Network error' }));

      // Provide more specific error messages
      if (response.status === 404) {
        throw new Error("Service not found. Please try again later.");
      } else if (response.status === 500) {
        throw new Error("Server error. Our team has been notified. Please try again later.");
      } else if (response.status >= 400 && response.status < 500) {
        throw new Error(errorData.error || `Request failed (${response.status})`);
      } else {
        throw new Error("Network error. Please check your connection and try again.");
      }
    }

    return response.json();
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async uploadResume(name: string, file: File): Promise<UploadResumeResponse> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('resume', file);

    const response = await fetch(`${this.baseUrl}/api/upload-resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async generateQuestions(
    name: string,
    jobTitle: string,
    numQuestions: number = 5
  ): Promise<GenerateQuestionsResponse> {
    return this.request<GenerateQuestionsResponse>('/api/generate-questions', {
      method: 'POST',
      body: JSON.stringify({
        name,
        job_title: jobTitle,
        num_questions: numQuestions,
      }),
    });
  }

  // Interview methods
  async startInterview(jobTitle: string, questions: string[]): Promise<StartInterviewResponse> {
    return this.request<StartInterviewResponse>('/api/interview/start', {
      method: 'POST',
      body: JSON.stringify({
        job_title: jobTitle,
        questions: questions,
      }),
    });
  }

  async submitAnswer(sessionId: string, answer: string): Promise<SubmitAnswerResponse> {
    return this.request<SubmitAnswerResponse>(`/api/interview/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        answer: answer,
      }),
    });
  }

  async getInterviewStatus(sessionId: string): Promise<InterviewStatusResponse> {
    return this.request<InterviewStatusResponse>(`/api/interview/${sessionId}/status`);
  }

  async analyzeInterview(sessionId: string): Promise<AnalyzeInterviewResponse> {
    return this.request<AnalyzeInterviewResponse>(`/api/interview/${sessionId}/analyze`, {
      method: 'POST',
    });
  }

  async getInterviewHistory(): Promise<InterviewHistoryResponse> {
    return this.request<InterviewHistoryResponse>('/api/interview/history');
  }

  async getInterviewResults(interviewId: string): Promise<InterviewResultsResponse> {
    return this.request<InterviewResultsResponse>(`/api/interview/${interviewId}/results`);
  }

  // STT/TTS methods
  async processSpeech(audioData: string): Promise<STTResponse> {
    return this.request<STTResponse>('/api/stt/process', {
      method: 'POST',
      body: JSON.stringify({
        audio_data: audioData,
      }),
    });
  }

  // Authentication methods
  async register(name: string, email: string, password: string, confirmPassword: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        confirmPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);