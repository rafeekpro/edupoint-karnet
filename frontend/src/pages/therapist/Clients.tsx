import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import apiClient from '../../services/api';

interface Client {
  id: string;
  name: string;
  email: string;
  active_reservations: number;
  total_sessions: number;
  next_session?: {
    date: string;
    time: string;
    class_name: string;
  };
}

const TherapistClients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiClient.get('/therapist/clients');
        setClients(response.data);
      } catch (err) {
        setError('Failed to load clients');
        console.error('Error fetching clients:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Clients
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View and manage your therapy clients
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <PersonIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
              <Typography variant="h6">Total Clients</Typography>
              <Typography variant="h3">{clients.length}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Active Reservations</TableCell>
              <TableCell>Total Sessions</TableCell>
              <TableCell>Next Session</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No clients assigned yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {client.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell align="center">{client.active_reservations}</TableCell>
                  <TableCell align="center">{client.total_sessions}</TableCell>
                  <TableCell>
                    {client.next_session ? (
                      <Box>
                        <Typography variant="body2">
                          {new Date(client.next_session.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {client.next_session.time} - {client.next_session.class_name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No upcoming sessions
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={client.active_reservations > 0 ? 'Active' : 'Inactive'}
                      color={client.active_reservations > 0 ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TherapistClients;