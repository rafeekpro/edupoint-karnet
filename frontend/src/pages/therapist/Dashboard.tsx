import React from 'react';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';

const TherapistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cards = [
    {
      title: 'My Calendar',
      description: 'View your therapy sessions calendar',
      icon: <CalendarIcon sx={{ fontSize: 48 }} />,
      action: () => navigate('/therapist/calendar'),
      buttonText: 'View Calendar',
    },
    {
      title: 'My Sessions',
      description: 'Manage your therapy sessions',
      icon: <NotesIcon sx={{ fontSize: 48 }} />,
      action: () => navigate('/therapist/sessions'),
      buttonText: 'Manage Sessions',
    },
    {
      title: 'My Clients',
      description: 'View your assigned clients',
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      action: () => navigate('/therapist/clients'),
      buttonText: 'View Clients',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Therapist Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome back, {user?.name}!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {cards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>{card.icon}</Box>
                <Typography gutterBottom variant="h6" component="h2">
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button fullWidth variant="contained" onClick={card.action}>
                  {card.buttonText}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TherapistDashboard;