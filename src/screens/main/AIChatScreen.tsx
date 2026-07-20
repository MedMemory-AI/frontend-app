import {
  AlertTriangle,
  ArrowUp,
  Bot,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw,
  Square,
  Trash2,
  User,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlobalHeader, Markdown, ScreenContainer } from '../../components';
import { useChatStore, ChatMessage } from '../../stores/chatStore';
import { useAuthStore } from '../../stores';
import { colors, radius, spacing, typography } from '../../theme';

export function AIChatScreen() {
  const [inputText, setInputText] = useState('');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  const toggleSources = (messageId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const {
    messages,
    isStreaming,
    currentStreamingStatus,
    sendMessage,
    retryMessage,
    clearHistory,
    abortStreaming,
  } = useChatStore();

  // Scroll to bottom when messages count changes
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Keep scrolling to bottom as streaming text builds up
  const lastMessageText = messages[messages.length - 1]?.text;
  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [lastMessageText, isStreaming]);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isStreaming) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isStreaming]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isStreaming) return;
    if (useAuthStore.getState().isGuest) {
      Alert.alert('Please login to continue.', '', [
        {
          text: 'OK',
          onPress: () => {
            useAuthStore.getState().exitGuestMode();
          },
        },
      ]);
      return;
    }
    const textToSend = inputText;
    setInputText('');
    Keyboard.dismiss();
    await sendMessage(textToSend);
  };

  const handleStop = () => {
    abortStreaming();
  };

  const handleRetry = async (messageId: string) => {
    await retryMessage(messageId);
  };

  const formatTime = (dateObj: Date | string) => {
    const d = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;
    return d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderMessageItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.sender === 'user';
    const isFailed = item.status === 'failed';
    const showSources = expandedSources[item.id] ?? false;

    return (
      <View style={styles.messageRowWrapper}>
        {!isUser && index > 0 && <View style={styles.aiDivider} />}

        <View
          style={[
            styles.messageRow,
            isUser ? styles.userRow : styles.aiRow,
          ]}
        >
          {/* Bot avatar on the left for AI messages */}
          {!isUser && (
            <View style={styles.avatarWrap}>
              <Bot color={colors.primary} size={18} />
            </View>
          )}

          <View style={[styles.bubbleContainer, isUser ? styles.userBubbleContainer : styles.aiBubbleContainer]}>
            <View
              style={[
                styles.bubble,
                isUser ? styles.userBubble : styles.aiBubble,
                isFailed && styles.failedBubble,
              ]}
            >
              {isUser ? (
                <Text style={styles.userText}>{item.text}</Text>
              ) : item.text ? (
                <Markdown content={item.text} />
              ) : item.status === 'sending' || item.status === 'streaming' ? (
                <Animated.View style={[styles.statusBox, { opacity: pulseAnim }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.statusBoxText}>
                    {currentStreamingStatus || 'Thinking...'}
                  </Text>
                </Animated.View>
              ) : (
                <Text style={styles.errorText}>No response compiled.</Text>
              )}

              {/* Source citations */}
              {item.sources && item.sources.length > 0 && (
                <View style={styles.sourcesWrapper}>
                  <Pressable
                    onPress={() => toggleSources(item.id)}
                    style={({ pressed }) => [
                      styles.sourcesPill,
                      pressed && styles.pressed,
                    ]}
                  >
                    <FileText size={14} color={colors.primary} />
                    <Text style={styles.sourcesPillText}>Sources {item.sources.length}</Text>
                    {showSources ? (
                      <ChevronUp size={14} color={colors.primary} />
                    ) : (
                      <ChevronDown size={14} color={colors.primary} />
                    )}
                  </Pressable>

                  {showSources && (
                    <View style={styles.sourcesContainer}>
                      <View style={styles.sourcesHeaderWrap}>
                        <Text style={styles.sourcesHeader}>Retrieved Records Context:</Text>
                      </View>
                      <View style={styles.sourcesList}>
                        {item.sources.map((source) => (
                          <View key={source.id} style={styles.sourceItem}>
                            <FileText size={12} color={colors.secondary} />
                            <View style={styles.sourceMetaWrap}>
                              <Text style={styles.sourceDocType}>{source.docType}</Text>
                              <Text style={styles.sourceMetaDetails}>
                                {source.date} • {source.doctor || 'Unknown'}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              <Text
                style={[
                  styles.timestamp,
                  isUser ? styles.userTimestamp : styles.aiTimestamp,
                ]}
              >
                {formatTime(item.timestamp)}
              </Text>
            </View>

            {/* Retry trigger for user messages that failed */}
            {isUser && index < messages.length - 1 && messages[index + 1]?.status === 'failed' && (
              <Pressable
                onPress={() => handleRetry(item.id)}
                style={styles.retryButton}
              >
                <RotateCcw size={14} color={colors.error} />
                <Text style={styles.retryText}>Retry query</Text>
              </Pressable>
            )}

            {isFailed && (
              <View style={styles.failedStatusWrap}>
                <AlertTriangle size={14} color={colors.error} />
                <Text style={styles.failedStatusText}>Stream compilation failed.</Text>
              </View>
            )}
          </View>

          {/* User avatar on the right for user messages */}
          {isUser && (
            <View style={[styles.avatarWrap, styles.userAvatarWrap]}>
              <User color={colors.textInverse} size={18} />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer padded={false} safeAreaBottom={false} safeAreaTop={false}>
      <GlobalHeader
        subtitle={isStreaming ? currentStreamingStatus : 'Ready to analyze health memory'}
        rightAction={
          messages.length > 0 ? (
            <Pressable
              onPress={clearHistory}
              style={({ pressed }) => [
                styles.headerActionBtn,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="Clear chat history"
            >
              <Trash2 size={20} color={colors.textSecondary} />
            </Pressable>
          ) : undefined
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 58 + insets.top : 0}
        style={styles.keyboardContainer}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Bot color={colors.primary} size={48} />
            </View>
            <Text style={styles.emptyTitle}>Secure Health AI Assistant</Text>
            <Text style={styles.emptyText}>
              Ask questions about your uploaded medical records, prescriptions,
              lab results, or clinic timeline history.
            </Text>
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggested queries:</Text>
              <Pressable
                onPress={() => setInputText('Summarize my recent lab reports.')}
                style={styles.suggestionItem}
              >
                <Text style={styles.suggestionText}>"Summarize my recent lab reports."</Text>
              </Pressable>
              <Pressable
                onPress={() => setInputText('What medicines am I currently prescribed?')}
                style={styles.suggestionItem}
              >
                <Text style={styles.suggestionText}>"What medicines am I currently prescribed?"</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Input area */}
        <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about your medical history..."
              placeholderTextColor={colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!isStreaming}
            />

            {isStreaming ? (
              <Pressable
                onPress={handleStop}
                style={styles.stopButton}
                accessibilityLabel="Stop response streaming"
              >
                <Square size={16} color={colors.textInverse} fill={colors.textInverse} />
              </Pressable>
            ) : (
              <Pressable
                onPress={handleSend}
                disabled={!inputText.trim()}
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                ]}
                accessibilityLabel="Send message"
              >
                <ArrowUp size={18} color={colors.textInverse} strokeWidth={2.5} />
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    ...typography.label,
    fontSize: 16,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  streamingSubtitle: {
    color: colors.primary,
    fontWeight: '500',
  },
  headerActionBtn: {
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  pressed: {
    opacity: 0.7,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  messageRowWrapper: {
    width: '100%',
  },
  aiDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: spacing.md,
    width: '100%',
  },
  messageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  userRow: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
  },
  aiRow: {
    alignSelf: 'stretch',
    maxWidth: '100%',
  },
  avatarWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  userAvatarWrap: {
    backgroundColor: colors.primary,
  },
  bubbleContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  userBubbleContainer: {
    alignItems: 'flex-end',
  },
  aiBubbleContainer: {
    alignItems: 'stretch',
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryMuted,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  statusBoxText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  aiBubble: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  failedBubble: {
    borderColor: colors.errorLight,
    backgroundColor: colors.errorLight,
  },
  userText: {
    ...typography.body,
    fontSize: 15,
    color: colors.textInverse,
    lineHeight: 22,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  typingStatusText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 10,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTimestamp: {
    color: colors.textTertiary,
  },
  sourcesWrapper: {
    marginTop: spacing.sm,
  },
  sourcesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primaryLight,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    gap: spacing.xs,
  },
  sourcesPillText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  sourcesContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  sourcesHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sourcesHeader: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
  },
  sourcesList: {
    gap: spacing.xs,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.xs,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 0.5,
  },
  sourceMetaWrap: {
    flex: 1,
  },
  sourceDocType: {
    ...typography.label,
    fontSize: 12,
    color: colors.text,
  },
  sourceMetaDetails: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.errorLight,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    marginTop: spacing.xxs,
  },
  retryText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.error,
    fontWeight: '500',
  },
  failedStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  failedStatusText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.error,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  suggestionsTitle: {
    ...typography.label,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  suggestionItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  suggestionText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontSize: 14,
  },
  inputWrapper: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: colors.text,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    maxHeight: 120,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderStrong,
  },
  stopButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
