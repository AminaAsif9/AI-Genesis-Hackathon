import os
import requests
import json
from typing import Optional, Dict, Any, List
import base64
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class AIServiceManager:
    """
    Unified AI service manager for STT, TTS, and evaluation services.
    Supports both development and production modes.
    """

    def __init__(self):
        # Gemini 2.5 Flash setup (for STT and evaluation)
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.gemini_base_url = "https://generativelanguage.googleapis.com/v1beta"

        # Environment mode
        self.dev_mode = os.getenv("AI_MODE", "dev").lower() == "dev"

    def _call_gemini_api(self, endpoint: str, payload: Dict[str, Any], max_retries: int = 3) -> Optional[Dict[str, Any]]:
        """Make a call to Gemini API with exponential backoff."""
        import time
        
        for attempt in range(max_retries):
            try:
                url = f"{self.gemini_base_url}/{endpoint}?key={self.gemini_api_key}"
                headers = {"Content-Type": "application/json"}

                response = requests.post(url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()

                return response.json()
                
            except requests.exceptions.HTTPError as e:
                if response.status_code == 429:  # Rate limit
                    if attempt < max_retries - 1:
                        wait_time = (2 ** attempt) * 2  # Exponential backoff: 2, 4, 8 seconds
                        time.sleep(wait_time)
                        continue
                    else:
                        return None
                else:
                    print(f"Gemini API error: {e}")
                    return None
            except Exception as e:
                print(f"Gemini API error: {e}")
                return None
        
        return None

    def _call_elevenlabs_api(self, endpoint: str, method: str = "GET", data: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
        """Make a call to ElevenLabs API."""
        try:
            url = f"{self.elevenlabs_base_url}/{endpoint}"
            headers = {
                "Accept": "application/json",
                "xi-api-key": self.elevenlabs_api_key
            }

            if method == "POST":
                headers["Content-Type"] = "application/json"
                response = requests.post(url, headers=headers, json=data, timeout=30)
            else:
                response = requests.get(url, headers=headers, timeout=30)

            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"ElevenLabs API error: {e}")
            return None

    def transcribe_audio(self, audio_data: bytes, mode: str = "auto") -> Optional[str]:
        """
        Transcribe audio to text.
        mode: 'dev' for Gemini, 'prod' for future production STT, 'auto' for environment-based
        """
        use_dev = (mode == "dev") or (mode == "auto" and self.dev_mode)

        if use_dev:
            result = self._transcribe_with_gemini(audio_data)
            if result:
                return result
            else:
                # Fallback to local processing or return None to trigger manual input
                return None
        else:
            # For MVP, fall back to Gemini even in prod mode
            # In full implementation, this would use a production STT service
            result = self._transcribe_with_gemini(audio_data)
            if result:
                return result
            else:
                return None

    def _transcribe_with_gemini(self, audio_data: bytes) -> Optional[str]:
        """Transcribe audio using Gemini 2.5 Flash."""
        try:
            # Convert audio to base64
            audio_b64 = base64.b64encode(audio_data).decode('utf-8')

            # For simplicity, assume WAV format and basic transcription
            # In production, you'd want proper audio format detection
            prompt = """
            Transcribe the following audio. Provide only the transcription text, no additional commentary.
            If the audio is unclear or empty, return an empty string.
            """

            payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "audio/wav",
                                "data": audio_b64
                            }
                        }
                    ]
                }],
                "generationConfig": {
                    "temperature": 0,
                    "topK": 1,
                    "topP": 1,
                    "maxOutputTokens": 2048,
                }
            }

            response = self._call_gemini_api("models/gemini-2.0-flash:generateContent", payload)

            if response and "candidates" in response:
                text = response["candidates"][0]["content"]["parts"][0]["text"]
                return text.strip()
            return None

        except Exception as e:
            print(f"Gemini transcription error: {e}")
            return None

    def evaluate_interview(self, questions_answers: List[Dict[str, Any]], job_title: str) -> Optional[Dict[str, Any]]:
        """
        Evaluate interview performance using AI.
        Returns scores and feedback for different dimensions.
        """
        try:
            # Format the interview data for evaluation
            interview_text = f"Job Title: {job_title}\n\n"
            for i, qa in enumerate(questions_answers, 1):
                interview_text += f"Q{i}: {qa['question']}\n"
                interview_text += f"A{i}: {qa['answer']}\n\n"

            prompt = f"""
            Evaluate this job interview for the position of {job_title}. Analyze the candidate's responses and provide:

            IMPORTANT: These answers were transcribed from speech using browser-based speech recognition.
            Be context-aware and intelligent about potential transcription errors:

            **Context-Aware Correction Guidelines:**
            - This is a technical job interview - interpret answers through a technical/programming lens
            - Look for programming languages, frameworks, tools, and technical concepts
            - Common speech recognition issues in technical contexts:
              * Homophones: "no/know", "to/two/too", "there/their/they're", "its/it's"
              * Technical terms: "axe/ask" → "ask", "wreck/tech" → "tech", "ape/API" → "API"
              * Programming: "sequel/SQL" → "SQL", "jazz/JavaScript" → "JavaScript", "pie/Python" → "Python"
              * Tools: "get/Git" → "Git", "hub/GitHub" → "GitHub", "slack/Stack" → "Stack"
            - Use surrounding context and technical knowledge to disambiguate
            - If a word doesn't make technical sense, consider phonetic alternatives
            - Technical acronyms and proper nouns should be preserved/corrected appropriately

            **Evaluation Criteria:**
            1. Overall score (1-10)
            2. Content score (1-10) - Quality and relevance of answers (accounting for transcription)
            3. Delivery score (1-10) - Communication clarity and confidence
            4. Technical score (1-10) - Technical knowledge and accuracy (with intelligent error correction)
            5. Communication score (1-10) - Professional communication skills

            **Scoring Guidelines:**
            - Be generous with technical content scores when transcription errors are likely
            - Focus delivery scores on actual communication quality, not transcription artifacts
            - Use technical expertise to evaluate whether the intended answer demonstrates competence
            Provide exactly 2-3 bullet points of constructive feedback.

            Format your response as JSON:
            {{
                "overall": <number>,
                "content": <number>,
                "delivery": <number>,
                "technical": <number>,
                "communication": <number>,
                "feedback": ["bullet point 1", "bullet point 2", "bullet point 3"]
            }}

            Interview:
            {interview_text}
            """

            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "topK": 1,
                    "topP": 1,
                    "maxOutputTokens": 1024,
                    "response_mime_type": "application/json"
                }
            }

            response = self._call_gemini_api("models/gemini-2.0-flash:generateContent", payload)

            if response and "candidates" in response:
                result_text = response["candidates"][0]["content"]["parts"][0]["text"]

                # Parse JSON response
                try:
                    result = json.loads(result_text)
                    return result
                except json.JSONDecodeError:
                    print(f"Failed to parse evaluation response: {result_text}")
                    return None

            return None

        except Exception as e:
            print(f"Interview evaluation error: {e}")
            return None

    def generate_interview_questions(self, resume_text: str, job_title: str, num_questions: int = 5) -> List[str]:
        """
        Generate interview questions based on resume and job title.
        """
        try:
            prompt = f"""
            Based on the following resume and job title, generate {num_questions} thoughtful interview questions.

            Job Title: {job_title}

            Resume:
            {resume_text[:2000]}  # Limit resume text to avoid token limits

            Generate {num_questions} interview questions that:
            1. Are relevant to the job title and candidate's experience
            2. Test both technical skills and behavioral competencies
            3. Progress from general to specific
            4. Include a mix of situational and technical questions

            Return only the questions as a JSON array of strings, no additional text.
            Example: ["Question 1?", "Question 2?", "Question 3?"]
            """

            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024,
                    "response_mime_type": "application/json"
                }
            }

            response = self._call_gemini_api("models/gemini-2.0-flash:generateContent", payload)

            if response and "candidates" in response:
                result_text = response["candidates"][0]["content"]["parts"][0]["text"]

                # Parse JSON response
                try:
                    questions = json.loads(result_text)
                    if isinstance(questions, list) and len(questions) > 0:
                        return questions[:num_questions]  # Ensure we don't exceed requested number
                    else:
                        # Fallback questions if parsing fails
                        return [
                            f"Can you tell me about your experience with {job_title}?",
                            "What are your greatest strengths and weaknesses?",
                            "Where do you see yourself in 5 years?",
                            "Why are you interested in this position?",
                            f"What technical skills do you have that are relevant to {job_title}?"
                        ][:num_questions]
                except json.JSONDecodeError:
                    print(f"Failed to parse questions response: {result_text}")
                    # Return fallback questions
                    return [
                        f"Can you tell me about your experience with {job_title}?",
                        "What are your greatest strengths and weaknesses?",
                        "Where do you see yourself in 5 years?",
                        "Why are you interested in this position?",
                        f"What technical skills do you have that are relevant to {job_title}?"
                    ][:num_questions]

            # Return fallback questions if API fails
            return [
                f"Can you tell me about your experience with {job_title}?",
                "What are your greatest strengths and weaknesses?",
                "Where do you see yourself in 5 years?",
                "Why are you interested in this position?",
                f"What technical skills do you have that are relevant to {job_title}?"
            ][:num_questions]

        except Exception as e:
            print(f"Question generation error: {e}")
            # Return basic fallback questions
            return [
                f"Can you tell me about your experience with {job_title}?",
                "What are your greatest strengths and weaknesses?",
                "Where do you see yourself in 5 years?",
                "Why are you interested in this position?",
                f"What technical skills do you have that are relevant to {job_title}?"
            ][:num_questions]

# Global AI service instance
ai_service = AIServiceManager()