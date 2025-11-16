# AI-Genesis-Hackathon - Current State Documentation

**Last Updated:** November 16, 2025  
**Repository:** https://github.com/AminaAsif9/AI-Genesis-Hackathon  
**Project Type:** AI-Powered Voice Interview Practice Platform  
**License:** MIT License (Copyright 2025 Amina)

---

## Executive Summary

AI-Genesis-Hackathon is a full-stack AI-powered interview preparation platform that enables users to practice job interviews through voice interactions. The system combines resume analysis, job-specific question generation, and real-time voice interview simulation to provide a comprehensive interview training experience.

**Key Features:**
- Resume upload and parsing (PDF/DOCX support)
- AI-powered personalized interview question generation
- Voice-enabled mock interviews
- Job-tailored assessments with customizable difficulty levels
- Interview history and progress tracking
- Modern, responsive glassmorphic UI design

---

## Technology Stack

### Backend (Python/Flask)
- **Framework:** Flask 
- **API Architecture:** RESTful API with CORS support
- **AI/ML Services:**
  - Groq API (openai/gpt-oss-20b model) for question generation
  - Previously used AIMLAPI (commented out in code)
- **Vector Database:** Qdrant Cloud (hosted instance)
- **Document Processing:** PyPDF2 for resume parsing
- **Environment Management:** python-dotenv
- **Additional Libraries:** streamlit (included but not actively used in main app)

### Frontend (React/TypeScript)
- **Framework:** React 19.1.1 with React Router 7.9.2
- **Language:** TypeScript 5.9.2
- **Build Tool:** Vite 7.1.7
- **Styling:** 
  - TailwindCSS 4.1.13 with custom glassmorphic design system
  - Framer Motion 12.23.24 for animations
- **UI Components:** 
  - Radix UI primitives (avatars, dropdowns, labels, progress, selects, slots)
  - Custom components (GlassCard, GradientButton, VoiceWaveAnimation, LoadingDots)
  - shadcn/ui inspired component architecture
- **State Management:** Zustand 5.0.8
- **Icons:** Lucide React 0.553.0
- **Charts:** Recharts 3.4.1
- **Theme:** next-themes 0.4.6 for dark/light mode support
- **Toast Notifications:** Sonner 2.0.7

### Infrastructure
- **Containerization:** Docker (multi-stage build configuration)
- **Version Control:** Git/GitHub
- **Backend Port:** 5000 (configurable via PORT env variable)
- **Frontend Dev Server:** 5173 (Vite default)
- **Frontend Production:** 3000 (via Docker)

---

## Project Structure

```
AI-Genesis-Hackathon/
├── app.py                          # Flask backend application (288 lines)
├── requirements.txt                # Python dependencies (8 packages)
├── LICENSE                         # MIT License
├── README.md                       # Basic project description
├── .gitignore                      # Git ignore rules
├── qdrant_data/                    # Qdrant vector database local data
│   └── meta.json                   # Collection metadata
└── frontend/                       # React frontend application
    ├── Dockerfile                  # Multi-stage Docker build
    ├── package.json                # Node dependencies
    ├── package-lock.json           # Locked dependency versions
    ├── tsconfig.json               # TypeScript configuration
    ├── vite.config.ts              # Vite build configuration
    ├── react-router.config.ts      # React Router configuration
    ├── components.json             # Component library config
    ├── README.md                   # Frontend setup instructions
    ├── .gitignore                  # Frontend-specific ignores
    ├── .dockerignore               # Docker build exclusions
    ├── public/                     # Static assets
    └── app/                        # Application source code
        ├── app.css                 # Global styles (3755 bytes)
        ├── root.tsx                # Root layout component
        ├── routes.ts               # Route definitions
        ├── components/             # Reusable UI components
        │   ├── Footer.tsx
        │   ├── GlassCard.tsx
        │   ├── GradientButton.tsx
        │   ├── LoadingDots.tsx
        │   ├── Navbar.tsx
        │   ├── VoiceWaveAnimation.tsx
        │   └── ui/                 # Radix UI-based primitives
        │       ├── avatar.tsx
        │       ├── button.tsx
        │       ├── dropdown-menu.tsx
        │       ├── input.tsx
        │       ├── label.tsx
        │       ├── progress.tsx
        │       ├── select.tsx
        │       ├── skeleton.tsx
        │       ├── sonner.tsx
        │       └── textarea.tsx
        ├── routes/                 # Page components (8 routes)
        │   ├── home.tsx            # Landing page (152 lines)
        │   ├── login.tsx           # Authentication page (139 lines)
        │   ├── register.tsx        # User registration
        │   ├── dashboard.tsx       # User dashboard (211 lines)
        │   ├── resume.tsx          # Resume upload page (196 lines)
        │   ├── interviewSetup.tsx  # Interview configuration (169 lines)
        │   ├── interviewLive.tsx   # Live interview session (154 lines)
        │   └── interviewResult.tsx # Interview results page
        ├── hooks/                  # Custom React hooks
        │   └── use-toast.tsx       # Toast notification hook
        ├── store/                  # State management
        │   └── useInterviewStore.ts # Zustand store (55 lines)
        └── lib/                    # Utility functions
```

