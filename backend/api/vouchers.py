from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel
from ..database.db_v2 import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["vouchers"])

# Pydantic models
class VoucherResponse(BaseModel):
    id: int
    voucher_type_id: int
    voucher_type_name: str
    organization_name: str
    sessions_total: int
    sessions_used: int
    sessions_remaining: int
    backup_sessions_total: int
    backup_sessions_used: int
    backup_sessions_remaining: int
    purchase_date: datetime
    expiry_date: date
    status: str
    price_paid: Optional[float]

class SessionResponse(BaseModel):
    id: int
    client_id: int
    client_name: str
    therapist_id: int
    therapist_name: str
    session_date: date
    session_time: str
    duration_minutes: int
    session_type: str
    location: Optional[str]
    status: str
    is_backup_session: bool
    therapist_notes: Optional[str]
    preparation_message: Optional[str]

class RescheduleRequest(BaseModel):
    session_id: int
    preferred_date: date
    preferred_time: str
    alternative_date: Optional[date]
    alternative_time: Optional[str]
    reason: str

class SessionPurchase(BaseModel):
    voucher_id: Optional[int]
    sessions_count: int
    payment_method: str

class VoucherPurchase(BaseModel):
    voucher_type_id: int
    payment_method: str

class TherapistNote(BaseModel):
    session_id: int
    notes: str

class PreparationMessage(BaseModel):
    session_id: int
    message: str

class BackupSessionRequest(BaseModel):
    session_id: int
    
# Client endpoints
@router.get("/client/vouchers", response_model=List[VoucherResponse])
async def get_client_vouchers(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get all vouchers for the current client"""
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = """
        SELECT 
            cv.*,
            vt.name as voucher_type_name,
            o.name as organization_name
        FROM client_vouchers cv
        JOIN voucher_types vt ON cv.voucher_type_id = vt.id
        JOIN organizations o ON cv.organization_id = o.id
        WHERE cv.client_id = %s
        ORDER BY cv.status, cv.expiry_date DESC
    """
    
    with db.cursor() as cursor:
        cursor.execute(query, (current_user["id"],))
        vouchers = cursor.fetchall()
        
    return [
        VoucherResponse(
            id=v["id"],
            voucher_type_id=v["voucher_type_id"],
            voucher_type_name=v["voucher_type_name"],
            organization_name=v["organization_name"],
            sessions_total=v["sessions_total"],
            sessions_used=v["sessions_used"],
            sessions_remaining=v["sessions_remaining"],
            backup_sessions_total=v["backup_sessions_total"],
            backup_sessions_used=v["backup_sessions_used"],
            backup_sessions_remaining=v["backup_sessions_remaining"],
            purchase_date=v["purchase_date"],
            expiry_date=v["expiry_date"],
            status=v["status"],
            price_paid=v["price_paid"]
        )
        for v in vouchers
    ]

@router.get("/client/sessions", response_model=List[SessionResponse])
async def get_client_sessions(
    status: Optional[str] = None,
    voucher_id: Optional[int] = None,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get sessions for the current client"""
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = """
        SELECT 
            ts.*,
            c.name as client_name,
            t.name as therapist_name
        FROM therapy_sessions ts
        JOIN users c ON ts.client_id = c.id
        JOIN users t ON ts.therapist_id = t.id
        WHERE ts.client_id = %s
    """
    
    params = [current_user["id"]]
    
    if status:
        query += " AND ts.status = %s"
        params.append(status)
    
    if voucher_id:
        query += " AND ts.voucher_id = %s"
        params.append(voucher_id)
    
    query += " ORDER BY ts.session_date DESC, ts.session_time DESC"
    
    with db.cursor() as cursor:
        cursor.execute(query, params)
        sessions = cursor.fetchall()
    
    return [
        SessionResponse(
            id=s["id"],
            client_id=s["client_id"],
            client_name=s["client_name"],
            therapist_id=s["therapist_id"],
            therapist_name=s["therapist_name"],
            session_date=s["session_date"],
            session_time=str(s["session_time"]),
            duration_minutes=s["duration_minutes"],
            session_type=s["session_type"],
            location=s["location"],
            status=s["status"],
            is_backup_session=s["is_backup_session"],
            therapist_notes=s["therapist_notes"],
            preparation_message=s["preparation_message"]
        )
        for s in sessions
    ]

@router.post("/client/reschedule-request")
async def request_reschedule(
    request: RescheduleRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Request to reschedule a session"""
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify session belongs to client
    with db.cursor() as cursor:
        cursor.execute(
            "SELECT * FROM therapy_sessions WHERE id = %s AND client_id = %s",
            (request.session_id, current_user["id"])
        )
        session = cursor.fetchone()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Create reschedule request
        cursor.execute("""
            INSERT INTO reschedule_requests 
            (session_id, requested_by, current_date, current_time, 
             preferred_date, preferred_time, alternative_date, alternative_time, reason)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            request.session_id,
            current_user["id"],
            session["session_date"],
            session["session_time"],
            request.preferred_date,
            request.preferred_time,
            request.alternative_date,
            request.alternative_time,
            request.reason
        ))
        
        request_id = cursor.fetchone()["id"]
        db.commit()
    
    return {"message": "Reschedule request submitted", "request_id": request_id}

