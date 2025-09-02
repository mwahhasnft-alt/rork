import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Mic, Send, Volume2, Pause, Loader, MessageCircle } from 'lucide-react-native';
import { useAIService } from '@/contexts/AIServiceContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CustomHeader } from '@/components/ui/CustomHeader';

const { width, height } = Dimensions.get('window');

// Conversation Ball Animation Component
const ConversationBall = ({ 
  isRecording, 
  isPlayingAudio, 
  isLoading, 
  onPress,
  colors
}: { 
  isRecording: boolean;
  isPlayingAudio: boolean;
  isLoading: boolean;
  onPress: () => void;
  colors: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const waveAnims = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.5),
    new Animated.Value(0.8),
    new Animated.Value(0.4),
    new Animated.Value(0.6),
    new Animated.Value(0.7),
  ]).current;

  useEffect(() => {
    if (isRecording) {
      // Pulsing animation while recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Glow effect
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      // Wave animations
      const animations = waveAnims.map((anim) => 
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 400 + Math.random() * 300,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 400 + Math.random() * 300,
              useNativeDriver: false,
            }),
          ])
        )
      );
      Animated.stagger(80, animations).start();
    } else if (isPlayingAudio) {
      // Speaking animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Glow effect for speaking
      Animated.timing(glowAnim, {
        toValue: 0.7,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      // Wave animations for speaking
      const animations = waveAnims.map((anim) => 
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.6 + 0.4,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.6 + 0.4,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        )
      );
      Animated.stagger(60, animations).start();
    } else {
      // Reset to idle state
      pulseAnim.setValue(1);
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      waveAnims.forEach(anim => anim.setValue(0.3));
    }
  }, [isRecording, isPlayingAudio]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getBallColor = () => {
    if (isRecording) return colors.error;
    if (isPlayingAudio) return colors.success;
    if (isLoading) return colors.warning;
    return colors.tint;
  };

  const getGlowColor = () => {
    if (isRecording) return colors.error + '4D'; // 30% opacity
    if (isPlayingAudio) return colors.success + '4D';
    if (isLoading) return colors.warning + '4D';
    return colors.tint + '4D';
  };

  return (
    <View style={styles.conversationBallContainer}>
      {/* Outer glow rings */}
      <Animated.View 
        style={[
          styles.glowRing,
          {
            opacity: glowAnim,
            backgroundColor: getGlowColor(),
            transform: [{ scale: pulseAnim.interpolate({
              inputRange: [1, 1.15],
              outputRange: [1.2, 1.4]
            }) }]
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.glowRing,
          styles.glowRingSecondary,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5]
            }),
            backgroundColor: getGlowColor(),
            transform: [{ scale: pulseAnim.interpolate({
              inputRange: [1, 1.15],
              outputRange: [1.4, 1.6]
            }) }]
          }
        ]} 
      />
      
      {/* Wave rings for active states */}
      {(isRecording || isPlayingAudio) && (
        <View style={styles.waveRingsContainer}>
          {waveAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveRing,
                {
                  borderColor: getBallColor(),
                  opacity: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.4]
                  }),
                  transform: [{
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.8 + index * 0.1]
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
      )}
      
      {/* Main conversation ball */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.conversationBallTouchable}
      >
        <Animated.View
          style={[
            styles.conversationBall,
            {
              backgroundColor: getBallColor(),
              transform: [
                { scale: Animated.multiply(scaleAnim, pulseAnim) }
              ]
            }
          ]}
        >
          {isLoading ? (
            <Loader color="#FFFFFF" size={32} />
          ) : isRecording ? (
            <Mic color="#FFFFFF" size={32} />
          ) : isPlayingAudio ? (
            <Volume2 color="#FFFFFF" size={32} />
          ) : (
            <MessageCircle color="#FFFFFF" size={32} />
          )}
        </Animated.View>
      </TouchableOpacity>
      
      {/* Status text */}
      <Text style={[styles.conversationBallStatus, { color: colors.placeholder }]}>
        {isRecording ? 'جاري الاستماع...' : 
         isPlayingAudio ? 'يتحدث الآن...' :
         isLoading ? 'يفكر...' : 'اضغط للتحدث أو إيقاف الصوت'}
      </Text>
    </View>
  );
};

