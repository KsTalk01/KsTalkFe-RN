import {db, insertWithUserId, getQuery, getCurrentUserId} from '../utils/dbUtils';

export const createConversationTable = async (): Promise<void> => {
  console.log("开始创建conversation表");
  try {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS conversation (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          unique_identifier TEXT NOT NULL UNIQUE,
          conversation_type TEXT NOT NULL, --会话类型
          conversation_name TEXT DEFAULT NULL , --会话名称,
          create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP , --创建时间,
          last_activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --最后活动时间，默认为当前时间,
          conversation_status TEXT DEFAULT 'active' , --'会话状态，默认为活跃'
          user_ids TEXT DEFAULT NULL  --包含所有用户的id，以逗号隔开
        );
    `);
    console.log("conversation表创建成功");
  } catch (error) {
    console.error("创建conversation表时出错:", error.message);
    throw error; // 可选，重新抛出错误以便调用者处理
  }
};

//添加会话 ---聊天发送消息时调用，若已存在改状态为active，不存在则重新添加
export const addConversation = async (user1: string, user2: string, conversationType: string, conversationName: string | null, userIds: string | null): Promise<number> => {
  const uniqueIdentifier = generateUniqueIdentifier(user1, user2);
  console.log(uniqueIdentifier);
  // 检查当前会话是否存在
  const checkQuery = `SELECT id FROM conversation WHERE unique_identifier = ?;`;
  const existingConversation = await getQuery(checkQuery, uniqueIdentifier);
  // const result = await existingConversation.getAllAsync;
  // console.log(result);
  console.log("existingConversation",existingConversation);
  console.log(existingConversation.length);


  if (existingConversation.length > 0) {
    console.log("已存在");
    // 修改状态为活跃
    const updateQuery = `UPDATE conversation SET conversation_status = 'active', last_activity_time = CURRENT_TIMESTAMP WHERE id = ?`;
    await getQuery(updateQuery, existingConversation[0].id);
    return existingConversation[0].id;
  } else {
    // 新增会话
    const insertQuery = `INSERT INTO conversation (unique_identifier, conversation_type, conversation_name, user_ids) VALUES (?, ?, ?, ?);`;
    const result = await insertWithUserId(insertQuery, uniqueIdentifier, conversationType, conversationName, userIds);
    return result.lastInsertRowId;
  }
};

//生成会话唯一标识
const generateUniqueIdentifier = (user1: string, user2: string): string => {
  return [user1, user2].sort().join('_');
};

export const getConversationByUsers = async (user1: string, user2: string): Promise<any> => {
  const uniqueIdentifier = generateUniqueIdentifier(user1, user2);
  const query = `SELECT * FROM conversation WHERE unique_identifier = ?;`;
  return await getQuery(query, uniqueIdentifier);
};

//分页获取历史记录
export const getConversationPage = async (page: number, pageSize: number): Promise<any> => {
  // const uniqueIdentifier = generateUniqueIdentifier(user1, user2);
  const start = (page - 1) * pageSize;
  const end = (page - 1) * pageSize+pageSize;
  const query = `
    SELECT * 
    FROM conversation 
    WHERE conversation_status = 'active'
    LIMIT ? , ?;
  `;


  try {
    const conversations = await getQuery(query,start,end);
    console.log("conversations=======>",conversations);

    // const a = conversations.map(task => ({
    //   id: task.id,
    //   user_id: task.user_id,
    //   conversation_name: task.conversation_name,
    //   last_activity_time: task.last_activity_time
    // }));
    // console.log(a);
    return conversations.map(task => ({
      id: task.id,
      user_id: task.user_id,
      conversation_name: task.conversation_name,
      last_activity_time: task.last_activity_time
    }));
  } catch (e) {
    console.log("出错了",e);
  }

};

export const deleteConversation = async (id: number, conversation_status: string): Promise<void> => {
  const update = 'UPDATE conversation SET conversation_status = ? WHERE id = ?';
  await getQuery(update,conversation_status,id);

};
