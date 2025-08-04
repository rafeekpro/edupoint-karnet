import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import api from '../../services/api';
import { Session } from '../../types';

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState<Date | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/therapist/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSession || !newDate || !newTime) return;

    try {
      const response = await api.put(`/therapist/sessions/${selectedSession.id}/reschedule`, {
        new_date: format(newDate, 'yyyy-MM-dd'),
        new_time: format(newTime, 'HH:mm:ss'),
        reason: rescheduleReason,
      });
      
      // Update session in list
      setSessions(sessions.map(s => s.id === selectedSession.id ? response.data : s));
      setIsRescheduleOpen(false);
      setSelectedSession(null);
      setNewDate(null);
      setNewTime(null);
      setRescheduleReason('');
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
      setSessions(sessions.map(s => s.id === selectedSession.id ? response.data : s));
      setIsNotesOpen(false);
      setSelectedSession(null);
      setNotes('');
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const getStatusColor = (status: string) => {
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Sessions
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No sessions found
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    {format(new Date(session.scheduled_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{session.scheduled_time}</TableCell>
                  <TableCell>Client Name</TableCell>
                  <TableCell>
                    <Chip
                      label={session.status}
                      color={getStatusColor(session.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {session.therapist_notes ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsRescheduleOpen(true);
                        }}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedSession(session);
                          setNotes(session.therapist_notes || '');
                          setIsNotesOpen(true);
                        }}
                      >
                        Notes
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reschedule Session</DialogTitle>
        <DialogContent>
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
          <TextField
            fullWidth
            label="Reason for rescheduling"
            multiline
            rows={3}
            value={rescheduleReason}
            onChange={(e) => setRescheduleReason(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRescheduleOpen(false)}>Cancel</Button>
          <Button onClick={handleReschedule} variant="contained">
            Reschedule
          </Button>
        </DialogActions>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNotesOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNotes} variant="contained">
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sessions;