**Total Code Statistics:**
- ~32 source files (TypeScript/Python)
- ~2,997 lines of code (excluding node_modules)
- Languages: Python, TypeScript/TSX, CSS

---

## Backend Architecture (app.py)

### Core Functionality

#### 1. **Resume Processing Pipeline**
- **PDF Extraction:** Uses PyPDF2 to extract text from uploaded PDFs
- **Text Chunking:** Splits resume text into 1000-character chunks with 200-character overlap
- **Vector Embedding:** Custom hash-based embedding function (SHA-256) creates 384-dimensional vectors
- **Storage:** Chunks stored in Qdrant cloud instance with metadata (name, chunk_text, chunk_index)

#### 2. **Qdrant Vector Database Integration**
- **Cloud Instance:** Hosted at `https://6b509411-8035-45bf-aaed-40616d6feb3e.eu-west-2-0.aws.cloud.qdrant.io`
- **Collection:** "resumes" with 384-dimensional COSINE distance vectors
- **Payload Indexing:** Keyword index on "name" field for efficient filtering
- **Initialization:** Auto-creates collection and indexes on startup

#### 3. **AI Question Generation (Groq API)**
- **Model:** openai/gpt-oss-20b
- **Streaming:** Uses streaming API for real-time response generation
- **Prompt Engineering:** System role as "expert technical interviewer"
- **Context Aware:** Uses first 3000 characters of resume + job title
- **Customizable:** Configurable number of questions (default: 5)
- **Post-processing:** Parses numbered/bulleted lists from AI response

### API Endpoints

#### `GET /health`
- **Purpose:** Health check endpoint
- **Response:** `{"status": "healthy", "message": "API is running"}`

#### `POST /api/upload-resume`
- **Purpose:** Upload and process resume files
- **Input:** 
  - Form data with "name" field (required)
  - File upload with "resume" field (required)
  - Supported formats: PDF, TXT, DOC, DOCX
- **Processing:**
  1. Validates file format
  2. Extracts text (PDF via PyPDF2, text files via UTF-8 decode)
  3. Chunks text
  4. Generates embeddings
  5. Stores in Qdrant with user's name
- **Response:** 
  ```json
  {
    "success": true,
    "message": "Resume uploaded successfully for {name}",
    "name": "john_doe",
    "chunks_stored": 5,
    "text_length": 4523
  }
  ```

#### `POST /api/generate-questions`
- **Purpose:** Generate interview questions based on uploaded resume
- **Input:** 
  ```json
  {
    "name": "john_doe",
    "job_title": "Senior Software Engineer",
    "num_questions": 5
  }
  ```
- **Processing:**
  1. Retrieves all resume chunks for the specified name
  2. Reconstructs full resume text
  3. Calls Groq API with resume context and job title
  4. Parses and extracts questions from streamed response
