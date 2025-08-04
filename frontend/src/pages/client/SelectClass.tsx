import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { TherapyClass } from '../../types';

const SelectClass: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<TherapyClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<TherapyClass | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
    // Get voucher code from URL params or session storage
    const code = sessionStorage.getItem('activeVoucherCode') || '';
    setVoucherCode(code);
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/therapy-classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek];
  };

  const getNextDate = (dayOfWeek: number) => {
    const today = new Date();
    const todayDay = today.getDay();
    const targetDay = dayOfWeek + 1; // Convert from 0-6 to 1-7
    let daysToAdd = targetDay - todayDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    return addDays(today, daysToAdd);
  };

  const handleReserve = async () => {
    if (!selectedClass || !startDate || !voucherCode) return;

    setError('');
    setIsLoading(true);

    try {
      await api.post('/client/reservations', {
        voucher_code: voucherCode,
        therapy_class_id: selectedClass.id,
        start_date: format(startDate, 'yyyy-MM-dd'),
      });
      
      sessionStorage.removeItem('activeVoucherCode');
      navigate('/client/calendar');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create reservation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Select Therapy Class
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Choose your preferred therapy class and starting date
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {classes.map((therapyClass) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={therapyClass.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedClass?.id === therapyClass.id ? 2 : 0,
                borderColor: 'primary.main',
              }}
              onClick={() => setSelectedClass(therapyClass)}
              data-class-id={therapyClass.id}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {therapyClass.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {therapyClass.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Chip
                    label={`${getDayName(therapyClass.day_of_week)} ${therapyClass.time}`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={`${therapyClass.duration_minutes} minutes`}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Therapist: {therapyClass.therapist_id}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedClass && (
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Selected: {selectedClass.name}
          </Typography>
          
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            minDate={getNextDate(selectedClass.day_of_week)}
            shouldDisableDate={(date) => date.getDay() !== (selectedClass.day_of_week + 1) % 7}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'normal',
                required: true,
              },
            }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleReserve}
              disabled={!startDate || isLoading}
            >
              {isLoading ? 'Reserving...' : 'Reserve 10 Sessions'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/client/dashboard')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SelectClass;