import api from './api';

export type MessageDto = {
  id: string;
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
  content: string;
  sentAt: string;
  readByRecipient: boolean;
};

export type ConversationDto = {
  id: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  tutorId: string;
  tutorFirstName: string;
  tutorLastName: string;
  sessionId: string;
  courseNumber: string;
  sessionDate: string;
  status: string;
  closesAt: string;
  createdAt: string;
  messages: MessageDto[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

// GET /api/messages/conversations
export async function getConversations(userId: string): Promise<ConversationDto[]> {
  try {
    const response = await api.get('/api/messages/conversations');
    return response.data as ConversationDto[];
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return [];
  }
}

// GET /api/messages/conversations/:id
export async function getConversation(conversationId: string): Promise<ConversationDto> {
  const response = await api.get('/api/messages/conversations/' + conversationId);
  return response.data as ConversationDto;
}

// POST /api/messages/conversations/:id/send
export async function sendMessage(conversationId: string, content: string): Promise<MessageDto> {
  const response = await api.post(
    '/api/messages/conversations/' + conversationId + '/send',
    { content }
  );
  return response.data as MessageDto;
}
