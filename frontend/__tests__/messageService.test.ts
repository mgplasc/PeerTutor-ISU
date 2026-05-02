// __tests__/messageService.test.ts
// Unit tests for messaging service functions
// run: npx jest __tests__/messageService.test.ts

import api from '../src/services/api';
import {
  getConversations,
  getConversation,
  sendMessage,
} from '../src/services/messageService';

const mockApi = api as jest.Mocked<typeof api>;

const mockConversation = {
  id: 'conv-uuid-1',
  studentId: 'student-uuid',
  studentFirstName: 'Jane',
  studentLastName: 'Doe',
  tutorId: 'tutor-uuid',
  tutorFirstName: 'Alice',
  tutorLastName: 'Smith',
  sessionId: 'session-uuid',
  courseNumber: 'IT 168',
  sessionDate: '2026-04-25',
  status: 'OPEN',
  closesAt: '2026-04-26T14:00:00',
  createdAt: '2026-04-24T10:00:00',
  messages: [],
  lastMessage: '',
  lastMessageTime: '2026-04-24T10:00:00',
  unreadCount: 0,
};

const mockMessage = {
  id: 'msg-uuid-1',
  senderId: 'student-uuid',
  senderFirstName: 'Jane',
  senderLastName: 'Doe',
  content: 'Hi, can we meet tomorrow?',
  sentAt: '2026-04-24T10:05:00',
  readByRecipient: false,
};

describe('messageService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getConversations ───

  describe('getConversations', () => {
    it('returns conversations list on success', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [mockConversation] });

      const result = await getConversations('student-uuid');

      expect(mockApi.get).toHaveBeenCalledWith('/api/messages/conversations');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('conv-uuid-1');
      expect(result[0].courseNumber).toBe('IT 168');
    });

    it('returns empty array on network error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await getConversations('student-uuid');
      expect(result).toEqual([]);
    });

    it('returns empty array when user has no conversations', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });

      const result = await getConversations('student-uuid');
      expect(result).toEqual([]);
    });
  });

  // ─── getConversation ────

  describe('getConversation', () => {
    it('returns full conversation with messages', async () => {
      const convWithMessages = {
        ...mockConversation,
        messages: [mockMessage],
        lastMessage: 'Hi, can we meet tomorrow?',
        unreadCount: 1,
      };
      mockApi.get.mockResolvedValueOnce({ data: convWithMessages });

      const result = await getConversation('conv-uuid-1');

      expect(mockApi.get).toHaveBeenCalledWith('/api/messages/conversations/conv-uuid-1');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('Hi, can we meet tomorrow?');
      expect(result.unreadCount).toBe(1);
    });

    it('throws on 403 - user not part of conversation', async () => {
      mockApi.get.mockRejectedValueOnce({
        response: { status: 403, data: { error: 'Forbidden' } },
      });

      await expect(getConversation('conv-uuid-1')).rejects.toBeTruthy();
    });
  });

  // ─── sendMessage ───

  describe('sendMessage', () => {
    it('sends a message and returns message DTO', async () => {
      mockApi.post.mockResolvedValueOnce({ data: mockMessage });

      const result = await sendMessage('conv-uuid-1', 'Hi, can we meet tomorrow?');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/messages/conversations/conv-uuid-1/send',
        { content: 'Hi, can we meet tomorrow?' }
      );
      expect(result.content).toBe('Hi, can we meet tomorrow?');
      expect(result.senderId).toBe('student-uuid');
    });

    it('throws when conversation is closed', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'This conversation is closed' } },
      });

      await expect(sendMessage('conv-uuid-1', 'hello')).rejects.toBeTruthy();
    });

    it('throws on empty content', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Message content cannot be empty' } },
      });

      await expect(sendMessage('conv-uuid-1', '')).rejects.toBeTruthy();
    });
  });

  // ─── conversation status logic ───

  describe('conversation status', () => {
    it('identifies OPEN conversation correctly', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { ...mockConversation, status: 'OPEN' } });

      const result = await getConversation('conv-uuid-1');
      expect(result.status).toBe('OPEN');
    });

    it('identifies CLOSED conversation correctly', async () => {
      const closed = { ...mockConversation, status: 'CLOSED' };
      mockApi.get.mockResolvedValueOnce({ data: closed });

      const result = await getConversation('conv-uuid-1');
      expect(result.status).toBe('CLOSED');
    });
  });
});