- **Response:** 
  ```json
  {
    "success": true,
    "name": "john_doe",
    "job_title": "Senior Software Engineer",
    "questions": [
      "Tell me about your experience with...",
      "How would you approach..."
    ],
    "total_questions": 5
  }
  ```

### Security & Configuration

**Hardcoded Credentials (Security Risk):**
- Groq API Key: `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`
- Qdrant API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ahAee0KrwlUEsc_Igi8fNuQD5lds6-UYwZqi4C2-PLM`
- Qdrant URL: `https://6b509411-8035-45bf-aaed-40616d6feb3e.eu-west-2-0.aws.cloud.qdrant.io:6333`

**Note:** These credentials are exposed in source code with fallback to environment variables. Should be moved to `.env` file exclusively.

### Error Handling
- Try-catch blocks around all major operations
- Descriptive error messages returned to client
- HTTP status codes: 200 (success), 400 (validation), 404 (not found), 500 (server error)

---

## Frontend Architecture

### Application Flow

1. **Landing Page (`/`)** 
   - Hero section with animated visuals
   - Feature showcase (4 key features)
   - Call-to-action buttons
   - Responsive design with glassmorphic cards

2. **Authentication (`/auth`, `/auth/register`)**
   - Login/Register forms
   - localStorage-based session management (no backend auth yet)
   - Email/password validation
   - Auto-redirect if already authenticated

3. **Dashboard (`/dashboard`)**
   - Welcome message with user's first name
   - Quick action cards: Upload Resume, Start Interview, View History
   - Recent interviews list (currently mock data)
   - Progress tracking placeholder

4. **Resume Upload (`/resume`)**
   - Drag-and-drop file upload interface
   - File type validation (PDF/DOCX)
   - Upload progress indicator
   - Success confirmation with auto-redirect

5. **Interview Setup (`/interview/setup`)**
   - Job title input
   - Job description textarea
   - Seniority level selector (Entry/Mid/Senior/Lead)
   - Difficulty level selector (Easy/Medium/Hard)
   - Starts voice interview session

6. **Live Interview (`/interview/live/:id`)**
   - Voice wave animation
   - Current question display
   - Recording controls (mic button)
   - Conversation history
   - End interview button

7. **Interview Results (`/interview/results/:id`)**
   - Results display page (structure exists)

### State Management (Zustand)

**Global Interview Store (`useInterviewStore`):**
```typescript
{
  resumeId: string | null
  resumeUploaded: boolean
  jobTitle: string
  jobDescription: string
  seniorityLevel: 'entry' | 'mid' | 'senior' | 'lead'
  difficultyLevel: 'easy' | 'medium' | 'hard'
  conversation: Array<{role: string, content: string}>
  currentQuestion: string
  interviewActive: boolean
  interviewId: string | null
}
```

### UI/UX Design System

**Color Palette:**
- Primary gradient: Blue to purple spectrum
- Secondary: Pink/purple tones
- Accent: Bright accent colors
- Background: Dark theme with transparency layers

**Design Patterns:**
- **Glassmorphism:** Frosted glass effect on cards
- **Gradient Buttons:** Multi-color gradient CTAs
- **Animations:** Framer Motion for smooth transitions
- **Voice Visualization:** Animated wave patterns during recording
- **Loading States:** Skeleton loaders and loading dots
- **Toast Notifications:** Non-intrusive feedback system

**Responsive Breakpoints:**
- Mobile-first approach
- Tailwind's default breakpoints (sm, md, lg, xl)
- Grid layouts adapt from 1 to 3 columns

### Component Architecture

**Presentational Components:**
- `GlassCard`: Glassmorphic container with optional hover effect
- `GradientButton`: Multi-gradient button variants (primary, secondary, accent)
- `VoiceWaveAnimation`: Animated wave visualization for voice activity
- `LoadingDots`: Pulsing dot loader
- `Navbar`: Global navigation with logo and auth links
- `Footer`: Site footer with links and branding

