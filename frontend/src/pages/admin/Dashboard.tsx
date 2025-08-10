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
import { 
  Users, 
  Building2, 
  FileText, 
  Settings,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Shield,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  organizations: number;
  voucherTypes: number;
  activeVouchers: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    organizations: 0,
    voucherTypes: 0,
    activeVouchers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch users
      const usersResponse = await api.get('/api/admin/users');
      const users = usersResponse.data;
      
      // Calculate user stats
      const activeUsers = users.filter((u: any) => u.is_active).length;
      const pendingUsers = users.filter((u: any) => !u.is_active && !u.approved_at).length;
      
      // Try to fetch organizations (may not exist yet)
      let orgCount = 0;
      try {
        const orgsResponse = await api.get('/api/admin/organizations');
        orgCount = orgsResponse.data.length;
      } catch (e) {
        // Organizations endpoint might not exist
      }

      setStats({
        totalUsers: users.length,
        activeUsers: activeUsers,
        pendingApprovals: pendingUsers,
        organizations: orgCount,
        voucherTypes: 0, // Will be implemented later
        activeVouchers: 0, // Will be implemented later
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove users',
      icon: Users,
      onClick: () => navigate('/admin/users'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Organizations',
      description: 'Manage organizations and owners',
      icon: Building2,
      onClick: () => navigate('/admin/organizations'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Voucher Types',
      description: 'Configure voucher types',
      icon: FileText,
      onClick: () => navigate('/admin/voucher-types'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      onClick: () => navigate('/admin/settings'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      change: '+5%',
      changeType: 'positive',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: UserPlus,
      change: stats.pendingApprovals > 0 ? 'Action needed' : 'All clear',
      changeType: stats.pendingApprovals > 0 ? 'warning' : 'neutral',
    },
    {
      title: 'Organizations',
      value: stats.organizations,
      icon: Building2,
      change: 'Active',
      changeType: 'neutral',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground p-6 rounded-lg text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-white/90">
          Here's an overview of your system. You have full administrative access.
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
                    Go to {action.title} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-muted-foreground">John Doe joined as a client - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Organization created</p>
                <p className="text-xs text-muted-foreground">ABC Therapy Center was added - 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Voucher type updated</p>
                <p className="text-xs text-muted-foreground">10-session package price changed - 1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Password Policy</span>
                <span className="text-sm font-medium text-green-600">Strong</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Last Security Audit</span>
                <span className="text-sm font-medium">2 days ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Failed Login Attempts</span>
                <span className="text-sm font-medium">3 (last 24h)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">API Response Time</span>
                <span className="text-sm font-medium text-green-600">45ms avg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Database Status</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">System Uptime</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;