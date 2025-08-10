from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time
from enum import Enum

# ============================================
# ENUMS
# ============================================
class UserRole(str, Enum):
    ADMIN = "admin"
    ORGANIZATION_OWNER = "organization_owner"
    THERAPIST = "therapist"
    CLIENT = "client"
    STAFF = "staff"

class VoucherStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Frequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    CUSTOM = "custom"

# ============================================
# ORGANIZATION MODELS
# ============================================
class OrganizationBase(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tax_id: Optional[str] = None
    logo_url: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    owner_email: str
    owner_name: str
    owner_password: str

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tax_id: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None

class Organization(OrganizationBase):
    id: int
    slug: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    owner: Optional['UserResponse'] = None

    class Config:
        from_attributes = True

# ============================================
# USER MODELS
# ============================================
class UserBase(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CLIENT

class UserCreate(UserBase):
    password: str
    organization_id: Optional[int] = None

class UserCreateWithOrg(UserBase):
    password: str
    organization_name: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    organization_id: Optional[int] = None

class UserPasswordChange(BaseModel):
    password: str = Field(..., min_length=8, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserResponse(UserBase):
    id: int
    organization_id: Optional[int]
    organization_name: Optional[str] = None
    is_organization_owner: bool
    is_active: bool
    approved_at: Optional[datetime]
    approved_by: Optional[int]
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============================================
# VOUCHER TYPE MODELS
# ============================================
class BookingRule(BaseModel):
    enabled: bool
    start_time: Optional[str] = None  # Format: "HH:MM"
    end_time: Optional[str] = None    # Format: "HH:MM"
    
    @validator('start_time', 'end_time')
    def validate_time_format(cls, v):
        if v:
            try:
                time.fromisoformat(v)
            except ValueError:
                raise ValueError('Time must be in HH:MM format')
        return v

class BookingRules(BaseModel):
    monday: Optional[BookingRule] = BookingRule(enabled=False)
    tuesday: Optional[BookingRule] = BookingRule(enabled=False)
    wednesday: Optional[BookingRule] = BookingRule(enabled=False)
    thursday: Optional[BookingRule] = BookingRule(enabled=False)
    friday: Optional[BookingRule] = BookingRule(enabled=False)
    saturday: Optional[BookingRule] = BookingRule(enabled=False)
    sunday: Optional[BookingRule] = BookingRule(enabled=False)

class VoucherTypeBase(BaseModel):
    name: str
    session_name: str = "Session"
    description: Optional[str] = None
    total_sessions: int = Field(..., gt=0)
    backup_sessions: int = Field(0, ge=0)
    session_duration_minutes: int = Field(..., gt=0)
    max_clients_per_session: int = Field(1, gt=0)
    frequency: Frequency
    custom_days: Optional[List[int]] = None  # 1=Mon, 7=Sun
    price: float = Field(..., ge=0)
    validity_days: int = Field(..., gt=0)
    booking_rules: BookingRules

class VoucherTypeCreate(VoucherTypeBase):
    pass

class VoucherTypeUpdate(BaseModel):
    name: Optional[str] = None
    session_name: Optional[str] = None
    description: Optional[str] = None
    total_sessions: Optional[int] = Field(None, gt=0)
    backup_sessions: Optional[int] = Field(None, ge=0)
    session_duration_minutes: Optional[int] = Field(None, gt=0)
    max_clients_per_session: Optional[int] = Field(None, gt=0)
    frequency: Optional[Frequency] = None
    custom_days: Optional[List[int]] = None
    price: Optional[float] = Field(None, ge=0)
    validity_days: Optional[int] = Field(None, gt=0)
    booking_rules: Optional[BookingRules] = None
    is_active: Optional[bool] = None

class VoucherType(VoucherTypeBase):
    id: int
    organization_id: int
    is_active: bool
    deactivated_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============================================
# VOUCHER MODELS
# ============================================
class VoucherPurchase(BaseModel):
    voucher_type_id: int
    payment_method: str
    payment_token: Optional[str] = None  # For payment gateway integration

class VoucherResponse(BaseModel):
    id: int
    voucher_type_id: int
    voucher_type_name: str
    organization_id: int
    client_id: int
    client_name: str
    purchase_date: datetime
    valid_until: datetime
    total_sessions: int
    used_sessions: int
    status: VoucherStatus
    payment_status: PaymentStatus
    payment_amount: Optional[float]
    payment_date: Optional[datetime]
    invoice_number: Optional[str]
    codes: List[Dict[str, Any]]  # Voucher codes

    class Config:
        from_attributes = True

# ============================================
# AUDIT LOG MODELS
# ============================================
class AuditLog(BaseModel):
    id: int
    user_id: Optional[int]
    organization_id: Optional[int]
    action: str
    entity_type: str
    entity_id: Optional[int]
    old_values: Optional[Dict[str, Any]]
    new_values: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================
# PERMISSION MODELS
# ============================================
class Permission(BaseModel):
    id: int
    user_id: int
    organization_id: int
    permission: str
    granted_by: Optional[int]
    granted_at: datetime

    class Config:
        from_attributes = True

class PermissionGrant(BaseModel):
    user_id: int
    permissions: List[str]

# ============================================
# RESPONSE MODELS
# ============================================
class MessageResponse(BaseModel):
    message: str
    details: Optional[Dict[str, Any]] = None

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int

# Update forward references
Organization.model_rebuild()
UserResponse.model_rebuild()