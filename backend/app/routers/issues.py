from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List, Optional
from app.config import get_db, get_storage
from app.models.schemas import IssueCreate, IssueStatusUpdate, IssueAssign
from app.middleware.auth_middleware import get_current_user, require_authority
from app.services.notification_service import create_notification
from datetime import datetime
import uuid
import os
import uuid
from fastapi import UploadFile, File, Depends, APIRouter
from typing import List
from fastapi.staticfiles import StaticFiles

router = APIRouter(prefix="/issues", tags=["issues"])

def serialize_issue(doc) -> dict:
    d = doc.to_dict()
    d["id"] = doc.id
    # Convert any datetime to ISO string
    for k, v in d.items():
        if hasattr(v, 'isoformat'):
            d[k] = v.isoformat()
    return d


UPLOAD_DIR = "uploads/images"

# Ensure directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload images to local storage."""
    
    urls = []

    for file in files[:3]:  # max 3
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save file locally
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # URL to access image
        image_url = f"/uploads/images/{unique_filename}"
        urls.append(image_url)

    return {"urls": urls}


@router.post("")
async def create_issue(
    data: IssueCreate,
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can report issues")

    db = get_db()
    issue_data = {
        "title": data.title,
        "category": data.category,
        "description": data.description,
        "priority": data.priority,
        "location": {"lat": data.location.lat, "lng": data.location.lng, "address": data.location.address},
        "images": data.images or [],
        "status": "pending",
        "reported_by": current_user["id"],
        "reported_by_name": current_user.get("name", ""),
        "reported_at": datetime.utcnow().isoformat(),
        "assigned_to": None,
        "assigned_at": None,
        "resolved_at": None,
        "resolution_note": None,
        "status_history": [
            {"status": "pending", "updated_at": datetime.utcnow().isoformat(), "updated_by": current_user["id"], "note": "Issue reported"}
        ],
    }

    ref = db.collection("issues").add(issue_data)
    issue_data["id"] = ref[1].id
    return issue_data


@router.get("/my")
async def get_my_issues(current_user: dict = Depends(get_current_user)):
    db = get_db()
    docs = db.collection("issues").where("reported_by", "==", current_user["id"]).order_by("reported_at", direction="DESCENDING").get()
    return [serialize_issue(d) for d in docs]


@router.get("")
async def get_all_issues(
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(require_authority)
):
    db = get_db()
    query = db.collection("issues").order_by("reported_at", direction="DESCENDING")

    docs = query.get()
    issues = [serialize_issue(d) for d in docs]

    if status:
        issues = [i for i in issues if i.get("status") == status]
    if category:
        issues = [i for i in issues if i.get("category") == category]
    if priority:
        issues = [i for i in issues if i.get("priority") == priority]

    return issues[:limit]


@router.get("/{issue_id}")
async def get_issue(issue_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = db.collection("issues").document(issue_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue = serialize_issue(doc)

    # Citizens can only view their own issues
    if current_user["role"] == "citizen" and issue["reported_by"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return issue


@router.patch("/{issue_id}/status")
async def update_status(
    issue_id: str,
    data: IssueStatusUpdate,
    current_user: dict = Depends(require_authority)
):
    valid_statuses = ["pending", "acknowledged", "in_progress", "resolved"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    db = get_db()
    doc = db.collection("issues").document(issue_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue = doc.to_dict()
    now = datetime.utcnow().isoformat()

    history_entry = {
        "status": data.status,
        "updated_at": now,
        "updated_by": current_user["id"],
        "note": data.note or "",
    }

    update_data = {
        "status": data.status,
        "status_history": (issue.get("status_history") or []) + [history_entry],
    }

    if data.status == "resolved":
        update_data["resolved_at"] = now
        update_data["resolution_note"] = data.note

    db.collection("issues").document(issue_id).update(update_data)

    # Notify the citizen
    status_messages = {
        "acknowledged": "Your issue has been acknowledged by the authorities.",
        "in_progress": "Work has started on your reported issue.",
        "resolved": "Your issue has been resolved. Thank you for reporting!",
    }
    if data.status in status_messages:
        create_notification(issue["reported_by"], issue_id, status_messages[data.status])

    return {"message": "Status updated", "status": data.status}


@router.patch("/{issue_id}/assign")
async def assign_issue(
    issue_id: str,
    data: IssueAssign,
    current_user: dict = Depends(require_authority)
):
    db = get_db()
    doc = db.collection("issues").document(issue_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Issue not found")

    db.collection("issues").document(issue_id).update({
        "assigned_to": data.department,
        "assigned_at": datetime.utcnow().isoformat(),
    })

    return {"message": "Issue assigned", "department": data.department}


@router.delete("/{issue_id}")
async def delete_issue(
    issue_id: str,
    current_user: dict = Depends(require_authority)
):
    db = get_db()
    db.collection("issues").document(issue_id).delete()
    return {"message": "Issue deleted"}
