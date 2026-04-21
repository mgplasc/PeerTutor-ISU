import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import Avatar from '../components/Avatar';
import { getConversations, getConversation, sendMessage, ConversationDto, MessageDto } from '../services/messageService';
import { useAuth } from '../context/AuthContext';

function MessagesScreen() {
  const auth = useAuth();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<ConversationDto | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

  async function openConversation(conv: ConversationDto) {
    try {
      const full = await getConversation(conv.id);
      setActiveConv(full);
    } catch (err) {
      setActiveConv(conv);
    }
  }

  async function handleSend() {
    if (messageText.trim() === '' || activeConv === null || sending) {
      return;
    }
    if (!activeConv.status || activeConv.status === 'CLOSED') {
      Alert.alert('Conversation Closed', 'This conversation has been closed.');
      return;
    }
    setSending(true);
    try {
      await sendMessage(activeConv.id, messageText.trim());
      setMessageText('');
      const updated = await getConversation(activeConv.id);
      setActiveConv(updated);
      setTimeout(function() {
        if (flatListRef.current && updated.messages.length > 0) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (err) {
      Alert.alert('Error', 'Could not send message. Please try again.');
    }
    setSending(false);
  }

  function getOtherPersonName(conv: ConversationDto) {
    const myId = auth.user.id;
    if (conv.studentId === myId) {
      return (conv.tutorFirstName || '') + ' ' + (conv.tutorLastName || '');
    }
    return (conv.studentFirstName || '') + ' ' + (conv.studentLastName || '');
  }

  function getOtherPersonInitials(conv: ConversationDto) {
    const name = getOtherPersonName(conv);
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  function formatTime(isoString: string) {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  function formatConvTime(isoString: string) {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) { return 'just now'; }
      if (diffMins < 60) { return diffMins + 'm'; }
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) { return diffHours + 'h'; }
      return Math.floor(diffHours / 24) + 'd';
    } catch {
      return '';
    }
  }

  if (loading) {
    return <ActivityIndicator color={COLORS.red} style={styles.spinner} />;
  }

  if (activeConv !== null) {
    const otherName = getOtherPersonName(activeConv);
    const otherInitials = getOtherPersonInitials(activeConv);
    const isClosed = activeConv.status === 'CLOSED';

    return (
      <View style={styles.screen}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={function() {
            setActiveConv(null);
            loadConversations();
          }}>
            <Text style={styles.backBtn}>Back</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatTitle}>{otherName.trim()}</Text>
            <Text style={styles.chatSubtitle}>
              {activeConv.courseNumber}
              {isClosed ? ' · Closed' : ''}
            </Text>
          </View>
        </View>

        {isClosed && (
          <View style={styles.closedBanner}>
            <Text style={styles.closedText}>
              This conversation closed 24 hours after the session.
            </Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={activeConv.messages}
          keyExtractor={function(item: MessageDto) { return item.id; }}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={function() {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }}
          renderItem={function({ item }: { item: MessageDto }) {
            const isMe = item.senderId === auth.user.id;
            return (
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                  {item.content}
                </Text>
                <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
                  {formatTime(item.sentAt)}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyChat}>
              No messages yet. Say hello!
            </Text>
          }
        />

        {!isClosed && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.messageInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.darkGray}
              multiline={true}
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.sendBtnText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
        keyExtractor={function(item: ConversationDto) { return item.id; }}
        contentContainerStyle={styles.convList}
        onRefresh={loadConversations}
        refreshing={loading}
        renderItem={function({ item }: { item: ConversationDto }) {
          const otherName = getOtherPersonName(item);
          const otherInitials = getOtherPersonInitials(item);
          const isClosed = item.status === 'CLOSED';
          return (
            <TouchableOpacity
              style={[styles.convItem, isClosed && styles.convItemClosed]}
              onPress={function() { openConversation(item); }}
            >
              <Avatar initials={otherInitials} bg={COLORS.red} size={48} />
              <View style={styles.convInfo}>
                <View style={styles.convTopRow}>
                  <Text style={styles.convName}>{otherName.trim()}</Text>
                  <Text style={styles.convTime}>
                    {formatConvTime(item.lastMessageTime || item.createdAt)}
                  </Text>
                </View>
                <Text style={styles.convCourse}>{item.courseNumber}</Text>
                <Text style={styles.convLast} numberOfLines={1}>
                  {item.lastMessage || 'No messages yet'}
                </Text>
                {isClosed && (
                  <Text style={styles.closedLabel}>Closed</Text>
                )}
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptyDesc}>
              Messages open automatically when a tutor confirms a session booking.
            </Text>
          </View>
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
  convItemClosed: {
    opacity: 0.7,
  },
  convInfo: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  convCourse: {
    fontSize: 12,
    color: COLORS.red,
    fontWeight: '600',
    marginTop: 2,
  },
  convLast: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  closedLabel: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginTop: 2,
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: COLORS.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 20,
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
  chatHeaderInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  chatSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closedBanner: {
    backgroundColor: COLORS.medGray,
    padding: 10,
    alignItems: 'center',
  },
  closedText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontStyle: 'italic',
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyChat: {
    textAlign: 'center',
    color: COLORS.darkGray,
    marginTop: 40,
    fontSize: 14,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: COLORS.red,
    alignSelf: 'flex-end',
  },
  bubbleText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: COLORS.white,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.medGray,
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.black,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default MessagesScreen;
