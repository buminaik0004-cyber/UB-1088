from app.config import get_db
from datetime import datetime

def create_notification(user_id: str, issue_id: str, message: str):
    """Create a notification for a user."""
    try:
        db = get_db()
        db.collection("notifications").add({
            "user_id": user_id,
            "issue_id": issue_id,
            "message": message,
            "is_read": False,
            "created_at": datetime.utcnow().isoformat(),
        })
    except Exception as e:
        print(f"Notification error: {e}")