@router.post("/client/use-backup-session")
async def use_backup_session(
    request: BackupSessionRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Use a backup session for a missed session"""
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Access denied")
    
    with db.cursor() as cursor:
        # Get the missed session
        cursor.execute("""
            SELECT ts.*, cv.backup_sessions_remaining 
            FROM therapy_sessions ts
            JOIN client_vouchers cv ON ts.voucher_id = cv.id
            WHERE ts.id = %s AND ts.client_id = %s AND ts.status = 'no_show'
        """, (request.session_id, current_user["id"]))
        
        session = cursor.fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Missed session not found")
        
        if session["backup_sessions_remaining"] <= 0:
            raise HTTPException(status_code=400, detail="No backup sessions available")
        
        # Create new session using backup
        cursor.execute("""
            INSERT INTO therapy_sessions 
            (client_id, therapist_id, voucher_id, organization_id,
             session_date, session_time, duration_minutes, session_type,
             location, status, is_backup_session, original_session_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'scheduled', true, %s)
            RETURNING id
        """, (
            session["client_id"],
            session["therapist_id"],
            session["voucher_id"],
            session["organization_id"],
            date.today() + timedelta(days=7),  # Schedule for next week
            session["session_time"],
            session["duration_minutes"],
            session["session_type"],
            session["location"],
            request.session_id
        ))
        
        new_session_id = cursor.fetchone()["id"]
        
        # Update backup session count
        cursor.execute("""
            UPDATE client_vouchers 
            SET backup_sessions_used = backup_sessions_used + 1
            WHERE id = %s
        """, (session["voucher_id"],))
        
        db.commit()
    
    return {"message": "Backup session applied", "new_session_id": new_session_id}

@router.post("/client/purchase-sessions")
async def purchase_sessions(
    purchase: SessionPurchase,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Purchase additional sessions"""
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Access denied")
    
    with db.cursor() as cursor:
        # Calculate price (simplified - should get from configuration)
        price_per_session = 100.00
        total_price = price_per_session * purchase.sessions_count
        
        # Create purchase record
        cursor.execute("""
            INSERT INTO session_purchases
            (client_id, voucher_id, organization_id, sessions_count, 
             price_per_session, total_price, payment_method, payment_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING id
        """, (
            current_user["id"],
            purchase.voucher_id,
            1,  # Should get from context
            purchase.sessions_count,
            price_per_session,
            total_price,
            purchase.payment_method
        ))
        
        purchase_id = cursor.fetchone()["id"]
        
        # In production, integrate with payment gateway here
        # For now, mark as completed
        cursor.execute("""
            UPDATE session_purchases 
            SET payment_status = 'completed', completed_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (purchase_id,))
        
        # Add sessions to voucher
        if purchase.voucher_id:
            cursor.execute("""
                UPDATE client_vouchers
                SET sessions_total = sessions_total + %s
                WHERE id = %s
            """, (purchase.sessions_count, purchase.voucher_id))
        
        db.commit()
    
    return {"message": "Sessions purchased successfully", "purchase_id": purchase_id}

@router.post("/client/purchase-voucher")
async def purchase_voucher(
    purchase: VoucherPurchase,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Purchase a new voucher package"""
    if current_user["role"] != "client":
        raise HTTPException(status_code=403, detail="Access denied")
    
    with db.cursor() as cursor:
        # Get voucher type details
        cursor.execute("""
            SELECT * FROM voucher_types WHERE id = %s AND is_active = true
        """, (purchase.voucher_type_id,))
        
        voucher_type = cursor.fetchone()
        if not voucher_type:
            raise HTTPException(status_code=404, detail="Voucher type not found")
        
        # Create new voucher
        cursor.execute("""
            INSERT INTO client_vouchers
            (client_id, voucher_type_id, organization_id, sessions_total,
             backup_sessions_total, expiry_date, price_paid, payment_method)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            current_user["id"],
            purchase.voucher_type_id,
            voucher_type["organization_id"],
            voucher_type["sessions_count"],
            voucher_type["backup_sessions_count"],
            date.today() + timedelta(days=voucher_type["validity_days"]),
            voucher_type["price"],
            purchase.payment_method
        ))
        
        voucher_id = cursor.fetchone()["id"]
        db.commit()
    
    return {"message": "Voucher purchased successfully", "voucher_id": voucher_id}

# Therapist endpoints
@router.get("/therapist/clients")
async def get_therapist_clients(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get all clients assigned to therapist"""
    if current_user["role"] != "therapist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = """
        SELECT DISTINCT
            c.id,
            c.name,
            c.email,
            COUNT(DISTINCT cv.id) as active_vouchers,
            SUM(cv.sessions_remaining) as total_sessions_remaining,
            COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'scheduled') as upcoming_sessions
        FROM client_therapist_assignments cta
        JOIN users c ON cta.client_id = c.id
        LEFT JOIN client_vouchers cv ON c.id = cv.client_id AND cv.status = 'active'
        LEFT JOIN therapy_sessions ts ON c.id = ts.client_id 
            AND ts.therapist_id = %s 
            AND ts.session_date >= CURRENT_DATE
        WHERE cta.therapist_id = %s AND cta.status = 'active'
        GROUP BY c.id, c.name, c.email
    """
    
    with db.cursor() as cursor:
        cursor.execute(query, (current_user["id"], current_user["id"]))
        clients = cursor.fetchall()
    
    return clients

@router.get("/therapist/client/{client_id}/vouchers")
async def get_client_vouchers_for_therapist(
    client_id: int,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get voucher details for a specific client"""
    if current_user["role"] != "therapist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify therapist has access to this client
    with db.cursor() as cursor:
        cursor.execute("""
            SELECT * FROM client_therapist_assignments
            WHERE client_id = %s AND therapist_id = %s AND status = 'active'
        """, (client_id, current_user["id"]))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="Access denied to this client")
        
        # Get vouchers
        cursor.execute("""
            SELECT 
                cv.*,
                vt.name as voucher_type_name,
                o.name as organization_name
            FROM client_vouchers cv
            JOIN voucher_types vt ON cv.voucher_type_id = vt.id
            JOIN organizations o ON cv.organization_id = o.id
            WHERE cv.client_id = %s
            ORDER BY cv.status, cv.expiry_date DESC
        """, (client_id,))
        
        vouchers = cursor.fetchall()
    
    return vouchers

@router.post("/therapist/add-session-notes")
async def add_session_notes(
    note: TherapistNote,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Add notes to a completed session"""
    if current_user["role"] != "therapist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    with db.cursor() as cursor:
        # Verify session belongs to therapist
        cursor.execute("""
            SELECT * FROM therapy_sessions 
            WHERE id = %s AND therapist_id = %s
        """, (note.session_id, current_user["id"]))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Update notes
        cursor.execute("""
            UPDATE therapy_sessions
            SET therapist_notes = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (note.notes, note.session_id))
        
        db.commit()
    
    return {"message": "Notes added successfully"}

@router.post("/therapist/send-preparation")
async def send_preparation_message(
    prep: PreparationMessage,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Send preparation message for upcoming session"""
    if current_user["role"] != "therapist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    with db.cursor() as cursor:
        # Verify session belongs to therapist and is upcoming
        cursor.execute("""
            SELECT * FROM therapy_sessions 
            WHERE id = %s AND therapist_id = %s 
            AND status IN ('scheduled', 'confirmed')
            AND session_date >= CURRENT_DATE
        """, (prep.session_id, current_user["id"]))
        
        session = cursor.fetchone()
        if not session:
            raise HTTPException(status_code=404, detail="Upcoming session not found")
        
        # Update preparation message
        cursor.execute("""
            UPDATE therapy_sessions
            SET preparation_message = %s, 
                preparation_sent_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (prep.message, prep.session_id))
        
        # Create notification for client
        cursor.execute("""
            INSERT INTO voucher_notifications
            (voucher_id, client_id, type, title, message)
            VALUES (%s, %s, 'preparation_required', 'Preparation Required', %s)
        """, (session["voucher_id"], session["client_id"], prep.message))
        
        db.commit()
    
    return {"message": "Preparation message sent"}

@router.get("/therapist/reschedule-requests")
async def get_reschedule_requests(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get pending reschedule requests for therapist"""
    if current_user["role"] != "therapist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    query = """
        SELECT 
            rr.*,
            ts.client_id,
            c.name as client_name
        FROM reschedule_requests rr
        JOIN therapy_sessions ts ON rr.session_id = ts.id
        JOIN users c ON ts.client_id = c.id
        WHERE ts.therapist_id = %s AND rr.status = 'pending'
        ORDER BY rr.requested_at DESC
    """
    
    with db.cursor() as cursor:
        cursor.execute(query, (current_user["id"],))
        requests = cursor.fetchall()
    
    return requests

@router.post("/therapist/respond-reschedule/{request_id}")
async def respond_to_reschedule(
    request_id: int,
    response: dict,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_db)
):
    """Respond to a reschedule request"""
    if current_user["role"] != "therapist":
        raise HTTPException(status_code=403, detail="Access denied")
    
    with db.cursor() as cursor:
        # Verify request belongs to therapist
        cursor.execute("""
            SELECT rr.*, ts.* 
            FROM reschedule_requests rr
            JOIN therapy_sessions ts ON rr.session_id = ts.id
            WHERE rr.id = %s AND ts.therapist_id = %s
        """, (request_id, current_user["id"]))
        
        request = cursor.fetchone()
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        if response["action"] == "accept":
            # Create new session
            cursor.execute("""
                INSERT INTO therapy_sessions 
                (client_id, therapist_id, voucher_id, organization_id,
                 session_date, session_time, duration_minutes, session_type,
                 location, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'scheduled')
                RETURNING id
            """, (
                request["client_id"],
                request["therapist_id"],
                request["voucher_id"],
                request["organization_id"],
                response["new_date"],
                response["new_time"],
                request["duration_minutes"],
                request["session_type"],
                request["location"]
            ))
            
            new_session_id = cursor.fetchone()["id"]
            
            # Update original session
            cursor.execute("""
                UPDATE therapy_sessions 
                SET status = 'rescheduled' 
                WHERE id = %s
            """, (request["session_id"],))
            
            # Update request
            cursor.execute("""
                UPDATE reschedule_requests
                SET status = 'accepted',
                    responded_by = %s,
                    response_message = %s,
                    new_session_id = %s,
                    responded_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (
                current_user["id"],
                response.get("message", "Request accepted"),
                new_session_id,
                request_id
            ))
            
            # Notify client
            cursor.execute("""
                INSERT INTO voucher_notifications
                (voucher_id, client_id, type, title, message)
                VALUES (%s, %s, 'reschedule_approved', 'Reschedule Approved', %s)
            """, (
                request["voucher_id"],
                request["client_id"],
                f"Your session has been rescheduled to {response['new_date']} at {response['new_time']}"
            ))
        else:
            # Reject request
            cursor.execute("""
                UPDATE reschedule_requests
                SET status = 'rejected',
                    responded_by = %s,
                    response_message = %s,
                    responded_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (
                current_user["id"],
                response.get("message", "Request rejected"),
                request_id
            ))
            
            # Notify client
            cursor.execute("""
                INSERT INTO voucher_notifications
                (voucher_id, client_id, type, title, message)
                VALUES (%s, %s, 'reschedule_rejected', 'Reschedule Request Rejected', %s)
            """, (
                request["voucher_id"],
                request["client_id"],
                response.get("message", "Your reschedule request has been rejected")
            ))
        
        db.commit()
    
    return {"message": f"Reschedule request {response['action']}ed"}