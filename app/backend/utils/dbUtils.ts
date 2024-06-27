import { SQLiteDatabase } from 'expo-sqlite';

let db: SQLiteDatabase;
let currentUserId: number | null = null;

export const setDBInstance = (database: SQLiteDatabase) => {
  db = database;
};

export const setCurrentUserId = (userId: number) => {
  currentUserId = userId;
};

export const getCurrentUserId = () => {
  return currentUserId;
};

export const runQuery = async (query: string, ...params: any[]): Promise<any> => {
  if (!currentUserId) {
    throw new Error('Current user ID is not set');
  }
  // 手动将 user_id 添加到查询中
  const updatedQuery = query.replace(';', ` AND user_id = ${currentUserId};`);
  return await db.execAsync(updatedQuery);
};

export const getQuery = async (query: string, ...params: any[]): Promise<any> => {
  if (!currentUserId) {
    throw new Error('Current user ID is not set');
  }
  // 手动将 user_id 添加到查询中
  const updatedQuery = query.replace(';', ` AND user_id = ${currentUserId};`);
  return await db.execAsync(updatedQuery);
};

export { db };
