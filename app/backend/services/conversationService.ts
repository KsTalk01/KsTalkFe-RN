import {db, runQuery, getQuery, getCurrentUserId} from '../utils/dbUtils';

export const createConversationTable = async (): Promise<void> => {
  await db.execAsync(`
      CREATE TABLE IF NOT EXISTS conversation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        unique_identifier TEXT NOT NULL UNIQUE,
        conversation_type TEXT NOT NULL COMMENT '会话类型',
        conversation_name TEXT DEFAULT NULL COMMENT '会话名称',
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        last_activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后活动时间，默认为当前时间',
        conversation_status TEXT DEFAULT 'active' COMMENT '会话状态，默认为活跃',
        user_ids TEXT DEFAULT NULL COMMENT '包含所有用户的id，以逗号隔开'
      );
  `);
};

export const addConversation = async (user1: string, user2: string, conversationType: string, conversationName: string | null, userIds: string | null): Promise<number> => {
  const uniqueIdentifier = generateUniqueIdentifier(user1, user2);
  const query = `INSERT INTO conversation (user_id, unique_identifier, conversation_type, conversation_name, user_ids) VALUES (${getCurrentUserId()}, ?, ?, ?, ?);`;
  const result = await runQuery(query, uniqueIdentifier, conversationType, conversationName, userIds);
  return result.lastInsertRowId;
};

const generateUniqueIdentifier = (user1: string, user2: string): string => {
  return [user1, user2].sort().join('_');
};

export const getConversationByUsers = async (user1: string, user2: string): Promise<any> => {
  const uniqueIdentifier = generateUniqueIdentifier(user1, user2);
  const query = `SELECT * FROM conversation WHERE unique_identifier = ? AND user_id = ${getCurrentUserId()};`;
  return await getQuery(query, uniqueIdentifier);
};
