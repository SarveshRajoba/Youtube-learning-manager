import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Navigation from "@/components/Navigation";
import {
  Plus,
  Trash2,
  Loader2,
  PlayCircle,
  Calendar as CalendarIcon,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  due_date?: string;
}

interface Playlist {
  id: string;
  title: string;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  playlist_id?: string;
  playlist?: {
    title: string;
  };
  todos: Todo[];
  created_at: string;
  updated_at: string;
  target_date?: string;
  status: string;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("none");
  const [newTodoTexts, setNewTodoTexts] = useState<{ [goalId: string]: string }>({});
  const [newTodoDueDates, setNewTodoDueDates] = useState<{ [goalId: string]: Date | undefined }>({});
  const { toast } = useToast();

  const fetchPlaylists = async () => {
    try {
      const response = await api.get("/playlists");
      const playlistsData = (response.data.data || []).map((item: any) => {
        return item.attributes || item;
      });
      setPlaylists(playlistsData);
    } catch (error: any) {
      console.error("Error fetching playlists:", error);
    }
  };

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/goals");
      const goalsData = (response.data.data || []).map((item: any) => {
        const goal = item.attributes || item;
        if (item.id && !goal.id) {
          goal.id = item.id;
        }
        if (!goal.todos || !Array.isArray(goal.todos)) {
          goal.todos = [];
        }
        // Ensure todos have proper structure
        goal.todos = goal.todos.map((todo: any) => ({
          ...todo,
          due_date: todo.due_date || undefined
        }));
        return goal;
      });
      setGoals(goalsData);
    } catch (error: any) {
      console.error("Error fetching goals:", error);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
    fetchGoals();
  }, []);

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a title for your goal",
        variant: "destructive"
      });
      return;
    }

    try {
      const playlistId = selectedPlaylistId === "none" ? null : selectedPlaylistId;

      await api.post("/goals", {
        goal: {
          title: newGoalTitle.trim(),
          description: newGoalDescription.trim() || "",
          playlist_id: playlistId,
          target_date: null,
          current_pct: 0,
          status: "active",
          todos: []
        }
      });

      toast({
        title: "Goal created",
        description: "You can now add todos to this goal",
      });

      setIsCreateDialogOpen(false);
      setNewGoalTitle("");
      setNewGoalDescription("");
      setSelectedPlaylistId("none");
      await fetchGoals();
    } catch (error: any) {
      console.error("Error creating goal:", error);
      const errorMessage = error.response?.data?.errors
        ? (Array.isArray(error.response.data.errors)
          ? error.response.data.errors.join(", ")
          : JSON.stringify(error.response.data.errors))
        : error.message || "Failed to create goal";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const addTodo = async (goalId: string) => {
    const todoText = newTodoTexts[goalId]?.trim();
    if (!todoText) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const existingTodos = Array.isArray(goal.todos) ? goal.todos : [];
      const dueDate = newTodoDueDates[goalId];

      const newTodo: Todo = {
        id: Date.now().toString(),
        text: todoText,
        completed: false,
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined
      };

      const updatedTodos = [...existingTodos, newTodo];

      await api.patch(`/goals/${goalId}`, {
        goal: {
          todos: updatedTodos
        }
      });

      // Clear the input and date for this goal
      setNewTodoTexts({ ...newTodoTexts, [goalId]: "" });
      setNewTodoDueDates({ ...newTodoDueDates, [goalId]: undefined });

      await fetchGoals();

      toast({
        title: "Todo added",
        description: "Todo item added successfully",
      });
    } catch (error: any) {
      console.error("Error adding todo:", error);
      toast({
        title: "Error",
        description: error.response?.data?.errors?.join(", ") || "Failed to add todo",
        variant: "destructive"
      });
    }
  };

  const toggleTodo = async (goalId: string, todoId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const existingTodos = goal.todos || [];
      const updatedTodos = existingTodos.map((todo: Todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      );

      await api.patch(`/goals/${goalId}`, {
        goal: {
          todos: updatedTodos
        }
      });

      await fetchGoals();
    } catch (error: any) {
      console.error("Error toggling todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive"
      });
    }
  };

  const deleteTodo = async (goalId: string, todoId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const existingTodos = goal.todos || [];
      const updatedTodos = existingTodos.filter((todo: Todo) => todo.id !== todoId);

      await api.patch(`/goals/${goalId}`, {
        goal: {
          todos: updatedTodos
        }
      });

      await fetchGoals();
      toast({
        title: "Todo deleted",
        description: "Todo item removed successfully",
      });
    } catch (error: any) {
      console.error("Error deleting todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive"
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!goalId) return;

    try {
      await api.delete(`/goals/${goalId}`);

      toast({
        title: "Goal deleted",
        description: "The goal has been removed.",
      });

      await fetchGoals();
    } catch (error: any) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const updateTodoDueDate = async (goalId: string, todoId: string, dueDate: Date | undefined) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const existingTodos = goal.todos || [];
      const updatedTodos = existingTodos.map((todo: Todo) =>
        todo.id === todoId
          ? { ...todo, due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined }
          : todo
      );

      await api.patch(`/goals/${goalId}`, {
        goal: {
          todos: updatedTodos
        }
      });

      await fetchGoals();
    } catch (error: any) {
      console.error("Error updating todo due date:", error);
      toast({
        title: "Error",
        description: "Failed to update due date",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading goals...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Goals & Todos</h1>
            <p className="text-muted-foreground mt-2">
              Manage your learning goals and track your progress
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
                  Create a goal with optional playlist association
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateGoal();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Master React Hooks"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Add a description..."
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playlist">Attach Playlist (Optional)</Label>
                  <Select
                    value={selectedPlaylistId}
                    onValueChange={setSelectedPlaylistId}
                  >
                    <SelectTrigger id="playlist">
                      <SelectValue placeholder="None - General Goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None - General Goal</SelectItem>
                      {playlists.map((playlist) => (
                        <SelectItem key={playlist.id} value={playlist.id}>
                          {playlist.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Goal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewGoalTitle("");
                      setNewGoalDescription("");
                      setSelectedPlaylistId("none");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first goal to start tracking your learning progress
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {goals.map((goal) => {
              const completedCount = goal.todos.filter(t => t.completed).length;
              const totalCount = goal.todos.length;
              const playlistTitle = goal.playlist?.title || (goal.playlist_id && playlists.find(p => p.id === goal.playlist_id)?.title);

              return (
                <Card key={goal.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {playlistTitle ? (
                        <PlayCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Target className="h-5 w-5 text-primary" />
                      )}
                      <div className="flex-1">
                        <CardTitle>{goal.title}</CardTitle>
                        <CardDescription>
                          {playlistTitle && (
                            <span className="flex items-center gap-1">
                              <PlayCircle className="h-3 w-3" />
                              {playlistTitle}
                            </span>
                          )}
                          {!playlistTitle && goal.description && (
                            <span>{goal.description}</span>
                          )}
                          {(!playlistTitle && !goal.description) && (
                            <span>{completedCount} of {totalCount} todos completed</span>
                          )}
                          {playlistTitle && (
                            <span className="ml-2">• {completedCount} of {totalCount} todos completed</span>
                          )}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Add Todo Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a new todo..."
                        value={newTodoTexts[goal.id] || ""}
                        onChange={(e) => setNewTodoTexts({ ...newTodoTexts, [goal.id]: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTodo(goal.id);
                          }
                        }}
                        className="flex-1"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !newTodoDueDates[goal.id] && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTodoDueDates[goal.id] ? (
                              format(newTodoDueDates[goal.id], "PPP")
                            ) : (
                              <span>Due date (optional)</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={newTodoDueDates[goal.id]}
                            onSelect={(date) => setNewTodoDueDates({ ...newTodoDueDates, [goal.id]: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Button
                        type="button"
                        onClick={() => addTodo(goal.id)}
                        size="icon"
                        disabled={!newTodoTexts[goal.id]?.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Todos List */}
                    {goal.todos.length > 0 ? (
                      <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                        {goal.todos.map((todo) => {
                          const dueDate = todo.due_date ? new Date(todo.due_date) : null;
                          const isOverdue = dueDate && !todo.completed && dueDate < new Date();

                          return (
                            <div
                              key={todo.id}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded hover:bg-background transition-colors",
                                isOverdue && "bg-destructive/10 border border-destructive/20"
                              )}
                            >
                              <Checkbox
                                checked={todo.completed}
                                onCheckedChange={() => toggleTodo(goal.id, todo.id)}
                              />
                              <span
                                className={cn(
                                  "flex-1",
                                  todo.completed && "line-through text-muted-foreground"
                                )}
                              >
                                {todo.text}
                              </span>
                              {dueDate && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "h-8 text-xs",
                                        isOverdue && !todo.completed && "text-destructive"
                                      )}
                                    >
                                      <CalendarIcon className="mr-1 h-3 w-3" />
                                      {format(dueDate, "MMM d, yyyy")}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                      mode="single"
                                      selected={dueDate}
                                      onSelect={(date) => updateTodoDueDate(goal.id, todo.id, date)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              )}
                              {!dueDate && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-xs text-muted-foreground"
                                    >
                                      <CalendarIcon className="mr-1 h-3 w-3" />
                                      Add date
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                      mode="single"
                                      onSelect={(date) => updateTodoDueDate(goal.id, todo.id, date)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => deleteTodo(goal.id, todo.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No todos yet. Add one above!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;