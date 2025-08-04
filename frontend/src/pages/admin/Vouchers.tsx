import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Voucher } from '../../types';

const Vouchers: React.FC = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await api.get('/admin/vouchers');
      setVouchers(response.data);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVoucherStatus = (voucher: Voucher) => {
    if (!voucher.client_id) return 'Not Assigned';
    if (!voucher.activated_at) return 'Assigned';
    return 'Active';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Vouchers
        </Typography>
        <Button variant="contained" onClick={() => navigate('/admin/vouchers/new')}>
          Generate Voucher
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Voucher ID</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Total Codes</TableCell>
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
            ) : vouchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No vouchers found
                </TableCell>
              </TableRow>
            ) : (
              vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>{voucher.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    {new Date(voucher.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getVoucherStatus(voucher)}
                      color={
                        getVoucherStatus(voucher) === 'Active'
                          ? 'success'
                          : getVoucherStatus(voucher) === 'Assigned'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{voucher.client_id || '-'}</TableCell>
                  <TableCell>{voucher.codes.length}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/admin/vouchers/${voucher.id}`)}>
                      View Details
                    </Button>
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

export default Vouchers;