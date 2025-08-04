import React from 'react';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Therapy System
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Professional therapy management platform
        </Typography>
        {!user && (
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ mt: 3 }}
          >
            Get Started
          </Button>
        )}
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              For Clients
            </Typography>
            <Typography color="text.secondary">
              Book therapy sessions, manage your calendar, and track your progress
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              For Therapists
            </Typography>
            <Typography color="text.secondary">
              Manage your sessions, write notes, and reschedule appointments
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              For Administrators
            </Typography>
            <Typography color="text.secondary">
              Generate vouchers, manage users, and oversee the system
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;