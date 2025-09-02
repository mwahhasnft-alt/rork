# Aqar AI - Real Estate Assistant

A modern React Native app built with Expo that provides an intelligent real estate assistant for the Saudi Arabian market. The app features AI-powered chat with voice input/output capabilities.

## Features

### 🤖 AI Chat Assistant
- **ChatGPT Integration**: Powered by OpenAI's GPT models for intelligent real estate conversations
- **Arabic Language Support**: Specialized for the Saudi Arabian real estate market
- **Context-Aware**: Maintains conversation history for better responses
- **Real Estate Expertise**: Provides advice on buying, selling, property valuation, and market trends

### 🎤 Voice Interaction
- **Speech-to-Text**: Convert voice input to text using Rork's STT API
- **Text-to-Speech**: AI responses can be spoken back using ElevenLabs (optional)
- **Voice Recording**: High-quality audio recording with visual feedback
- **Audio Playback**: Play AI responses with waveform animations

### 📱 Modern UI/UX
- **iOS-Style Design**: Clean, minimalistic interface with smooth animations
- **Chat Bubbles**: WhatsApp-style conversation interface
- **Voice Controls**: Large microphone button for easy voice input
- **Loading States**: Typing indicators and pulse animations
- **Bottom Navigation**: Easy access to different app sections

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: React Context with @nkzw/create-context-hook
- **Navigation**: Expo Router (file-based routing)
- **Audio**: Expo AV for recording and playback
- **Icons**: Lucide React Native
- **Styling**: React Native StyleSheet

## API Integrations

### 1. ChatGPT (OpenAI)
- **Endpoint**: `https://toolkit.rork.com/text/llm/`
- **Purpose**: AI conversation and real estate assistance
- **Features**: Context-aware responses, Arabic language support

### 2. Speech-to-Text
- **Endpoint**: `https://toolkit.rork.com/stt/transcribe/`
- **Purpose**: Convert voice recordings to text
- **Supported Formats**: WAV, M4A, MP3
- **Language**: Arabic (ar) with auto-detection

### 3. ElevenLabs (Text-to-Speech) - Optional
- **Endpoint**: `https://api.elevenlabs.io/v1/text-to-speech/`
- **Purpose**: Convert AI responses to natural speech
- **Features**: Multiple voice options, Arabic support
- **Setup Required**: API key and voice ID configuration

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)
- Physical device for testing (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aqar-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure ElevenLabs (Optional)**
   
   If you want to enable text-to-speech functionality:
   
   a. Sign up for ElevenLabs account at https://elevenlabs.io
   b. Get your API key from the dashboard
   c. Choose a voice ID (or create a custom voice)
   d. Update `constants/ai-config.ts`:
   
   ```typescript
   export const AI_CONFIG = {
     // ... other config
     ELEVENLABS_API_KEY: 'your_actual_api_key_here',
     ELEVENLABS_VOICE_ID: 'your_chosen_voice_id_here',
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run on device/simulator**
   - Scan QR code with Expo Go app (recommended for testing voice features)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## Project Structure

```
app/
├── (tabs)/                 # Tab-based navigation
│   ├── index.tsx          # Chat screen (main)
│   ├── properties.tsx     # Property listings
│   ├── analytics.tsx      # Market analytics
│   ├── profile.tsx        # User profile
│   └── settings.tsx       # App settings
├── _layout.tsx            # Root layout with providers
└── +not-found.tsx         # 404 page

contexts/
└── AIServiceContext.tsx   # AI service state management

constants/
├── ai-config.ts           # AI API configuration
└── colors.ts              # App color scheme

types/
├── chat.ts                # Chat-related types
└── property.ts            # Property-related types
```

## Key Components

### AIServiceContext
Centralized state management for:
- Chat messages and conversation history
- Recording state and audio playback
- AI API calls and error handling
- Speech-to-text transcription
- Text-to-speech generation

### Chat Screen Features
- **Real-time messaging**: Instant message display with timestamps
- **Voice recording**: Press and hold microphone for voice input
- **Audio playback**: Play AI responses with visual feedback
- **Typing indicators**: Shows when AI is processing
- **Error handling**: User-friendly error messages
- **Conversation context**: Maintains chat history for better AI responses

## Customization

### Modifying AI Behavior
Edit the system prompt in `constants/ai-config.ts`:

```typescript
SYSTEM_PROMPT: `أنت مساعد عقار ذكي متخصص في السوق العقاري السعودي...`
```

### Adding New Voice Options
Update `AVAILABLE_VOICES` in `constants/ai-config.ts` with ElevenLabs voice IDs.

### Styling Changes
All styles are in StyleSheet objects within components. The app uses iOS-style design patterns with:
- System colors (#007AFF for primary, #8E8E93 for secondary)
- Rounded corners and soft shadows
- Right-to-left text alignment for Arabic

## Troubleshooting

### Common Issues

1. **JSON Parse Error**
   - Fixed with improved error handling in AI response parsing
   - App now handles both JSON and plain text responses

2. **Voice Recording Not Working**
   - Ensure microphone permissions are granted
   - Test on physical device (simulators have limited audio support)
   - Check that Expo AV is properly configured

3. **ElevenLabs Integration**
   - Verify API key is correctly set in ai-config.ts
   - Check voice ID is valid
   - Monitor API usage limits

4. **Network Issues**
   - Ensure stable internet connection
   - Check API endpoints are accessible
   - Review console logs for detailed error messages

### Development Tips

- Use physical device for testing voice features
- Enable remote debugging for better error tracking
- Check Expo logs for detailed error information
- Test with different network conditions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review console logs for error details
- Test on physical device if using simulator
- Ensure all API keys are properly configured