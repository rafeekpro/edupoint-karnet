from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Optional
from datetime import datetime

from models_v2 import (
    UserRole, Organization, OrganizationCreate, OrganizationUpdate,
    UserCreate, UserCreateWithOrg, UserUpdate, UserPasswordChange, UserResponse,
    VoucherType, VoucherTypeCreate, VoucherTypeUpdate,
    VoucherPurchase, VoucherResponse, MessageResponse,
    PaginatedResponse, AuditLog, Permission, PermissionGrant
)
from db_v2 import db_v2
from auth import get_current_user

router = APIRouter()

# ============================================
# DEPENDENCIES
# ============================================
async def get_current_admin(current_user: UserResponse = Depends(get_current_user)):
    """Ensure user is admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def get_current_org_owner(current_user: UserResponse = Depends(get_current_user)):
    """Ensure user is organization owner"""
    if not current_user.is_organization_owner and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Organization owner access required")
    return current_user

async def verify_org_access(org_id: int, current_user: UserResponse = Depends(get_current_user)):
    """Verify user has access to organization"""
    if current_user.role == UserRole.ADMIN:
        return True
    if current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Access denied to this organization")
    if not current_user.is_organization_owner:
        raise HTTPException(status_code=403, detail="Organization owner access required")
    return True

# ============================================
# ADMIN - USER MANAGEMENT
# ============================================
@router.get("/api/admin/users", response_model=List[UserResponse])
async def list_all_users(
    organization_id: Optional[int] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: List all users in the system"""
    users = db_v2.list_users(organization_id, role, is_active)
    return users

