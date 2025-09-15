// Audio service using Google Translate TTS
import { Audio } from 'expo-av';

export class AudioService {
  private static currentSound: Audio.Sound | null = null;
  private static isPlaying = false;

  // Google Translate TTS language codes
  private static languageCodes = {
    english: 'en',
    japanese: 'ja',
    spanish: 'es',
    arabic: 'ar',
  };

  static async speak(text: string, language: string = 'english'): Promise<void> {
    try {
      if (this.isPlaying) {
        await this.stop();
      }

      const audioUrl = this.getGoogleTranslateTTSUrl(text, language);
      if (!audioUrl) {
        console.warn('Could not generate TTS URL');
        return;
      }

      // Load and play the audio with proper headers to mimic browser request
      const { sound } = await Audio.Sound.createAsync(
        {
          uri: audioUrl,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://translate.google.com/',
            'Origin': 'https://translate.google.com',
          }
        },
        { shouldPlay: true }
      );

      this.currentSound = sound;
      this.isPlaying = true;

      // Set up completion handler
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
          this.currentSound = null;
        }
      });

    } catch (error) {
      console.error('Google Translate TTS Error:', error);
      this.isPlaying = false;
      this.currentSound = null;
      throw error;
    }
  }

  static async stop(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
      this.isPlaying = false;
    } catch (error) {
      console.error('Stop TTS Error:', error);
    }
  }

  static isCurrentlySpeaking(): boolean {
    return this.isPlaying;
  }

  // Generate Google Translate human voice audio URL
  static getGoogleTranslateTTSUrl(text: string, language: string): string | null {
    try {
      const langCode = this.languageCodes[language as keyof typeof this.languageCodes];
      if (!langCode) {
        console.warn(`Unsupported language: ${language}`);
        return null;
      }

      // URL encode the text
      const encodedText = encodeURIComponent(text);

      // Use the exact same URL that Google Translate website uses for human voices
      // This is the URL that gets called when you click the speaker button on translate.google.com
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&q=${encodedText}&client=tw-ob&ttsspeed=1`;

      return ttsUrl;
    } catch (error) {
      console.error('Error generating TTS URL:', error);
      return null;
    }
  }

  // Preload audio for better performance
  static async preloadAudio(text: string, language: string): Promise<string | null> {
    const audioUrl = this.getGoogleTranslateTTSUrl(text, language);
    if (!audioUrl) return null;

    try {
      // Preload the audio file with proper headers
      await Audio.Sound.createAsync(
        {
          uri: audioUrl,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://translate.google.com/',
            'Origin': 'https://translate.google.com',
          }
        },
        { shouldPlay: false }
      );
      return audioUrl;
    } catch (error) {
      console.error('Error preloading audio:', error);
      return null;
    }
  }

  // Get audio URL for external use
  static getAudioUrl(text: string, language: string): string | null {
    return this.getGoogleTranslateTTSUrl(text, language);
  }
}
