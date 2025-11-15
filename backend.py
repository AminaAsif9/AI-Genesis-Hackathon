import os
import re
import tempfile
import json
from PyPDF2 import PdfReader
from openai import OpenAI

#########################
# 1) CONFIG
#########################

# Replace api key with your actual key or use environment variables.
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key="", #put your key here
)

# We'll keep everything in memory for a quick demo (no DB).
CHUNK_STORE = []
CHUNKS_FILE = "interviewmind_chunks.json"  # optional for saving/loading

#########################
# 2) LOAD/SAVE CHUNKS (OPTIONAL)
#########################

def load_chunks_from_disk():
    """
    Load saved chunks from a JSON file for persistence across restarts.
    """
    global CHUNK_STORE
    if os.path.exists(CHUNKS_FILE):
        try:
            with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
                CHUNK_STORE = json.load(f)
            print(f"Loaded {len(CHUNK_STORE)} chunks from {CHUNKS_FILE}")
        except Exception as e:
            print(f"Error loading {CHUNKS_FILE}: {e}")

def save_chunks_to_disk():
    """
    Saves current CHUNK_STORE to a JSON file for persistence.
    """
    try:
        with open(CHUNKS_FILE, "w", encoding="utf-8") as f:
            json.dump(CHUNK_STORE, f, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving chunks: {e}")

#########################
# 3) CORE FUNCTIONS
#########################

def chunk_text(text, chunk_size=2000, overlap=200):
    """
    Break text into segments of `chunk_size` characters,
    each with `overlap` characters from the previous chunk.
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += (chunk_size - overlap)
    return chunks

def process_files(uploaded_files):
    """
    Process multiple uploaded files. Extract text, create chunks, and store in CHUNK_STORE.
    """
    if not uploaded_files:
        return "No files uploaded."

    total_chunks = 0
    for uploaded_file in uploaded_files:
        doc_name = uploaded_file.name
        text = ""

        # If PDF
        if doc_name.lower().endswith(".pdf"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(uploaded_file.getvalue())
                tmp_path = tmp.name

            try:
                reader = PdfReader(tmp_path)
                for page in reader.pages:
                    text += page.extract_text()
            except Exception:
                return f"Error processing PDF file: {doc_name}"
        else:
            try:
                text = uploaded_file.getvalue().decode("utf-8", errors="ignore")
            except Exception:
                return f"Error processing text file: {doc_name}"

        # Create chunks
        chunks = chunk_text(text)
        if not chunks:
            continue

        # Add to CHUNK_STORE
        for c in chunks:
            CHUNK_STORE.append({"doc_name": doc_name, "chunk_text": c})
        total_chunks += len(chunks)

    save_chunks_to_disk()
    return f"Successfully processed {len(uploaded_files)} files. Total chunks created: {total_chunks}"

def find_relevant_chunk(query):
    """
    Find the most relevant chunk for a query using keyword matching.
    """
    if not CHUNK_STORE:
        return None

    keywords = re.findall(r"\w+", query.lower())
    best_count = -1
    best_chunk = None

    for item in CHUNK_STORE:
        chunk_lower = item["chunk_text"].lower()
        match_count = sum(1 for kw in keywords if kw in chunk_lower)
        if match_count > best_count:
            best_count = match_count
            best_chunk = item["chunk_text"]

    return best_chunk

def generate_answer(context, user_query):
    """
    Call 'llama-3.1-8b-instant' model with the chosen chunk as context.
    """
    if not context:
        return "No relevant chunk found."

    messages = [
        {
            "role": "system",
            "content": (
                "You are an AI interview agent. Your job is to conduct a fully dynamic, context-aware interview. "
                "Use ONLY the context (resume, job description, and previous chunk). "
                "Your output MUST be only the next interview question. "
                "Do NOT give advice, explanations, summaries, or answers. "
                "Make each question natural, specific to the candidate, and based on what they just said."
            )
        },
        {
            "role": "user",
            "content": (
                f"Context: {context}\n\n"
                f"Candidate Response: {user_query}"
            )
        }
    ]

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages
        )
        return response.choices[0].message.content if response.choices else "No response from the API."
    except Exception as e:
        return f"Error: {e}"

def answer_user_query(query):
    """
    1) Find relevant chunk with naive search
    2) Pass chunk + query to 'llama-3.1-8b-instant'
    """
    if not CHUNK_STORE:
        return "No documents uploaded yet. Please upload a file first."

    chunk = find_relevant_chunk(query)
    if not chunk:
        return "No relevant data found in your documents."

    return generate_answer(chunk, query)
