import os
import json
import datetime
from typing import Dict, List, Optional, Any
import threading

class SimpleStorage:
    """
    Simple JSON file-based storage system for user interview data.
    Each user gets their own directory with JSON files for different data types.
    """

    def __init__(self, base_dir: Optional[str] = None):
        # Default to Vercel writable temp folder
        if base_dir is None:
            base_dir = "/tmp/user_data"
        self.base_dir = base_dir
        self._lock = threading.Lock()
        self._ensure_base_directory()

    def _ensure_base_directory(self):
        """Ensure the base directory exists."""
        os.makedirs(self.base_dir, exist_ok=True)

    def _get_user_dir(self, user_id: str) -> str:
        """Get the directory path for a specific user."""
        return os.path.join(self.base_dir, user_id)

    def _ensure_user_directory(self, user_id: str):
        """Ensure the user's directory exists."""
        os.makedirs(self._get_user_dir(user_id), exist_ok=True)

    def _get_file_path(self, user_id: str, filename: str) -> str:
        """Get the full path for a user's data file."""
        return os.path.join(self._get_user_dir(user_id), filename)

    def save_user_data(self, user_id: str, filename: str, data: Dict[str, Any]) -> bool:
        """Save data to a user's JSON file."""
        try:
            with self._lock:
                self._ensure_user_directory(user_id)
                if not filename.endswith('.json'):
                    filename = f"{filename}.json"
                file_path = self._get_file_path(user_id, filename)

                data_with_meta = {
                    **data,
                    "_metadata": {
                        "last_updated": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                        "version": "1.0"
                    }
                }

                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data_with_meta, f, indent=2, ensure_ascii=False)

            return True
        except Exception as e:
            print(f"Error saving user data: {e}")
            return False

    def load_user_data(self, user_id: str, filename: str) -> Optional[Dict[str, Any]]:
        """Load data from a user's JSON file."""
        try:
            if not filename.endswith('.json'):
                filename = f"{filename}.json"
            file_path = self._get_file_path(user_id, filename)
            if not os.path.exists(file_path):
                return None

            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading user data: {e}")
            return None

    def list_user_files(self, user_id: str) -> List[str]:
        """List all data files for a user."""
        try:
            user_dir = self._get_user_dir(user_id)
            if not os.path.exists(user_dir):
                return []

            return [f[:-5] for f in os.listdir(user_dir) if f.endswith('.json')]
        except Exception as e:
            print(f"Error listing user files: {e}")
            return []

    def delete_user_data(self, user_id: str, filename: str) -> bool:
        """Delete a user's data file."""
        try:
            if not filename.endswith('.json'):
                filename = f"{filename}.json"
            file_path = self._get_file_path(user_id, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
            return True
        except Exception as e:
            print(f"Error deleting user data: {e}")
            return False

    def delete_user_directory(self, user_id: str) -> bool:
        """Delete all data for a user."""
        try:
            import shutil
            user_dir = self._get_user_dir(user_id)
            if os.path.exists(user_dir):
                shutil.rmtree(user_dir)
            return True
        except Exception as e:
            print(f"Error deleting user directory: {e}")
            return False


# Global storage instance
storage = SimpleStorage()

# Interview-specific storage
class InterviewStorage:
    """Specialized storage for interview-related data."""

    def __init__(self, storage: SimpleStorage):
        self.storage = storage

    def save_interview_result(self, user_id: str, interview_data: Dict[str, Any]) -> bool:
        try:
            if 'interview_id' not in interview_data:
                import uuid
                interview_data['interview_id'] = str(uuid.uuid4())
            interview_data['completed_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            filename = f"interview_{interview_data['interview_id']}.json"
            return self.storage.save_user_data(user_id, filename, interview_data)
        except Exception as e:
            print(f"Error saving interview result: {e}")
            return False

    def get_interview_result(self, user_id: str, interview_id: str) -> Optional[Dict[str, Any]]:
        filename = f"interview_{interview_id}.json"
        return self.storage.load_user_data(user_id, filename)

    def list_user_interviews(self, user_id: str) -> List[Dict[str, Any]]:
        interviews = []
        for filename in self.storage.list_user_files(user_id):
            if filename.startswith('interview_'):
                data = self.storage.load_user_data(user_id, filename)
                if data:
                    interviews.append(data)
        interviews.sort(key=lambda x: x.get('completed_at', ''), reverse=True)
        return interviews

    def save_interview_session(self, user_id: str, session_data: Dict[str, Any]) -> bool:
        filename = f"session_{session_data.get('session_id', 'active')}.json"
        return self.storage.save_user_data(user_id, filename, session_data)

    def get_interview_session(self, user_id: str, session_id: str = 'active') -> Optional[Dict[str, Any]]:
        filename = f"session_{session_id}.json"
        return self.storage.load_user_data(user_id, filename)

    def delete_interview_session(self, user_id: str, session_id: str = 'active') -> bool:
        filename = f"session_{session_id}.json"
        return self.storage.delete_user_data(user_id, filename)


# Global interview storage instance
interview_storage = InterviewStorage(storage)