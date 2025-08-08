from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, date
from typing import List

from models import (
    User, TherapyClass, Voucher, VoucherCode, Reservation, Session,
    LoginRequest, TokenResponse, VoucherGenerateRequest, ReservationRequest,
    SessionRescheduleRequest, UserRole, SessionStatus, CodeStatus
)
from database import MockDatabase, db
from auth import (
    authenticate_user, create_access_token, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(title="Therapy System API", version="1.0.0")

# Configure CORS
import os

origins = [
    "http://localhost:3000",
    "http://app.localhost",  # Docker Traefik local
    "https://voucherskit.com",
    "https://dev.voucherskit.com",
]

# Add additional origins from environment variable if provided
if os.getenv("ADDITIONAL_CORS_ORIGINS"):
    origins.extend(os.getenv("ADDITIONAL_CORS_ORIGINS").split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Therapy System API"}

@app.post("/token", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    return TokenResponse(access_token=access_token, user=user)

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Admin endpoints
@app.post("/admin/vouchers", response_model=Voucher)
async def generate_voucher(
    request: VoucherGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    voucher = db.create_voucher(
        regular_codes=request.regular_codes_count,
        backup_codes=request.backup_codes_count
    )
    return voucher

@app.get("/admin/vouchers", response_model=List[Voucher])
async def list_vouchers(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return list(db.vouchers.values())

@app.get("/admin/users", response_model=List[User])
async def list_users(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return list(db.users.values())

# Therapy classes endpoints
@app.get("/therapy-classes", response_model=List[TherapyClass])
async def list_therapy_classes():
    return list(db.therapy_classes.values())

@app.get("/therapy-classes/{class_id}", response_model=TherapyClass)
async def get_therapy_class(class_id: str):
    therapy_class = db.therapy_classes.get(class_id)
    if not therapy_class:
        raise HTTPException(status_code=404, detail="Therapy class not found")
    return therapy_class

@app.post("/admin/therapy-classes", response_model=TherapyClass)
async def create_therapy_class(
    therapy_class: TherapyClass,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Verify therapist exists
    therapist = db.users.get(therapy_class.therapist_id)
    if not therapist or therapist.role != UserRole.THERAPIST:
        raise HTTPException(status_code=400, detail="Invalid therapist ID")
    
    # Add to database
    db.therapy_classes[therapy_class.id] = therapy_class
    return therapy_class

@app.put("/admin/therapy-classes/{class_id}", response_model=TherapyClass)
async def update_therapy_class(
    class_id: str,
    therapy_class: TherapyClass,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if class exists
    if class_id not in db.therapy_classes:
        raise HTTPException(status_code=404, detail="Therapy class not found")
    
    # Verify therapist exists
    therapist = db.users.get(therapy_class.therapist_id)
    if not therapist or therapist.role != UserRole.THERAPIST:
        raise HTTPException(status_code=400, detail="Invalid therapist ID")
    
    # Update class
    therapy_class.id = class_id  # Ensure ID doesn't change
    db.therapy_classes[class_id] = therapy_class
    return therapy_class

@app.delete("/admin/therapy-classes/{class_id}")
async def delete_therapy_class(
    class_id: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if class exists
    if class_id not in db.therapy_classes:
        raise HTTPException(status_code=404, detail="Therapy class not found")
    
    # Check for active reservations
    active_reservations = [r for r in db.reservations.values() 
                          if r.therapy_class_id == class_id]
    if active_reservations:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete class with active reservations"
        )
    
    # Delete class
    del db.therapy_classes[class_id]
    return {"message": "Class deleted successfully"}

# Client endpoints
@app.post("/client/activate-code")
async def activate_code(
    code: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    voucher_code = db.get_voucher_code_by_code(code)
    if not voucher_code:
        raise HTTPException(status_code=404, detail="Invalid code")
    
    voucher = db.vouchers.get(voucher_code.voucher_id)
    if voucher.client_id and voucher.client_id != current_user.id:
        raise HTTPException(status_code=400, detail="Code already assigned to another client")
    
    voucher.client_id = current_user.id
    voucher.activated_at = datetime.now()
    
    return {"message": "Code activated successfully", "voucher_id": voucher.id}

@app.post("/client/activate-code/{code}")
async def activate_voucher_code(code: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    voucher_code = db.get_voucher_code_by_code(code)
    if not voucher_code:
        raise HTTPException(status_code=404, detail="Invalid voucher code")
    
    if voucher_code.status != CodeStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Code is not active")
    
    voucher = db.vouchers.get(voucher_code.voucher_id)
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucher not found")
    
    # Check if voucher is already activated by another client
    if voucher.client_id and voucher.client_id != current_user.id:
        raise HTTPException(status_code=400, detail="Voucher already activated by another user")
    
    # Activate voucher for the client
    voucher.client_id = current_user.id
    voucher.activated_at = datetime.now()
    
    # Return info about code type
    return {
        "success": True, 
        "voucher": voucher,
        "code_type": "backup" if voucher_code.is_backup else "regular",
        "is_backup": voucher_code.is_backup
    }

@app.post("/client/reservations", response_model=Reservation)
async def create_reservation(
    request: ReservationRequest,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    voucher_code = db.get_voucher_code_by_code(request.voucher_code)
    if not voucher_code:
        raise HTTPException(status_code=404, detail="Invalid code")
    
    voucher = db.vouchers.get(voucher_code.voucher_id)
    if voucher.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Code not assigned to this client")
    
    if voucher_code.status != CodeStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Code already used or expired")
    
    therapy_class = db.therapy_classes.get(request.therapy_class_id)
    if not therapy_class:
        raise HTTPException(status_code=404, detail="Therapy class not found")
    
    reservation = db.create_reservation(
        voucher_code=voucher_code,
        therapy_class=therapy_class,
        client_id=current_user.id,
        start_date=request.start_date
    )
    
    return reservation

@app.get("/client/reservations", response_model=List[Reservation])
async def list_client_reservations(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.get_user_reservations(current_user.id)

@app.get("/client/sessions", response_model=List[Session])
async def list_client_sessions(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    sessions = []
    for reservation in db.get_user_reservations(current_user.id):
        sessions.extend(reservation.sessions)
    
    return sorted(sessions, key=lambda s: (s.scheduled_date, s.scheduled_time))

@app.get("/client/voucher-status")
async def get_voucher_status(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Find vouchers for this client
    client_vouchers = [v for v in db.vouchers.values() if v.client_id == current_user.id]
    
    if not client_vouchers:
        return {"has_voucher": False}
    
    voucher = client_vouchers[0]  # Get the most recent one
    
    # Count used codes
    regular_used = 0
    backup_used = 0
    regular_total = 0
    backup_total = 0
    
    for code in voucher.codes:
        if code.is_backup:
            backup_total += 1
            if code.status == CodeStatus.USED:
                backup_used += 1
        else:
            regular_total += 1
            if code.status == CodeStatus.USED:
                regular_used += 1
    
    return {
        "has_voucher": True,
        "voucher_id": voucher.id,
        "regular_codes": {
            "total": regular_total,
            "used": regular_used,
            "remaining": regular_total - regular_used
        },
        "backup_codes": {
            "total": backup_total,
            "used": backup_used,
            "remaining": backup_total - backup_used
        }
    }

# Therapist endpoints
@app.get("/therapist/sessions", response_model=List[Session])
async def list_therapist_sessions(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.THERAPIST:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.get_therapist_sessions(current_user.id)

@app.get("/therapist/sessions-with-details")
async def list_therapist_sessions_with_details(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.THERAPIST:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    sessions = db.get_therapist_sessions(current_user.id)
    
    # Enrich sessions with client and class details
    enriched_sessions = []
    for session in sessions:
        reservation = db.reservations.get(session.reservation_id)
        if reservation:
            therapy_class = db.therapy_classes.get(reservation.therapy_class_id)
            client = db.users.get(reservation.client_id)
            
            session_dict = session.dict()
            session_dict['therapy_class'] = therapy_class
            session_dict['client'] = client
            enriched_sessions.append(session_dict)
    
    return enriched_sessions

@app.put("/therapist/sessions/{session_id}/reschedule", response_model=Session)
async def reschedule_session(
    session_id: str,
    request: SessionRescheduleRequest,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.THERAPIST:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    session = db.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify therapist owns this session
    reservation = db.reservations.get(session.reservation_id)
    therapy_class = db.therapy_classes.get(reservation.therapy_class_id)
    if therapy_class.therapist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this session")
    
    session.actual_date = request.new_date
    session.actual_time = request.new_time
    session.status = SessionStatus.RESCHEDULED
    if request.reason:
        session.therapist_notes = f"Rescheduled: {request.reason}"
    
    return session

@app.put("/therapist/sessions/{session_id}/notes", response_model=Session)
async def update_session_notes(
    session_id: str,
    notes: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.THERAPIST:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    session = db.sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify therapist owns this session
    reservation = db.reservations.get(session.reservation_id)
    therapy_class = db.therapy_classes.get(reservation.therapy_class_id)
    if therapy_class.therapist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this session")
    
    session.therapist_notes = notes
    return session

@app.get("/therapist/clients")
async def list_therapist_clients(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.THERAPIST:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get all therapy classes for this therapist
    therapist_classes = [tc for tc in db.therapy_classes.values() 
                        if tc.therapist_id == current_user.id]
    therapist_class_ids = [tc.id for tc in therapist_classes]
    
    # Find all unique clients from reservations
    clients_data = {}
    
    for reservation in db.reservations.values():
        if reservation.therapy_class_id in therapist_class_ids:
            client = db.users.get(reservation.client_id)
            if client and client.id not in clients_data:
                # Get all reservations for this client with this therapist
                client_reservations = [r for r in db.reservations.values() 
                                     if r.client_id == client.id 
                                     and r.therapy_class_id in therapist_class_ids]
                
                # Count total sessions and find next session
                total_sessions = 0
                next_session = None
                active_reservations = 0
                
                for res in client_reservations:
                    sessions = [s for s in db.sessions.values() if s.reservation_id == res.id]
                    total_sessions += len(sessions)
                    
                    # Check if reservation is active (has future sessions)
                    future_sessions = [s for s in sessions 
                                     if s.scheduled_date >= date.today() 
                                     and s.status != SessionStatus.CANCELLED]
                    if future_sessions:
                        active_reservations += 1
                        # Find the next upcoming session
                        future_sessions.sort(key=lambda s: (s.scheduled_date, s.scheduled_time))
                        if not next_session or future_sessions[0].scheduled_date < next_session['date']:
                            therapy_class = db.therapy_classes.get(res.therapy_class_id)
                            next_session = {
                                'date': future_sessions[0].scheduled_date.isoformat(),
                                'time': future_sessions[0].scheduled_time.isoformat(),
                                'class_name': therapy_class.name
                            }
                
                clients_data[client.id] = {
                    'id': client.id,
                    'name': client.name,
                    'email': client.email,
                    'active_reservations': active_reservations,
                    'total_sessions': total_sessions,
                    'next_session': next_session
                }
    
    return list(clients_data.values())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)