import { MOCK_MESSAGES, MOCK_TUTORS } from '../constants/mockData';

// TODO: replace with API calls when backend messaging endpoints are built
// GET  /api/messages/conversations?userId=
// POST /api/messages

let conversations = MOCK_MESSAGES.map(function(conv) {
  return {
    id: conv.id,
    tutor: MOCK_TUTORS[conv.tutorIndex],
    lastMessage: conv.lastMessage,
    lastTime: conv.lastTime,
    unreadCount: conv.unreadCount,
    messages: conv.messages.slice(),
  };
});

export async function getConversations(userId: string) {
  await new Promise(function(resolve) { setTimeout(resolve, 300); });
  return conversations;
}

export async function sendMessage(conversationId: string, text: string) {
  const newMessage = {
    id: 'msg-' + Date.now(),
    from: 'me',
    text: text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  conversations = conversations.map(function(conv) {
    if (conv.id === conversationId) {
      return {
        id: conv.id,
        tutor: conv.tutor,
        lastMessage: text,
        lastTime: 'just now',
        unreadCount: conv.unreadCount,
        messages: conv.messages.concat([newMessage]),
      };
    }
    return conv;
  });

  return newMessage;
}
