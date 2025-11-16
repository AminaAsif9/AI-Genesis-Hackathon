import os
import re
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from groq import Groq
import io
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__)
CORS(app)

# client = OpenAI(
#     base_url="https://api.aimlapi.com/v1",
#     api_key=os.getenv("AIMLAPI_KEY", "3e309ea84e14470eb327d65938b15097"),
# )
client = Groq(api_key=os.getenv("GROQ_API_KEY", "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"))

qdrant_client = QdrantClient(
    url="https://6b509411-8035-45bf-aaed-40616d6feb3e.eu-west-2-0.aws.cloud.qdrant.io:6333", 
    api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ahAee0KrwlUEsc_Igi8fNuQD5lds6-UYwZqi4C2-PLM",
)

COLLECTION_NAME = "resumes"
VECTOR_SIZE = 384

# Authentication configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
users_db = {}  # In production, use a proper database

# JWT token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
            current_user = users_db.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'message': 'Missing required fields'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        name = data['name'].strip()
        confirm_password = data.get('confirmPassword')
        
        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        # Check password strength
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters long'}), 400
        
        # Check if passwords match
        if password != confirm_password:
            return jsonify({'message': 'Passwords do not match'}), 400
        
        # Check if user already exists
        if any(user['email'] == email for user in users_db.values()):
            return jsonify({'message': 'User already exists'}), 409
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = generate_password_hash(password)
        
        users_db[user_id] = {
            'id': user_id,
            'name': name,
            'email': email,
            'password': hashed_password,
            'created_at': datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, JWT_SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user_id,
                'name': name,
                'email': email,
                'createdAt': users_db[user_id]['created_at']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Missing email or password'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user by email
        user = None
        user_id = None
        for uid, user_data in users_db.items():
            if user_data['email'] == email:
                user = user_data
                user_id = uid
                break
        
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
        }, JWT_SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user_id,
                'name': user['name'],
                'email': user['email'],
                'createdAt': user['created_at']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'user': {
            'id': current_user['id'],
            'name': current_user['name'],
            'email': current_user['email'],
            'createdAt': current_user['created_at']
        }
    }), 200

def initialize_qdrant():
    try:
        collections = qdrant_client.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if COLLECTION_NAME not in collection_names:
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            )
            print(f"Created collection: {COLLECTION_NAME}")

        qdrant_client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="name",
            field_schema="keyword"
        )
        print("Created payload index for 'name'")

    except Exception as e:
        print(f"Error initializing Qdrant: {e}")


def extract_text_from_pdf(pdf_bytes):
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        raise Exception(f"Error extracting PDF text: {str(e)}")

def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        start += (chunk_size - overlap)
    return chunks

def create_simple_embedding(text):
    import hashlib
    
    hash_obj = hashlib.sha256(text.encode())
    hash_bytes = hash_obj.digest()
    
    vector = []
    for i in range(VECTOR_SIZE):
        byte_val = hash_bytes[i % len(hash_bytes)]
        vector.append((byte_val / 255.0) * 2 - 1)
    
    return vector

def store_resume_in_qdrant(name, resume_text):
    try:
        chunks = chunk_text(resume_text)
        
        points = []
        for idx, chunk in enumerate(chunks):
            point_id = str(uuid.uuid4())
            vector = create_simple_embedding(chunk)
            
            point = PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "name": name.lower(),
                    "chunk_text": chunk,
                    "chunk_index": idx
                }
            )
            points.append(point)
        
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        
        return len(points)
    except Exception as e:
        raise Exception(f"Error storing in Qdrant: {str(e)}")

def get_resume_by_name(name):
    try:
        dummy_vector = [0.0] * VECTOR_SIZE
        
        results = qdrant_client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter={
                "must": [
                    {
                        "key": "name",
                        "match": {
                            "value": name.lower()
                        }
                    }
                ]
            },
            limit=100
        )
        
        if not results[0]:
            return None
        
        chunks = sorted(results[0], key=lambda x: x.payload.get("chunk_index", 0))
        full_text = "\n".join([chunk.payload["chunk_text"] for chunk in chunks])
        
        return full_text
    except Exception as e:
        raise Exception(f"Error retrieving from Qdrant: {str(e)}")

def generate_interview_questions(resume_text, job_title, num_questions=5):
    """
    Generate interview questions using Groq streaming API.
    """
    try:
        prompt = f"""Based on the following resume and job title, generate {num_questions} relevant interview questions.

Job Title: {job_title}

Resume:
{resume_text[:3000]}

Generate {num_questions} specific, relevant interview questions that:
1. Are tailored to the candidate's experience in their resume
2. Are relevant to the {job_title} position
3. Cover technical skills, experience, and behavioral aspects
4. Are clear and professional

Format your response as a numbered list of questions only.
"""

        # Groq streaming API
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": "You are an expert technical interviewer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_completion_tokens=1000,
            top_p=1,
            reasoning_effort="medium",
            stream=True
        )

        # Collect streamed content
        questions_text = ""
        for chunk in completion:
            questions_text += chunk.choices[0].delta.content or ""

        # Parse into a clean list
        questions = []
        for line in questions_text.split('\n'):
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-')):
                question = re.sub(r'^[\d\.\)\-\s]+', '', line).strip()
                if question:
                    questions.append(question)

        return questions[:num_questions]

    except Exception as e:
        raise Exception(f"Error generating questions with Groq: {str(e)}")



@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"}), 200

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    try:
        name = request.form.get('name')
        if not name:
            return jsonify({"error": "Name is required"}), 400
        
        if 'resume' not in request.files:
            return jsonify({"error": "Resume file is required"}), 400
        
        resume_file = request.files['resume']
        if resume_file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        filename = resume_file.filename.lower()
        
        if filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(resume_file.read())
        elif filename.endswith(('.txt', '.doc', '.docx')):
            resume_text = resume_file.read().decode('utf-8', errors='ignore')
        else:
            return jsonify({"error": "Unsupported file format. Please upload PDF or TXT file"}), 400
        
        if not resume_text.strip():
            return jsonify({"error": "Could not extract text from resume"}), 400
        
        num_chunks = store_resume_in_qdrant(name, resume_text)
        
        return jsonify({
            "success": True,
            "message": f"Resume uploaded successfully for {name}",
            "name": name,
            "chunks_stored": num_chunks,
            "text_length": len(resume_text)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-questions', methods=['POST'])
def generate_questions():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        name = data.get('name')
        job_title = data.get('job_title')
        num_questions = data.get('num_questions', 5)
        
        if not name:
            return jsonify({"error": "Name is required"}), 400
        
        if not job_title:
            return jsonify({"error": "Job title is required"}), 400
        
        resume_text = get_resume_by_name(name)
        
        if not resume_text:
            return jsonify({
                "error": f"No resume found for name: {name}",
                "suggestion": "Please upload resume first using /api/upload-resume"
            }), 404
        
        questions = generate_interview_questions(resume_text, job_title, num_questions)
        
        return jsonify({
            "success": True,
            "name": name,
            "job_title": job_title,
            "questions": questions,
            "total_questions": len(questions)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    initialize_qdrant()
    
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)