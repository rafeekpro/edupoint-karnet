export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'therapist' | 'admin';
  created_at?: string;
}

export interface TherapyClass {
  id: string;
  name: string;
  description: string;
  therapist_id: string;
  day_of_week: number;
  time: string;
  duration_minutes: number;
  max_participants: number;
}

export interface VoucherCode {
  id: string;
  code: string;
  voucher_id: string;
  is_backup: boolean;
  status: 'active' | 'used' | 'expired';
  used_count: number;
  max_uses: number;
}

export interface Voucher {
  id: string;
  client_id?: string;
  codes: VoucherCode[];
  created_at: string;
  activated_at?: string;
}

export interface Session {
  id: string;
  reservation_id: string;
  scheduled_date: string;
  scheduled_time: string;
  actual_date?: string;
  actual_time?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  therapist_notes?: string;
  client_notes?: string;
}

export interface Reservation {
  id: string;
  voucher_code_id: string;
  therapy_class_id: string;
  client_id: string;
  start_date: string;
  sessions: Session[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}