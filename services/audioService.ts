// Audio service using Text-to-Speech
import * as Speech from 'expo-speech';

export class AudioService {
  private static isSpeaking = false;

  // Language codes for TTS
  private static languageCodes = {
    japanese: 'ja-JP',
    spanish: 'es-ES',
    arabic: 'ar-SA',
    english: 'en-US',
  };

  static async speak(text: string, language?: string): Promise<void> {
    try {
      if (this.isSpeaking) {
        await this.stop();
      }

      const options = {
        language: language ? this.languageCodes[language as keyof typeof this.languageCodes] || 'en-US' : 'en-US',
        pitch: 1.0,
        rate: 0.8, // Slightly slower for better learning
        voice: this.getVoiceForLanguage(language),
      };

      this.isSpeaking = true;
      await Speech.speak(text, options);
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  static async stop(): Promise<void> {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('Stop TTS Error:', error);
    }
  }

  static isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  static getAvailableVoices(): Promise<Speech.Voice[]> {
    return Speech.getAvailableVoicesAsync();
  }

  private static getVoiceForLanguage(language?: string): string | undefined {
    // You can specify preferred voices for each language
    const preferredVoices = {
      japanese: 'ja-JP',
      spanish: 'es-ES',
      arabic: 'ar-SA',
    };

    return language ? preferredVoices[language as keyof typeof preferredVoices] : undefined;
  }

  // Legacy method for backward compatibility
  static getAudioUrl(text: string, language?: string): string | null {
    // Since we're using TTS, we don't need URLs
    // This method is kept for compatibility with existing code
    return null;
  }

  static async preloadAudio(text: string, language?: string): Promise<string | null> {
    // TTS doesn't require preloading
    return null;
  }
}
