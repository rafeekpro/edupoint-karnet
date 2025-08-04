import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Voucher } from '../../types';

const VoucherNew: React.FC = () => {
  const navigate = useNavigate();
  const [regularCodes, setRegularCodes] = useState('10');
  const [backupCodes, setBackupCodes] = useState('2');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [voucher, setVoucher] = useState<Voucher | null>(null);

  const handleGenerate = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/admin/vouchers', {
        regular_codes_count: parseInt(regularCodes),
        backup_codes_count: parseInt(backupCodes),
      });
      setVoucher(response.data);
    } catch (err) {
      setError('Failed to generate voucher');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate a PDF
    alert('PDF download functionality would be implemented here');
  };

  if (voucher) {
    return (
      <Box>
        <Box className="no-print" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Voucher Generated Successfully
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            Voucher generated successfully
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button variant="contained" onClick={handlePrint}>
              Print Voucher
            </Button>
            <Button variant="outlined" onClick={handleDownloadPDF}>
              Download PDF
            </Button>
            <Button 
              variant="text" 
              onClick={() => {
                setVoucher(null);
                setRegularCodes('10');
                setBackupCodes('2');
                setError('');
              }}
            >
              Generate Another
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }} className="voucher-print">
          <Typography variant="h5" align="center" gutterBottom>
            Therapy System Voucher
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" paragraph>
            Voucher ID: {voucher.id}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" paragraph>
            Generated: {new Date(voucher.created_at).toLocaleDateString()}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Regular Codes (10 sessions each)
            </Typography>
            <Grid container spacing={2}>
              {voucher.codes
                .filter((code) => !code.is_backup)
                .map((code) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={code.id}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center', py: 1 }}>
                        <Typography
                          variant="body1"
                          className="regular-code"
                          sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                        >
                          {code.code}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Backup Codes (for missed sessions)
            </Typography>
            <Grid container spacing={2}>
              {voucher.codes
                .filter((code) => code.is_backup)
                .map((code) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={code.id}>
                    <Card variant="outlined" sx={{ bgcolor: 'warning.light' }}>
                      <CardContent sx={{ textAlign: 'center', py: 1 }}>
                        <Typography
                          variant="body1"
                          className="backup-code"
                          sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                        >
                          {code.code}
                        </Typography>
                        <Chip label="Backup" size="small" color="warning" sx={{ mt: 0.5 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Instructions: Each regular code provides 10 therapy sessions. Backup codes can be
              used to reschedule missed sessions.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Generate New Voucher
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
          <TextField
            fullWidth
            label="Number of Regular Codes"
            name="regularCodes"
            type="number"
            value={regularCodes}
            onChange={(e) => setRegularCodes(e.target.value)}
            margin="normal"
            inputProps={{ min: 1, max: 20 }}
            helperText="Each code provides 10 therapy sessions"
          />

          <TextField
            fullWidth
            label="Number of Backup Codes"
            name="backupCodes"
            type="number"
            value={backupCodes}
            onChange={(e) => setBackupCodes(e.target.value)}
            margin="normal"
            inputProps={{ min: 0, max: 10 }}
            helperText="Used for rescheduling missed sessions"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Voucher'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/admin/dashboard')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .voucher-print {
            box-shadow: none !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default VoucherNew;