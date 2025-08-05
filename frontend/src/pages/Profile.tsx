import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import { 
  User, 
  Mail, 
  Calendar, 
  Edit,
  Camera,
  Youtube,
  Settings,
  Shield,
  Bell,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock user data
const userData = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "",
  joinedAt: "2024-01-01",
  stats: {
    totalVideos: 45,
    completedVideos: 35,
    totalWatchTime: "28h 45m",
    streak: 7,
    goalsCompleted: 3
  },
  preferences: {
    emailNotifications: true,
    weeklyReports: true,
    goalReminders: true
  },
  connectedAccounts: {
    youtube: {
      connected: false,
      email: ""
    }
  }
};

const Profile = () => {
  const [user, setUser] = useState(userData);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email
  });
  const { toast } = useToast();

  const handleSaveProfile = () => {
    setUser({
      ...user,
      name: editForm.name,
      email: editForm.email
    });
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive"
      });
      return;
    }
    
    // Mock password change
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    });
    setPasswords({ current: "", new: "", confirm: "" });
    setShowChangePassword(false);
  };

  const handleToggleNotification = (type: keyof typeof user.preferences) => {
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        [type]: !user.preferences[type]
      }
    });
    toast({
      title: "Preferences updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleConnectYoutube = () => {
    // Mock YouTube connection
    setUser({
      ...user,
      connectedAccounts: {
        ...user.connectedAccounts,
        youtube: {
          connected: true,
          email: "john.doe@gmail.com"
        }
      }
    });
    toast({
      title: "YouTube connected",
      description: "You can now import playlists from your YouTube account.",
    });
  };

  const handleDisconnectYoutube = () => {
    setUser({
      ...user,
      connectedAccounts: {
        ...user.connectedAccounts,
        youtube: {
          connected: false,
          email: ""
        }
      }
    });
    toast({
      title: "YouTube disconnected",
      description: "Your YouTube account has been disconnected.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the camera icon to upload a new photo
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={isEditing ? editForm.name : user.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? editForm.email : user.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(user.joinedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Last updated 30 days ago
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                    >
                      Change Password
                    </Button>
                  </div>

                  {showChangePassword && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwords.new}
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleChangePassword}>Update Password</Button>
                        <Button variant="outline" onClick={() => setShowChangePassword(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Connected Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Connected Accounts
                </CardTitle>
                <CardDescription>Manage your connected services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Youtube className="h-8 w-8 text-red-500" />
                      <div>
                        <h4 className="font-medium">YouTube</h4>
                        <p className="text-sm text-muted-foreground">
                          {user.connectedAccounts.youtube.connected 
                            ? `Connected as ${user.connectedAccounts.youtube.email}`
                            : "Connect to import playlists"
                          }
                        </p>
                      </div>
                    </div>
                    {user.connectedAccounts.youtube.connected ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDisconnectYoutube}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleConnectYoutube}>
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Button
                      variant={user.preferences.emailNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleNotification("emailNotifications")}
                    >
                      {user.preferences.emailNotifications ? "On" : "Off"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Reports</h4>
                      <p className="text-sm text-muted-foreground">
                        Get weekly learning progress summaries
                      </p>
                    </div>
                    <Button
                      variant={user.preferences.weeklyReports ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleNotification("weeklyReports")}
                    >
                      {user.preferences.weeklyReports ? "On" : "Off"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Goal Reminders</h4>
                      <p className="text-sm text-muted-foreground">
                        Remind me about upcoming goal deadlines
                      </p>
                    </div>
                    <Button
                      variant={user.preferences.goalReminders ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleNotification("goalReminders")}
                    >
                      {user.preferences.goalReminders ? "On" : "Off"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Statistics</CardTitle>
                <CardDescription>Your learning achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{user.stats.completedVideos}</div>
                    <p className="text-xs text-muted-foreground">Videos Completed</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">{user.stats.goalsCompleted}</div>
                    <p className="text-xs text-muted-foreground">Goals Achieved</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Watch Time</span>
                    <span className="font-medium">{user.stats.totalWatchTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Streak</span>
                    <span className="font-medium">{user.stats.streak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;