**UI Primitives (Radix-based):**
- Form controls: Input, Textarea, Label, Select
- Interactive: Button, Dropdown Menu, Avatar
- Feedback: Progress bar, Skeleton loader, Toast (Sonner)

**Page Components:**
- All routes are default exports from their respective files
- Use custom hooks for side effects (`useToast`, `useNavigate`)
- Zustand store for cross-page state
- localStorage for simple auth persistence

---

## Current Limitations & Gaps

### Backend
1. **No Real Authentication:** API endpoints are unprotected
2. **Hardcoded Secrets:** API keys and URLs in source code
3. **Simple Embeddings:** Hash-based vectors instead of semantic embeddings
4. **No Voice Processing:** No speech-to-text or text-to-speech integration
5. **Limited File Support:** Only basic PDF/TXT parsing
6. **No Database:** User data and interview sessions not persisted
7. **CORS Wide Open:** Allows all origins

### Frontend
1. **Mock Authentication:** Uses localStorage, no real backend integration
2. **No API Integration:** Upload/generate endpoints not called from UI
3. **No Voice Recording:** Microphone button is non-functional
4. **Mock Data:** Dashboard interviews are hardcoded
5. **Incomplete Routes:** Results page mostly empty
6. **No Error Boundaries:** Limited error handling beyond ErrorBoundary
7. **No Testing:** No unit or integration tests visible

### Infrastructure
1. **No CI/CD:** No automated testing or deployment pipelines
2. **No Environment Files:** `.env` not in repository (good for security, but no template)
3. **Local Qdrant Data:** `qdrant_data/` directory committed (should be gitignored)
4. **No Documentation:** No API documentation (Swagger/OpenAPI)
5. **No Monitoring:** No logging, analytics, or error tracking

---

## Integration Status

### ✅ Implemented
- Backend API structure with Flask
- Resume upload and chunking logic
- Qdrant vector database integration
- AI question generation via Groq
- Frontend routing and navigation
- UI component library
- State management setup
- Docker configuration for frontend

### ⚠️ Partially Implemented
- Authentication (frontend only, no backend)
- Resume upload (backend ready, frontend disconnected)
- Interview flow (UI exists, no backend integration)

### ❌ Not Implemented
- Voice recording and speech-to-text
- Text-to-speech for AI interviewer
- Real-time voice conversation
- Interview scoring and feedback
- User registration and login backend
- Database for user data
- Interview history persistence
- Results analysis and visualization
- Email notifications
- Payment/subscription system

---

## Environment Variables

### Backend (Expected)
```bash
GROQ_API_KEY=<groq-api-key>
PORT=5000  # Optional, defaults to 5000
```

### Frontend (Expected)
```bash
# No environment variables currently used
# API URL should be configurable for production
```

**Note:** Currently using fallback hardcoded values if env vars not set.

---

## Dependencies

### Backend (`requirements.txt`)
```
flask                 # Web framework
flask-cors            # CORS support
PyPDF2                # PDF parsing
openai                # OpenAI SDK (not currently used)
qdrant-client         # Vector database client
python-dotenv         # Environment variable management
streamlit             # Not used in main app
groq                  # Groq AI API client
```

### Frontend (`package.json` - Key Dependencies)
```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router": "^7.9.2",
    "@radix-ui/react-*": "Latest",
    "framer-motion": "^12.23.24",
    "zustand": "^5.0.8",
    "lucide-react": "^0.553.0",
    "tailwindcss": "^4.1.13",
    "recharts": "^3.4.1",
    "sonner": "^2.0.7"
  },
  "devDependencies": {
    "@react-router/dev": "^7.9.2",
    "typescript": "^5.9.2",
    "vite": "^7.1.7"
  }
}
```

---

## Development Setup

### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables (optional, has fallbacks)
export GROQ_API_KEY="your-key-here"

# Run development server
python app.py
# Server runs on http://0.0.0.0:5000
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# Server runs on http://localhost:5173

# Build for production
npm run build

