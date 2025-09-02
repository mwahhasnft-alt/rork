// AI Service Configuration
export const AI_CONFIG = {
  // OpenAI/ChatGPT Configuration
  CHAT_API_URL: 'https://toolkit.rork.com/text/llm/',
  
  // Speech-to-Text Configuration
  STT_API_URL: 'https://toolkit.rork.com/stt/transcribe/',
  
  // ElevenLabs Configuration
  ELEVENLABS_API_URL: 'https://api.elevenlabs.io/v1/text-to-speech',
  ELEVENLABS_API_KEY: 'sk_f8c9e2a1b3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', // Demo key
  ELEVENLABS_VOICE_ID: 'pNInz6obpgDQGcFmaJgB', // Arabic voice
  
  // Default voice settings for ElevenLabs
  VOICE_SETTINGS: {
    stability: 0.5,
    similarity_boost: 0.5,
    style: 0.0,
    use_speaker_boost: true,
  },
  
  // Request timeout settings
  REQUEST_TIMEOUT: 30000,
  MAX_RETRIES: 2,
  
  // System prompt for the AI assistant
  SYSTEM_PROMPT: `أنت مساعد عقار ذكي متخصص في السوق العقاري السعودي. تساعد المستخدمين في:
- البحث عن العقارات (شقق، فلل، أراضي، محلات تجارية)
- تقديم المشورة في الشراء والبيع
- تحليل أسعار العقارات والاتجاهات
- معلومات عن الأحياء والمناطق
- النصائح القانونية والمالية العقارية
- التقييم العقاري

أجب باللغة العربية بطريقة مفيدة ومهنية ومختصرة. كن ودوداً ومساعداً وخبيراً في المجال العقاري السعودي.`,
};

// Available ElevenLabs voices
export const AVAILABLE_VOICES = {
  ARABIC_MALE: 'pNInz6obpgDQGcFmaJgB',
  ARABIC_FEMALE: '21m00Tcm4TlvDq8ikWAM', 
  MULTILINGUAL: 'EXAVITQu4vr4xnSDxMaL',
  ENGLISH_MALE: 'TxGEqnHWrfWFTfGW9XjX',
  ENGLISH_FEMALE: 'jsCqWAovK2LkecY7zXl4',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'عذراً، حدث خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.',
  AI_ERROR: 'عذراً، حدث خطأ في الاستجابة. يرجى المحاولة مرة أخرى.',
  TRANSCRIPTION_ERROR: 'لم أتمكن من فهم التسجيل الصوتي. يرجى المحاولة مرة أخرى.',
  PERMISSION_ERROR: 'يرجى السماح بالوصول للميكروفون لاستخدام الميزة الصوتية.',
  RECORDING_ERROR: 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.',
};