@router.post("/api/admin/users", response_model=UserResponse, status_code=201)
async def create_user_admin(
    user_data: UserCreateWithOrg,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: Create a new user"""
    # Check if email already exists
    existing = db_v2.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create organization if needed
    org_id = None
    if user_data.organization_name:
        org = db_v2.create_organization(
            user_data.organization_name,
            user_data.email,
            user_data.name,
            user_data.password
        )
        org_id = org['id']
    
    # Create user
    user = db_v2.create_user(
        email=user_data.email,
        name=user_data.name,
        password=user_data.password,
        role=user_data.role,
        organization_id=org_id,
        created_by=current_user.id,
        phone=user_data.phone,
        is_active=True
    )
    return user

@router.get("/api/admin/users/{user_id}", response_model=UserResponse)
async def get_user_admin(
    user_id: int,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: Get user details"""
    user = db_v2.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/api/admin/users/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: int,
    user_data: UserUpdate,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: Update user details"""
    # Check if user exists
    user = db_v2.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user
    updated_user = db_v2.update_user(
        user_id=user_id,
        updated_by=current_user.id,
        **user_data.dict(exclude_unset=True)
    )
    return updated_user

@router.put("/api/admin/users/{user_id}/password", response_model=MessageResponse)
async def change_user_password_admin(
    user_id: int,
    password_data: UserPasswordChange,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: Change user password"""
    success = db_v2.change_user_password(user_id, password_data.password, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Password updated successfully"}

@router.delete("/api/admin/users/{user_id}", response_model=MessageResponse)
async def delete_user_admin(
    user_id: int,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: Delete a user"""
    success = db_v2.delete_user(user_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.post("/api/admin/users/{user_id}/approve", response_model=UserResponse)
async def approve_user_admin(
    user_id: int,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: Approve a pending user"""
    user = db_v2.approve_user(user_id, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ============================================
# ADMIN - ORGANIZATION MANAGEMENT
# ============================================
@router.get("/api/admin/organizations", response_model=List[Organization])
async def list_organizations_admin(
    is_active: Optional[bool] = None,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: List all organizations"""
    return db_v2.list_organizations(is_active)

@router.post("/api/admin/organizations", response_model=Organization, status_code=201)
async def create_organization_admin(
    org_data: OrganizationCreate,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: Create a new organization with owner"""
    # Check if owner email already exists
    existing = db_v2.get_user_by_email(org_data.owner_email)
    if existing:
        raise HTTPException(status_code=400, detail="Owner email already registered")
    
    org = db_v2.create_organization(
        name=org_data.name,
        owner_email=org_data.owner_email,
        owner_name=org_data.owner_name,
        owner_password=org_data.owner_password,
        address=org_data.address,
        phone=org_data.phone,
        email=org_data.email,
        tax_id=org_data.tax_id,
        logo_url=org_data.logo_url
    )
    return org

@router.put("/api/admin/organizations/{org_id}", response_model=Organization)
async def update_organization_admin(
    org_id: int,
    org_data: OrganizationUpdate,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: Update organization details"""
    org = db_v2.get_organization(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    updated_org = db_v2.update_organization(
        org_id=org_id,
        user_id=current_user.id,
        **org_data.dict(exclude_unset=True)
    )
    return updated_org

@router.delete("/api/admin/organizations/{org_id}", response_model=MessageResponse)
async def delete_organization_admin(
    org_id: int,
    current_user: UserResponse = Depends(get_current_admin)
):
    """Admin: Delete an organization (soft delete)"""
    updated_org = db_v2.update_organization(
        org_id=org_id,
        user_id=current_user.id,
        is_active=False
    )
    if not updated_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return {"message": "Organization deactivated successfully"}

# ============================================
# ORGANIZATION OWNER - USER MANAGEMENT
# ============================================
@router.get("/api/organizations/{org_id}/users", response_model=List[UserResponse])
async def list_organization_users(
    org_id: int,
    current_user: UserResponse = Depends(get_current_org_owner)
):
    """Organization owner: List users in organization"""
    await verify_org_access(org_id, current_user)
    users = db_v2.list_users(organization_id=org_id)
    return users

@router.post("/api/organizations/{org_id}/users", response_model=UserResponse, status_code=201)
async def add_user_to_organization(
    org_id: int,
    user_data: UserCreate,
    current_user: UserResponse = Depends(get_current_org_owner)
):
    """Organization owner: Add user to organization"""
    await verify_org_access(org_id, current_user)
    
    # Check if email already exists
    existing = db_v2.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = db_v2.create_user(
        email=user_data.email,
        name=user_data.name,
        password=user_data.password,
        role=user_data.role,
        organization_id=org_id,
        created_by=current_user.id,
        phone=user_data.phone,
        is_active=True  # Auto-approve for org owners
    )
    return user

@router.delete("/api/organizations/{org_id}/users/{user_id}", response_model=MessageResponse)
async def remove_user_from_organization(
    org_id: int,
    user_id: int,
    current_user: UserResponse = Depends(get_current_org_owner)
):
    """Organization owner: Remove user from organization"""
    await verify_org_access(org_id, current_user)
    
    # Check if user belongs to organization
    user = db_v2.get_user(user_id)
    if not user or user['organization_id'] != org_id:
        raise HTTPException(status_code=404, detail="User not found in organization")
    
    # Can't remove yourself
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    
    # Remove user
    success = db_v2.delete_user(user_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User removed from organization"}

# ============================================
# ORGANIZATION OWNER - VOUCHER TYPE MANAGEMENT
# ============================================
@router.get("/api/organizations/{org_id}/voucher-types", response_model=List[VoucherType])
async def list_organization_voucher_types(
    org_id: int,
    is_active: Optional[bool] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """List voucher types for organization"""
    # Public endpoint for clients to see available voucher types
    voucher_types = db_v2.list_voucher_types(organization_id=org_id, is_active=is_active)
    return voucher_types

@router.post("/api/organizations/{org_id}/voucher-types", response_model=VoucherType, status_code=201)
async def create_voucher_type(
    org_id: int,
    vt_data: VoucherTypeCreate,
    current_user: UserResponse = Depends(get_current_org_owner)
):
    """Organization owner: Create voucher type"""
    await verify_org_access(org_id, current_user)
    
    # Convert booking rules to dict
    booking_rules = vt_data.booking_rules.dict()
    
    voucher_type = db_v2.create_voucher_type(
        organization_id=org_id,
        created_by=current_user.id,
        name=vt_data.name,
        session_name=vt_data.session_name,
        description=vt_data.description,
        total_sessions=vt_data.total_sessions,
        backup_sessions=vt_data.backup_sessions,
        session_duration_minutes=vt_data.session_duration_minutes,
        max_clients_per_session=vt_data.max_clients_per_session,
        frequency=vt_data.frequency,
        custom_days=vt_data.custom_days,
        price=vt_data.price,
        validity_days=vt_data.validity_days,
        booking_rules=booking_rules,
        is_active=True
    )
    return voucher_type

@router.put("/api/organizations/{org_id}/voucher-types/{vt_id}", response_model=VoucherType)
async def update_voucher_type(
    org_id: int,
    vt_id: int,
    vt_data: VoucherTypeUpdate,
    current_user: UserResponse = Depends(get_current_org_owner)
):
    """Organization owner: Update voucher type"""
    await verify_org_access(org_id, current_user)
    
    # Check if voucher type belongs to organization
    vt = db_v2.get_voucher_type(vt_id)
    if not vt or vt['organization_id'] != org_id:
        raise HTTPException(status_code=404, detail="Voucher type not found")
    
    # Prepare update data
    update_data = vt_data.dict(exclude_unset=True)
    if 'booking_rules' in update_data:
        update_data['booking_rules'] = update_data['booking_rules'].dict()
    
    updated_vt = db_v2.update_voucher_type(
        voucher_type_id=vt_id,
        updated_by=current_user.id,
        **update_data
    )
    return updated_vt

@router.put("/api/organizations/{org_id}/voucher-types/{vt_id}/deactivate", response_model=VoucherType)
async def deactivate_voucher_type(
    org_id: int,
    vt_id: int,
    current_user: UserResponse = Depends(get_current_org_owner)
):
    """Organization owner: Deactivate voucher type"""
    await verify_org_access(org_id, current_user)
    
    # Check if voucher type belongs to organization
    vt = db_v2.get_voucher_type(vt_id)
    if not vt or vt['organization_id'] != org_id:
        raise HTTPException(status_code=404, detail="Voucher type not found")
    
    deactivated_vt = db_v2.deactivate_voucher_type(vt_id, current_user.id)
    return deactivated_vt

@router.delete("/api/organizations/{org_id}/voucher-types/{vt_id}", response_model=MessageResponse)
async def delete_voucher_type(
    org_id: int,
    vt_id: int,
    current_user: UserResponse = Depends(get_current_org_owner)
):
    """Organization owner: Delete voucher type (deactivate)"""
    await verify_org_access(org_id, current_user)
    
    # Deactivate instead of hard delete
    deactivated_vt = db_v2.deactivate_voucher_type(vt_id, current_user.id)
    if not deactivated_vt:
        raise HTTPException(status_code=404, detail="Voucher type not found")
    
    return {"message": "Voucher type deactivated successfully"}

# ============================================
# CLIENT - VOUCHER PURCHASE
# ============================================
@router.get("/api/voucher-types/available", response_model=List[VoucherType])
async def list_available_voucher_types(
    current_user: UserResponse = Depends(get_current_user)
):
    """Client: List all available voucher types for purchase"""
    voucher_types = db_v2.list_available_voucher_types()
    return voucher_types

@router.post("/api/vouchers/purchase", response_model=VoucherResponse, status_code=201)
async def purchase_voucher(
    purchase_data: VoucherPurchase,
    current_user: UserResponse = Depends(get_current_user)
):
    """Client: Purchase a voucher"""
    if current_user.role not in [UserRole.CLIENT, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only clients can purchase vouchers")
    
    try:
        voucher = db_v2.purchase_voucher(
            client_id=current_user.id,
            voucher_type_id=purchase_data.voucher_type_id,
            payment_method=purchase_data.payment_method,
            payment_token=purchase_data.payment_token
        )
        
        # Get voucher type details
        vt = db_v2.get_voucher_type(purchase_data.voucher_type_id)
        voucher['voucher_type_name'] = vt['name']
        voucher['client_name'] = current_user.name
        
        return voucher
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/vouchers/my", response_model=List[VoucherResponse])
async def list_my_vouchers(
    current_user: UserResponse = Depends(get_current_user)
):
    """Client: List my purchased vouchers"""
    # This would need to be implemented in db_v2
    # For now, return empty list
    return []

# ============================================
# ORGANIZATION MANAGEMENT
# ============================================
@router.get("/api/organizations/{org_id}", response_model=Organization)
async def get_organization(
    org_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get organization details"""
    # Check access
    if current_user.role != UserRole.ADMIN and current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    org = db_v2.get_organization(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.put("/api/organizations/{org_id}", response_model=Organization)
async def update_organization(
    org_id: int,
    org_data: OrganizationUpdate,
    current_user: UserResponse = Depends(get_current_org_owner)
):
    """Update organization details"""
    await verify_org_access(org_id, current_user)
    
    updated_org = db_v2.update_organization(
        org_id=org_id,
        user_id=current_user.id,
        **org_data.dict(exclude_unset=True)
    )
    if not updated_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return updated_org