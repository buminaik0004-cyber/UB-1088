from fastapi import APIRouter, Depends
from app.config import get_db
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    db = get_db()
    docs = db.collection("notifications").where("user_id", "==", current_user["id"]).order_by("created_at", direction="DESCENDING").limit(20).get()
    result = []
    for d in docs:
        n = d.to_dict()
        n["id"] = d.id
        result.append(n)
    return result


@router.patch("/{notif_id}/read")
async def mark_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    db.collection("notifications").document(notif_id).update({"is_read": True})
    return {"message": "Marked as read"}


@router.patch("/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    db = get_db()
    docs = db.collection("notifications").where("user_id", "==", current_user["id"]).where("is_read", "==", False).get()
    for d in docs:
        d.reference.update({"is_read": True})
    return {"message": "All marked as read"}