// Waveform Animation Component for messages
const WaveformAnimation = ({ isActive, colors }: { isActive: boolean; colors: any }) => {
  const waveAnims = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.5),
    new Animated.Value(0.8),
    new Animated.Value(0.4),
    new Animated.Value(0.6),
  ]).current;

  useEffect(() => {
    if (isActive) {
      const animations = waveAnims.map((anim, index) => 
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        )
      );
      
      Animated.stagger(100, animations).start();
    } else {
      waveAnims.forEach(anim => anim.setValue(0.3));
    }
  }, [isActive]);

  return (
    <View style={styles.waveformContainer}>
      {waveAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              backgroundColor: colors.tint,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 20],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function ChatScreen() {
  const { colors, shadows } = useTheme();
  const {
    messages,
    isLoading,
    isRecording,
    isPlayingAudio,
    playingMessageId,
    sendMessage,
    startRecording,
    stopRecording,
    playAudio,
  } = useAIService();
  
  const [inputText, setInputText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;
  const textInputAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showTextInput) {
      Animated.spring(textInputAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(textInputAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [showTextInput]);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(typingAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      typingAnim.setValue(0);
    }
  }, [isLoading]);

  // Auto-play audio for voice responses
  useEffect(() => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2];
      const lastAIMessage = messages[messages.length - 1];
      
      // Check if last user message was voice input and AI response has audio
      if (!lastAIMessage.isUser && 
          lastUserMessage?.metadata?.wasVoiceInput && 
          lastAIMessage.metadata?.audioUrl &&
          !isPlayingAudio &&
          !isLoading) {
        // Auto-play the AI response
        setTimeout(() => {
          playAudio(lastAIMessage.id, lastAIMessage.metadata?.audioUrl);
        }, 800); // Small delay for better UX
      }
    }
  }, [messages, isPlayingAudio, isLoading, playAudio]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText);
    setInputText('');
    setShowTextInput(false);
  };

  // Enhanced conversation ball press handler
  const handleConversationBallPress = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else if (isPlayingAudio) {
      // Stop current audio playback
      playAudio(playingMessageId || '', '');
    } else if (!isLoading) {
      startRecording();
    }
  }, [isRecording, isPlayingAudio, isLoading, playingMessageId, stopRecording, playAudio, startRecording]);

  const toggleTextInput = () => {
    setShowTextInput(!showTextInput);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <CustomHeader 
        titleEn="Real Estate AI"
        titleAr="عقار AI"
        showLogo={true}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? {
                ...styles.userMessage,
                backgroundColor: colors.tint,
              } : {
                ...styles.aiMessage,
                backgroundColor: colors.card,
                ...shadows.small,
              },
            ]}
          >
            <View style={styles.messageContent}>
              <Text
                style={[
                  styles.messageText,
                  message.isUser 
                    ? { color: '#FFFFFF' } 
                    : { color: colors.text },
                ]}
              >
                {message.text}
              </Text>
              {!message.isUser && (
                <TouchableOpacity
                  style={[
                    styles.audioButton,
                    { backgroundColor: colors.backgroundSecondary },
                    playingMessageId === message.id && isPlayingAudio && { backgroundColor: colors.tint + '20' }
                  ]}
                  onPress={() => playAudio(message.id, message.metadata?.audioUrl)}
                  disabled={isLoading}
                >
                  {playingMessageId === message.id && isPlayingAudio ? (
                    <View style={styles.playingContainer}>
                      <Pause color={colors.tint} size={16} />
                      <WaveformAnimation isActive={true} colors={colors} />
                    </View>
                  ) : (
                    <Volume2 color={colors.tint} size={16} />
                  )}
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.timestamp, { color: colors.placeholder }]}>
              {message.timestamp.toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageContainer, styles.aiMessage, { backgroundColor: colors.card }]}>
            <Animated.View style={[styles.typingIndicator, { opacity: typingAnim }]}>
              <Text style={[styles.typingText, { color: colors.placeholder }]}>يكتب...</Text>
            </Animated.View>
          </View>
        )}
      </ScrollView>

      {/* Main Conversation Ball */}
      <ConversationBall
        isRecording={isRecording}
        isPlayingAudio={isPlayingAudio}
        isLoading={isLoading}
        onPress={handleConversationBallPress}
        colors={colors}
      />
      
      {/* Text Input Overlay */}
      <Animated.View 
        style={[
          styles.textInputOverlay,
          { backgroundColor: colors.card },
          {
            opacity: textInputAnim,
            transform: [{
              translateY: textInputAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0]
              })
            }]
          }
        ]}
        pointerEvents={showTextInput ? 'auto' : 'none'}
      >
        <View style={styles.textInputContainer}>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: colors.input, 
              borderColor: colors.inputBorder,
              color: colors.text
            }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="اكتب رسالتك هنا..."
            placeholderTextColor={colors.placeholder}
            multiline
            textAlign="right"
            autoFocus={showTextInput}
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              { backgroundColor: inputText.trim() ? colors.tint : colors.border }
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Send color={inputText.trim() ? "#FFFFFF" : colors.placeholder} size={20} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Text Input Toggle Button */}
      <TouchableOpacity 
        style={[styles.textToggleButton, { backgroundColor: colors.card }]}
        onPress={toggleTextInput}
      >
        <MessageCircle color={colors.tint} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 200, // Extra space for conversation ball
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'right',
    flex: 1,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  typingIndicator: {
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  audioButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  audioButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  playingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    marginHorizontal: 8,
  },
  waveBar: {
    width: 2,
    marginHorizontal: 0.5,
    borderRadius: 1,
  },
  // Conversation Ball Styles
  conversationBallContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  conversationBallTouchable: {
    zIndex: 10,
  },
  conversationBall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  conversationBallStatus: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    zIndex: 1,
  },
  glowRingSecondary: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  waveRingsContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  waveRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  // Text Input Overlay Styles
  textInputOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 16,
    right: 16,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {},
  textToggleButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 998,
  },
});