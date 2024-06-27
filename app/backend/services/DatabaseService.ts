import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export const openDatabase = async (): Promise<void> => {
  db = await SQLite.openDatabaseAsync('tasks.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL
    );
  `);
};

export const addTask = async (title: string): Promise<number> => {
  const result = await db.runAsync(
      'INSERT INTO tasks (title, completed) VALUES (?, ?)',
      title,
      false
  );
  return result.lastInsertRowId;
};

export const updateTask = async (id: number, completed: boolean): Promise<void> => {
  await db.runAsync(
      'UPDATE tasks SET completed = ? WHERE id = ?',
      completed,
      id
  );
};

export const deleteTask = async (id: number): Promise<void> => {
  await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
};

export const getTask = async (id: number): Promise<{ id: number, title: string, completed: boolean } | null> => {
  const task = await db.getFirstAsync('SELECT * FROM tasks WHERE id = ?', id);
  return task ? { id: task.id, title: task.title, completed: task.completed } : null;
};

export const getAllTasks = async (): Promise<{ id: number, title: string, completed: boolean }[]> => {
  const tasks = await db.getAllAsync('SELECT * FROM tasks');
  // console.log("获取到的任务有========》"+tasks)
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    completed: task.completed,
  }));
};
