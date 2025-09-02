export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'voice' | 'property' | 'image';
  metadata?: {
    audioUrl?: string;
    duration?: number;
    propertyId?: string;
    imageUrl?: string;
    wasVoiceInput?: boolean;
  };
}

export interface VoiceRecording {
  uri: string;
  duration: number;
  size: number;
}

export interface AIResponse {
  completion?: string;
  message?: string;
  suggestions?: string[];
  properties?: string[];
  intent?: 'search' | 'info' | 'general' | 'booking';
}

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence?: number;
}