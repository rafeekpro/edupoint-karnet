import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  Calendar,
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  FileText,
  ArrowRight
} from 'lucide-react';

interface SessionStats {
  todaySessions: number;
  weekSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  totalClients: number;
  activeClients: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats] = useState<SessionStats>({
    todaySessions: 3,
    weekSessions: 15,
    completedSessions: 120,
    cancelledSessions: 5,
    totalClients: 25,
    activeClients: 18,
  });

  const todaysSessions = [
    {
      time: '09:00',
      client: 'Anna Kowalska',
      type: 'Individual Therapy',
      status: 'completed',
      duration: '60 min',
    },
    {
      time: '10:30',
      client: 'Jan Nowak',
      type: 'Group Session',
      status: 'completed',
      duration: '90 min',
    },
    {
      time: '14:00',
      client: 'Maria Wiśniewska',
      type: 'Individual Therapy',
      status: 'upcoming',
      duration: '60 min',
    },
    {
      time: '16:00',
      client: 'Piotr Zieliński',
      type: 'Consultation',
      status: 'upcoming',
      duration: '45 min',
    },
  ];

  const quickActions = [
    {
      title: 'View Calendar',
      description: 'Manage your schedule',
      icon: Calendar,
      onClick: () => navigate('/therapist/calendar'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'My Sessions',
      description: 'View all sessions',
      icon: Clock,
      onClick: () => navigate('/therapist/sessions'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Clients',
      description: 'Manage client list',
      icon: Users,
      onClick: () => navigate('/therapist/clients'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Reports',
      description: 'Session reports',
      icon: FileText,
      onClick: () => navigate('/therapist/reports'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const statsCards = [
    {
      title: "Today's Sessions",
      value: stats.todaySessions,
      icon: Calendar,
      change: '2 upcoming',
      changeType: 'neutral',
    },
    {
      title: 'This Week',
      value: stats.weekSessions,
      icon: Activity,
      change: '+20% vs last week',
      changeType: 'positive',
    },
    {
      title: 'Active Clients',
      value: stats.activeClients,
      icon: Users,
      change: `${stats.totalClients} total`,
      changeType: 'neutral',
    },
    {
      title: 'Completion Rate',
      value: '96%',
      icon: CheckCircle,
      change: 'Excellent',
      changeType: 'positive',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-600">Completed</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-600">Upcoming</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-400 p-6 rounded-lg text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-white/90">
          You have {stats.todaySessions} sessions scheduled for today. Keep up the great work!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'warning' ? 'text-orange-600' :
                  'text-muted-foreground'
                }`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your sessions for {new Date().toLocaleDateString()}</CardDescription>
            </div>
            <Button onClick={() => navigate('/therapist/calendar')}>
              View Full Calendar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todaysSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{session.time}</p>
                    <p className="text-xs text-muted-foreground">{session.duration}</p>
                  </div>
                  <div>
                    <p className="font-medium">{session.client}</p>
                    <p className="text-sm text-muted-foreground">{session.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(session.status)}
                  {session.status === 'upcoming' && (
                    <Button size="sm" variant="outline">
                      Start Session
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={action.onClick}
              >
                <CardHeader>
                  <div className={`${action.bgColor} ${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="p-0">
                    Open <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Sessions This Month</span>
                <span className="text-sm font-medium">45 / 50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Client Satisfaction</span>
                <span className="text-sm font-medium text-green-600">4.8 / 5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">On-Time Rate</span>
                <span className="text-sm font-medium">98%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Documentation Complete</span>
                <span className="text-sm font-medium">100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Session notes pending</p>
                  <p className="text-xs text-muted-foreground">2 sessions from yesterday</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Schedule conflict tomorrow</p>
                  <p className="text-xs text-muted-foreground">Two sessions at 14:00</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New client assignment</p>
                  <p className="text-xs text-muted-foreground">Review profile before first session</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
