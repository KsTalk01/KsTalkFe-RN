import { db, insertWithUserId, getQuery, getCurrentUserId } from '../utils/dbUtils';

export const createMessagesTable = async (): Promise<void> => {
  try{
  console.log("开始创建message表");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      message_text TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP --消息发送时间,
    );
  `);
  console.log("message表创建成功");
} catch (error) {
  console.error("创建message表时出错:", error.message);
  throw error; // 可选，重新抛出错误以便调用者处理
}
};

export const addMessage = async (conversationId: number, senderId: number, messageText: string): Promise<number> => {
  const query = `INSERT INTO messages (user_id, conversation_id, sender_id, message_text) VALUES (${getCurrentUserId()}, ?, ?, ?);`;
  const result = await getQuery(query, conversationId, senderId, messageText);
  return result.lastInsertRowId;
};

export const getMessagesByConversation = async (conversationId: number): Promise<any[]> => {
  const query = `SELECT * FROM messages WHERE conversation_id = ? AND user_id = ${getCurrentUserId()};`;
  return await getQuery(query, conversationId);
};
