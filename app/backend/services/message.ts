import { db, runQuery, getQuery, getCurrentUserId } from '../utils/dbUtils';

export const createMessagesTable = async (): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      message_text TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '消息发送时间',
      FOREIGN KEY (conversation_id) REFERENCES conversation(id)
    );
  `);
};

export const addMessage = async (conversationId: number, senderId: number, messageText: string): Promise<number> => {
  const query = `INSERT INTO messages (user_id, conversation_id, sender_id, message_text) VALUES (${getCurrentUserId()}, ?, ?, ?);`;
  const result = await runQuery(query, conversationId, senderId, messageText);
  return result.lastInsertRowId;
};

export const getMessagesByConversation = async (conversationId: number): Promise<any[]> => {
  const query = `SELECT * FROM messages WHERE conversation_id = ? AND user_id = ${getCurrentUserId()};`;
  return await getQuery(query, conversationId);
};
