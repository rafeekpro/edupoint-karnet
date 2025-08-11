import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  status: 'active' | 'inactive';
  clientCount: number;
  sessionsThisMonth: number;
}

const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setEmployees([
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        email: 'sarah@company.com',
        phone: '+1-555-0101',
        specialty: 'Physical Therapy',
        status: 'active',
        clientCount: 15,
        sessionsThisMonth: 42
      },
      {
        id: 2,
        name: 'John Smith',
        email: 'john@company.com',
        phone: '+1-555-0102',
        specialty: 'Occupational Therapy',
        status: 'active',
        clientCount: 12,
        sessionsThisMonth: 38
      },
      {
        id: 3,
        name: 'Maria Garcia',
        email: 'maria@company.com',
        phone: '+1-555-0103',
        specialty: 'Speech Therapy',
        status: 'inactive',
        clientCount: 8,
        sessionsThisMonth: 0
      }
    ]);
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>
                Manage employees in your organization
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead>Sessions (Month)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        {employee.name}
                      </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.specialty}</TableCell>
                    <TableCell>{employee.clientCount}</TableCell>
                    <TableCell>{employee.sessionsThisMonth}</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* List info for test visibility */}
          <div data-testid="employees-list" className="mt-4 text-sm text-muted-foreground">
            Showing {filteredEmployees.length} employees from your organization
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeesPage;