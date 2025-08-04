import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import { TherapyClass, User } from '../../types';

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<TherapyClass[]>([]);
  const [therapists, setTherapists] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TherapyClass | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    therapist_id: '',
    day_of_week: 0,
    time: '09:00',
    duration_minutes: 60,
    max_participants: 1,
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesResponse, usersResponse] = await Promise.all([
        api.get('/therapy-classes'),
        api.get('/admin/users'),
      ]);
      setClasses(classesResponse.data);
      // Filter only therapists
      const therapistUsers = usersResponse.data.filter(
        (user: User) => user.role === 'therapist'
      );
      setTherapists(therapistUsers);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayOfWeek];
  };

  const getTherapistName = (therapistId: string) => {
    const therapist = therapists.find((t) => t.id === therapistId);
    return therapist ? therapist.name : 'Unknown';
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.therapist_id) errors.therapist_id = 'Therapist is required';
    if (formData.duration_minutes <= 0) errors.duration_minutes = 'Duration must be positive';
    if (formData.max_participants < 1) errors.max_participants = 'Must have at least 1 participant';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      therapist_id: '',
      day_of_week: 0,
      time: '09:00',
      duration_minutes: 60,
      max_participants: 1,
    });
    setFormErrors({});
  };

  const handleCreateClass = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await api.post('/admin/therapy-classes', formData);
      setClasses([...classes, response.data]);
      setIsDialogOpen(false);
      resetForm();
      setSnackbar({ open: true, message: 'Class created successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to create class:', error);
      setSnackbar({ open: true, message: 'Failed to create class', severity: 'error' });
    }
  };

  const handleEditClick = (therapyClass: TherapyClass) => {
    setSelectedClass(therapyClass);
    setFormData({
      name: therapyClass.name,
      description: therapyClass.description,
      therapist_id: therapyClass.therapist_id,
      day_of_week: therapyClass.day_of_week,
      time: therapyClass.time,
      duration_minutes: therapyClass.duration_minutes,
      max_participants: therapyClass.max_participants,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateClass = async () => {
    if (!validateForm() || !selectedClass) return;
    
    try {
      const response = await api.put(`/admin/therapy-classes/${selectedClass.id}`, {
        ...formData,
        id: selectedClass.id,
      });
      setClasses(classes.map(c => c.id === selectedClass.id ? response.data : c));
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedClass(null);
      setSnackbar({ open: true, message: 'Class updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to update class:', error);
      setSnackbar({ open: true, message: 'Failed to update class', severity: 'error' });
    }
  };

  const handleDeleteClick = (therapyClass: TherapyClass) => {
    setSelectedClass(therapyClass);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    
    try {
      await api.delete(`/admin/therapy-classes/${selectedClass.id}`);
      setClasses(classes.filter(c => c.id !== selectedClass.id));
      setIsDeleteDialogOpen(false);
      setSelectedClass(null);
      setSnackbar({ open: true, message: 'Class deleted successfully', severity: 'success' });
    } catch (error: any) {
      console.error('Failed to delete class:', error);
      const message = error.response?.data?.detail || 'Failed to delete class';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Therapy Classes
        </Typography>
        <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
          Add New Class
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Therapist</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Max Participants</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((therapyClass) => (
              <TableRow key={therapyClass.id}>
                <TableCell>{therapyClass.name}</TableCell>
                <TableCell>{getTherapistName(therapyClass.therapist_id)}</TableCell>
                <TableCell>{getDayName(therapyClass.day_of_week)} {therapyClass.time}</TableCell>
                <TableCell>{therapyClass.duration_minutes} min</TableCell>
                <TableCell>{therapyClass.max_participants} participants</TableCell>
                <TableCell>
                  <Button 
                    size="small"
                    onClick={() => handleEditClick(therapyClass)} 
                    color="primary"
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => handleDeleteClick(therapyClass)} 
                    color="error"
                    startIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onClose={() => { setIsDialogOpen(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Therapy Class</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Class Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            select
            label="Select Therapist"
            name="therapist_id"
            value={formData.therapist_id}
            onChange={(e) => setFormData({ ...formData, therapist_id: e.target.value })}
            margin="normal"
            error={!!formErrors.therapist_id}
            helperText={formErrors.therapist_id}
          >
            {therapists.map((therapist) => (
              <MenuItem key={therapist.id} value={therapist.id}>
                {therapist.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Select Day"
            name="day_of_week"
            value={formData.day_of_week}
            onChange={(e) => setFormData({ ...formData, day_of_week: Number(e.target.value) })}
            margin="normal"
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
              (day, index) => (
                <MenuItem key={index} value={index}>
                  {day}
                </MenuItem>
              )
            )}
          </TextField>
          <TextField
            fullWidth
            label="Time"
            name="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
            margin="normal"
            error={!!formErrors.duration_minutes}
            helperText={formErrors.duration_minutes}
          />
          <TextField
            fullWidth
            label="Max Participants"
            name="max_participants"
            type="number"
            value={formData.max_participants}
            onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })}
            margin="normal"
            error={!!formErrors.max_participants}
            helperText={formErrors.max_participants}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button onClick={handleCreateClass} variant="contained">
            Create Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => { setIsEditDialogOpen(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Therapy Class</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Class Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            select
            label="Therapist"
            name="therapist_id"
            value={formData.therapist_id}
            onChange={(e) => setFormData({ ...formData, therapist_id: e.target.value })}
            margin="normal"
            error={!!formErrors.therapist_id}
            helperText={formErrors.therapist_id}
          >
            {therapists.map((therapist) => (
              <MenuItem key={therapist.id} value={therapist.id}>
                {therapist.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Day of Week"
            name="day_of_week"
            value={formData.day_of_week}
            onChange={(e) => setFormData({ ...formData, day_of_week: Number(e.target.value) })}
            margin="normal"
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
              (day, index) => (
                <MenuItem key={index} value={index}>
                  {day}
                </MenuItem>
              )
            )}
          </TextField>
          <TextField
            fullWidth
            label="Time"
            name="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
            margin="normal"
            error={!!formErrors.duration_minutes}
            helperText={formErrors.duration_minutes}
          />
          <TextField
            fullWidth
            label="Max Participants"
            name="max_participants"
            type="number"
            value={formData.max_participants}
            onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })}
            margin="normal"
            error={!!formErrors.max_participants}
            helperText={formErrors.max_participants}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button onClick={handleUpdateClass} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Therapy Class</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedClass?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteClass} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Classes;