import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { Bar } from "react-native-progress";
import DateTimePicker from "@react-native-community/datetimepicker";
import useTaskStore, { Task } from "../store/taskStore"; // Import store and Task type

// --- Helper Functions (moved outside component for clarity and reusability) ---

/**
 * Calculates the remaining time until a due date.
 * @param dueDate The ISO string of the due date.
 * @returns A formatted string of the time left.
 */
const calculateTimeLeft = (dueDate: string) => {
  const currentTime = new Date().getTime();
  const dueTime = new Date(dueDate).getTime();
  const totalTime = dueTime - currentTime;

  if (totalTime <= 0) return "Overdue";

  const days = Math.floor(totalTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (totalTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

/**
 * Calculates the progress of a task from its creation to its due date.
 * @param dueDate The ISO string of the due date.
 * @param createdAt The ISO string of the creation date (from task.id).
 * @returns A progress value between 0 and 1.
 */
const calculateProgress = (dueDate: string, createdAt: string) => {
  const now = new Date().getTime();
  const due = new Date(dueDate).getTime();
  const start = new Date(parseInt(createdAt)).getTime();

  if (now >= due) return 1; // If overdue, progress is 100%
  if (now <= start || due <= start) return 0;

  const totalDuration = due - start;
  const elapsed = now - start;

  return elapsed / totalDuration;
};

/**
 * Determines the color of the progress bar based on the progress.
 * @param progress The progress value (0 to 1).
 * @returns A color string.
 */
const determineColor = (progress: number) => {
  if (progress >= 1) return "#d9534f"; // Red for overdue
  if (progress > 0.75) return "#f0ad4e"; // Yellow for approaching
  return "#5cb85c"; // Green for tasks with ample time
};

/**
 * A dedicated component to render a single task item.
 * This improves performance by isolating the countdown timer's re-renders
 * to only the specific task item that is updating.
 */
const TaskItem = ({ item }: { item: Task }) => {
  const { toggleTaskStatus, removeTask } = useTaskStore();
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeLeft(item.dueDate)
  );

  const progress = calculateProgress(item.dueDate, item.id);
  const color = determineColor(progress);

  useEffect(() => {
    if (item.completed) return; // Stop timer if task is completed

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(item.dueDate);
      setTimeLeft(newTimeLeft);
      if (newTimeLeft === "Overdue") {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [item.dueDate, item.completed]);

  return (
    <View style={[styles.taskItem, item.completed && styles.taskItemCompleted]}>
      <Pressable
        onPress={() => toggleTaskStatus(item.id)}
        style={styles.taskBody}
      >
        <Text
          style={[styles.taskName, item.completed && styles.taskNameCompleted]}
        >
          {item.title}
        </Text>
        <Text style={styles.taskDate}>
          Due: {new Date(item.dueDate).toLocaleString()}
        </Text>
      </Pressable>

      {!item.completed && (
        <>
          <View style={styles.progressContainer}>
            <Bar
              progress={progress}
              width={null}
              style={{ flex: 1 }}
              color={color}
              unfilledColor="#e9ecef"
              borderColor={item.completed ? "#adb5bd" : "#495057"}
              height={18}
              borderRadius={5}
            />
          </View>
          <Text style={styles.countdownText}>{timeLeft}</Text>
        </>
      )}

      <Pressable
        onPress={() => removeTask(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    </View>
  );
};

/**
 * The main screen component for the Task Manager.
 * It handles user input and displays the list of tasks from the Zustand store.
 */
export default function TaskScreen() {
  // Global state and actions from our Zustand store
  const { tasks, addTask } = useTaskStore();

  // Local UI state for the input form
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddTask = () => {
    if (title.trim()) {
      addTask({ title, dueDate: dueDate.toISOString() });
      setTitle(""); // Reset input
    } else {
      Alert.alert("Invalid Input", "Please enter a task title.");
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Manager</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter task title"
          value={title}
          onChangeText={setTitle}
        />

        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          <Text style={styles.dateButtonText}>
            {`Due: ${dueDate.toLocaleDateString()}`}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="datetime"
            display="default"
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        <Pressable
          onPress={handleAddTask}
          style={({ pressed }) => [
            styles.addButton,
            !title.trim() && styles.addButtonDisabled,
            pressed && styles.buttonPressed,
          ]}
          disabled={!title.trim()}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </Pressable>
      </View>

      <FlatList
        data={[...tasks].sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskItem item={item} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#343a40",
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  dateButton: {
    padding: 12,
    backgroundColor: "#e9ecef",
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#495057",
  },
  addButton: {
    padding: 15,
    backgroundColor: "#28a745",
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  addButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  taskItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  taskItemCompleted: {
    backgroundColor: "#e9ecef",
    borderColor: "#ced4da",
  },
  taskBody: {
    flex: 1,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  taskNameCompleted: {
    textDecorationLine: "line-through",
    color: "#6c757d",
  },
  taskDate: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 14,
    color: "#dc3545",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 4,
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: "flex-end",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
