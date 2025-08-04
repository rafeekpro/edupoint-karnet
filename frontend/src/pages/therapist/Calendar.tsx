import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Button,
  TextField,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import api from '../../services/api';
import { Session, TherapyClass, User } from '../../types';

interface SessionWithDetails extends Session {
  therapyClass?: TherapyClass;
  client?: User;
}

const TherapistCalendar: React.FC = () => {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/therapist/sessions-with-details');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(
      (session) => session.scheduled_date === format(date, 'yyyy-MM-dd')
    );
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'rescheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleReschedule = async () => {
    if (!selectedSession || !newDate || !newTime) return;

    try {
      const response = await api.put(`/therapist/sessions/${selectedSession.id}/reschedule`, {
        new_date: format(newDate, 'yyyy-MM-dd'),
        new_time: format(newTime, 'HH:mm:ss'),
      });
      
      // Update session in list
      setSessions(sessions.map(s => s.id === selectedSession.id ? { ...s, ...response.data } : s));
      setIsRescheduleOpen(false);
      setSelectedSession(null);
      setNewDate(null);
      setNewTime(null);
    } catch (error) {
      console.error('Failed to reschedule session:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSession) return;

    try {
      const response = await api.put(
        `/therapist/sessions/${selectedSession.id}/notes`,
        null,
        { params: { notes } }
      );
      
      // Update session in list
      setSessions(sessions.map(s => s.id === selectedSession.id ? { ...s, ...response.data } : s));
      setIsNotesOpen(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const days = getDaysInMonth();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Calendar
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
          Previous
        </Button>
        <Typography variant="h6">
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <Button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
          Next
        </Button>
      </Box>

      <Box className="calendar-view" sx={{ mt: 3 }}>
        <Grid container spacing={1}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid size={{ xs: 12 / 7 }} key={day}>
              <Typography align="center" variant="body2" fontWeight="bold">
                {day}
              </Typography>
            </Grid>
          ))}

          {days.map((day) => {
            const daySessions = getSessionsForDate(day);
            
            return (
              <Grid size={{ xs: 12 / 7 }} key={day.toString()}>
                <Card
                  sx={{
                    minHeight: 120,
                    bgcolor: !isSameMonth(day, currentMonth) 
                      ? 'grey.100' 
                      : isToday(day) 
                      ? 'primary.light' 
                      : 'background.paper',
                  }}
                >
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {format(day, 'd')}
                    </Typography>
                    {daySessions.map((session) => (
                      <Box
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        sx={{ 
                          mt: 0.5, 
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 }
                        }}
                      >
                        <Chip
                          label={`${session.scheduled_time.slice(0, 5)} - ${session.client?.name || 'Unknown'}`}
                          size="small"
                          color={getSessionStatusColor(session.status)}
                          sx={{ width: '100%', fontSize: '0.7rem' }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Dialog
        open={!!selectedSession && !isRescheduleOpen && !isNotesOpen}
        onClose={() => setSelectedSession(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSession && (
          <>
            <DialogTitle>Session Details</DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                {selectedSession.therapyClass?.name}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Client:</strong> {selectedSession.client?.name} ({selectedSession.client?.email})
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Date:</strong> {format(new Date(selectedSession.scheduled_date), 'EEEE, MMMM d, yyyy')}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Time:</strong> {selectedSession.scheduled_time}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Status:</strong>{' '}
                <Chip 
                  label={selectedSession.status} 
                  size="small" 
                  color={getSessionStatusColor(selectedSession.status)}
                />
              </Typography>
              
              {selectedSession.therapist_notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Session Notes:
                  </Typography>
                  <Typography variant="body2">
                    {selectedSession.therapist_notes}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setNotes(selectedSession.therapist_notes || '');
                    setIsNotesOpen(true);
                  }}
                >
                  {selectedSession.therapist_notes ? 'Edit Notes' : 'Add Notes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsRescheduleOpen(true)}
                >
                  Reschedule
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reschedule Session</DialogTitle>
        <DialogContent>
          <>
            <DatePicker
              label="New Date"
              value={newDate}
              onChange={(value) => setNewDate(value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                },
              }}
            />
            <TimePicker
              label="New Time"
              value={newTime}
              onChange={(value) => setNewTime(value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                },
              }}
            />
          </>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsRescheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleReschedule} variant="contained">
              Reschedule
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesOpen} onClose={() => setIsNotesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Session Notes</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsNotesOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNotes} variant="contained">
              Save Notes
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TherapistCalendar;