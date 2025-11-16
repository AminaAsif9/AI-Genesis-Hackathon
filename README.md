# InterviewMind - AI-Powered Interview Preparation Platform

An AI-powered interview preparation platform built for the AI-Genesis Hackathon. Practice job-specific interviews with personalized AI-generated questions, receive detailed feedback, and improve your interview skills through voice-enabled mock sessions.

## ðŸš€ Features

- **Resume Upload & AI Analysis**: Upload your resume (PDF/TXT) and get personalized interview questions
- **AI-Generated Questions**: Questions tailored to your experience level and job role using Groq AI
- **JWT Authentication**: Secure user authentication with registration and login
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Glass-morphism design with dark/light theme support

### ðŸš§ In Development
- Voice-enabled practice sessions
- Real-time feedback and analysis
- Progress tracking and history

## ðŸ› ï¸ Technology Stack

### Backend
- **Python Flask** - REST API server
- **Groq AI** - Question generation and AI processing
- **Qdrant Vector Database** - Resume storage and semantic search
- **JWT Authentication** - Secure token-based auth
- **PyPDF2** - PDF text extraction

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router 7** - Client-side routing
- **TailwindCSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Radix UI** - Accessible component primitives
- **Sonner** - Toast notifications

## ðŸ“‹ Prerequisites

### For Local Development
- Python 3.11+ (recommended)
- Node.js 18+
- Git

### For Docker Development (Optional)
- Docker
- Docker Compose

## ðŸš€ Quick Start

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
   GROQ_API_KEY=your_groq_api_key
   QDRANT_URL=your_qdrant_cloud_url
   QDRANT_API_KEY=your_qdrant_api_key
   JWT_SECRET_KEY=your_jwt_secret_key
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
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key
   QDRANT_URL=your_qdrant_cloud_url
   QDRANT_API_KEY=your_qdrant_api_key
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```
   - Backend will be available at `http://localhost:5000`
   - Frontend will be available at `http://localhost:5173`

## ðŸ“ Project Structure

```
â”œâ”€â”€ app.py                 # Flask backend server
â”œâ”€â”€ requirements.txt       # Python dependencies
â”œâ”€â”€ Dockerfile             # Backend container configuration
â”œâ”€â”€ docker-compose.yml     # Full-stack container orchestration
â”œâ”€â”€ frontend/             # React frontend
â”‚   â”œâ”€â”€ app/              # React Router v7 app directory
â”‚   â”‚   â”œâ”€â”€ components/   # Reusable UI components
â”‚   â”‚   â”œâ”€â”€ routes/       # Page components
â”‚   â”‚   â”œâ”€â”€ store/        # Zustand state management
â”‚   â”‚   â”œâ”€â”€ hooks/        # Custom React hooks
â”‚   â”‚   â”œâ”€â”€ lib/          # Utilities and API client
â”‚   â”‚   â””â”€â”€ root.tsx      # App root component
â”‚   â”œâ”€â”€ Dockerfile        # Frontend container configuration
â”‚   â””â”€â”€ package.json
â”œâ”€â”€ qdrant_data/          # Local Qdrant data (if using local instance)
â”œâ”€â”€ currentstate.md       # Project status and architecture details
â”œâ”€â”€ DEVELOPMENT.md        # Development guidelines and testing
â”œâ”€â”€ frontend-backend-analysis.md # Technical analysis and documentation
â””â”€â”€ LICENSE               # MIT license
```

## ðŸ”§ API Endpoints

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

### Interview Questions
- `POST /api/generate-questions` - Generate interview questions
  - **Body**: `{ "name": "string", "job_title": "string", "num_questions": number }`
  - **Response**: `{ "success": true, "questions": [...], "total_questions": number }`

### Health Check
- `GET /health` - API health check
  - **Response**: `{ "status": "healthy", "message": "API is running" }`

## ðŸŽ¯ Usage

1. **Register/Login**: Create an account or sign in
2. **Upload Resume**: Upload your resume to get personalized questions
3. **Generate Questions**: Get AI-generated interview questions based on your resume and target job role
4. **Practice**: Go through the generated interview questions (voice features coming soon)

### ðŸš§ Future Features
- Interactive voice-based practice sessions
- Real-time feedback and performance analysis
- Progress tracking and improvement suggestions

## ðŸ“„ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ðŸ™ Acknowledgments

- Built for the AI-Genesis Hackathon
- Powered by Groq AI for question generation
- Qdrant for vector database functionality
- React and Flask communities for excellent documentation
