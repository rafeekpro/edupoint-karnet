from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, date, time
from enum import Enum
import uuid

class UserRole(str, Enum):
    CLIENT = "client"
    THERAPIST = "therapist"
    ADMIN = "admin"

class CodeStatus(str, Enum):
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"

class SessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: UserRole
    password_hash: Optional[str] = Field(None, exclude=True)
    created_at: datetime = Field(default_factory=datetime.now)

class TherapyClass(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    therapist_id: str
    day_of_week: int  # 0-6 (Monday-Sunday)
    time: time
    duration_minutes: int = 60
    max_participants: int = 1
    created_at: datetime = Field(default_factory=datetime.now)

class VoucherCode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    voucher_id: str
    is_backup: bool = False
    status: CodeStatus = CodeStatus.ACTIVE
    used_count: int = 0
    max_uses: int = 10
    created_at: datetime = Field(default_factory=datetime.now)

class Voucher(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: Optional[str] = None
    codes: List[VoucherCode] = []
    created_at: datetime = Field(default_factory=datetime.now)
    activated_at: Optional[datetime] = None

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reservation_id: str
    scheduled_date: date
    scheduled_time: time
    actual_date: Optional[date] = None
    actual_time: Optional[time] = None
    status: SessionStatus = SessionStatus.SCHEDULED
    therapist_notes: Optional[str] = None
    client_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class Reservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    voucher_code_id: str
    therapy_class_id: str
    client_id: str
    start_date: date
    sessions: List[Session] = []
    created_at: datetime = Field(default_factory=datetime.now)

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class VoucherGenerateRequest(BaseModel):
    regular_codes_count: int = 10
    backup_codes_count: int = 2

class ReservationRequest(BaseModel):
    voucher_code: str
    therapy_class_id: str
    start_date: date

class SessionRescheduleRequest(BaseModel):
    new_date: date
    new_time: time
    reason: Optional[str] = None