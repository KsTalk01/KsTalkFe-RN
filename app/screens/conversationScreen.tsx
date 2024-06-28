import React, { useEffect, useState } from 'react';
import { Text, View, Button, FlatList } from 'react-native';
import {
  deleteConversation,
  addConversation,
  getConversationPage
} from '../backend/services/conversationService';
import { openDatabase } from '../backend/db/index';
import { setCurrentUserId } from '../backend/utils/dbUtils';


const ConversationScreen = () => {
  const [conversations, setConversations] = useState<{ id: number, title: string, completed: boolean }[]>([]);

  useEffect(() => {
    const initializeDb = async () => {
      setCurrentUserId("1");
      await openDatabase();
      const conversations = await getConversationPage(1,10);
      setConversations(conversations);
    };

    initializeDb();
  }, []);

  const handleAddTask = async () => {
    await addConversation("1","2","1","zhangs22","aa");
    const updatedConversations = await getConversationPage(1,10);
    setConversations(updatedConversations);
  };



  const handleDeleteTask = async (id: number) => {
    console.log(id);
    await deleteConversation(id,"noActive");
    const updatedConversations = await getConversationPage(1,10);;
    setConversations(updatedConversations);
  };

  return (
      <View style={{ padding: 20 }}>
        <Button title="Add Task" onPress={handleAddTask} />
        <FlatList
            data={conversations}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
                  <Text style={{ textDecorationLine: item.conversation_status=='active' ? 'line-through' : 'none' }}>{item.conversation_name}</Text>
                  {/*<Button title="Toggle" onPress={() => handleToggleTask(item.id, item.completed)} />*/}
                  <Button title="Delete" onPress={() => handleDeleteTask(item.id)} />
                </View>
            )}
        />
      </View>
  );
};

export default ConversationScreen;
