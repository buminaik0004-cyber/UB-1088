from fastapi import APIRouter, Depends
from app.config import get_db
from app.middleware.auth_middleware import require_authority
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def get_summary(current_user: dict = Depends(require_authority)):
    db = get_db()
    docs = db.collection("issues").get()
    issues = [d.to_dict() for d in docs]

    now = datetime.utcnow()
    week_ago = (now - timedelta(days=7)).isoformat()

    summary = {
        "total": len(issues),
        "pending": sum(1 for i in issues if i.get("status") == "pending"),
        "acknowledged": sum(1 for i in issues if i.get("status") == "acknowledged"),
        "in_progress": sum(1 for i in issues if i.get("status") == "in_progress"),
        "resolved": sum(1 for i in issues if i.get("status") == "resolved"),
        "this_week": sum(1 for i in issues if (i.get("reported_at") or "") >= week_ago),
    }
    return summary


@router.get("/by-category")
async def get_by_category(current_user: dict = Depends(require_authority)):
    db = get_db()
    docs = db.collection("issues").get()

    counts = defaultdict(int)
    for d in docs:
        cat = d.to_dict().get("category", "other")
        counts[cat] += 1

    category_labels = {
        "pothole": "Pothole", "garbage": "Garbage", "streetlight": "Streetlight",
        "water_leakage": "Water", "road_damage": "Road", "drainage": "Drainage",
        "encroachment": "Encroach.", "other": "Other",
    }

    return [{"category": category_labels.get(k, k), "count": v} for k, v in counts.items()]


@router.get("/by-week")
async def get_by_week(current_user: dict = Depends(require_authority)):
    db = get_db()
    docs = db.collection("issues").get()

    week_data = defaultdict(lambda: {"reported": 0, "resolved": 0})

    for d in docs:
        issue = d.to_dict()
        reported_at = issue.get("reported_at")
        if not reported_at:
            continue

        try:
            dt = datetime.fromisoformat(reported_at)
            # Get week start (Monday)
            week_start = dt - timedelta(days=dt.weekday())
            week_key = week_start.strftime("W%d %b")
            week_data[week_key]["reported"] += 1
            if issue.get("status") == "resolved":
                week_data[week_key]["resolved"] += 1
        except Exception:
            continue

    # Return last 8 weeks sorted
    sorted_weeks = sorted(week_data.items())[-8:]
    return [{"week": k, **v} for k, v in sorted_weeks]


@router.get("/resolution-time")
async def get_resolution_time(current_user: dict = Depends(require_authority)):
    db = get_db()
    docs = db.collection("issues").where("status", "==", "resolved").get()

    dept_times = defaultdict(list)
    for d in docs:
        issue = d.to_dict()
        reported = issue.get("reported_at")
        resolved = issue.get("resolved_at")
        dept = issue.get("assigned_to", "general")
        if reported and resolved:
            try:
                r1 = datetime.fromisoformat(reported)
                r2 = datetime.fromisoformat(resolved)
                days = (r2 - r1).days
                dept_times[dept].append(days)
            except Exception:
                pass

    return [
        {"department": dept, "avg_days": round(sum(times) / len(times), 1)}
        for dept, times in dept_times.items()
        if times
    ]