# Type checking
npm run typecheck
```

### Docker (Frontend)
```bash
cd frontend

# Build image
docker build -t ai-genesis-frontend .

# Run container
docker run -p 3000:3000 ai-genesis-frontend
```

---

## Git History

**Recent Commits:**
- `117b443` - Initial plan (current HEAD on branch `copilot/add-currentstate-md-file`)
- `68fd054` - updated frontend (main branch)

**Branch Structure:**
- `main` - Primary development branch
- `copilot/add-currentstate-md-file` - Current documentation branch

**Repository Details:**
- Remote: https://github.com/AminaAsif9/AI-Genesis-Hackathon
- Grafted repository (shallow clone with limited history)

---

## Known Issues & Technical Debt

### High Priority
1. **Security Vulnerability:** Exposed API keys in source code
2. **No Backend Auth:** API endpoints completely unprotected
3. **Frontend-Backend Disconnect:** UI not calling backend APIs
4. **No Voice Processing:** Core feature (voice interview) not implemented

### Medium Priority
5. **Mock Data:** Dashboard using hardcoded interview data
6. **Error Handling:** Insufficient error boundaries and validation
7. **No Tests:** No testing infrastructure
8. **localStorage Auth:** Insecure authentication mechanism

### Low Priority
9. **Code Comments:** Commented-out AIMLAPI code should be removed
10. **Unused Dependency:** Streamlit in requirements.txt but not used
11. **Qdrant Data:** Local qdrant_data/ should be gitignored
12. **Type Safety:** Some TypeScript `any` types should be properly typed

---

## Next Steps / Roadmap

### Phase 1: Core Integration
1. Connect frontend resume upload to backend API
2. Implement backend authentication system
3. Create user database (PostgreSQL/MongoDB)
4. Integrate question generation into interview setup
5. Move secrets to environment variables

### Phase 2: Voice Features
1. Implement speech-to-text (Web Speech API or Whisper)
2. Implement text-to-speech (ElevenLabs, Azure, or Google TTS)
3. Build real-time conversation flow
4. Add voice activity detection

### Phase 3: Intelligence
1. Replace hash embeddings with proper semantic embeddings (OpenAI/Cohere)
2. Implement interview scoring logic
3. Generate detailed feedback and suggestions
4. Add follow-up question generation
5. Implement progress tracking analytics

### Phase 4: Production
1. Add comprehensive error handling
2. Implement logging and monitoring
3. Create CI/CD pipelines
4. Add unit and integration tests
5. Deploy to production environment
6. Set up proper secret management

---

## Contact & Maintenance

**Repository Owner:** AminaAsif9  
**License:** MIT  
**Created:** 2025  
**Project Status:** Active Development  

---

## Appendix: File Inventory

### Python Files (1)
- `app.py` - 288 lines, main backend application

### TypeScript/TSX Files (31)
**Routes (8):**
- `home.tsx`, `login.tsx`, `register.tsx`, `dashboard.tsx`
- `resume.tsx`, `interviewSetup.tsx`, `interviewLive.tsx`, `interviewResult.tsx`

**Components (16):**
- Core: `GlassCard`, `GradientButton`, `Navbar`, `Footer`, `VoiceWaveAnimation`, `LoadingDots`
- UI: `avatar`, `button`, `dropdown-menu`, `input`, `label`, `progress`, `select`, `skeleton`, `sonner`, `textarea`

**Store/Hooks (2):**
- `useInterviewStore.ts`, `use-toast.tsx`

**Config/Root (5):**
- `root.tsx`, `routes.ts`, `app.css`, `vite.config.ts`, `react-router.config.ts`

### Configuration Files (9)
- `package.json`, `package-lock.json`, `tsconfig.json`, `components.json`
- `requirements.txt`, `.gitignore` (x2), `.dockerignore`
- `Dockerfile`

### Documentation (3)
- `README.md` (root), `README.md` (frontend), `LICENSE`

**Total Files:** ~41 source files + dependencies

---

*End of Current State Documentation*
