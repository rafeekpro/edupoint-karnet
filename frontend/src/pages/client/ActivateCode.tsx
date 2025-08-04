import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ActivateCode: React.FC = () => {
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/client/activate-code', null, {
        params: { code: voucherCode },
      });
      navigate('/client/select-class');
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Code already used or expired');
      } else if (err.response?.status === 404) {
        setError('Invalid code');
      } else {
        setError('Failed to activate code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Activate Voucher Code
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 500 }}>
        <Typography variant="body1" paragraph>
          Enter your voucher code to activate your therapy sessions.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleActivate}>
          <TextField
            fullWidth
            label="Voucher Code"
            name="voucherCode"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            margin="normal"
            required
            inputProps={{ 
              style: { fontFamily: 'monospace', letterSpacing: '0.1em' },
              maxLength: 8,
            }}
            placeholder="XXXXXXXX"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading || voucherCode.length !== 8}
            >
              {isLoading ? 'Activating...' : 'Activate'}
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
      </Paper>
    </Box>
  );
};

export default ActivateCode;