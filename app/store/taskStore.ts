import { create } from 'zustand';

// 1. Define the shape of a task
export interface Task {
  id: string;
  title: string;
  dueDate: string; // Using string for simplicity
  completed: boolean;
}

// 2. Define the shape of the store's state and actions
interface TaskState {
  tasks: Task[];
  addTask: (task: { title: string; dueDate: string }) => void;
  toggleTaskStatus: (id: string) => void;
  removeTask: (id: string) => void;
}

/**
 * This is the Zustand store for managing tasks.
 * It centralizes the state and logic for tasks,
 * making it accessible throughout the application in a clean and efficient way.
 */
const useTaskStore = create<TaskState>((set) => ({
  // Initial state
  tasks: [],

  // Action to add a new task
  addTask: (task) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...task,
          id: Date.now().toString(), // Simple unique ID generation
          completed: false,
        },
      ],
    })),

  // Action to toggle the completion status of a task
  toggleTaskStatus: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    })),

  // Action to remove a task
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
}));

export default useTaskStore;
