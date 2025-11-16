import { create } from 'zustand';

interface InterviewState {
  resumeId: string | null;
  resumeUploaded: boolean;
  jobTitle: string;
  jobDescription: string;
  seniorityLevel: string;
  difficultyLevel: string;
  conversation: Array<{ role: string; content: string }>;
  currentQuestion: string;
  interviewActive: boolean;
  interviewId: string | null;
  setResumeId: (id: string | null) => void;
  setResumeUploaded: (uploaded: boolean) => void;
  setJobTitle: (title: string) => void;
  setJobDescription: (description: string) => void;
  setSeniorityLevel: (level: string) => void;
  setDifficultyLevel: (level: string) => void;
  addMessage: (message: { role: string; content: string }) => void;
  setCurrentQuestion: (question: string) => void;
  setInterviewActive: (active: boolean) => void;
  setInterviewId: (id: string | null) => void;
  resetInterview: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  resumeId: null,
  resumeUploaded: false,
  jobTitle: '',
  jobDescription: '',
  seniorityLevel: 'mid',
  difficultyLevel: 'medium',
  conversation: [],
  currentQuestion: '',
  interviewActive: false,
  interviewId: null,
  setResumeId: (id) => set({ resumeId: id }),
  setResumeUploaded: (uploaded) => set({ resumeUploaded: uploaded }),
  setJobTitle: (title) => set({ jobTitle: title }),
  setJobDescription: (description) => set({ jobDescription: description }),
  setSeniorityLevel: (level) => set({ seniorityLevel: level }),
  setDifficultyLevel: (level) => set({ difficultyLevel: level }),
  addMessage: (message) => set((state) => ({ conversation: [...state.conversation, message] })),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setInterviewActive: (active) => set({ interviewActive: active }),
  setInterviewId: (id) => set({ interviewId: id }),
  resetInterview: () => set({
    conversation: [],
    currentQuestion: '',
    interviewActive: false,
    interviewId: null,
  }),
}));
