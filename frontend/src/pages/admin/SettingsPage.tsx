import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Settings,
  Bell,
  Shield,
  Globe,
  Mail,
  Database,
  Clock,
  Calendar,
  DollarSign,
  Save,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showApiKey, setShowApiKey] = useState(false);
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'VouchersKit',
    siteUrl: 'https://voucherskit.com',
    supportEmail: 'support@voucherskit.com',
    timezone: 'Europe/Warsaw',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'PLN',
    language: 'pl',
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@voucherskit.com',
    smtpPassword: '',
    senderName: 'VouchersKit',
    senderEmail: 'noreply@voucherskit.com',
    enableEmailNotifications: true,
    enableSmsNotifications: false,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    requireTwoFactor: false,
    sessionTimeout: '60',
    passwordMinLength: '8',
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: true,
    maxLoginAttempts: '5',
    lockoutDuration: '30',
    apiRateLimit: '1000',
    enableAuditLog: true,
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    defaultSessionDuration: '60',
    minBookingAdvance: '24',
    maxBookingAdvance: '30',
    allowCancellation: true,
    cancellationDeadline: '24',
    allowRescheduling: true,
    reschedulingDeadline: '12',
    workingDaysStart: 'Monday',
    workingDaysEnd: 'Friday',
    workingHoursStart: '08:00',
    workingHoursEnd: '20:00',
    breakDuration: '15',
  });

  // Backup Settings
  const [backupSettings, setBackupSettings] = useState({
    enableAutoBackup: true,
    backupFrequency: 'daily',
    backupTime: '03:00',
    backupRetention: '30',
    backupLocation: 'local',
    backupEncryption: true,
    lastBackup: '2025-08-10 03:00:00',
    nextBackup: '2025-08-11 03:00:00',
  });

  const handleSaveSettings = async (section: string) => {
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  const handleTestEmail = async () => {
    // Test email configuration
    window.alert('Test email sent to ' + emailSettings.senderEmail);
  };

  const handleBackupNow = async () => {
    if (window.confirm('Start manual backup now?')) {
      // Trigger manual backup
      window.alert('Backup started. You will be notified when complete.');
    }
  };

  const handleRestoreBackup = async () => {
    if (window.confirm('Are you sure you want to restore from the last backup? This will overwrite current data.')) {
      // Restore from backup
      window.alert('Restore process started. The system will be unavailable for a few minutes.');
    }
  };

  const handleGenerateApiKey = () => {
    // Generate new API key
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    window.alert('New API Key generated: ' + newKey);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Save Status */}
      {saveStatus === 'saved' && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to save settings. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic system configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={generalSettings.siteUrl}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Warsaw">Europe/Warsaw</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New York</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={generalSettings.dateFormat} onValueChange={(value) => setGeneralSettings({ ...generalSettings, dateFormat: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select value={generalSettings.timeFormat} onValueChange={(value) => setGeneralSettings({ ...generalSettings, timeFormat: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hour</SelectItem>
                      <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={generalSettings.currency} onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLN">PLN (zł)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('general')} disabled={saveStatus === 'saving'}>
                  {saveStatus === 'saving' ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
              <CardDescription>
                Configure email and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    value={emailSettings.senderName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications for bookings and reminders</p>
                  </div>
                  <Switch
                    checked={emailSettings.enableEmailNotifications}
                    onCheckedChange={(checked: boolean) => setEmailSettings({ ...emailSettings, enableEmailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS notifications (requires SMS gateway)</p>
                  </div>
                  <Switch
                    checked={emailSettings.enableSmsNotifications}
                    onCheckedChange={(checked: boolean) => setEmailSettings({ ...emailSettings, enableSmsNotifications: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleTestEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </Button>
                <Button onClick={() => handleSaveSettings('email')} disabled={saveStatus === 'saving'}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
                  </div>
                  <Switch
                    checked={securitySettings.requireTwoFactor}
                    onCheckedChange={(checked: boolean) => setSecuritySettings({ ...securitySettings, requireTwoFactor: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all administrative actions</p>
                  </div>
                  <Switch
                    checked={securitySettings.enableAuditLog}
                    onCheckedChange={(checked: boolean) => setSecuritySettings({ ...securitySettings, enableAuditLog: checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (min)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Lockout Duration (min)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password Requirements</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={securitySettings.passwordRequireUppercase}
                        onCheckedChange={(checked: boolean) => setSecuritySettings({ ...securitySettings, passwordRequireUppercase: checked })}
                      />
                      <Label>Require uppercase letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={securitySettings.passwordRequireLowercase}
                        onCheckedChange={(checked: boolean) => setSecuritySettings({ ...securitySettings, passwordRequireLowercase: checked })}
                      />
                      <Label>Require lowercase letters</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={securitySettings.passwordRequireNumbers}
                        onCheckedChange={(checked: boolean) => setSecuritySettings({ ...securitySettings, passwordRequireNumbers: checked })}
                      />
                      <Label>Require numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={securitySettings.passwordRequireSpecial}
                        onCheckedChange={(checked: boolean) => setSecuritySettings({ ...securitySettings, passwordRequireSpecial: checked })}
                      />
                      <Label>Require special characters</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Settings</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value="sk_live_xxxxxxxxxxxxxxxxxxx"
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" onClick={handleGenerateApiKey}>
                      <Key className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                    <Input
                      id="apiRateLimit"
                      type="number"
                      value={securitySettings.apiRateLimit}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, apiRateLimit: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('security')} disabled={saveStatus === 'saving'}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Settings
              </CardTitle>
              <CardDescription>
                Configure booking rules and schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultSessionDuration">Default Session Duration (min)</Label>
                  <Input
                    id="defaultSessionDuration"
                    type="number"
                    value={bookingSettings.defaultSessionDuration}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, defaultSessionDuration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minBookingAdvance">Min Booking Advance (hours)</Label>
                  <Input
                    id="minBookingAdvance"
                    type="number"
                    value={bookingSettings.minBookingAdvance}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, minBookingAdvance: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBookingAdvance">Max Booking Advance (days)</Label>
                  <Input
                    id="maxBookingAdvance"
                    type="number"
                    value={bookingSettings.maxBookingAdvance}
                    onChange={(e) => setBookingSettings({ ...bookingSettings, maxBookingAdvance: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Cancellations</Label>
                    <p className="text-sm text-muted-foreground">Clients can cancel their bookings</p>
                  </div>
                  <Switch
                    checked={bookingSettings.allowCancellation}
                    onCheckedChange={(checked: boolean) => setBookingSettings({ ...bookingSettings, allowCancellation: checked })}
                  />
                </div>
                {bookingSettings.allowCancellation && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="cancellationDeadline">Cancellation Deadline (hours before)</Label>
                    <Input
                      id="cancellationDeadline"
                      type="number"
                      value={bookingSettings.cancellationDeadline}
                      onChange={(e) => setBookingSettings({ ...bookingSettings, cancellationDeadline: e.target.value })}
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Rescheduling</Label>
                    <p className="text-sm text-muted-foreground">Clients can reschedule their bookings</p>
                  </div>
                  <Switch
                    checked={bookingSettings.allowRescheduling}
                    onCheckedChange={(checked: boolean) => setBookingSettings({ ...bookingSettings, allowRescheduling: checked })}
                  />
                </div>
                {bookingSettings.allowRescheduling && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="reschedulingDeadline">Rescheduling Deadline (hours before)</Label>
                    <Input
                      id="reschedulingDeadline"
                      type="number"
                      value={bookingSettings.reschedulingDeadline}
                      onChange={(e) => setBookingSettings({ ...bookingSettings, reschedulingDeadline: e.target.value })}
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Working Hours</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2 items-center">
                    <Select value={bookingSettings.workingDaysStart} onValueChange={(value) => setBookingSettings({ ...bookingSettings, workingDaysStart: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>to</span>
                    <Select value={bookingSettings.workingDaysEnd} onValueChange={(value) => setBookingSettings({ ...bookingSettings, workingDaysEnd: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Friday">Friday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                        <SelectItem value="Sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="time"
                      value={bookingSettings.workingHoursStart}
                      onChange={(e) => setBookingSettings({ ...bookingSettings, workingHoursStart: e.target.value })}
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={bookingSettings.workingHoursEnd}
                      onChange={(e) => setBookingSettings({ ...bookingSettings, workingHoursEnd: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('booking')} disabled={saveStatus === 'saving'}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Recovery
              </CardTitle>
              <CardDescription>
                Configure automatic backups and data recovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup system data</p>
                </div>
                <Switch
                  checked={backupSettings.enableAutoBackup}
                  onCheckedChange={(checked: boolean) => setBackupSettings({ ...backupSettings, enableAutoBackup: checked })}
                />
              </div>

              {backupSettings.enableAutoBackup && (
                <div className="space-y-4 ml-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Frequency</Label>
                      <Select value={backupSettings.backupFrequency} onValueChange={(value) => setBackupSettings({ ...backupSettings, backupFrequency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backupTime">Time</Label>
                      <Input
                        id="backupTime"
                        type="time"
                        value={backupSettings.backupTime}
                        onChange={(e) => setBackupSettings({ ...backupSettings, backupTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backupRetention">Retention (days)</Label>
                      <Input
                        id="backupRetention"
                        type="number"
                        value={backupSettings.backupRetention}
                        onChange={(e) => setBackupSettings({ ...backupSettings, backupRetention: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backupLocation">Backup Location</Label>
                      <Select value={backupSettings.backupLocation} onValueChange={(value) => setBackupSettings({ ...backupSettings, backupLocation: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local Storage</SelectItem>
                          <SelectItem value="s3">Amazon S3</SelectItem>
                          <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                          <SelectItem value="azure">Azure Blob Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Encryption</Label>
                        <p className="text-sm text-muted-foreground">Encrypt backup files</p>
                      </div>
                      <Switch
                        checked={backupSettings.backupEncryption}
                        onCheckedChange={(checked: boolean) => setBackupSettings({ ...backupSettings, backupEncryption: checked })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Backup Status</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Backup:</span>
                    <span>{backupSettings.lastBackup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Backup:</span>
                    <span>{backupSettings.nextBackup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Backup Size:</span>
                    <span>1.2 GB</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleBackupNow}>
                    <Database className="mr-2 h-4 w-4" />
                    Backup Now
                  </Button>
                  <Button variant="outline" onClick={handleRestoreBackup}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restore Backup
                  </Button>
                </div>
                <Button onClick={() => handleSaveSettings('backup')} disabled={saveStatus === 'saving'}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;