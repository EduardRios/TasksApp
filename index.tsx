import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable } from 'react-native';
import { Bar } from 'react-native-progress';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TaskApp() {
  // State to hold the task name entered by the user
  const [taskName, setTaskName] = useState(''); 

  // State to store the list of tasks, each task has a name, due date, time left, progress, and color
  const [tasks, setTasks] = useState<{ name: string; dueDate: Date; timeLeft: string; progress: number; color: string }[]>([]);

  // State to hold the selected due date for a task
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); 

  // State to control the visibility of the date picker
  const [showDatePicker, setShowDatePicker] = useState(false); 

  // Function that handles date selection from the date picker
  const onChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Hide the date picker after selecting a date
    if (selectedDate) {
      setSelectedDate(selectedDate); // Set the selected date
    }
  };

  // Calculate the progress bar percentage based on how much time is left until the due date
  const calculateProgress = (dueDate: Date) => {
    const currentTime = new Date().getTime();
    const dueTime = new Date(dueDate).getTime();
    const totalTime = dueTime - currentTime;
    const maxTime = dueTime - new Date().setHours(0, 0, 0, 0); // Time span from now to the start of the day

    const progress = Math.max(0, totalTime / maxTime); // Ensure progress doesn't go negative
    return progress;
  };

  // Calculate the time left until the task's due date
  const calculateTimeLeft = (dueDate: Date) => {
    const currentTime = new Date().getTime();
    const dueTime = new Date(dueDate).getTime();
    const totalTime = dueTime - currentTime;

    if (totalTime <= 0) return 'Time is up'; // Return if the task is overdue

    const days = Math.floor(totalTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((totalTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);

    // Format the remaining time as days, hours, minutes, and seconds
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  // Determine the color of the progress bar based on how close the task is to its due date
  const determineColor = (dueDate: Date) => {
    const currentTime = new Date().getTime();
    const dueTime = new Date(dueDate).getTime();
    const totalTime = dueTime - currentTime;

    const halfTime = (dueTime - new Date().setHours(0, 0, 0, 0)) / 2; // Half of the available time

    if (totalTime <= 0) return '#ff3333'; // Red for overdue tasks
    if (totalTime <= halfTime) return '#ffc107'; // Yellow for approaching tasks
    return '#28a745'; // Green for tasks with ample time
  };

  // Function to add a new task to the task list
  const addTask = () => {
    if (taskName && selectedDate) { // Only add the task if both task name and due date are set
      const timeLeft = calculateTimeLeft(selectedDate); // Calculate the time left for the task
      const progress = calculateProgress(selectedDate); // Calculate the progress
      const color = determineColor(selectedDate); // Determine the color based on time left
      // Add the new task to the list
      setTasks([...tasks, { name: taskName, dueDate: selectedDate, timeLeft, progress, color }]); 
      setTaskName(''); // Clear the task name input
      setSelectedDate(null); // Clear the selected date
    }
  };

  // Function to delete a task by its index
  const deleteTask = (index: number) => {
    setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index)); // Remove the task from the list
  };

  // Effect to update the countdown and progress of each task every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => ({
          ...task,
          timeLeft: calculateTimeLeft(task.dueDate), // Update time left
          progress: calculateProgress(task.dueDate), // Update progress
          color: determineColor(task.dueDate), // Update color
        }))
      );
    }, 1000); // Run every second

    return () => clearInterval(interval); // Clear interval when component unmounts
  }, [tasks]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Manager</Text>

      {/* Input for entering task name */}
      <TextInput
        style={styles.input}
        placeholder="Enter task name"
        value={taskName}
        onChangeText={setTaskName}
      />

      {/* Button to show the date picker */}
      <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>
          {selectedDate
            ? `${selectedDate.toLocaleDateString()} ${selectedDate.toLocaleTimeString()}` // Show selected date and time
            : 'Choose Due Date and Time'}
        </Text>
      </Pressable>

      {/* Show the date picker if activated */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="datetime"
          display="default"
          minimumDate={new Date()} // Prevent selecting past dates
          onChange={onChange} // Handle date selection
        />
      )}

      {/* Button to add the task */}
      <Pressable
        onPress={addTask}
        style={[styles.addButton, (!taskName || !selectedDate) && styles.addButtonDisabled]} // Disable if task name or date is missing
        disabled={!taskName || !selectedDate}
      >
        <Text style={styles.addButtonText}>Add Task</Text>
      </Pressable>

      {/* List of tasks with delete option */}
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()} // Unique key for each item
        renderItem={({ item, index }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskName}>{item.name}</Text>
            <Text style={styles.taskDate}>Due: {item.dueDate.toLocaleString()}</Text>
            <View style={styles.progressContainer}>
              {/* Progress bar representing time left */}
              <Bar
                progress={item.progress} 
                width={null} 
                style={{ flex: 1 }} 
                color={item.color} // Color based on urgency
                unfilledColor="#ccc" // Background color of the progress bar
                borderColor="#000"
                height={20}
                borderRadius={5}
              />
            </View>
            <Text style={styles.countdownText}>{item.timeLeft}</Text>
            {/* Delete button */}
            <Pressable onPress={() => deleteTask(index)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  taskItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  countdownText: {
    fontSize: 16,
    color: '#ff3333',
    marginTop: 5,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#ff3333',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
