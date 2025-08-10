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
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Calendar,
  Clock,
  CreditCard,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  ShoppingCart,
  FileText,
  MessageSquare,
  Info,
  Package,
} from 'lucide-react';

interface Voucher {
  id: number;
  voucher_type_name: string;
  organization_name: string;
  sessions_total: number;
  sessions_used: number;
  sessions_remaining: number;
  backup_sessions_total: number;
  backup_sessions_used: number;
  backup_sessions_remaining: number;
  purchase_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'exhausted' | 'cancelled';
  price_paid: number;
}

interface Session {
  id: number;
  therapist_name: string;
  session_date: string;
  session_time: string;
  duration_minutes: number;
  session_type: 'individual' | 'group' | 'online';
  location?: string;
  status: string;
  is_backup_session: boolean;
  therapist_notes?: string;
  preparation_message?: string;
}

interface VoucherPackage {
  id: number;
  name: string;
  description: string;
  sessions_count: number;
  backup_sessions_count: number;
  validity_days: number;
  price: number;
  organization_name: string;
}

const Vouchers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availablePackages, setAvailablePackages] = useState<VoucherPackage[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isVoucherDetailsOpen, setIsVoucherDetailsOpen] = useState(false);
  const [isSessionDetailsOpen, setIsSessionDetailsOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isPurchaseSessionsOpen, setIsPurchaseSessionsOpen] = useState(false);
  const [isPurchaseVoucherOpen, setIsPurchaseVoucherOpen] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);

  // Form states
  const [rescheduleForm, setRescheduleForm] = useState({
    preferred_date: '',
    preferred_time: '',
    alternative_date: '',
    alternative_time: '',
    reason: '',
  });

  const [purchaseForm, setPurchaseForm] = useState({
    sessions_count: 1,
    voucher_id: null as number | null,
    payment_method: 'credit_card',
  });

  // Mock data
  const mockVouchers: Voucher[] = [
    {
      id: 1,
      voucher_type_name: 'Standard Package',
      organization_name: 'Wellness Center',
      sessions_total: 10,
      sessions_used: 5,
      sessions_remaining: 5,
      backup_sessions_total: 2,
      backup_sessions_used: 0,
      backup_sessions_remaining: 2,
      purchase_date: '2025-07-01',
      expiry_date: '2025-10-01',
      status: 'active',
      price_paid: 1000,
    },
    {
      id: 2,
      voucher_type_name: 'Premium Package',
      organization_name: 'Wellness Center',
      sessions_total: 20,
      sessions_used: 8,
      sessions_remaining: 12,
      backup_sessions_total: 4,
      backup_sessions_used: 1,
      backup_sessions_remaining: 3,
      purchase_date: '2025-06-15',
      expiry_date: '2025-09-15',
      status: 'active',
      price_paid: 1800,
    },
  ];

  const mockSessions: Session[] = [
    {
      id: 1,
      therapist_name: 'Dr. Smith',
      session_date: '2025-08-05',
      session_time: '14:00',
      duration_minutes: 60,
      session_type: 'individual',
      location: 'Room 201',
      status: 'completed',
      is_backup_session: false,
      therapist_notes: 'Good progress on anxiety management techniques. Continue with breathing exercises.',
    },
    {
      id: 2,
      therapist_name: 'Dr. Smith',
      session_date: '2025-08-12',
      session_time: '14:00',
      duration_minutes: 60,
      session_type: 'individual',
      location: 'Room 201',
      status: 'scheduled',
      is_backup_session: false,
      preparation_message: 'Please bring your journal and complete the mood tracking worksheet.',
    },
    {
      id: 3,
      therapist_name: 'Dr. Johnson',
      session_date: '2025-08-07',
      session_time: '10:00',
      duration_minutes: 60,
      session_type: 'online',
      status: 'no_show',
      is_backup_session: false,
    },
  ];

  const mockPackages: VoucherPackage[] = [
    {
      id: 1,
      name: 'Basic Package',
      description: 'Perfect for getting started',
      sessions_count: 5,
      backup_sessions_count: 1,
      validity_days: 60,
      price: 500,
      organization_name: 'Wellness Center',
    },
    {
      id: 2,
      name: 'Standard Package',
      description: 'Our most popular package',
      sessions_count: 10,
      backup_sessions_count: 2,
      validity_days: 90,
      price: 900,
      organization_name: 'Wellness Center',
    },
    {
      id: 3,
      name: 'Premium Package',
      description: 'Comprehensive therapy package',
      sessions_count: 20,
      backup_sessions_count: 4,
      validity_days: 120,
      price: 1700,
      organization_name: 'Wellness Center',
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, fetch from API
      // const [vouchersRes, sessionsRes, packagesRes] = await Promise.all([
      //   api.get('/api/client/vouchers'),
      //   api.get('/api/client/sessions'),
      //   api.get('/api/client/available-packages'),
      // ]);

      // Mock implementation
      setVouchers(mockVouchers);
      setSessions(mockSessions);
      setAvailablePackages(mockPackages);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load vouchers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherClick = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsVoucherDetailsOpen(true);
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsSessionDetailsOpen(true);
  };

  const handleRequestReschedule = async () => {
    try {
      // In production, send to API
      // await api.post('/api/client/reschedule-request', {
      //   session_id: selectedSession?.id,
      //   ...rescheduleForm,
      // });

      setIsRescheduleDialogOpen(false);
      setRescheduleForm({
        preferred_date: '',
        preferred_time: '',
        alternative_date: '',
        alternative_time: '',
        reason: '',
      });
      // Show success message
    } catch (err: any) {
      console.error('Failed to request reschedule:', err);
      setError('Failed to submit reschedule request');
    }
  };

  const handleUseBackupSession = async (sessionId: number) => {
    try {
      // In production, send to API
      // await api.post('/api/client/use-backup-session', {
      //   session_id: sessionId,
      // });

      setIsBackupDialogOpen(false);
      fetchData(); // Refresh data
      // Show success message
    } catch (err: any) {
      console.error('Failed to use backup session:', err);
      setError('Failed to apply backup session');
    }
  };

  const handlePurchaseSessions = async () => {
    try {
      // In production, send to API
      // await api.post('/api/client/purchase-sessions', purchaseForm);

      setIsPurchaseSessionsOpen(false);
      setPurchaseForm({
        sessions_count: 1,
        voucher_id: null,
        payment_method: 'credit_card',
      });
      // Show success message and refresh
    } catch (err: any) {
      console.error('Failed to purchase sessions:', err);
      setError('Failed to complete purchase');
    }
  };

  const handlePurchaseVoucher = async (packageId: number) => {
    try {
      // In production, send to API
      // await api.post('/api/client/purchase-voucher', {
      //   voucher_type_id: packageId,
      //   payment_method: 'credit_card',
      // });

      setIsPurchaseVoucherOpen(false);
      fetchData(); // Refresh data
      // Show success message
    } catch (err: any) {
      console.error('Failed to purchase voucher:', err);
      setError('Failed to complete purchase');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'exhausted':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'outline';
      case 'no_show':
      case 'missed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getSessionStatusLabel = (status: string) => {
    switch (status) {
      case 'no_show':
        return 'Missed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filterStatus !== 'all' && session.status !== filterStatus) return false;
    if (searchQuery && !session.therapist_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const upcomingSessions = sessions.filter(s => 
    ['scheduled', 'confirmed'].includes(s.status)
  );

  const completedSessions = sessions.filter(s => 
    s.status === 'completed'
  );

  const missedSessions = sessions.filter(s => 
    s.status === 'no_show'
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Vouchers</h1>
          <p className="text-muted-foreground mt-2">
            Manage your therapy vouchers and sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPurchaseSessionsOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Purchase Sessions
          </Button>
          <Button onClick={() => setIsPurchaseVoucherOpen(true)}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Purchase New Voucher
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Vouchers</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
        </TabsList>

        {/* Active Vouchers Tab */}
        <TabsContent value="active">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vouchers.filter(v => v.status === 'active').map((voucher) => (
              <Card 
                key={voucher.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleVoucherClick(voucher)}
                data-testid="voucher-card"
                data-backup-count={voucher.backup_sessions_remaining}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg" data-testid="voucher-type">
                        {voucher.voucher_type_name}
                      </CardTitle>
                      <CardDescription>{voucher.organization_name}</CardDescription>
                    </div>
                    <Badge variant={getStatusColor(voucher.status)} data-testid="voucher-status">
                      {voucher.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Sessions</span>
                      <span className="font-medium" data-testid="sessions-remaining">
                        {voucher.sessions_remaining}/{voucher.sessions_total}
                      </span>
                    </div>
                    <Progress 
                      value={(voucher.sessions_remaining / voucher.sessions_total) * 100}
                      className="h-2"
                      data-testid="progress-bar"
                    />
                    {voucher.backup_sessions_remaining > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Backup</span>
                        <Badge variant="outline" data-testid="backup-sessions">
                          {voucher.backup_sessions_remaining} backup
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Expires</span>
                      <span className="text-sm font-medium" data-testid="expiry-date">
                        {new Date(voucher.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {vouchers.filter(v => v.status === 'active').length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active vouchers</p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsPurchaseVoucherOpen(true)}
                >
                  Purchase Voucher
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Session History Tab */}
        <TabsContent value="history">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Search by therapist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
                data-testid="session-search"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]" data-testid="voucher-filter">
                  <SelectValue placeholder="All sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no_show">Missed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Session List */}
            <div className="space-y-2">
              {filteredSessions.map((session) => (
                <Card 
                  key={session.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSessionClick(session)}
                  data-testid="session-entry"
                  data-status={session.status === 'no_show' ? 'missed' : session.status}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium" data-testid="therapist-name">
                            {session.therapist_name}
                          </span>
                          {session.is_backup_session && (
                            <Badge variant="secondary">Backup</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span data-testid="session-date">
                              {new Date(session.session_date).toLocaleDateString()}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.session_time}
                          </span>
                          <span>{session.duration_minutes} min</span>
                        </div>
                        {session.therapist_notes && (
                          <div className="mt-2 flex items-start gap-1">
                            <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground line-clamp-1">
                              {session.therapist_notes}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant={getStatusColor(session.status)}
                          data-testid="session-status"
                        >
                          {getSessionStatusLabel(session.status)}
                        </Badge>
                        {session.status === 'no_show' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSession(session);
                              setIsBackupDialogOpen(true);
                            }}
                          >
                            Use Backup Session
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Upcoming Sessions Tab */}
        <TabsContent value="upcoming">
          <div className="space-y-2">
            {upcomingSessions.map((session) => (
              <Card 
                key={session.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSessionClick(session)}
                data-testid="upcoming-session"
                data-has-preparation={!!session.preparation_message}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {session.therapist_name}
                        </span>
                        {session.preparation_message && (
                          <Badge variant="default" data-testid="preparation-badge">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Preparation Required
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.session_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.session_time}
                        </span>
                        <span>{session.duration_minutes} min</span>
                        {session.location && (
                          <span>{session.location}</span>
                        )}
                      </div>
                      {session.preparation_message && (
                        <Alert className="mt-2">
                          <Info className="h-4 w-4" />
                          <AlertDescription data-testid="preparation-message">
                            {session.preparation_message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session);
                          setIsRescheduleDialogOpen(true);
                        }}
                      >
                        Request Reschedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {upcomingSessions.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming sessions</p>
                  <Button 
                    className="mt-4"
                    onClick={() => navigate('/client/calendar')}
                  >
                    Book a Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Voucher Details Dialog */}
      <Dialog open={isVoucherDetailsOpen} onOpenChange={setIsVoucherDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Voucher Details</DialogTitle>
            <DialogDescription>
              View detailed information about your voucher
            </DialogDescription>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedVoucher.voucher_type_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="font-medium">{selectedVoucher.organization_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sessions Used</p>
                  <p className="font-medium">{selectedVoucher.sessions_used}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sessions Remaining</p>
                  <p className="font-medium">{selectedVoucher.sessions_remaining}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Backup Sessions</p>
                  <p className="font-medium">
                    {selectedVoucher.backup_sessions_remaining} of {selectedVoucher.backup_sessions_total}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-medium">
                    {new Date(selectedVoucher.expiry_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Session Usage</p>
                <Progress 
                  value={(selectedVoucher.sessions_remaining / selectedVoucher.sessions_total) * 100}
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {Math.round((selectedVoucher.sessions_remaining / selectedVoucher.sessions_total) * 100)}% remaining
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Details Dialog */}
      <Dialog open={isSessionDetailsOpen} onOpenChange={setIsSessionDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              View session information
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Therapist</p>
                  <p className="font-medium">{selectedSession.therapist_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusColor(selectedSession.status)}>
                    {getSessionStatusLabel(selectedSession.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedSession.session_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedSession.session_time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedSession.duration_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedSession.session_type}</p>
                </div>
              </div>
              
              {selectedSession.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedSession.location}</p>
                </div>
              )}
              
              {selectedSession.therapist_notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Therapist Notes</p>
                  <div className="p-3 bg-muted rounded-lg" data-testid="therapist-notes">
                    <p className="text-sm">{selectedSession.therapist_notes}</p>
                  </div>
                </div>
              )}
              
              {selectedSession.preparation_message && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Preparation Required</p>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {selectedSession.preparation_message}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Reschedule</DialogTitle>
            <DialogDescription>
              Request to reschedule your session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred-date">Preferred Date</Label>
                <Input
                  id="preferred-date"
                  type="date"
                  value={rescheduleForm.preferred_date}
                  onChange={(e) => setRescheduleForm({
                    ...rescheduleForm,
                    preferred_date: e.target.value
                  })}
                  data-testid="preferred-date"
                />
              </div>
              <div>
                <Label htmlFor="preferred-time">Preferred Time</Label>
                <Input
                  id="preferred-time"
                  type="time"
                  value={rescheduleForm.preferred_time}
                  onChange={(e) => setRescheduleForm({
                    ...rescheduleForm,
                    preferred_time: e.target.value
                  })}
                  data-testid="preferred-time"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="alt-date">Alternative Date (Optional)</Label>
                <Input
                  id="alt-date"
                  type="date"
                  value={rescheduleForm.alternative_date}
                  onChange={(e) => setRescheduleForm({
                    ...rescheduleForm,
                    alternative_date: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="alt-time">Alternative Time</Label>
                <Input
                  id="alt-time"
                  type="time"
                  value={rescheduleForm.alternative_time}
                  onChange={(e) => setRescheduleForm({
                    ...rescheduleForm,
                    alternative_time: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="reason">Reason for Reschedule</Label>
              <Textarea
                id="reason"
                value={rescheduleForm.reason}
                onChange={(e) => setRescheduleForm({
                  ...rescheduleForm,
                  reason: e.target.value
                })}
                placeholder="Please provide a reason..."
                data-testid="reschedule-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestReschedule}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Use Backup Session Dialog */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Use Backup Session?</DialogTitle>
            <DialogDescription>
              Would you like to use a backup session to compensate for this missed session?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You have backup sessions available. Using one will schedule a replacement session.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBackupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedSession && handleUseBackupSession(selectedSession.id)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Sessions Dialog */}
      <Dialog open={isPurchaseSessionsOpen} onOpenChange={setIsPurchaseSessionsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Purchase Additional Sessions</DialogTitle>
            <DialogDescription>
              Add more sessions to your existing voucher
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="session-count">Number of Sessions</Label>
              <Select
                value={purchaseForm.sessions_count.toString()}
                onValueChange={(value) => setPurchaseForm({
                  ...purchaseForm,
                  sessions_count: parseInt(value)
                })}
                data-testid="session-count"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 3, 5, 10].map(count => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} {count === 1 ? 'session' : 'sessions'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Price</span>
                <span className="font-semibold" data-testid="total-price">
                  {purchaseForm.sessions_count * 100} PLN
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPurchaseSessionsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchaseSessions}>
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Voucher Dialog */}
      <Dialog open={isPurchaseVoucherOpen} onOpenChange={setIsPurchaseVoucherOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Available Voucher Packages</DialogTitle>
            <DialogDescription>
              Choose a voucher package that suits your needs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {availablePackages.map((pkg) => (
              <Card 
                key={pkg.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                data-testid="voucher-package"
                onClick={() => {}}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{pkg.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                      <div className="mt-3 space-y-1 text-sm" data-testid="package-details">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{pkg.sessions_count} sessions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{pkg.backup_sessions_count} backup sessions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Valid for {pkg.validity_days} days</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{pkg.price} PLN</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchaseVoucher(pkg.id);
                        }}
                      >
                        Purchase Package
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vouchers;