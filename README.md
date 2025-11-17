# InterviewMind - AI Interview Practice Platform

An AI-powered interview practice platform built for the AI-Genesis Hackathon. Practice interviews with AI-generated questions, voice recording, and basic feedback.

## 🚀 Features

- **Resume Upload**: Upload your resume (PDF/TXT) for question generation
- **AI-Generated Questions**: Questions based on your resume and job role using Gemini AI
- **Voice Recording**: Record answers using browser speech recognition
- **Text-to-Speech**: Listen to questions using browser TTS
- **Basic Evaluation**: Get feedback on your answers
- **User Authentication**: JWT-based registration and login
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean interface with theme support
- **Session Tracking**: View past interview sessions

## 🛠️ Technology Stack

### Backend
- **Python Flask** - REST API server
- **Google Gemini AI** - Question generation and basic evaluation
- **Groq AI** - AI processing
- **Qdrant Vector Database** - Resume storage
- **JWT Authentication** - User authentication
- **PyPDF2** - PDF processing
- **Web Speech API** - Browser text-to-speech

### Frontend
- **React 19** - React framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router 7** - Routing
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Radix UI** - UI components
- **React Speech Recognition** - Voice input

## 📋 Prerequisites

### For Local Development
- Python 3.11+ (recommended)
- Node.js 18+
- Git
- Modern web browser with Web Speech API support (Chrome, Edge, Safari)

### For Docker Development (Optional)
- Docker
- Docker Compose

## 🚀 Quick Start

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AminaAsif9/AI-Genesis-Hackathon.git
   cd AI-Genesis-Hackathon
   ```

2. **Create Python virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # macOS/Linux
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # REQUIRED AI Service API Keys
   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here

   # Qdrant Configuration
   QDRANT_URL=https://your-qdrant-instance.com:6333
   QDRANT_API_KEY=your_qdrant_api_key_here

   # Flask Configuration
   JWT_SECRET_KEY=your_secure_jwt_secret_key_here
   FLASK_ENV=development
   ```

5. **Run the backend**
   ```bash
   python app.py
   ```
   The backend will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

### Docker Setup (Alternative)

1. **Ensure Docker and Docker Compose are installed**

2. **Set up environment variables**
   Create a `.env` file in the root directory (same as above)

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```
   - Backend will be available at `http://localhost:5000`
   - Frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
├── app.py                # Flask backend server
├── ai_service.py         # AI processing and API integrations
├── storage.py            # User data and interview storage
├── requirements.txt      # Python dependencies
├── Dockerfile            # Backend container configuration
├── docker-compose.yml    # Full-stack container orchestration
├── .env.example          # Environment variables template
├── frontend/             # React frontend
│   ├── app/              # React Router v7 app directory
│   │   ├── components/   # Reusable UI components
│   │   │   ├── ui/       # Radix UI components
│   │   │   └── *.tsx     # Custom components
│   │   ├── routes/       # Page components
│   │   ├── store/        # Zustand state management
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and API client
│   │   └── root.tsx      # App root component
│   ├── public/           # Static assets
│   ├── build/            # Production build output
│   ├── Dockerfile        # Frontend container configuration
│   └── package.json
├── qdrant_data/          # Local Qdrant data (if using local instance)
├── user_data/            # User interview data storage
└── LICENSE               # MIT license
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
  - **Body**: `{ "name": "string", "email": "string", "password": "string", "confirmPassword": "string" }`
  - **Response**: `{ "token": "string", "user": {...} }`
- `POST /api/auth/login` - User login
  - **Body**: `{ "email": "string", "password": "string" }`
  - **Response**: `{ "token": "string", "user": {...} }`
- `GET /api/auth/me` - Get current user profile (requires JWT token)
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ "user": {...} }`

### Resume Management
- `POST /api/upload-resume` - Upload and process resume
  - **Form Data**: `name` (string), `resume` (file - PDF/TXT)
  - **Response**: `{ "success": true, "name": "string", "chunks_stored": number }`

### Interview Management
- `POST /api/generate-questions` - Generate interview questions
  - **Body**: `{ "name": "string", "job_title": "string", "num_questions": number }`
  - **Response**: `{ "success": true, "questions": [...], "total_questions": number }`
- `POST /api/start-interview` - Start a new interview session
  - **Body**: `{ "name": "string", "job_title": "string", "questions": [...] }`
  - **Response**: `{ "session_id": "string", "message": "string" }`
- `POST /api/submit-answer` - Submit answer for evaluation
  - **Body**: `{ "session_id": "string", "question_index": number, "answer": "string" }`
  - **Response**: `{ "evaluation": {...}, "next_question": {...} }`
- `GET /api/interview-result/:session_id` - Get interview results
  - **Response**: `{ "results": {...}, "evaluation": {...} }`

### Health Check
- `GET /health` - API health check
  - **Response**: `{ "status": "healthy", "message": "API is running" }`

## 🎯 Usage

1. **Register/Login**: Create an account or sign in
2. **Upload Resume**: Upload your resume (PDF or TXT) for question generation
3. **Setup Interview**: Select job role and number of questions
4. **Practice Interview**:
   - Listen to questions using text-to-speech
   - Record answers using voice or type manually
   - Navigate through questions
5. **View Results**: See basic evaluation feedback

## 🔒 Security & Configuration

### Environment Variables
All sensitive configuration is managed through environment variables. Copy `.env.example` to `.env` and fill in your API keys:

- **AI Services**: `GEMINI_API_KEY`, `GROQ_API_KEY`
- **Database**: `QDRANT_URL`, `QDRANT_API_KEY`
- **Security**: `JWT_SECRET_KEY`

### Production Deployment
- Never commit `.env` files to version control
- Use strong, unique secrets for JWT tokens
- Configure proper CORS settings for production domains
- Enable HTTPS in production environments

## 🧪 Testing & Development

### Running Tests
```bash
# Backend tests (if implemented)
python -m pytest

# Frontend build verification
cd frontend && npm run build
```

### Development Guidelines
- Follow standard React and Python best practices
- Use TypeScript for type safety
- Handle errors appropriately
- Test manually before deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the AI-Genesis Hackathon
- Uses Google Gemini AI for question generation
- Uses Groq AI for processing
- Uses Qdrant for vector database
- React and Flask for the framework
- Web Speech API for voice features