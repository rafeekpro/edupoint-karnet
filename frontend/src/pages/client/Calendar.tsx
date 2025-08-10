import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Video,
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
} from 'lucide-react';

interface Session {
  id: string;
  therapistName: string;
  therapistId: string;
  date: string;
  time: string;
  duration: number;
  type: 'individual' | 'group' | 'online';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  voucherId?: string;
  voucherType?: string;
}

interface AvailableSlot {
  therapistId: string;
  therapistName: string;
  date: string;
  time: string;
  duration: number;
  type: 'individual' | 'group' | 'online';
  location?: string;
  available: boolean;
}

interface Voucher {
  id: string;
  type: string;
  sessionsRemaining: number;
  sessionsTotal: number;
  expiryDate: string;
}

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    voucherId: '',
    notes: '',
    sessionType: 'individual',
  });

  // Mock data
  const mockSessions: Session[] = [
    {
      id: '1',
      therapistName: 'Dr. Smith',
      therapistId: 'therapist1',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: 60,
      type: 'individual',
      status: 'confirmed',
      location: 'Room 201',
      voucherId: 'voucher1',
      voucherType: 'Standard Package',
    },
    {
      id: '2',
      therapistName: 'Dr. Johnson',
      therapistId: 'therapist2',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      time: '10:00',
      duration: 60,
      type: 'online',
      status: 'scheduled',
      voucherId: 'voucher1',
      voucherType: 'Standard Package',
    },
    {
      id: '3',
      therapistName: 'Dr. Smith',
      therapistId: 'therapist1',
      date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      time: '15:30',
      duration: 60,
      type: 'individual',
      status: 'scheduled',
      location: 'Room 201',
      voucherId: 'voucher2',
      voucherType: 'Premium Package',
    },
  ];

  const mockAvailableSlots: AvailableSlot[] = [
    {
      therapistId: 'therapist1',
      therapistName: 'Dr. Smith',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '09:00',
      duration: 60,
      type: 'individual',
      location: 'Room 201',
      available: true,
    },
    {
      therapistId: 'therapist1',
      therapistName: 'Dr. Smith',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '11:00',
      duration: 60,
      type: 'individual',
      location: 'Room 201',
      available: true,
    },
    {
      therapistId: 'therapist2',
      therapistName: 'Dr. Johnson',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '14:00',
      duration: 60,
      type: 'online',
      available: true,
    },
    {
      therapistId: 'therapist3',
      therapistName: 'Dr. Williams',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '16:00',
      duration: 90,
      type: 'group',
      location: 'Conference Room',
      available: true,
    },
  ];

  const mockVouchers: Voucher[] = [
    {
      id: 'voucher1',
      type: 'Standard Package',
      sessionsRemaining: 5,
      sessionsTotal: 10,
      expiryDate: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
    },
    {
      id: 'voucher2',
      type: 'Premium Package',
      sessionsRemaining: 12,
      sessionsTotal: 20,
      expiryDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0],
    },
  ];

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In production, fetch from API
      // const [sessionsRes, slotsRes, vouchersRes] = await Promise.all([
      //   api.get('/api/client/sessions'),
      //   api.get('/api/client/available-slots'),
      //   api.get('/api/client/vouchers'),
      // ]);
      
      // Mock implementation
      setSessions(mockSessions);
      setAvailableSlots(mockAvailableSlots);
      setVouchers(mockVouchers);
    } catch (err: any) {
      console.error('Failed to fetch calendar data:', err);
      setError('Failed to load calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsDetailsDialogOpen(true);
  };

  const handleSlotClick = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setBookingForm({
      voucherId: vouchers[0]?.id || '',
      notes: '',
      sessionType: slot.type,
    });
    setIsBookingDialogOpen(true);
  };

  const handleBookSession = async () => {
    if (!selectedSlot || !bookingForm.voucherId) {
      setError('Please select a voucher');
      return;
    }

    try {
      // In production, send to API
      // await api.post('/api/client/book-session', {
      //   therapistId: selectedSlot.therapistId,
      //   date: selectedSlot.date,
      //   time: selectedSlot.time,
      //   voucherId: bookingForm.voucherId,
      //   notes: bookingForm.notes,
      // });
      
      // Mock implementation
      const newSession: Session = {
        id: Date.now().toString(),
        therapistName: selectedSlot.therapistName,
        therapistId: selectedSlot.therapistId,
        date: selectedSlot.date,
        time: selectedSlot.time,
        duration: selectedSlot.duration,
        type: selectedSlot.type,
        status: 'scheduled',
        location: selectedSlot.location,
        notes: bookingForm.notes,
        voucherId: bookingForm.voucherId,
        voucherType: vouchers.find(v => v.id === bookingForm.voucherId)?.type,
      };
      
      setSessions([...sessions, newSession]);
      setAvailableSlots(availableSlots.filter(s => 
        !(s.therapistId === selectedSlot.therapistId && 
          s.date === selectedSlot.date && 
          s.time === selectedSlot.time)
      ));
      
      setIsBookingDialogOpen(false);
      setSelectedSlot(null);
    } catch (err: any) {
      console.error('Failed to book session:', err);
      setError('Failed to book session. Please try again.');
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) {
      return;
    }
    
    try {
      // In production, send to API
      // await api.patch(`/api/client/sessions/${sessionId}/cancel`);
      
      // Mock implementation
      setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, status: 'cancelled' } : s
      ));
      setIsDetailsDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to cancel session:', err);
      setError('Failed to cancel session. Please try again.');
    }
  };

  const handleRescheduleSession = (session: Session) => {
    // In a real app, this would open a reschedule dialog
    setIsDetailsDialogOpen(false);
    // Navigate to reschedule page or open reschedule dialog
  };

  const getWeekDays = () => {
    const week = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getSessionsForDateTime = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(s => s.date === dateStr && s.time === time);
  };

  const getAvailableSlotsForDateTime = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots.filter(s => s.date === dateStr && s.time === time);
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: Session['type'] | AvailableSlot['type']) => {
    switch (type) {
      case 'online':
        return <Video className="h-3 w-3" />;
      case 'group':
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const formatDateHeader = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays();
      const start = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    } else {
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Calendar</h1>
          <p className="text-muted-foreground mt-2">
            View your sessions and book appointments
          </p>
        </div>
        <Button onClick={() => navigate('/client/book-session')}>
          <Plus className="mr-2 h-4 w-4" />
          Book Session
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Voucher Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {vouchers.map((voucher) => (
          <Card key={voucher.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-medium">
                    {voucher.type}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {voucher.sessionsRemaining}/{voucher.sessionsTotal}
                </div>
                <Badge variant="outline">Sessions left</Badge>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2"
                  style={{
                    width: `${(voucher.sessionsRemaining / voucher.sessionsTotal) * 100}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateNavigation('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateNavigation('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <h2 className="text-lg font-semibold ml-4">{formatDateHeader()}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
          <span>Your Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span>Available Slots</span>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'week' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left text-sm font-medium w-20">Time</th>
                    {getWeekDays().map((day, index) => (
                      <th key={index} className="p-2 text-center text-sm font-medium min-w-[120px]">
                        <div>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className={`text-lg ${day.toDateString() === new Date().toDateString() ? 'text-primary font-bold' : ''}`}>
                          {day.getDate()}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getTimeSlots().map((time, slotIndex) => (
                    <tr key={slotIndex} className="border-b">
                      <td className="p-2 text-sm text-muted-foreground">{time}</td>
                      {getWeekDays().map((day, dayIndex) => {
                        const daysSessions = getSessionsForDateTime(day, time);
                        const daysSlots = getAvailableSlotsForDateTime(day, time);
                        return (
                          <td key={dayIndex} className="p-1 border-l relative h-16">
                            {/* Render sessions */}
                            {daysSessions.map((session, sessionIndex) => (
                              <div
                                key={`session-${sessionIndex}`}
                                className={`absolute inset-x-1 p-1 rounded cursor-pointer text-xs ${getStatusColor(session.status)} border z-20`}
                                style={{
                                  top: '2px',
                                  height: `${(session.duration / 30) * 32 - 4}px`,
                                }}
                                onClick={() => handleSessionClick(session)}
                              >
                                <div className="flex items-center gap-1">
                                  {getTypeIcon(session.type)}
                                  <span className="font-medium truncate">{session.therapistName}</span>
                                </div>
                                {session.location && (
                                  <div className="text-xs opacity-75 truncate">{session.location}</div>
                                )}
                              </div>
                            ))}
                            {/* Render available slots */}
                            {daysSlots.map((slot, slotIndex) => (
                              <div
                                key={`slot-${slotIndex}`}
                                className="absolute inset-x-1 p-1 rounded cursor-pointer text-xs bg-green-50 text-green-700 border-green-200 border hover:bg-green-100 z-10"
                                style={{
                                  top: '2px',
                                  height: `${(slot.duration / 30) * 32 - 4}px`,
                                }}
                                onClick={() => handleSlotClick(slot)}
                              >
                                <div className="flex items-center gap-1">
                                  <Plus className="h-3 w-3" />
                                  <span className="truncate">{slot.therapistName}</span>
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'day' && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              {getTimeSlots().map((time, index) => {
                const daysSessions = getSessionsForDateTime(currentDate, time);
                const daysSlots = getAvailableSlotsForDateTime(currentDate, time);
                return (
                  <div key={index} className="flex gap-4 p-2 border-b">
                    <div className="w-20 text-sm text-muted-foreground">{time}</div>
                    <div className="flex-1 space-y-2">
                      {/* Sessions */}
                      {daysSessions.map((session, sessionIndex) => (
                        <div
                          key={sessionIndex}
                          className={`p-3 rounded-lg cursor-pointer ${getStatusColor(session.status)} border`}
                          onClick={() => handleSessionClick(session)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(session.type)}
                              <span className="font-medium">{session.therapistName}</span>
                              <Badge variant="outline" className="text-xs">
                                {session.duration} min
                              </Badge>
                            </div>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                          </div>
                          {session.location && (
                            <div className="flex items-center gap-1 mt-2 text-sm">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </div>
                          )}
                          {session.voucherType && (
                            <div className="flex items-center gap-1 mt-1 text-sm">
                              <CreditCard className="h-3 w-3" />
                              {session.voucherType}
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Available Slots */}
                      {daysSlots.map((slot, slotIndex) => (
                        <div
                          key={slotIndex}
                          className="p-3 rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 border border-green-200"
                          onClick={() => handleSlotClick(slot)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-700">
                                Available: {slot.therapistName}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {slot.duration} min
                              </Badge>
                            </div>
                            <Button size="sm" variant="outline">
                              Book
                            </Button>
                          </div>
                          {slot.location && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                              <MapPin className="h-3 w-3" />
                              {slot.location}
                            </div>
                          )}
                        </div>
                      ))}
                      {daysSessions.length === 0 && daysSlots.length === 0 && (
                        <div className="text-sm text-muted-foreground">No sessions or availability</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'month' && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium">
                  {day}
                </div>
              ))}
              {/* Month view implementation would go here */}
              <div className="col-span-7 text-center py-8 text-muted-foreground">
                Month view coming soon...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              View and manage your session
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedSession.type)}
                  <span className="font-medium">{selectedSession.therapistName}</span>
                </div>
                <Badge className={getStatusColor(selectedSession.status)}>
                  {selectedSession.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {new Date(selectedSession.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {selectedSession.time} ({selectedSession.duration} minutes)
                </div>
                {selectedSession.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {selectedSession.location}
                  </div>
                )}
                {selectedSession.voucherType && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    {selectedSession.voucherType}
                  </div>
                )}
              </div>

              {selectedSession.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm">{selectedSession.notes}</p>
                </div>
              )}

              <div className="flex justify-between gap-2">
                {selectedSession.status === 'scheduled' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRescheduleSession(selectedSession)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Reschedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelSession(selectedSession.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
                {selectedSession.type === 'online' && (
                  <Button>
                    <Video className="mr-2 h-4 w-4" />
                    Join Session
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Book Session Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book Session</DialogTitle>
            <DialogDescription>
              Book this available time slot
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedSlot.therapistName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {selectedSlot.time} ({selectedSlot.duration} minutes)
                  </div>
                  {selectedSlot.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {selectedSlot.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voucher">Select Voucher</Label>
                  <Select
                    value={bookingForm.voucherId}
                    onValueChange={(value) => setBookingForm({ ...bookingForm, voucherId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a voucher" />
                    </SelectTrigger>
                    <SelectContent>
                      {vouchers.map((voucher) => (
                        <SelectItem key={voucher.id} value={voucher.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{voucher.type}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({voucher.sessionsRemaining} sessions left)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="Any special requirements or notes for the therapist..."
                    rows={3}
                  />
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You will receive a confirmation email once the booking is confirmed.
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBookSession}>
                  Confirm Booking
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;