import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Avatar from '../components/Avatar';
import { getConversations, sendMessage } from '../services/messageService';
import { useAuth } from '../context/AuthContext';

type MessageItem = {
  id: string;
  from: string;
  text: string;
  timestamp: string;
};

type ConversationTutor = {
  firstName: string;
  lastName: string;
  avatar: string;
  avatarBg: string;
};

type Conversation = {
  id: string;
  tutor: ConversationTutor;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: MessageItem[];
};

function MessagesScreen() {
  const auth = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(function() {
    loadConversations();
  }, []);

  async function loadConversations() {
    setLoading(true);
    try {
      const data = await getConversations(auth.user.id);
      setConversations(data);
    } catch (err) {
      setConversations([]);
    }
    setLoading(false);
  }

  async function handleSend() {
    if (messageText.trim() === '' || activeConv === null) {
      return;
    }
    try {
      await sendMessage(activeConv.id, messageText.trim());
      setMessageText('');
      await loadConversations();
      const updated = conversations.find(function(c: Conversation) { return c.id === activeConv.id; });
      if (updated !== undefined) {
        setActiveConv(updated);
      }
    } catch (err) {
      // fail silently for now
    }
  }

  if (loading) {
    return <ActivityIndicator color={COLORS.red} style={styles.spinner} />;
  }

  if (activeConv !== null) {
    const tutorName = activeConv.tutor.firstName + ' ' + activeConv.tutor.lastName;

    return (
      <View style={styles.screen}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={function() { setActiveConv(null); }}>
            <Text style={styles.backBtn}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.chatTitle}>{tutorName}</Text>
        </View>

        <FlatList
          data={activeConv.messages}
          keyExtractor={function(item: MessageItem) { return item.id; }}
          contentContainerStyle={styles.messageList}
          renderItem={function({ item }: { item: MessageItem }) {
            const isMe = item.from === 'me';
            return (
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                  {item.text}
                </Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.messageInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.darkGray}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={function(item: Conversation) { return item.id; }}
        contentContainerStyle={styles.convList}
        renderItem={function({ item }: { item: Conversation }) {
          const tutorName = item.tutor.firstName + ' ' + item.tutor.lastName;
          return (
            <TouchableOpacity
              style={styles.convItem}
              onPress={function() { setActiveConv(item); }}
            >
              <Avatar initials={item.tutor.avatar} bg={item.tutor.avatarBg} size={48} />
              <View style={styles.convInfo}>
                <View style={styles.convTopRow}>
                  <Text style={styles.convName}>{tutorName}</Text>
                  <Text style={styles.convTime}>{item.lastTime}</Text>
                </View>
                <Text style={styles.convLast} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No messages yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  spinner: {
    marginTop: 40,
  },
  headerBar: {
    backgroundColor: COLORS.red,
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  convList: {
    padding: 12,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  convInfo: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  convName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  convTime: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  convLast: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: COLORS.red,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  chatHeader: {
    backgroundColor: COLORS.red,
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  messageList: {
    padding: 16,
    gap: 8,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 14,
    padding: 12,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  bubbleMe: {
    backgroundColor: COLORS.red,
    alignSelf: 'flex-end',
  },
  bubbleText: {
    fontSize: 14,
    color: COLORS.black,
  },
  bubbleTextMe: {
    color: COLORS.white,
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.medGray,
  },
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.black,
  },
  sendBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  sendBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.darkGray,
    marginTop: 40,
    fontSize: 14,
  },
});

export default MessagesScreen;
