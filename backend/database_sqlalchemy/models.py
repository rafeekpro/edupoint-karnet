from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, Time, Enum, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
import uuid

from .config import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    THERAPIST = "therapist"
    CLIENT = "client"


class CodeStatus(str, enum.Enum):
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"


class SessionStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"
    NO_SHOW = "no_show"


class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    therapy_classes = relationship("TherapyClass", back_populates="therapist")
    vouchers = relationship("Voucher", back_populates="client")
    reservations = relationship("Reservation", back_populates="client")


class TherapyClass(Base):
    __tablename__ = "therapy_classes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    therapist_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0 = Monday, 6 = Sunday
    time = Column(Time, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    max_participants = Column(Integer, default=1)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    therapist = relationship("User", back_populates="therapy_classes")
    reservations = relationship("Reservation", back_populates="therapy_class")


class Voucher(Base):
    __tablename__ = "vouchers"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("users.id"), index=True)
    activated_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    client = relationship("User", back_populates="vouchers")
    codes = relationship("VoucherCode", back_populates="voucher", cascade="all, delete-orphan")


class VoucherCode(Base):
    __tablename__ = "voucher_codes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(8), unique=True, nullable=False, index=True)
    voucher_id = Column(String(36), ForeignKey("vouchers.id"), nullable=False, index=True)
    is_backup = Column(Boolean, default=False)
    status = Column(Enum(CodeStatus), default=CodeStatus.ACTIVE, index=True)
    used_count = Column(Integer, default=0)
    max_uses = Column(Integer, default=1)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    voucher = relationship("Voucher", back_populates="codes")
    reservations = relationship("Reservation", back_populates="voucher_code")


class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    voucher_code_id = Column(String(36), ForeignKey("voucher_codes.id"), nullable=False, index=True)
    therapy_class_id = Column(String(36), ForeignKey("therapy_classes.id"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    start_date = Column(Date, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    voucher_code = relationship("VoucherCode", back_populates="reservations")
    therapy_class = relationship("TherapyClass", back_populates="reservations")
    client = relationship("User", back_populates="reservations")
    sessions = relationship("Session", back_populates="reservation", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reservation_id = Column(String(36), ForeignKey("reservations.id"), nullable=False, index=True)
    scheduled_date = Column(Date, nullable=False, index=True)
    scheduled_time = Column(Time, nullable=False)
    actual_date = Column(Date, nullable=True)
    actual_time = Column(Time, nullable=True)
    status = Column(Enum(SessionStatus), default=SessionStatus.SCHEDULED, index=True)
    therapist_notes = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    reservation = relationship("Reservation", back_populates="sessions")