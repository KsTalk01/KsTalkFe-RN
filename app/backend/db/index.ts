import * as SQLite from 'expo-sqlite';
import { setDBInstance } from '../utils/dbUtils';
import { createConversationTable } from '../services/conversationService';
import { createMessagesTable } from '../services/message';

export const openDatabase = async (): Promise<void> => {
  const db = SQLite.openDatabaseSync('ks_talk.db');
  setDBInstance(db);
  await createConversationTable();
  await createMessagesTable();
};
