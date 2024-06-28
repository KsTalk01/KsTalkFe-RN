import * as SQLite from 'expo-sqlite';
import { setDBInstance } from '../utils/dbUtils';
import { createConversationTable } from '../services/conversationService';
import { createMessagesTable } from '../services/message';

export const openDatabase = async (): Promise<void> => {
  const db = SQLite.openDatabaseAsync('ks_talk.db');
  setDBInstance(await db);
  await createConversationTable();
  await createMessagesTable();
};
