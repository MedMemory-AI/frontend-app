import { create } from 'zustand';

import { getAccessToken } from '../api/tokenStorage';
import { API_BASE_URL } from '../constants';

export type ChatSource = {
  id: string;
  docType: string;
  date: string;
  doctor?: string;
};

export type ChatMessage = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  status: 'sending' | 'streaming' | 'sent' | 'failed';
  timestamp: Date;
  sources?: ChatSource[];
};

type ChatState = {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentStreamingStatus: string;
  activeXhr: XMLHttpRequest | null;
};

type ChatActions = {
  sendMessage: (text: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  clearHistory: () => void;
  abortStreaming: () => void;
  streamResponse: (query: string, aiMessageId: string) => Promise<void>;
};

export type ChatStore = ChatState & ChatActions;

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  currentStreamingStatus: '',
  activeXhr: null,

  sendMessage: async (text: string) => {
    if (!text.trim()) return;

    const userMessageId = generateId();
    const aiMessageId = generateId();

    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: text.trim(),
      status: 'sent',
      timestamp: new Date(),
    };

    const aiMessage: ChatMessage = {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      status: 'sending',
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage, aiMessage],
    }));

    await get().streamResponse(text, aiMessageId);
  },

  retryMessage: async (messageId: string) => {
    const { messages } = get();
    const userMsgIndex = messages.findIndex((m) => m.id === messageId);
    if (userMsgIndex === -1) return;

    const userMsg = messages[userMsgIndex];
    const nextMsg = messages[userMsgIndex + 1];
    let aiMsgId = '';

    const newMessages = [...messages];

    // Check if next message is AI, we can reuse it
    if (nextMsg && nextMsg.sender === 'ai') {
      aiMsgId = nextMsg.id;
      newMessages[userMsgIndex + 1] = {
        ...nextMsg,
        text: '',
        status: 'sending',
        sources: [],
        timestamp: new Date(),
      };
    } else {
      aiMsgId = generateId();
      newMessages.splice(userMsgIndex + 1, 0, {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        status: 'sending',
        timestamp: new Date(),
      });
    }

    set({ messages: newMessages });
    await get().streamResponse(userMsg.text, aiMsgId);
  },

  clearHistory: () => {
    get().abortStreaming();
    set({ messages: [] });
  },

  abortStreaming: () => {
    const { activeXhr } = get();
    if (activeXhr) {
      activeXhr.abort();
      set({ activeXhr: null, isStreaming: false, currentStreamingStatus: '' });
    }
  },

  streamResponse: async (query: string, aiMessageId: string) => {
    get().abortStreaming(); // Abort any active streaming

    set({ isStreaming: true, currentStreamingStatus: 'Connecting to medical brain...' });

    try {
      const token = await getAccessToken();
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/chat/stream`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      set({ activeXhr: xhr });

      let processedLength = 0;
      let buffer = '';

      const updateAiMessage = (updates: Partial<ChatMessage>) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === aiMessageId ? { ...msg, ...updates } : msg
          ),
        }));
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 3 || xhr.readyState === 4) {
          try {
            const text = xhr.responseText;
            const newText = text.substring(processedLength);
            processedLength = text.length;
            buffer += newText;

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (let line of lines) {
              line = line.trim();
              if (line.startsWith('data:')) {
                const dataStr = line.slice(5).trim();
                if (dataStr) {
                  try {
                    const data = JSON.parse(dataStr);
                    if (data.event === 'status') {
                      set({ currentStreamingStatus: data.status });
                      updateAiMessage({ status: 'streaming' });
                    } else if (data.event === 'token') {
                      set((state) => ({
                        messages: state.messages.map((msg) => {
                          if (msg.id === aiMessageId) {
                            return {
                              ...msg,
                              text: msg.text + data.token,
                              status: 'streaming',
                            };
                          }
                          return msg;
                        }),
                      }));
                    } else if (data.event === 'final') {
                      updateAiMessage({
                        text: data.data?.answer || '',
                        sources: data.data?.sources || [],
                        status: 'sent',
                      });
                    } else if (data.event === 'error') {
                      updateAiMessage({
                        text: data.status || 'An error occurred during query compiling.',
                        status: 'failed',
                      });
                    }
                  } catch {
                    // Ignore syntax errors for partial lines
                  }
                }
              }
            }
          } catch (err) {
            console.error('Error parsing streaming response:', err);
          }
        }

        if (xhr.readyState === 4) {
          // Process final remaining buffer
          if (buffer.trim()) {
            const line = buffer.trim();
            if (line.startsWith('data:')) {
              const dataStr = line.slice(5).trim();
              if (dataStr) {
                try {
                  const data = JSON.parse(dataStr);
                  if (data.event === 'final') {
                    updateAiMessage({
                      text: data.data?.answer || '',
                      sources: data.data?.sources || [],
                      status: 'sent',
                    });
                  } else if (data.event === 'error') {
                    updateAiMessage({
                      text: data.status || 'An error occurred during query compiling.',
                      status: 'failed',
                    });
                  }
                } catch {}
              }
            }
          }

          // If stream finished and status is still sending/streaming/pending, finalize it
          const currentMsg = get().messages.find((m) => m.id === aiMessageId);
          if (currentMsg && (currentMsg.status === 'sending' || currentMsg.status === 'streaming')) {
            updateAiMessage({ status: 'sent' });
          }

          set({ isStreaming: false, currentStreamingStatus: '', activeXhr: null });
        }
      };

      xhr.onerror = () => {
        updateAiMessage({
          text: 'Network connection failed. Please check your internet connection.',
          status: 'failed',
        });
        set({ isStreaming: false, currentStreamingStatus: '', activeXhr: null });
      };

      xhr.ontimeout = () => {
        updateAiMessage({
          text: 'Request timed out. Please try again.',
          status: 'failed',
        });
        set({ isStreaming: false, currentStreamingStatus: '', activeXhr: null });
      };

      xhr.send(JSON.stringify({ query }));
    } catch (err) {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                text: err instanceof Error ? err.message : 'An unexpected error occurred.',
                status: 'failed',
              }
            : msg
        ),
      }));
      set({ isStreaming: false, currentStreamingStatus: '', activeXhr: null });
    }
  },
}));
