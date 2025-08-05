import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import { 
  Target, 
  Plus, 
  Calendar, 
  CheckCircle,
  Clock,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Mock data
const goalsData = [
  {
    id: 1,
    title: "Complete React Masterclass",
    description: "Finish all 25 videos in the React Masterclass playlist and build the final project",
    type: "playlist",
    targetDate: "2024-02-15",
    progress: 72,
    current: 18,
    target: 25,
    priority: "high",
    status: "active",
    createdAt: "2024-01-10"
  },
  {
    id: 2,
    title: "Watch 5 videos per week",
    description: "Maintain consistent learning by watching at least 5 educational videos every week",
    type: "habit",
    targetDate: "2024-12-31",
    progress: 80,
    current: 4,
    target: 5,
    priority: "medium",
    status: "active",
    createdAt: "2024-01-01"
  },
  {
    id: 3,
    title: "Learn TypeScript Fundamentals",
    description: "Complete the TypeScript Deep Dive course to improve type safety in projects",
    type: "skill",
    targetDate: "2024-02-01",
    progress: 33,
    current: 6,
    target: 18,
    priority: "high",
    status: "active",
    createdAt: "2024-01-15"
  },
  {
    id: 4,
    title: "Build a Full-Stack Project",
    description: "Apply learned concepts by building a complete web application with React and Node.js",
    type: "project",
    targetDate: "2024-03-01",
    progress: 10,
    current: 2,
    target: 20,
    priority: "low",
    status: "active",
    createdAt: "2024-01-20"
  }
];

const Goals = () => {
  const [goals, setGoals] = useState(goalsData);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    type: "playlist",
    targetDate: "",
    target: "",
    priority: "medium"
  });
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "playlist": return "📚";
      case "habit": return "🔄";
      case "skill": return "🎯";
      case "project": return "🚀";
      default: return "📋";
    }
  };

  const getDaysUntilDeadline = (targetDate: string) => {
    const today = new Date();
    const deadline = new Date(targetDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.targetDate || !newGoal.target) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const goal = {
      id: goals.length + 1,
      ...newGoal,
      progress: 0,
      current: 0,
      target: parseInt(newGoal.target),
      status: "active",
      createdAt: new Date().toISOString().split('T')[0]
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: "",
      description: "",
      type: "playlist",
      targetDate: "",
      target: "",
      priority: "medium"
    });
    setIsCreateDialogOpen(false);

    toast({
      title: "Goal Created!",
      description: "Your new learning goal has been set successfully.",
    });
  };

  const handleDeleteGoal = (goalId: number) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    toast({
      title: "Goal Deleted",
      description: "The goal has been removed from your list.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Learning Goals</h1>
            <p className="text-muted-foreground mt-2">
              Set and track your learning objectives
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a new learning objective to track your progress
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Complete React Course"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your goal in detail..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={newGoal.type}
                      onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                    >
                      <option value="playlist">Playlist</option>
                      <option value="habit">Habit</option>
                      <option value="skill">Skill</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target">Target (number)</Label>
                    <Input
                      id="target"
                      type="number"
                      placeholder="e.g., 25"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateGoal} className="flex-1">
                    Create Goal
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const daysLeft = getDaysUntilDeadline(goal.targetDate);
            const isOverdue = daysLeft < 0;
            const isUrgent = daysLeft <= 7 && daysLeft >= 0;
            
            return (
              <Card key={goal.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(goal.type)}</span>
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-lg leading-tight">
                          <Link to={`/goals/${goal.id}`} className="hover:text-primary transition-colors">
                            {goal.title}
                          </Link>
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(goal.priority)} variant="outline">
                            {goal.priority}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {goal.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/goals/${goal.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Goal
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Goal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <CardDescription className="text-sm line-clamp-2">
                    {goal.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="text-muted-foreground">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-3" />
                    <p className="text-xs text-muted-foreground text-center">
                      {goal.progress}% complete
                    </p>
                  </div>
                  
                  {/* Deadline info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due {new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      isOverdue ? "text-destructive" : isUrgent ? "text-warning" : "text-muted-foreground"
                    }`}>
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">
                        {isOverdue 
                          ? `${Math.abs(daysLeft)} days overdue`
                          : daysLeft === 0 
                          ? "Due today"
                          : `${daysLeft} days left`
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/goals/${goal.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Manage
                      </Link>
                    </Button>
                    {goal.progress === 100 && (
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No goals set yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first learning goal to start tracking your progress
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Goal
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        {goals.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{goals.length}</div>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {goals.filter(g => g.progress === 100).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {goals.filter(g => getDaysUntilDeadline(g.targetDate) <= 7 && getDaysUntilDeadline(g.targetDate) >= 0).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Due Soon</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-foreground">
                    {Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;