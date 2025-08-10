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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
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
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Edit,
  FileText,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  User,
  Users,
  XCircle,
  ChevronRight,
  CalendarDays,
  History,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  activeVouchers: number;
  totalSessionsRemaining: number;
  upcomingSessions: number;
  lastSessionDate?: string;
  status: 'active' | 'inactive' | 'paused';
  notes?: string;
}

interface ClientVoucher {
  id: string;
  type: string;
  organization: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  backupSessionsTotal: number;
  backupSessionsUsed: number;
  backupSessionsRemaining: number;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'exhausted';
}

interface Session {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  duration: number;
  type: 'individual' | 'group' | 'online';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  location?: string;
  therapistNotes?: string;
  preparationMessage?: string;
  isBackupSession: boolean;
}

interface RescheduleRequest {
  id: string;
  sessionId: string;
  clientName: string;
  currentDate: string;
  currentTime: string;
  preferredDate: string;
  preferredTime: string;
  alternativeDate?: string;
  alternativeTime?: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: string;
}

const Clients: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientVouchers, setClientVouchers] = useState<ClientVoucher[]>([]);
  const [clientSessions, setClientSessions] = useState<Session[]>([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isPreparationDialogOpen, setIsPreparationDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Form states
  const [notesForm, setNotesForm] = useState({ notes: '' });
  const [preparationForm, setPreparationForm] = useState({ message: '' });
  const [rescheduleForm, setRescheduleForm] = useState({
    action: 'accept',
    newDate: '',
    newTime: '',
    message: '',
  });

  // Mock data
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      activeVouchers: 2,
      totalSessionsRemaining: 15,
      upcomingSessions: 3,
      lastSessionDate: '2025-08-05',
      status: 'active',
      notes: 'Prefers morning sessions',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321',
      activeVouchers: 1,
      totalSessionsRemaining: 5,
      upcomingSessions: 1,
      lastSessionDate: '2025-08-08',
      status: 'active',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      activeVouchers: 0,
      totalSessionsRemaining: 0,
      upcomingSessions: 0,
      lastSessionDate: '2025-07-20',
      status: 'inactive',
    },
  ];

  const mockVouchers: ClientVoucher[] = [
    {
      id: 'v1',
      type: 'Standard Package',
      organization: 'Wellness Center',
      sessionsTotal: 10,
      sessionsUsed: 3,
      sessionsRemaining: 7,
      backupSessionsTotal: 2,
      backupSessionsUsed: 0,
      backupSessionsRemaining: 2,
      purchaseDate: '2025-07-01',
      expiryDate: '2025-10-01',
      status: 'active',
    },
    {
      id: 'v2',
      type: 'Premium Package',
      organization: 'Wellness Center',
      sessionsTotal: 20,
      sessionsUsed: 12,
      sessionsRemaining: 8,
      backupSessionsTotal: 4,
      backupSessionsUsed: 1,
      backupSessionsRemaining: 3,
      purchaseDate: '2025-06-15',
      expiryDate: '2025-09-15',
      status: 'active',
    },
  ];

  const mockSessions: Session[] = [
    {
      id: 's1',
      clientId: '1',
      clientName: 'John Doe',
      date: '2025-08-12',
      time: '10:00',
      duration: 60,
      type: 'individual',
      status: 'scheduled',
      location: 'Room 201',
      isBackupSession: false,
    },
    {
      id: 's2',
      clientId: '1',
      clientName: 'John Doe',
      date: '2025-08-05',
      time: '10:00',
      duration: 60,
      type: 'individual',
      status: 'completed',
      location: 'Room 201',
      therapistNotes: 'Good progress on anxiety management techniques',
      isBackupSession: false,
    },
    {
      id: 's3',
      clientId: '2',
      clientName: 'Jane Smith',
      date: '2025-08-15',
      time: '14:00',
      duration: 60,
      type: 'online',
      status: 'scheduled',
      isBackupSession: false,
    },
  ];

  const mockRescheduleRequests: RescheduleRequest[] = [
    {
      id: 'rr1',
      sessionId: 's1',
      clientName: 'John Doe',
      currentDate: '2025-08-12',
      currentTime: '10:00',
      preferredDate: '2025-08-14',
      preferredTime: '11:00',
      alternativeDate: '2025-08-15',
      alternativeTime: '10:00',
      reason: 'Work conflict',
      status: 'pending',
      requestedAt: '2025-08-10T09:00:00',
    },
  ];

  useEffect(() => {
    fetchData();
  }, [filterStatus, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, fetch from API
      // const [clientsRes, requestsRes] = await Promise.all([
      //   api.get('/api/therapist/clients'),
      //   api.get('/api/therapist/reschedule-requests'),
      // ]);

      // Mock implementation
      let filteredClients = [...mockClients];
      
      if (filterStatus !== 'all') {
        filteredClients = filteredClients.filter(c => c.status === filterStatus);
      }
      
      if (searchTerm) {
        filteredClients = filteredClients.filter(c =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setClients(filteredClients);
      setRescheduleRequests(mockRescheduleRequests);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (clientId: string) => {
    try {
      // In production, fetch from API
      // const [vouchersRes, sessionsRes] = await Promise.all([
      //   api.get(`/api/therapist/client/${clientId}/vouchers`),
      //   api.get(`/api/therapist/client/${clientId}/sessions`),
      // ]);

      // Mock implementation
      setClientVouchers(mockVouchers);
      setClientSessions(mockSessions.filter(s => s.clientId === clientId));
    } catch (err: any) {
      console.error('Failed to fetch client details:', err);
      setError('Failed to load client details.');
    }
  };

  const handleClientClick = async (client: Client) => {
    setSelectedClient(client);
    await fetchClientDetails(client.id);
    setIsClientDialogOpen(true);
  };

  const handleAddNotes = (session: Session) => {
    setSelectedSession(session);
    setNotesForm({ notes: session.therapistNotes || '' });
    setIsNotesDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedSession) return;

    try {
      // In production, send to API
      // await api.post('/api/therapist/add-session-notes', {
      //   sessionId: selectedSession.id,
      //   notes: notesForm.notes,
      // });

      // Mock implementation
      setClientSessions(clientSessions.map(s =>
        s.id === selectedSession.id
          ? { ...s, therapistNotes: notesForm.notes }
          : s
      ));
      
      setIsNotesDialogOpen(false);
      setSelectedSession(null);
    } catch (err: any) {
      console.error('Failed to save notes:', err);
      setError('Failed to save notes. Please try again.');
    }
  };

  const handleAddPreparation = (session: Session) => {
    setSelectedSession(session);
    setPreparationForm({ message: session.preparationMessage || '' });
    setIsPreparationDialogOpen(true);
  };

  const handleSendPreparation = async () => {
    if (!selectedSession) return;

    try {
      // In production, send to API
      // await api.post('/api/therapist/send-preparation', {
      //   sessionId: selectedSession.id,
      //   message: preparationForm.message,
      // });

      // Mock implementation
      setClientSessions(clientSessions.map(s =>
        s.id === selectedSession.id
          ? { ...s, preparationMessage: preparationForm.message }
          : s
      ));
      
      setIsPreparationDialogOpen(false);
      setSelectedSession(null);
    } catch (err: any) {
      console.error('Failed to send preparation:', err);
      setError('Failed to send preparation message. Please try again.');
    }
  };

  const handleRescheduleRequest = (request: RescheduleRequest) => {
    setSelectedRequest(request);
    setRescheduleForm({
      action: 'accept',
      newDate: request.preferredDate,
      newTime: request.preferredTime,
      message: '',
    });
    setIsRescheduleDialogOpen(true);
  };

  const handleRespondToReschedule = async () => {
    if (!selectedRequest) return;

    try {
      // In production, send to API
      // await api.post(`/api/therapist/respond-reschedule/${selectedRequest.id}`, rescheduleForm);

      // Mock implementation
      setRescheduleRequests(rescheduleRequests.map(r =>
        r.id === selectedRequest.id
          ? { ...r, status: rescheduleForm.action === 'accept' ? 'accepted' : 'rejected' }
          : r
      ));
      
      setIsRescheduleDialogOpen(false);
      setSelectedRequest(null);
    } catch (err: any) {
      console.error('Failed to respond to reschedule:', err);
      setError('Failed to respond to reschedule request. Please try again.');
    }
  };

  const handleMarkNoShow = async (sessionId: string) => {
    if (!window.confirm('Mark this session as missed?')) return;

    try {
      // In production, send to API
      // await api.patch(`/api/therapist/sessions/${sessionId}/no-show`);

      // Mock implementation
      setClientSessions(clientSessions.map(s =>
        s.id === sessionId ? { ...s, status: 'no_show' } : s
      ));
    } catch (err: any) {
      console.error('Failed to mark no-show:', err);
      setError('Failed to update session status.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'no_show':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'no_show':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const pendingRequestsCount = rescheduleRequests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Clients</h1>
          <p className="text-muted-foreground mt-2">
            Manage your clients and their sessions
          </p>
        </div>
        <div className="flex gap-2">
          {pendingRequestsCount > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(true)}
              className="relative"
              data-testid="reschedule-badge"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reschedule Requests
              <Badge variant="destructive" className="ml-2">
                {pendingRequestsCount}
              </Badge>
            </Button>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
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

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="client-search"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[150px]" data-testid="client-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleClientClick(client)}
            data-testid="client-card"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg" data-testid="client-name">
                    {client.name}
                  </CardTitle>
                  <CardDescription>{client.email}</CardDescription>
                </div>
                <Badge className={getStatusColor(client.status)}>
                  {client.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="active-vouchers">
                      {client.activeVouchers} active voucher{client.activeVouchers !== 1 && 's'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="sessions-remaining">
                      {client.totalSessionsRemaining} sessions left
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{client.upcomingSessions} upcoming</span>
                  </div>
                </div>
                {client.lastSessionDate && (
                  <div className="text-xs text-muted-foreground">
                    Last session: {new Date(client.lastSessionDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Details Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              View and manage client information
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              {/* Client Info */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedClient.name}</CardTitle>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {selectedClient.email}
                        </div>
                        {selectedClient.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {selectedClient.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(selectedClient.status)}>
                      {selectedClient.status}
                    </Badge>
                  </div>
                </CardHeader>
                {selectedClient.notes && (
                  <CardContent>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-sm">{selectedClient.notes}</p>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Tabs for vouchers and sessions */}
              <Tabs defaultValue="vouchers" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
                  <TabsTrigger value="sessions">Session History</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
                </TabsList>

                <TabsContent value="vouchers" className="space-y-4">
                  <ScrollArea className="h-[300px]" data-testid="voucher-list">
                    <div className="space-y-3">
                      {clientVouchers.map((voucher) => (
                        <Card key={voucher.id}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-sm font-medium">
                                  {voucher.type}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {voucher.organization}
                                </CardDescription>
                              </div>
                              <Badge className={getStatusColor(voucher.status)}>
                                {voucher.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Sessions</span>
                                <span className="font-medium">
                                  {voucher.sessionsRemaining}/{voucher.sessionsTotal}
                                </span>
                              </div>
                              <Progress
                                value={(voucher.sessionsRemaining / voucher.sessionsTotal) * 100}
                                className="h-2"
                              />
                              {voucher.backupSessionsTotal > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Backup Sessions</span>
                                  <span className="font-medium">
                                    {voucher.backupSessionsRemaining}/{voucher.backupSessionsTotal}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Expires</span>
                                <span>{new Date(voucher.expiryDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-4">
                  <ScrollArea className="h-[300px]" data-testid="session-history">
                    <div className="space-y-3">
                      {clientSessions
                        .filter(s => s.status === 'completed' || s.status === 'no_show')
                        .map((session) => (
                          <Card 
                            key={session.id}
                            data-testid="session-entry"
                            data-status={session.status === 'no_show' ? 'missed' : 'completed'}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {getSessionStatusIcon(session.status)}
                                    <span className="font-medium">
                                      {new Date(session.date).toLocaleDateString()} at {session.time}
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {session.type} session • {session.duration} minutes
                                  </div>
                                  {session.location && (
                                    <div className="flex items-center gap-1 text-sm">
                                      <MapPin className="h-3 w-3" />
                                      {session.location}
                                    </div>
                                  )}
                                  {session.therapistNotes && (
                                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                                      <p className="font-medium">Notes:</p>
                                      <p>{session.therapistNotes}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Badge className={getStatusColor(session.status)}>
                                    {session.status === 'no_show' ? 'Missed' : session.status}
                                  </Badge>
                                  {session.status === 'completed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddNotes(session);
                                      }}
                                      data-testid="session-notes"
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Notes
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                  <ScrollArea className="h-[300px]" data-testid="upcoming-sessions">
                    <div className="space-y-3">
                      {clientSessions
                        .filter(s => s.status === 'scheduled' || s.status === 'confirmed')
                        .map((session) => (
                          <Card 
                            key={session.id}
                            data-testid="upcoming-session"
                            data-has-preparation={!!session.preparationMessage}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {getSessionStatusIcon(session.status)}
                                    <span className="font-medium">
                                      {new Date(session.date).toLocaleDateString()} at {session.time}
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {session.type} session • {session.duration} minutes
                                  </div>
                                  {session.location && (
                                    <div className="flex items-center gap-1 text-sm">
                                      <MapPin className="h-3 w-3" />
                                      {session.location}
                                    </div>
                                  )}
                                  {session.preparationMessage && (
                                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                      <p className="font-medium text-blue-700">Preparation sent:</p>
                                      <p className="text-blue-600">{session.preparationMessage}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Badge className={getStatusColor(session.status)}>
                                    {session.status}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddPreparation(session);
                                    }}
                                  >
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    Prep
                                  </Button>
                                  {new Date(session.date).toDateString() === new Date().toDateString() && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkNoShow(session.id);
                                      }}
                                    >
                                      No-Show
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Notes</DialogTitle>
            <DialogDescription>
              Add or update notes for this session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notesForm.notes}
                onChange={(e) => setNotesForm({ notes: e.target.value })}
                placeholder="Enter session notes..."
                rows={5}
                data-testid="session-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Preparation Dialog */}
      <Dialog open={isPreparationDialogOpen} onOpenChange={setIsPreparationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preparation Request</DialogTitle>
            <DialogDescription>
              Send preparation instructions to the client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preparation">Preparation Message</Label>
              <Textarea
                id="preparation"
                value={preparationForm.message}
                onChange={(e) => setPreparationForm({ message: e.target.value })}
                placeholder="Please bring your journal and complete the mood tracking worksheet..."
                rows={4}
                data-testid="preparation-message"
              />
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                The client will receive this message as a preparation reminder for their upcoming session.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreparationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPreparation}>
              <Send className="mr-2 h-4 w-4" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Requests Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reschedule Requests</DialogTitle>
            <DialogDescription>
              Review and respond to client reschedule requests
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {rescheduleRequests
                .filter(r => r.status === 'pending')
                .map((request) => (
                  <Card key={request.id} data-testid="reschedule-request">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{request.clientName}</p>
                            <p className="text-sm text-muted-foreground">
                              Requested {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p>{new Date(request.currentDate).toLocaleDateString()} at {request.currentTime}</p>
                          </div>
                          <div>
                            <p className="font-medium">Preferred Time</p>
                            <p>{new Date(request.preferredDate).toLocaleDateString()} at {request.preferredTime}</p>
                          </div>
                        </div>
                        {request.alternativeDate && (
                          <div className="text-sm">
                            <p className="font-medium">Alternative</p>
                            <p>{new Date(request.alternativeDate).toLocaleDateString()} at {request.alternativeTime}</p>
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="font-medium">Reason</p>
                          <p className="text-muted-foreground">{request.reason}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRescheduleRequest(request)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setRescheduleForm({ ...rescheduleForm, action: 'reject' });
                              handleRespondToReschedule();
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {rescheduleRequests.filter(r => r.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No pending reschedule requests
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;