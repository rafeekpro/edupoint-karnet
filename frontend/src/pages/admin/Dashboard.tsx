import React from 'react';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  CardGiftcard as VoucherIcon,
  People as PeopleIcon,
  Class as ClassIcon,
} from '@mui/icons-material';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cards = [
    {
      title: 'Generate Voucher',
      description: 'Create new vouchers with codes',
      icon: <VoucherIcon sx={{ fontSize: 48 }} />,
      action: () => navigate('/admin/vouchers/new'),
      buttonText: 'Generate Voucher',
    },
    {
      title: 'Manage Vouchers',
      description: 'View all generated vouchers',
      icon: <VoucherIcon sx={{ fontSize: 48 }} />,
      action: () => navigate('/admin/vouchers'),
      buttonText: 'View Vouchers',
    },
    {
      title: 'Users',
      description: 'Manage system users',
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      action: () => navigate('/admin/users'),
      buttonText: 'Manage Users',
    },
    {
      title: 'Classes',
      description: 'Manage therapy classes',
      icon: <ClassIcon sx={{ fontSize: 48 }} />,
      action: () => navigate('/admin/classes'),
      buttonText: 'Manage Classes',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome back, {user?.name}!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {cards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
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

export default AdminDashboard;