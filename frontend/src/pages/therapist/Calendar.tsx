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
  Users,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface Session {
  id: string;
  clientName: string;
  clientId: string;
  date: string;
  time: string;
  duration: number;
  type: 'individual' | 'group' | 'online';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  notes?: string;
  groupSize?: number;
  voucherId?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  session?: Session;
}

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for new session
  const [newSessionForm, setNewSessionForm] = useState({
    clientId: '',
    date: '',
    time: '',
    duration: '60',
    type: 'individual',
    location: '',
    notes: '',
  });

  // Mock data - in production, this would come from API
  const mockSessions: Session[] = [
    {
      id: '1',
      clientName: 'Anna Kowalska',
      clientId: 'client1',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      duration: 60,
      type: 'individual',
      status: 'confirmed',
      location: 'Room 101',
      notes: 'Progress review session',
    },
    {
      id: '2',
      clientName: 'Jan Nowak',
      clientId: 'client2',
      date: new Date().toISOString().split('T')[0],
      time: '10:30',
      duration: 60,
      type: 'online',
      status: 'scheduled',
      notes: 'First session after break',
    },
    {
      id: '3',
      clientName: 'Group Therapy Session',
      clientId: 'group1',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: 90,
      type: 'group',
      status: 'confirmed',
      location: 'Conference Room',
      groupSize: 6,
    },
    {
      id: '4',
      clientName: 'Maria Wiśniewska',
      clientId: 'client3',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '11:00',
      duration: 60,
      type: 'individual',
      status: 'scheduled',
      location: 'Room 102',
    },
  ];

  useEffect(() => {
    fetchSessions();
  }, [currentDate, viewMode]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In production, fetch from API
      // const response = await api.get('/api/therapist/sessions', {
      //   params: { date: currentDate.toISOString(), view: viewMode }
      // });
      // setSessions(response.data);
      
      // Mock implementation
      setSessions(mockSessions);
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err);
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

  const handleCreateSession = async () => {
    try {
      // In production, send to API
      // await api.post('/api/therapist/sessions', newSessionForm);
      
      // Mock implementation
      const newSession: Session = {
        id: Date.now().toString(),
        clientName: 'New Client',
        clientId: newSessionForm.clientId,
        date: newSessionForm.date,
        time: newSessionForm.time,
        duration: parseInt(newSessionForm.duration),
        type: newSessionForm.type as Session['type'],
        status: 'scheduled',
        location: newSessionForm.location,
        notes: newSessionForm.notes,
      };
      
      setSessions([...sessions, newSession]);
      setIsNewSessionDialogOpen(false);
      resetNewSessionForm();
    } catch (err: any) {
      console.error('Failed to create session:', err);
      setError('Failed to create session. Please try again.');
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) {
      return;
    }
    
    try {
      // In production, send to API
      // await api.patch(`/api/therapist/sessions/${sessionId}/cancel`);
      
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
    // Open reschedule dialog with session details
    setNewSessionForm({
      clientId: session.clientId,
      date: session.date,
      time: session.time,
      duration: session.duration.toString(),
      type: session.type,
      location: session.location || '',
      notes: session.notes || '',
    });
    setIsDetailsDialogOpen(false);
    setIsNewSessionDialogOpen(true);
  };

  const resetNewSessionForm = () => {
    setNewSessionForm({
      clientId: '',
      date: '',
      time: '',
      duration: '60',
      type: 'individual',
      location: '',
      notes: '',
    });
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
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          available: true,
        });
      }
    }
    return slots;
  };

  const getSessionsForDateTime = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(s => s.date === dateStr && s.time === time);
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
      case 'no-show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: Session['type']) => {
    switch (type) {
      case 'online':
        return <Video className="h-3 w-3" />;
      case 'group':
        return <Users className="h-3 w-3" />;
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
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Manage your sessions and appointments
          </p>
        </div>
        <Button onClick={() => setIsNewSessionDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Session
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
              <Button variant="outline" size="icon" onClick={fetchSessions}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  {getTimeSlots().map((slot, slotIndex) => (
                    <tr key={slotIndex} className="border-b">
                      <td className="p-2 text-sm text-muted-foreground">{slot.time}</td>
                      {getWeekDays().map((day, dayIndex) => {
                        const daysSessions = getSessionsForDateTime(day, slot.time);
                        return (
                          <td key={dayIndex} className="p-1 border-l relative h-16">
                            {daysSessions.map((session, sessionIndex) => (
                              <div
                                key={sessionIndex}
                                className={`absolute inset-x-1 p-1 rounded cursor-pointer text-xs ${getStatusColor(session.status)} border`}
                                style={{
                                  top: '2px',
                                  height: `${(session.duration / 30) * 32 - 4}px`,
                                  zIndex: 10,
                                }}
                                onClick={() => handleSessionClick(session)}
                              >
                                <div className="flex items-center gap-1">
                                  {getTypeIcon(session.type)}
                                  <span className="font-medium truncate">{session.clientName}</span>
                                </div>
                                {session.location && (
                                  <div className="text-xs opacity-75 truncate">{session.location}</div>
                                )}
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
              {getTimeSlots().map((slot, index) => {
                const daysSessions = getSessionsForDateTime(currentDate, slot.time);
                return (
                  <div key={index} className="flex gap-4 p-2 border-b">
                    <div className="w-20 text-sm text-muted-foreground">{slot.time}</div>
                    <div className="flex-1 space-y-2">
                      {daysSessions.map((session, sessionIndex) => (
                        <div
                          key={sessionIndex}
                          className={`p-3 rounded-lg cursor-pointer ${getStatusColor(session.status)} border`}
                          onClick={() => handleSessionClick(session)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(session.type)}
                              <span className="font-medium">{session.clientName}</span>
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
                          {session.notes && (
                            <div className="mt-2 text-sm text-muted-foreground">{session.notes}</div>
                          )}
                        </div>
                      ))}
                      {daysSessions.length === 0 && (
                        <div className="text-sm text-muted-foreground">Available</div>
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
              View and manage session information
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedSession.type)}
                  <span className="font-medium">{selectedSession.clientName}</span>
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
                {selectedSession.groupSize && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {selectedSession.groupSize} participants
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
                <div className="flex gap-2">
                  {selectedSession.status === 'scheduled' && (
                    <>
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
                    </>
                  )}
                </div>
                <Button
                  onClick={() => navigate(`/therapist/sessions/${selectedSession.id}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Session Dialog */}
      <Dialog open={isNewSessionDialogOpen} onOpenChange={setIsNewSessionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Session</DialogTitle>
            <DialogDescription>
              Create a new therapy session
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client
              </Label>
              <Select
                value={newSessionForm.clientId}
                onValueChange={(value) => setNewSessionForm({ ...newSessionForm, clientId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client1">Anna Kowalska</SelectItem>
                  <SelectItem value="client2">Jan Nowak</SelectItem>
                  <SelectItem value="client3">Maria Wiśniewska</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={newSessionForm.date}
                onChange={(e) => setNewSessionForm({ ...newSessionForm, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={newSessionForm.time}
                onChange={(e) => setNewSessionForm({ ...newSessionForm, time: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Select
                value={newSessionForm.duration}
                onValueChange={(value) => setNewSessionForm({ ...newSessionForm, duration: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={newSessionForm.type}
                onValueChange={(value) => setNewSessionForm({ ...newSessionForm, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newSessionForm.location}
                onChange={(e) => setNewSessionForm({ ...newSessionForm, location: e.target.value })}
                className="col-span-3"
                placeholder="Room 101"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={newSessionForm.notes}
                onChange={(e) => setNewSessionForm({ ...newSessionForm, notes: e.target.value })}
                className="col-span-3"
                placeholder="Session notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewSessionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession}>
              Schedule Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;