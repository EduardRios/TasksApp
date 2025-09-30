import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import useTaskStore from "../store/taskStore";

export default function TaskScreen() {
  const { tasks, addTask, removeTask, toggleTaskStatus } = useTaskStore();
  const [title, setTitle] = useState("");

  const handleAddTask = () => {
    if (title.trim()) {
      addTask({ title });
      setTitle("");
    } else {
      Alert.alert("Invalid Input", "Please enter a task title.");
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
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.taskItem,
              item.completed && styles.taskItemCompleted,
            ]}
          >
            <Pressable
              onPress={() => toggleTaskStatus(item.id)}
              style={styles.taskBody}
            >
              <Text
                style={[
                  styles.taskName,
                  item.completed && styles.taskNameCompleted,
                ]}
              >
                {item.title}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => removeTask(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
