from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "citizen"
    phone: Optional[str] = None
    ward: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Location(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = ""

class IssueCreate(BaseModel):
    title: str
    category: str
    description: str
    priority: str = "medium"
    location: Location
    images: Optional[List[str]] = []

class IssueStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = ""

class IssueAssign(BaseModel):
    department: str

class NotificationCreate(BaseModel):
    user_id: str
    issue_id: str
    message: str
