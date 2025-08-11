import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Search, Calendar, FileText, Phone, Mail } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  nextSession?: string;
  totalSessions: number;
  voucherStatus: 'active' | 'expiring' | 'expired';
  remainingSessions: number;
}

const EmployeeClientsPage: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - in real app, fetch from API
    // Only showing clients assigned to this employee
    setClients([
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-1001',
        nextSession: '2024-01-15 14:00',
        totalSessions: 12,
        voucherStatus: 'active',
        remainingSessions: 8
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-1002',
        nextSession: '2024-01-16 10:00',
        totalSessions: 8,
        voucherStatus: 'expiring',
        remainingSessions: 2
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob.j@example.com',
        phone: '+1-555-1003',
        nextSession: '2024-01-17 15:30',
        totalSessions: 20,
        voucherStatus: 'active',
        remainingSessions: 5
      }
    ]);
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVoucherBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expiring': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>My Clients</CardTitle>
              <CardDescription>
                Clients assigned to you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Clients Table */}
          <div className="rounded-md border">
            <Table data-testid="clients-list">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Next Session</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Voucher Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      {client.name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.nextSession ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(client.nextSession).toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No upcoming</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.remainingSessions} left</div>
                        <div className="text-sm text-muted-foreground">
                          {client.totalSessions} total
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getVoucherBadgeVariant(client.voucherStatus)}>
                        {client.voucherStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Notes
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* List info for test visibility */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredClients.length} clients assigned to you
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeClientsPage;