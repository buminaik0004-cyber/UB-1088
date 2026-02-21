from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from app.config import get_db
from app.models.schemas import UserRegister, UserLogin
from app.middleware.auth_middleware import create_access_token, get_current_user
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

@router.post("/register")
async def register(data: UserRegister):
    db = get_db()

    # Check email exists
    existing = db.collection("users").where("email", "==", data.email).get()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if data.role not in ["citizen", "authority"]:
        raise HTTPException(status_code=400, detail="Role must be citizen or authority")

    hashed = pwd_context.hash(data.password[:72])
    user_data = {
        "name": data.name,
        "email": data.email,
        "password": hashed,
        "role": data.role,
        "phone": data.phone or "",
        "ward": data.ward or "",
        "created_at": datetime.utcnow().isoformat(),
    }

    ref = db.collection("users").add(user_data)
    user_id = ref[1].id

    token = create_access_token({"sub": user_id, "role": data.role})
    user_data.pop("password")
    user_data["id"] = user_id

    return {"token": token, "user": user_data}


@router.post("/login")
async def login(data: UserLogin):
    db = get_db()
    users = db.collection("users").where("email", "==", data.email).get()

    if not users:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_doc = users[0]
    user = user_doc.to_dict()

    if not pwd_context.verify(data.password[:72], user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user_doc.id, "role": user["role"]})
    user.pop("password")
    user["id"] = user_doc.id

    return {"token": token, "user": user}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    current_user.pop("password", None)
    return current_user


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
