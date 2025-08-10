import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Copy
} from 'lucide-react';

interface VoucherType {
  id: number;
  organization_id: number;
  organization_name?: string;
  name: string;
  description?: string;
  sessions_count: number;
  backup_sessions_count: number;
  session_duration_minutes: number;
  group_size: number;
  validity_days: number;
  price: number;
  booking_advance_days: number;
  booking_hour_start: string;
  booking_hour_end: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: number;
  name: string;
  is_active: boolean;
}

const VoucherTypesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [voucherTypes, setVoucherTypes] = useState<VoucherType[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<VoucherType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    organization_id: '',
    name: '',
    description: '',
    sessions_count: '10',
    backup_sessions_count: '2',
    session_duration_minutes: '60',
    group_size: '1',
    validity_days: '90',
    price: '',
    booking_advance_days: '7',
    booking_hour_start: '08:00',
    booking_hour_end: '20:00',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch voucher types and organizations in parallel
      const [typesResponse, orgsResponse] = await Promise.all([
        api.get('/api/admin/voucher-types').catch(() => ({ data: [] })),
        api.get('/api/admin/organizations')
      ]);
      
      setVoucherTypes(typesResponse.data);
      setOrganizations(orgsResponse.data);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load voucher types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoucherType = async () => {
    try {
      const payload = {
        organization_id: parseInt(formData.organization_id),
        name: formData.name,
        description: formData.description || undefined,
        sessions_count: parseInt(formData.sessions_count),
        backup_sessions_count: parseInt(formData.backup_sessions_count),
        session_duration_minutes: parseInt(formData.session_duration_minutes),
        group_size: parseInt(formData.group_size),
        validity_days: parseInt(formData.validity_days),
        price: parseFloat(formData.price),
        booking_advance_days: parseInt(formData.booking_advance_days),
        booking_hour_start: formData.booking_hour_start,
        booking_hour_end: formData.booking_hour_end,
      };

      await api.post('/api/admin/voucher-types', payload);
      setIsCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Failed to create voucher type:', error);
      setError(error.response?.data?.detail || 'Failed to create voucher type');
    }
  };

  const handleUpdateVoucherType = async () => {
    if (!selectedType) return;

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        sessions_count: parseInt(formData.sessions_count),
        backup_sessions_count: parseInt(formData.backup_sessions_count),
        session_duration_minutes: parseInt(formData.session_duration_minutes),
        group_size: parseInt(formData.group_size),
        validity_days: parseInt(formData.validity_days),
        price: parseFloat(formData.price),
        booking_advance_days: parseInt(formData.booking_advance_days),
        booking_hour_start: formData.booking_hour_start,
        booking_hour_end: formData.booking_hour_end,
      };

      await api.put(`/api/admin/voucher-types/${selectedType.id}`, payload);
      setIsEditDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Failed to update voucher type:', error);
      setError(error.response?.data?.detail || 'Failed to update voucher type');
    }
  };

  const handleDeleteVoucherType = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this voucher type?')) {
      return;
    }

    try {
      await api.delete(`/api/admin/voucher-types/${id}`);
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete voucher type:', error);
      setError(error.response?.data?.detail || 'Failed to delete voucher type');
    }
  };

  const handleToggleActive = async (type: VoucherType) => {
    try {
      await api.patch(`/api/admin/voucher-types/${type.id}/toggle-active`);
      fetchData();
    } catch (error: any) {
      console.error('Failed to toggle voucher type status:', error);
      setError(error.response?.data?.detail || 'Failed to update voucher type status');
    }
  };

  const handleDuplicate = (type: VoucherType) => {
    setFormData({
      organization_id: type.organization_id.toString(),
      name: `${type.name} (Copy)`,
      description: type.description || '',
      sessions_count: type.sessions_count.toString(),
      backup_sessions_count: type.backup_sessions_count.toString(),
      session_duration_minutes: type.session_duration_minutes.toString(),
      group_size: type.group_size.toString(),
      validity_days: type.validity_days.toString(),
      price: type.price.toString(),
      booking_advance_days: type.booking_advance_days.toString(),
      booking_hour_start: type.booking_hour_start,
      booking_hour_end: type.booking_hour_end,
    });
    setIsCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      organization_id: '',
      name: '',
      description: '',
      sessions_count: '10',
      backup_sessions_count: '2',
      session_duration_minutes: '60',
      group_size: '1',
      validity_days: '90',
      price: '',
      booking_advance_days: '7',
      booking_hour_start: '08:00',
      booking_hour_end: '20:00',
    });
    setSelectedType(null);
  };

  const openEditDialog = (type: VoucherType) => {
    setSelectedType(type);
    setFormData({
      organization_id: type.organization_id.toString(),
      name: type.name,
      description: type.description || '',
      sessions_count: type.sessions_count.toString(),
      backup_sessions_count: type.backup_sessions_count.toString(),
      session_duration_minutes: type.session_duration_minutes.toString(),
      group_size: type.group_size.toString(),
      validity_days: type.validity_days.toString(),
      price: type.price.toString(),
      booking_advance_days: type.booking_advance_days.toString(),
      booking_hour_start: type.booking_hour_start,
      booking_hour_end: type.booking_hour_end,
    });
    setIsEditDialogOpen(true);
  };

  const filteredVoucherTypes = voucherTypes.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         type.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOrg = filterOrg === 'all' || type.organization_id.toString() === filterOrg;
    
    const matchesActive = filterActive === 'all' ||
                         (filterActive === 'active' && type.is_active) ||
                         (filterActive === 'inactive' && !type.is_active);
    
    return matchesSearch && matchesOrg && matchesActive;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading voucher types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Voucher Types</h1>
          <p className="text-muted-foreground mt-2">
            Configure voucher packages for organizations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Voucher Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Voucher Type</DialogTitle>
              <DialogDescription>
                Configure a new voucher package for an organization.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="organization" className="text-right">
                  Organization *
                </Label>
                <Select 
                  value={formData.organization_id}
                  onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.filter(o => o.is_active).map(org => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Premium Package 10 Sessions"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Package description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sessions_count" className="text-right">
                  Sessions *
                </Label>
                <Input
                  id="sessions_count"
                  type="number"
                  value={formData.sessions_count}
                  onChange={(e) => setFormData({ ...formData, sessions_count: e.target.value })}
                  className="col-span-3"
                  placeholder="10"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="backup_sessions" className="text-right">
                  Backup Sessions
                </Label>
                <Input
                  id="backup_sessions"
                  type="number"
                  value={formData.backup_sessions_count}
                  onChange={(e) => setFormData({ ...formData, backup_sessions_count: e.target.value })}
                  className="col-span-3"
                  placeholder="2"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration (min) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.session_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, session_duration_minutes: e.target.value })}
                  className="col-span-3"
                  placeholder="60"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group_size" className="text-right">
                  Group Size *
                </Label>
                <Input
                  id="group_size"
                  type="number"
                  value={formData.group_size}
                  onChange={(e) => setFormData({ ...formData, group_size: e.target.value })}
                  className="col-span-3"
                  placeholder="1"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="validity" className="text-right">
                  Validity (days) *
                </Label>
                <Input
                  id="validity"
                  type="number"
                  value={formData.validity_days}
                  onChange={(e) => setFormData({ ...formData, validity_days: e.target.value })}
                  className="col-span-3"
                  placeholder="90"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price (PLN) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="col-span-3"
                  placeholder="1500.00"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booking_advance" className="text-right">
                  Booking Advance
                </Label>
                <Input
                  id="booking_advance"
                  type="number"
                  value={formData.booking_advance_days}
                  onChange={(e) => setFormData({ ...formData, booking_advance_days: e.target.value })}
                  className="col-span-3"
                  placeholder="7"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booking_hours" className="text-right">
                  Booking Hours
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    type="time"
                    value={formData.booking_hour_start}
                    onChange={(e) => setFormData({ ...formData, booking_hour_start: e.target.value })}
                  />
                  <span className="self-center">to</span>
                  <Input
                    type="time"
                    value={formData.booking_hour_end}
                    onChange={(e) => setFormData({ ...formData, booking_hour_end: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVoucherType}>
                Create Voucher Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Types
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voucherTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              {voucherTypes.filter(t => t.is_active).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Organizations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Using voucher system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Sessions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {voucherTypes.length > 0 
                ? Math.round(voucherTypes.reduce((sum, t) => sum + t.sessions_count, 0) / voucherTypes.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per package
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Price
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {voucherTypes.length > 0 
                ? formatPrice(voucherTypes.reduce((sum, t) => sum + t.price, 0) / voucherTypes.length)
                : formatPrice(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per voucher
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search voucher types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterOrg} onValueChange={setFilterOrg}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.id.toString()}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterActive} onValueChange={(value: any) => setFilterActive(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Voucher Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Types List</CardTitle>
          <CardDescription>
            Manage all voucher packages in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVoucherTypes.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No voucher types found matching your search.' : 'No voucher types yet.'}
              </p>
              {!searchQuery && (
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Voucher Type
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVoucherTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{type.name}</p>
                        {type.description && (
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{type.organization_name || 'Unknown'}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {type.sessions_count} sessions (+{type.backup_sessions_count} backup)
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {type.session_duration_minutes} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Group size: {type.group_size}
                        </div>
                        <div>Valid for {type.validity_days} days</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{formatPrice(type.price)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.is_active ? 'default' : 'secondary'}>
                        {type.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicate(type)}
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(type)}
                        >
                          {type.is_active ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteVoucherType(type.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog - Similar to Create but without organization selector */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Voucher Type</DialogTitle>
            <DialogDescription>
              Update voucher package configuration.
            </DialogDescription>
          </DialogHeader>
          {/* Same form fields as create dialog, minus organization selector */}
          <div className="grid gap-4 py-4">
            {/* Copy all fields from create dialog except organization */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            {/* ... rest of the fields ... */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateVoucherType}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoucherTypesPage;