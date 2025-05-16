import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tasks() {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/tasks", {
        title,
        completed: false,
        userId: 1, // Default demo user
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTaskTitle("");
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const res = await apiRequest("PUT", `/api/tasks/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Handler for adding a new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTaskMutation.mutate(newTaskTitle);
    }
  };

  // Handler for toggling task completion
  const handleToggleComplete = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { completed: !task.completed },
    });
  };

  // Handler for deleting a task
  const handleDeleteTask = (id: number) => {
    deleteTaskMutation.mutate(id);
  };

  // Filter tasks
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <>
      <header className="py-4">
        <h1 className="text-2xl font-medium">Tasks</h1>
      </header>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What are you working on?"
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={addTaskMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="w-full mb-8">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 text-center">Loading tasks...</div>
              ) : activeTasks.length > 0 ? (
                <ul className="divide-y divide-border">
                  {activeTasks.map((task) => (
                    <li key={task.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task)}
                          className="h-5 w-5 border-2 border-primary text-primary rounded-full"
                        />
                        <span>{task.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <p>No active tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 text-center">Loading tasks...</div>
              ) : completedTasks.length > 0 ? (
                <ul className="divide-y divide-border">
                  {completedTasks.map((task) => (
                    <li key={task.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task)}
                          className="h-5 w-5 border-2 border-primary text-primary rounded-full"
                        />
                        <span className="line-through text-muted-foreground">{task.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <p>No completed tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
