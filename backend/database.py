from typing import Dict, List, Optional
from models import User, TherapyClass, Voucher, VoucherCode, Reservation, Session, UserRole, CodeStatus
from datetime import datetime, date, time, timedelta
import uuid
import random
import string

class MockDatabase:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.therapy_classes: Dict[str, TherapyClass] = {}
        self.vouchers: Dict[str, Voucher] = {}
        self.voucher_codes: Dict[str, VoucherCode] = {}
        self.reservations: Dict[str, Reservation] = {}
        self.sessions: Dict[str, Session] = {}
        
        self._init_mock_data()
    
    def _init_mock_data(self):
        # Create admin user
        admin = User(
            id="admin-1",
            email="admin@therapy.com",
            name="Admin User",
            role=UserRole.ADMIN,
            password_hash="$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe"  # password: admin123
        )
        self.users[admin.id] = admin
        
        # Create therapists
        therapist1 = User(
            id="therapist-1",
            email="john@therapy.com",
            name="John Smith",
            role=UserRole.THERAPIST,
            password_hash="$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe"  # password: admin123
        )
        therapist2 = User(
            id="therapist-2",
            email="jane@therapy.com",
            name="Jane Doe",
            role=UserRole.THERAPIST,
            password_hash="$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe"
        )
        self.users[therapist1.id] = therapist1
        self.users[therapist2.id] = therapist2
        
        # Create therapy classes
        class1 = TherapyClass(
            id="class-1",
            name="Cognitive Behavioral Therapy",
            description="Individual CBT sessions focusing on thought patterns and behaviors",
            therapist_id=therapist1.id,
            day_of_week=0,  # Monday
            time=time(13, 0),  # 13:00
            duration_minutes=60
        )
        class2 = TherapyClass(
            id="class-2",
            name="Mindfulness Meditation",
            description="Group meditation and mindfulness practice",
            therapist_id=therapist2.id,
            day_of_week=2,  # Wednesday
            time=time(15, 0),  # 15:00
            duration_minutes=90,
            max_participants=5
        )
        class3 = TherapyClass(
            id="class-3",
            name="Art Therapy",
            description="Express emotions through creative art activities",
            therapist_id=therapist1.id,
            day_of_week=4,  # Friday
            time=time(10, 0),  # 10:00
            duration_minutes=120
        )
        class4 = TherapyClass(
            id="class-4",
            name="Music Therapy",
            description="Healing through music and sound",
            therapist_id=therapist2.id,
            day_of_week=2,  # Wednesday
            time=time(11, 0),  # 11:00
            duration_minutes=60,
            max_participants=15
        )
        class5 = TherapyClass(
            id="class-5",
            name="Group Therapy",
            description="Group support and therapy sessions",
            therapist_id=therapist2.id,
            day_of_week=3,  # Thursday
            time=time(16, 0),  # 16:00
            duration_minutes=90,
            max_participants=10
        )
        self.therapy_classes[class1.id] = class1
        self.therapy_classes[class2.id] = class2
        self.therapy_classes[class3.id] = class3
        self.therapy_classes[class4.id] = class4
        self.therapy_classes[class5.id] = class5
        
        # Create a client with voucher
        client = User(
            id="client-1",
            email="client@example.com",
            name="Test Client",
            role=UserRole.CLIENT,
            password_hash="$2b$12$Xd3RZPUJU7XfVNgQfBWOmuaSO/H8XxBGfm.oU5xV5O6ROFDgHTQYe"
        )
        self.users[client.id] = client
        
        # Create a sample voucher and reservation for testing
        sample_voucher = self.create_voucher()
        sample_voucher.client_id = client.id
        sample_voucher.activated_at = datetime.now()
        
        # Create a reservation for the client
        sample_code = sample_voucher.codes[0]
        self.create_reservation(
            voucher_code=sample_code,
            therapy_class=class1,
            client_id=client.id,
            start_date=date.today()
        )
    
    def generate_voucher_code(self) -> str:
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    def create_voucher(self, regular_codes: int = 10, backup_codes: int = 2) -> Voucher:
        voucher = Voucher(id=str(uuid.uuid4()))
        
        # Generate regular codes
        for i in range(regular_codes):
            code = VoucherCode(
                code=self.generate_voucher_code(),
                voucher_id=voucher.id,
                is_backup=False
            )
            self.voucher_codes[code.id] = code
            voucher.codes.append(code)
        
        # Generate backup codes
        for i in range(backup_codes):
            code = VoucherCode(
                code=self.generate_voucher_code(),
                voucher_id=voucher.id,
                is_backup=True
            )
            self.voucher_codes[code.id] = code
            voucher.codes.append(code)
        
        self.vouchers[voucher.id] = voucher
        return voucher
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        for user in self.users.values():
            if user.email == email:
                return user
        return None
    
    def get_voucher_code_by_code(self, code: str) -> Optional[VoucherCode]:
        for vc in self.voucher_codes.values():
            if vc.code == code:
                return vc
        return None
    
    def create_reservation(self, voucher_code: VoucherCode, therapy_class: TherapyClass, 
                          client_id: str, start_date: date) -> Reservation:
        reservation = Reservation(
            voucher_code_id=voucher_code.id,
            therapy_class_id=therapy_class.id,
            client_id=client_id,
            start_date=start_date
        )
        
        # Create 10 sessions for the next 10 weeks
        current_date = start_date
        for i in range(10):
            # Find next occurrence of the therapy class day
            while current_date.weekday() != therapy_class.day_of_week:
                current_date += timedelta(days=1)
            
            session = Session(
                reservation_id=reservation.id,
                scheduled_date=current_date,
                scheduled_time=therapy_class.time
            )
            self.sessions[session.id] = session
            reservation.sessions.append(session)
            
            # Move to next week
            current_date += timedelta(days=7)
        
        self.reservations[reservation.id] = reservation
        
        # Mark voucher code as used
        voucher_code.status = CodeStatus.USED
        voucher_code.used_count += 1
        
        return reservation
    
    def get_user_reservations(self, user_id: str) -> List[Reservation]:
        return [r for r in self.reservations.values() if r.client_id == user_id]
    
    def get_therapist_sessions(self, therapist_id: str) -> List[Session]:
        therapist_classes = [tc.id for tc in self.therapy_classes.values() 
                           if tc.therapist_id == therapist_id]
        
        sessions = []
        for reservation in self.reservations.values():
            if reservation.therapy_class_id in therapist_classes:
                sessions.extend(reservation.sessions)
        
        return sorted(sessions, key=lambda s: (s.scheduled_date, s.scheduled_time))

# Global database instance
db = MockDatabase()