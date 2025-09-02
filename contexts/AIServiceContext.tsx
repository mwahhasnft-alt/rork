import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import createContextHook from '@nkzw/create-context-hook';
import { ChatMessage, AIResponse, TranscriptionResult } from '@/types/chat';
import { AI_CONFIG, ERROR_MESSAGES } from '@/constants/ai-config';
import { searchPropertiesForAI } from '@/constants/property-data';

interface AIServiceState {
  messages: ChatMessage[];
  isLoading: boolean;
  isRecording: boolean;
  isPlayingAudio: boolean;
  playingMessageId: string | null;
  currentSound: Audio.Sound | null;
  recording: Audio.Recording | null;
}

interface AIServiceActions {
  sendMessage: (text: string) => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  playAudio: (messageId: string, audioUrl?: string) => Promise<void>;
  clearMessages: () => void;
  addMessage: (message: ChatMessage) => void;
}

const useCreateAIService = () => {
  const [state, setState] = useState<AIServiceState>({
    messages: [
      {
        id: '1',
        text: 'مرحباً! أنا مساعد عقار الذكي. كيف يمكنني مساعدتك اليوم في العثور على العقار المثالي؟',
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      },
    ],
    isLoading: false,
    isRecording: false,
    isPlayingAudio: false,
    playingMessageId: null,
    currentSound: null,
    recording: null,
  });

  const updateState = useCallback((updates: Partial<AIServiceState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [prev.messages[0]], // Keep the welcome message
    }));
  }, []);

  const transcribeAudio = useCallback(async (uri: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const audioFile = {
        uri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`,
      } as any;

      formData.append('audio', audioFile);
      formData.append('language', 'ar');

      const response = await fetch(AI_CONFIG.STT_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: TranscriptionResult = await response.json();
      return result.text || null;
    } catch (error) {
      console.error('Transcription error:', error);
      return null;
    }
  }, []);

  const transcribeAudioWeb = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', 'ar');

      const response = await fetch(AI_CONFIG.STT_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: TranscriptionResult = await response.json();
      return result.text || null;
    } catch (error) {
      console.error('Web transcription error:', error);
      return null;
    }
  }, []);

  const generateSpeech = useCallback(async (text: string, messageId: string): Promise<string | null> => {
    try {
      console.log('Generating speech for text:', text.substring(0, 50) + '...');
      
      // Clean text for better speech synthesis
      const cleanText = text
        .replace(/[\*\#\`\_\~]/g, '') // Remove markdown
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (cleanText.length > 500) {
        // Truncate very long texts for better performance
        console.log('Text truncated for speech generation');
      }
      
      const response = await fetch(`${AI_CONFIG.ELEVENLABS_API_URL}/${AI_CONFIG.ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': AI_CONFIG.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: cleanText.length > 500 ? cleanText.substring(0, 500) + '...' : cleanText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            ...AI_CONFIG.VOICE_SETTINGS,
            stability: 0.6, // Slightly more stable for Arabic
            similarity_boost: 0.7, // Better voice consistency
          },
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        
        if (Platform.OS === 'web') {
          // For web, return blob URL
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log('Speech generated successfully for message:', messageId);
          return audioUrl;
        } else {
          // For native, convert blob to base64
          const reader = new FileReader();
          return new Promise((resolve) => {
            reader.onloadend = () => {
              const base64data = reader.result as string;
              console.log('Speech generated successfully for message:', messageId);
              resolve(base64data);
            };
            reader.readAsDataURL(audioBlob);
          });
        }
      } else {
        console.log('ElevenLabs API error:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.log('Speech generation failed:', error);
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text',
      metadata: {
        wasVoiceInput: state.isRecording || text.includes('[Voice Input]')
      },
    };

    addMessage(userMessage);
    updateState({ isLoading: true });

    try {
      // Search for relevant properties based on user query
      const relevantProperties = searchPropertiesForAI(text);
      
      // Build conversation history for better context
      const conversationMessages = state.messages.slice(-5).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
      }));

      console.log('Sending request to AI API...');
      console.log('Found relevant properties:', relevantProperties.length);
      
      // Create enhanced system prompt with property data
      let enhancedSystemPrompt = AI_CONFIG.SYSTEM_PROMPT;
      
      if (relevantProperties.length > 0) {
        enhancedSystemPrompt += `\n\nالعقارات المتاحة التي تطابق طلب المستخدم:\n`;
        relevantProperties.forEach((property, index) => {
          enhancedSystemPrompt += `\n${index + 1}. ${property.title}\n`;
          enhancedSystemPrompt += `   - السعر: ${property.price.toLocaleString()} ريال سعودي\n`;
          enhancedSystemPrompt += `   - الموقع: ${property.location.district}، ${property.location.city}\n`;
          enhancedSystemPrompt += `   - المساحة: ${property.details.area} متر مربع\n`;
          if (property.details.bedrooms) {
            enhancedSystemPrompt += `   - غرف النوم: ${property.details.bedrooms}\n`;
          }
          if (property.details.bathrooms) {
            enhancedSystemPrompt += `   - دورات المياه: ${property.details.bathrooms}\n`;
          }
          enhancedSystemPrompt += `   - النوع: ${property.type}\n`;
          enhancedSystemPrompt += `   - المواصفات: ${property.features.join('، ')}\n`;
          if (property.agent) {
            enhancedSystemPrompt += `   - الوكيل: ${property.agent.name} - ${property.agent.phone}\n`;
          }
          enhancedSystemPrompt += `   - الوصف: ${property.description}\n`;
        });
        enhancedSystemPrompt += `\nاستخدم هذه المعلومات لتقديم إجابة مفيدة ومفصلة للمستخدم. اذكر العقارات المناسبة مع تفاصيلها وأسعارها.`;
      }
      
      // Create request payload
      const requestPayload = {
        messages: [
          {
            role: 'system',
            content: enhancedSystemPrompt,
          },
          ...conversationMessages,
          {
            role: 'user',
            content: text,
          },
        ],
      };
      
      console.log('Request payload:', JSON.stringify(requestPayload, null, 2));
      
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Request timeout - aborting');
        controller.abort();
      }, 30000); // 30 second timeout
      
      // Add retry logic for network failures
      let response: Response | null = null;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          response = await fetch(AI_CONFIG.CHAT_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
            },
            body: JSON.stringify(requestPayload),
            signal: controller.signal,
          });
          break; // Success, exit retry loop
        } catch (fetchError) {
          console.log(`Fetch attempt ${retryCount + 1} failed:`, fetchError);
          retryCount++;
          
          if (retryCount > maxRetries) {
            throw fetchError; // Re-throw the last error
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
      
      if (!response) {
        throw new Error('Failed to get response after retries');
      }
      
      clearTimeout(timeoutId);

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorText = 'Unknown error';
        try {
          errorText = await response.text();
        } catch (e) {
          console.error('Could not read error response:', e);
        }
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Details: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw API response:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      const cleanedResponse = responseText.trim();

      let result: AIResponse;
      try {
        result = JSON.parse(cleanedResponse);
        console.log('Parsed response:', result);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response that failed to parse:', cleanedResponse);
        
        // Try to handle plain text responses
        if (cleanedResponse && !cleanedResponse.startsWith('{') && !cleanedResponse.startsWith('[')) {
          result = { completion: cleanedResponse };
        } else {
          // If it looks like JSON but failed to parse, show a more helpful error
          throw new Error(`Invalid JSON response from server. Response: ${cleanedResponse.substring(0, 200)}...`);
        }
      }

      const aiResponseText = result.completion || result.message || ERROR_MESSAGES.AI_ERROR;
      
      if (!aiResponseText || aiResponseText.trim() === '') {
        throw new Error('Empty completion in response');
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };

      addMessage(aiMessage);

      // Generate speech for the AI response
      try {
        const audioUrl = await generateSpeech(aiResponseText, aiMessage.id);
        if (audioUrl) {
          // Update message with audio URL
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === aiMessage.id
                ? { ...msg, metadata: { ...msg.metadata, audioUrl } }
                : msg
            ),
          }));
          
          // Auto-play the response if user was using voice
          if (state.messages.length > 0 && 
              state.messages[state.messages.length - 1]?.metadata?.wasVoiceInput) {
            // Small delay to ensure message is rendered and use a ref to avoid dependency issues
            setTimeout(() => {
              // We'll handle auto-play in the UI component instead
              console.log('Voice input detected, audio ready for auto-play');
            }, 500);
          }
        }
      } catch (speechError) {
        console.log('Speech generation failed, continuing without audio:', speechError);
      }

    } catch (error) {
      console.error('AI response error:', error);
      
      // Determine error type for better user feedback
      let fallbackResponse = ERROR_MESSAGES.NETWORK_ERROR;
      
      if (error instanceof TypeError && error.message.includes('Load failed')) {
        fallbackResponse = 'عذراً، لا يمكن الاتصال بالخدمة حالياً. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          fallbackResponse = 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.';
        } else if (error.message.includes('JSON')) {
          fallbackResponse = 'حدث خطأ في معالجة الاستجابة. يرجى المحاولة مرة أخرى.';
        } else if (error.message.includes('HTTP 5')) {
          fallbackResponse = 'الخدمة غير متاحة مؤقتاً. يرجى المحاولة بعد قليل.';
        }
      }
      
      // Add contextual responses based on user input
      const lowerText = text.toLowerCase();
      if (lowerText.includes('شقة') || lowerText.includes('apartment')) {
        fallbackResponse += ' في هذه الأثناء، عند البحث عن شقة، أنصح بتحديد المنطقة المفضلة والميزانية أولاً.';
      } else if (lowerText.includes('فيلا') || lowerText.includes('villa')) {
        fallbackResponse += ' في هذه الأثناء، للبحث عن فيلا، من المهم تحديد المساحة المطلوبة والحي المرغوب.';
      } else if (lowerText.includes('سعر') || lowerText.includes('price')) {
        fallbackResponse += ' في هذه الأثناء، تذكر أن أسعار العقارات تختلف حسب المنطقة والمساحة والمواصفات.';
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'text',
      };
      addMessage(errorMessage);
    } finally {
      updateState({ isLoading: false });
    }
  }, [state.messages, state.isRecording, addMessage, updateState, generateSpeech]);

  const startRecording = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (Platform.OS === 'web') {
        // Web-specific recording implementation
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Try different MIME types for better browser compatibility
          let mimeType = 'audio/webm;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'audio/mp4';
              if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = ''; // Let browser choose
              }
            }
          }
          
          const mediaRecorder = new MediaRecorder(stream, 
            mimeType ? { mimeType } : undefined
          );
          
          const audioChunks: Blob[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };
          
          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Create a mock recording object for web
            const webRecording = {
              getURI: () => audioUrl,
              stopAndUnloadAsync: async () => {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
              }
            };
            
            updateState({ recording: webRecording as any, isRecording: false });
            
            // Process the recording
            updateState({ isLoading: true });
            const transcribedText = await transcribeAudioWeb(audioBlob);
            
            if (transcribedText) {
              await sendMessage(transcribedText);
            } else {
              Alert.alert('Error', ERROR_MESSAGES.TRANSCRIPTION_ERROR);
            }
            
            updateState({ recording: null, isLoading: false });
          };
          
          mediaRecorder.start();
          updateState({ recording: { mediaRecorder, stream } as any, isRecording: true });
          
          // Add visual feedback
          console.log('Started web recording with MIME type:', mimeType || 'default');
          
        } catch (webError) {
          console.error('Web recording failed:', webError);
          Alert.alert('Error', 'Microphone access denied or not supported');
        }
      } else {
        // Native recording implementation
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert('Permission required', ERROR_MESSAGES.PERMISSION_ERROR);
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        // Use high quality recording preset for native platforms
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        updateState({ recording, isRecording: true });
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', ERROR_MESSAGES.RECORDING_ERROR);
    }
  }, [updateState, sendMessage, transcribeAudioWeb]);

  const stopRecording = useCallback(async () => {
    if (!state.recording) return;

    try {
      updateState({ isRecording: false });
      
      if (Platform.OS === 'web') {
        // Web-specific stop recording
        const webRecording = state.recording as any;
        if (webRecording.mediaRecorder && webRecording.mediaRecorder.state === 'recording') {
          webRecording.mediaRecorder.stop();
        }
      } else {
        // Native stop recording
        await state.recording.stopAndUnloadAsync();
        
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const uri = state.recording.getURI();
        if (uri) {
          updateState({ isLoading: true });
          const transcribedText = await transcribeAudio(uri);
          
          if (transcribedText) {
            // Mark as voice input for auto-play response
            await sendMessage(`[Voice Input] ${transcribedText}`);
          } else {
            Alert.alert('Error', ERROR_MESSAGES.TRANSCRIPTION_ERROR);
          }
        }
        
        updateState({ recording: null, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', ERROR_MESSAGES.RECORDING_ERROR);
      updateState({ recording: null, isRecording: false, isLoading: false });
    }
  }, [state.recording, updateState, transcribeAudio, sendMessage]);

  const playAudio = useCallback(async (messageId: string, audioUrl?: string) => {
    try {
      // Stop current audio if playing
      if (state.currentSound) {
        await state.currentSound.unloadAsync();
        updateState({ currentSound: null });
      }

      // Toggle playback if same message
      if (state.playingMessageId === messageId) {
        updateState({ isPlayingAudio: false, playingMessageId: null });
        return;
      }

      updateState({ isPlayingAudio: true, playingMessageId: messageId });
      
      // Haptic feedback for audio start
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (audioUrl && audioUrl !== 'audio_url_placeholder') {
        try {
          // Configure audio session for better playback
          if (Platform.OS !== 'web') {
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: false,
              playsInSilentModeIOS: true,
              shouldDuckAndroid: true,
              playThroughEarpieceAndroid: false,
            });
          }
          
          // Load and play actual audio
          const { sound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { 
              shouldPlay: true,
              volume: 1.0,
              rate: 1.0,
              shouldCorrectPitch: true,
            }
          );
          
          updateState({ currentSound: sound });
          
          // Set up playback status listener
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded) {
              if (status.didJustFinish) {
                updateState({ isPlayingAudio: false, playingMessageId: null, currentSound: null });
                sound.unloadAsync();
                
                // Haptic feedback for audio end
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }
            }
          });
          
        } catch (audioError) {
          console.log('Audio playback failed, using simulation:', audioError);
          // Fallback to simulation with estimated duration
          const estimatedDuration = Math.min(Math.max(audioUrl.length * 50, 2000), 8000);
          setTimeout(() => {
            updateState({ isPlayingAudio: false, playingMessageId: null });
          }, estimatedDuration);
        }
      } else {
        // Simulate audio playback for demo with realistic duration
        console.log('Simulating audio playback for message:', messageId);
        const message = state.messages.find(m => m.id === messageId);
        const estimatedDuration = message ? Math.min(Math.max(message.text.length * 80, 2000), 10000) : 3000;
        
        setTimeout(() => {
          updateState({ isPlayingAudio: false, playingMessageId: null });
        }, estimatedDuration);
      }
      
    } catch (error) {
      console.error('Audio playback error:', error);
      updateState({ isPlayingAudio: false, playingMessageId: null });
    }
  }, [state.currentSound, state.playingMessageId, state.messages, updateState]);

  const actions: AIServiceActions = {
    sendMessage,
    startRecording,
    stopRecording,
    playAudio,
    clearMessages,
    addMessage,
  };

  return {
    ...state,
    ...actions,
  };
};

export const [AIServiceProvider, useAIService] = createContextHook(useCreateAIService);