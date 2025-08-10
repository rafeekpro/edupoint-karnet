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
import { Progress } from '../../components/ui/progress';
import { 
  Calendar,
  Clock,
  CreditCard,
  Users,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Package,
  ShoppingCart
} from 'lucide-react';

interface VoucherInfo {
  id: string;
  type: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  expiryDate: string;
  status: 'active' | 'expired' | 'used';
}

interface UpcomingSession {
  id: string;
  date: string;
  time: string;
  therapist: string;
  type: string;
  status: 'confirmed' | 'pending' | 'completed';
  duration: string;
}

interface ClientStats {
  activeVouchers: number;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  therapists: number;
  nextSession: string | null;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats] = useState<ClientStats>({
    activeVouchers: 2,
    totalSessions: 20,
    completedSessions: 8,
    upcomingSessions: 2,
    therapists: 3,
    nextSession: 'Tomorrow at 10:00 AM',
  });

  const [vouchers] = useState<VoucherInfo[]>([
    {
      id: '1',
      type: 'Individual Therapy - 10 Sessions',
      sessionsTotal: 10,
      sessionsUsed: 4,
      sessionsRemaining: 6,
      expiryDate: '2025-05-15',
      status: 'active',
    },
    {
      id: '2',
      type: 'Group Therapy - 5 Sessions',
      sessionsTotal: 5,
      sessionsUsed: 1,
      sessionsRemaining: 4,
      expiryDate: '2025-06-30',
      status: 'active',
    },
  ]);

  const [upcomingSessions] = useState<UpcomingSession[]>([
    {
      id: '1',
      date: 'Tomorrow',
      time: '10:00 AM',
      therapist: 'Dr. Anna Kowalska',
      type: 'Individual Therapy',
      status: 'confirmed',
      duration: '60 min',
    },
    {
      id: '2',
      date: 'Friday',
      time: '2:00 PM',
      therapist: 'Dr. Jan Nowak',
      type: 'Group Session',
      status: 'confirmed',
      duration: '90 min',
    },
  ]);

  const quickActions = [
    {
      title: 'Book Session',
      description: 'Schedule your next session',
      icon: Calendar,
      onClick: () => navigate('/client/book-session'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'My Vouchers',
      description: 'View and manage vouchers',
      icon: CreditCard,
      onClick: () => navigate('/client/vouchers'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Purchase Voucher',
      description: 'Buy new voucher packages',
      icon: ShoppingCart,
      onClick: () => navigate('/client/purchase'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Session History',
      description: 'View past sessions',
      icon: Clock,
      onClick: () => navigate('/client/sessions'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const statsCards = [
    {
      title: 'Active Vouchers',
      value: stats.activeVouchers,
      icon: Package,
      change: `${stats.totalSessions - stats.completedSessions} sessions remaining`,
      changeType: 'neutral',
    },
    {
      title: 'Completed Sessions',
      value: stats.completedSessions,
      icon: CheckCircle,
      change: '+2 this month',
      changeType: 'positive',
    },
    {
      title: 'Upcoming Sessions',
      value: stats.upcomingSessions,
      icon: Calendar,
      change: stats.nextSession || 'None scheduled',
      changeType: 'neutral',
    },
    {
      title: 'Your Therapists',
      value: stats.therapists,
      icon: Users,
      change: 'Active',
      changeType: 'neutral',
    },
  ];

  const getVoucherProgress = (voucher: VoucherInfo) => {
    return (voucher.sessionsUsed / voucher.sessionsTotal) * 100;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="outline" className="text-green-600">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-gray-600">Completed</Badge>;
      case 'active':
        return <Badge variant="outline" className="text-blue-600">Active</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-600">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-lg text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-white/90">
          You have {stats.upcomingSessions} upcoming sessions. Your next session is {stats.nextSession}.
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

      {/* Active Vouchers */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Active Vouchers</CardTitle>
              <CardDescription>Track your session packages and usage</CardDescription>
            </div>
            <Button onClick={() => navigate('/client/purchase')} variant="outline">
              Purchase New Voucher
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{voucher.type}</h3>
                    <p className="text-sm text-muted-foreground">
                      Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(voucher.status)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sessions Used</span>
                    <span className="font-medium">
                      {voucher.sessionsUsed} / {voucher.sessionsTotal}
                    </span>
                  </div>
                  <Progress value={getVoucherProgress(voucher)} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {voucher.sessionsRemaining} sessions remaining
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/client/book-session')}
                  >
                    Book Session
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/client/vouchers/${voucher.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </div>
            <Button onClick={() => navigate('/client/sessions')}>
              View All Sessions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">{session.date}</p>
                    <p className="text-lg font-bold">{session.time}</p>
                    <p className="text-xs text-muted-foreground">{session.duration}</p>
                  </div>
                  <div>
                    <p className="font-medium">{session.therapist}</p>
                    <p className="text-sm text-muted-foreground">{session.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(session.status)}
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
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

      {/* Progress & Recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Sessions This Month</span>
                <span className="text-sm font-medium">4 / 6 scheduled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Attendance Rate</span>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Treatment Duration</span>
                <span className="text-sm font-medium">3 months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Sessions Completed</span>
                <span className="text-sm font-medium">{stats.completedSessions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Book your next session</p>
                  <p className="text-xs text-muted-foreground">You have available sessions to use</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Consider group therapy</p>
                  <p className="text-xs text-muted-foreground">Join our support groups for additional help</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Voucher expiring soon</p>
                  <p className="text-xs text-muted-foreground">Use your remaining sessions before May 15</p>
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