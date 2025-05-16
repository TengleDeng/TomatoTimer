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

export default function TaskList() {
  const [showForm, setShowForm] = useState(false);
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
      setShowForm(false);
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

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg">Current Focus</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </CardHeader>

      {showForm && (
        <CardContent className="pb-3 pt-0">
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What are you working on?"
              className="flex-1"
              autoFocus
            />
            <Button 
              type="submit" 
              disabled={addTaskMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              Save
            </Button>
          </form>
        </CardContent>
      )}

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-center">Loading tasks...</div>
        ) : tasks.length > 0 ? (
          <ul className="divide-y divide-border">
            {tasks.map((task) => (
              <li key={task.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task)}
                    className="h-5 w-5 border-2 border-primary text-primary rounded-full"
                  />
                  <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
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
            <span className="mdi mdi-format-list-checks text-4xl mb-2 block"></span>
            <p>Add a task to focus on</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
