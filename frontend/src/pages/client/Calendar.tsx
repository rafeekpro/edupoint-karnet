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
} from '@mui/material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import api from '../../services/api';
import { Session, Reservation, TherapyClass } from '../../types';

interface SessionWithDetails extends Session {
  therapyClass?: TherapyClass;
}

const Calendar: React.FC = () => {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [currentMonth] = useState(new Date());
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const sessionsResponse = await api.get('/client/sessions');
      const reservationsResponse = await api.get('/client/reservations');
      const classesResponse = await api.get('/therapy-classes');
      
      const sessionsData = sessionsResponse.data;
      const reservations = reservationsResponse.data;
      const classes = classesResponse.data;

      // Enrich sessions with therapy class data
      const enrichedSessions = sessionsData.map((session: Session) => {
        const reservation = reservations.find((r: Reservation) => r.id === session.reservation_id);
        const therapyClass = reservation 
          ? classes.find((c: TherapyClass) => c.id === reservation.therapy_class_id)
          : null;
        
        return {
          ...session,
          therapyClass,
        };
      });

      setSessions(enrichedSessions);
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

  const days = getDaysInMonth();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Calendar
      </Typography>

      <Box className="calendar-view" sx={{ mt: 3 }}>
        <Typography variant="h6" align="center" gutterBottom>
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>

        <Grid container spacing={1}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid size={1.71} key={day}>
              <Typography align="center" variant="body2" fontWeight="bold">
                {day}
              </Typography>
            </Grid>
          ))}

          {days.map((day) => {
            const daySessions = getSessionsForDate(day);
            
            return (
              <Grid size={1.71} key={day.toString()}>
                <Card
                  sx={{
                    minHeight: 100,
                    bgcolor: !isSameMonth(day, currentMonth) 
                      ? 'grey.100' 
                      : isToday(day) 
                      ? 'primary.light' 
                      : 'background.paper',
                    cursor: daySessions.length > 0 ? 'pointer' : 'default',
                  }}
                  onClick={() => daySessions.length > 0 && setSelectedSession(daySessions[0])}
                >
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="body2">
                      {format(day, 'd')}
                    </Typography>
                    {daySessions.map((session) => (
                      <Box
                        key={session.id}
                        className={`calendar-session ${session.status}`}
                        sx={{ mt: 0.5 }}
                      >
                        <Chip
                          label={session.scheduled_time.slice(0, 5)}
                          size="small"
                          color={getSessionStatusColor(session.status)}
                          sx={{ width: '100%' }}
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
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSession && (
          <>
            <DialogTitle>Session Details</DialogTitle>
            <DialogContent className="session-details">
              <Typography variant="h6" gutterBottom>
                {selectedSession.therapyClass?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {format(new Date(selectedSession.scheduled_date), 'EEEE, MMMM d, yyyy')}
              </Typography>
              <Typography variant="body2" paragraph>
                Time: {selectedSession.scheduled_time}
              </Typography>
              <Typography variant="body2" paragraph>
                Status: <Chip 
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
                  <Typography variant="body2" className="therapist-notes">
                    {selectedSession.therapist_notes}
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Calendar;