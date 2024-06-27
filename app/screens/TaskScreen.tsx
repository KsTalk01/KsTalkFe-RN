import React, { useEffect, useState } from 'react';
import { Text, View, Button, FlatList } from 'react-native';
import { openDatabase, addTask, getAllTasks, updateTask, deleteTask } from '../backend/services/DatabaseService';

const TaskScreen = () => {
  const [tasks, setTasks] = useState<{ id: number, title: string, completed: boolean }[]>([]);

  useEffect(() => {
    const initializeDb = async () => {
      await openDatabase();
      const tasks = await getAllTasks();
      setTasks(tasks);
    };

    initializeDb();
  }, []);

  const handleAddTask = async () => {
    await addTask('New Task');
    const updatedTasks = await getAllTasks();
    setTasks(updatedTasks);
  };

  const handleToggleTask = async (id: number, completed: boolean) => {
    await updateTask(id, !completed);
    const updatedTasks = await getAllTasks();
    setTasks(updatedTasks);
  };

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id);
    const updatedTasks = await getAllTasks();
    setTasks(updatedTasks);
  };

  return (
      <View style={{ padding: 20 }}>
        <Button title="Add Task" onPress={handleAddTask} />
        <FlatList
            data={tasks}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
                  <Text style={{ textDecorationLine: item.completed ? 'line-through' : 'none' }}>{item.title}</Text>
                  <Button title="Toggle" onPress={() => handleToggleTask(item.id, item.completed)} />
                  <Button title="Delete" onPress={() => handleDeleteTask(item.id)} />
                </View>
            )}
        />
      </View>
  );
};

export default TaskScreen;
