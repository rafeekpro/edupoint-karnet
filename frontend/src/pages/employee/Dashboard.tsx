import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaySessions: 4,
    weekSessions: 18,
    totalClients: 24,
    completedSessions: 156,
    upcomingToday: 2,
    pendingNotes: 3
  });

  useEffect(() => {
    // In a real app, fetch stats from API
    setStats({
      todaySessions: 4,
      weekSessions: 18,
      totalClients: 24,
      completedSessions: 156,
      upcomingToday: 2,
      pendingNotes: 3
    });
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-teal-100">Service Provider Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingToday} upcoming, {stats.todaySessions - stats.upcomingToday} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekSessions}</div>
            <p className="text-xs text-muted-foreground">Sessions scheduled this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Active clients assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSessions}</div>
            <p className="text-xs text-muted-foreground">Total sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">Client satisfaction rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Notes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingNotes}</div>
            <p className="text-xs text-muted-foreground">Sessions need notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/employee/sessions')}
            >
              <Calendar className="h-8 w-8 mb-2" />
              <span>Sessions</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/employee/clients')}
            >
              <UserCheck className="h-8 w-8 mb-2" />
              <span>Clients</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/employee/calendar')}
            >
              <CalendarDays className="h-8 w-8 mb-2" />
              <span>Calendar</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/employee/notes')}
            >
              <AlertCircle className="h-8 w-8 mb-2" />
              <span>Session Notes</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Management Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your sessions for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">9:00 AM - John Doe</p>
                  <p className="text-sm text-muted-foreground">Physical Therapy</p>
                </div>
                <Badge variant="outline" className="text-green-600">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">10:30 AM - Jane Smith</p>
                  <p className="text-sm text-muted-foreground">Occupational Therapy</p>
                </div>
                <Badge variant="outline" className="text-green-600">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">2:00 PM - Bob Johnson</p>
                  <p className="text-sm text-muted-foreground">Speech Therapy</p>
                </div>
                <Badge variant="outline" className="text-yellow-600">Upcoming</Badge>
              </div>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/employee/calendar')}
            >
              View Full Calendar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Client Activity</CardTitle>
            <CardDescription>Latest updates from your clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm">Session completed with John Doe</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm">Reschedule request from Jane Smith</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <UserCheck className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm">New client assigned: Mary Wilson</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/employee/clients')}
            >
              View All Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

// Component helper
const Badge: React.FC<{ variant: string; className?: string; children: React.ReactNode }> = ({ 
  variant, 
  className = '', 
  children 
}) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
};