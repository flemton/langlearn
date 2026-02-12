// Google Translate service for fetching translations and TTS
export class GoogleTranslateService {
  private static readonly BASE_URL = 'https://translate.googleapis.com/translate_a/single';

  // Language codes mapping
  private static readonly languageCodes = {
    english: 'en',
    japanese: 'ja',
    spanish: 'es',
    arabic: 'ar',
  };

  // Translate text from source language to target language
  static async translateText(
    text: string,
    fromLanguage: string = 'english',
    toLanguage: string
  ): Promise<string> {
    try {
      const fromCode = this.languageCodes[fromLanguage as keyof typeof this.languageCodes];
      const toCode = this.languageCodes[toLanguage as keyof typeof this.languageCodes];

      if (!fromCode || !toCode) {
        throw new Error(`Unsupported language: ${fromLanguage} or ${toLanguage}`);
      }

      // Google Translate API parameters
      const params = new URLSearchParams({
        client: 'gtx',
        sl: fromCode,  // source language
        tl: toCode,    // target language
        dt: 't',       // return translation
        q: text,       // text to translate
      });

      const response = await fetch(`${this.BASE_URL}?${params}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();

      // Parse Google Translate response format
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }

      throw new Error('Invalid translation response format');
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to original text if translation fails
      return text;
    }
  }

  // Get TTS audio URL for text in specified language
  static getTTSUrl(text: string, language: string): string | null {
    try {
      const langCode = this.languageCodes[language as keyof typeof this.languageCodes];
      if (!langCode) {
        console.warn(`Unsupported language for TTS: ${language}`);
        return null;
      }

      const encodedText = encodeURIComponent(text);
      return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&total=1&idx=0&textlen=${text.length}&client=tw-ob&prev=input&ttsspeed=1`;
    } catch (error) {
      console.error('Error generating TTS URL:', error);
      return null;
    }
  }

  // Batch translate multiple texts
  static async translateBatch(
    texts: string[],
    fromLanguage: string = 'english',
    toLanguage: string
  ): Promise<string[]> {
    const translations: string[] = [];

    for (const text of texts) {
      const translation = await this.translateText(text, fromLanguage, toLanguage);
      translations.push(translation);
    }

    return translations;
  }

  // Detect language of text
  static async detectLanguage(text: string): Promise<string | null> {
    try {
      const params = new URLSearchParams({
        client: 'gtx',
        sl: 'auto',  // auto-detect source language
        tl: 'en',    // target language (doesn't matter for detection)
        dt: 't',
        q: text,
      });

      const response = await fetch(`${this.BASE_URL}?${params}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`Language detection API error: ${response.status}`);
      }

      const data = await response.json();

      // Extract detected language from response
      if (data && data[2]) {
        const detectedCode = data[2];

        // Map back to our language names
        for (const [name, code] of Object.entries(this.languageCodes)) {
          if (code === detectedCode) {
            return name;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Language detection error:', error);
      return null;
    }
  }

  // Get supported languages
  static getSupportedLanguages(): string[] {
    return Object.keys(this.languageCodes);
  }

  // Get language code
  static getLanguageCode(language: string): string | null {
    return this.languageCodes[language as keyof typeof this.languageCodes] || null;
  }
}
