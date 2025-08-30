// Data service for managing lesson content and user progress
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Lesson {
  id: number;
  title: string;
  description: string;
  content: LessonContent[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
}

export interface LessonContent {
  type: 'text' | 'vocabulary' | 'grammar' | 'exercise';
  text?: string;
  word?: string;
  romaji?: string;
  pronunciation?: string;
  example?: string;
  meaning?: string;
  explanation?: string;
  question?: string;
  options?: string[];
  correctAnswer?: number;
}

export interface UserProgress {
  language: string;
  completedLessons: number[];
  currentStreak: number;
  totalLessonsCompleted: number;
  lastStudyDate: string;
  totalStudyTime: number; // in minutes
}

export class DataService {
  private static LESSONS_CACHE_KEY = 'lessons_cache';
  private static PROGRESS_CACHE_KEY = 'user_progress';
  private static CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Fetch lessons from API or cache
  static async getLessons(language: string): Promise<Lesson[]> {
    try {
      // Try to get from cache first
      const cached = await this.getCachedLessons(language);
      if (cached) {
        return cached;
      }

      // For now, skip API call and use demo data directly
      // This prevents 404 errors from non-existent API
      const lessons = this.getDemoLessons(language);

      // Cache the results
      await this.cacheLessons(language, lessons);

      return lessons;
    } catch (error) {
      console.warn('Using demo data due to API unavailability');
      // Return fallback demo data
      return this.getDemoLessons(language);
    }
  }

  private static async fetchLessonsFromAPI(language: string): Promise<Lesson[]> {
    // Replace with your actual API endpoint
    const response = await fetch(`https://your-api.com/api/lessons/${language}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return this.transformAPIData(data);
  }

  private static transformAPIData(apiData: any): Lesson[] {
    // Transform API response to match our Lesson interface
    return apiData.lessons.map((lesson: any) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content_items.map((item: any) => ({
        type: item.type,
        text: item.text,
        word: item.word,
        romaji: item.romaji,
        pronunciation: item.pronunciation,
        example: item.example,
        meaning: item.meaning,
        explanation: item.explanation,
        question: item.question,
        options: item.options,
        correctAnswer: item.correct_answer,
      })),
      difficulty: lesson.difficulty,
      estimatedTime: lesson.estimated_time,
    }));
  }

  private static async getCachedLessons(language: string): Promise<Lesson[] | null> {
    try {
      const cacheKey = `${this.LESSONS_CACHE_KEY}_${language}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (!cachedData) return null;

      const { data, timestamp } = JSON.parse(cachedData);

      // Check if cache is expired
      if (Date.now() - timestamp > this.CACHE_EXPIRY) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  private static async cacheLessons(language: string, lessons: Lesson[]): Promise<void> {
    try {
      const cacheKey = `${this.LESSONS_CACHE_KEY}_${language}`;
      const cacheData = {
        data: lessons,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching lessons:', error);
    }
  }

  // User Progress Management
  static async getUserProgress(language: string): Promise<UserProgress> {
    try {
      const progressKey = `${this.PROGRESS_CACHE_KEY}_${language}`;
      const progressData = await AsyncStorage.getItem(progressKey);

      if (progressData) {
        return JSON.parse(progressData);
      }
    } catch (error) {
      console.error('Error reading user progress:', error);
    }

    // Return default progress
    return {
      language,
      completedLessons: [],
      currentStreak: 0,
      totalLessonsCompleted: 0,
      lastStudyDate: '',
      totalStudyTime: 0,
    };
  }

  static async updateUserProgress(language: string, progress: Partial<UserProgress>): Promise<void> {
    try {
      const currentProgress = await this.getUserProgress(language);
      const updatedProgress = { ...currentProgress, ...progress };

      const progressKey = `${this.PROGRESS_CACHE_KEY}_${language}`;
      await AsyncStorage.setItem(progressKey, JSON.stringify(updatedProgress));

      // Sync with server if online
      await this.syncProgressWithServer(updatedProgress);
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  }

  static async markLessonComplete(language: string, lessonId: number, studyTime: number = 0): Promise<void> {
    const progress = await this.getUserProgress(language);

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      progress.totalLessonsCompleted += 1;
    }

    progress.lastStudyDate = new Date().toISOString().split('T')[0];
    progress.totalStudyTime += studyTime;

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (progress.lastStudyDate === yesterday || progress.lastStudyDate === today) {
      progress.currentStreak += 1;
    } else {
      progress.currentStreak = 1;
    }

    await this.updateUserProgress(language, progress);
  }

  private static async syncProgressWithServer(progress: UserProgress): Promise<void> {
    try {
      // Only sync if user is logged in and online
      const authToken = await this.getAuthToken();
      if (!authToken) return;

      await fetch('https://your-api.com/api/progress/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(progress),
      });
    } catch (error) {
      console.warn('Failed to sync progress with server:', error);
    }
  }

  private static async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  // Demo data fallback - comprehensive lessons
  private static getDemoLessons(language: string): Lesson[] {
    const demoData: Record<string, Lesson[]> = {
      japanese: [
        {
          id: 1,
          title: 'Hiragana Basics',
          description: 'Learn the fundamental Japanese script',
          difficulty: 'beginner',
          estimatedTime: 15,
          content: [
            { type: 'text', text: 'Hiragana is the fundamental Japanese script used for native words. These are the basic vowel sounds.' },
            { type: 'vocabulary', word: 'あ (a)', romaji: 'a', meaning: 'a (as in father)' },
            { type: 'vocabulary', word: 'い (i)', romaji: 'i', meaning: 'i (as in machine)' },
            { type: 'vocabulary', word: 'う (u)', romaji: 'u', meaning: 'u (as in ruler)' },
            { type: 'vocabulary', word: 'え (e)', romaji: 'e', meaning: 'e (as in red)' },
            { type: 'vocabulary', word: 'お (o)', romaji: 'o', meaning: 'o (as in orange)' },
            { type: 'text', text: 'Now let\'s learn the K sounds combined with vowels.' },
            { type: 'vocabulary', word: 'か (ka)', romaji: 'ka', meaning: 'ka' },
            { type: 'vocabulary', word: 'き (ki)', romaji: 'ki', meaning: 'ki' },
            { type: 'vocabulary', word: 'く (ku)', romaji: 'ku', meaning: 'ku' },
            { type: 'vocabulary', word: 'け (ke)', romaji: 'ke', meaning: 'ke' },
            { type: 'vocabulary', word: 'こ (ko)', romaji: 'ko', meaning: 'ko' },
            { type: 'text', text: 'Practice these basic combinations:' },
            { type: 'vocabulary', word: 'あか (aka)', romaji: 'aka', meaning: 'red' },
            { type: 'vocabulary', word: 'いけ (ike)', romaji: 'ike', meaning: 'pond' },
            { type: 'vocabulary', word: 'おおきい (ookii)', romaji: 'ookii', meaning: 'big' },
          ],
        },
        {
          id: 2,
          title: 'Katakana Basics',
          description: 'Master the second Japanese script',
          difficulty: 'beginner',
          estimatedTime: 15,
          content: [
            { type: 'text', text: 'Katakana is used for foreign words, onomatopoeic expressions, and emphasis. Let\'s start with the basics.' },
            { type: 'vocabulary', word: 'ア (a)', romaji: 'a', meaning: 'a' },
            { type: 'vocabulary', word: 'イ (i)', romaji: 'i', meaning: 'i' },
            { type: 'vocabulary', word: 'ウ (u)', romaji: 'u', meaning: 'u' },
            { type: 'vocabulary', word: 'エ (e)', romaji: 'e', meaning: 'e' },
            { type: 'vocabulary', word: 'オ (o)', romaji: 'o', meaning: 'o' },
            { type: 'text', text: 'Katakana is commonly used for foreign loanwords:' },
            { type: 'vocabulary', word: 'パン (pan)', romaji: 'pan', meaning: 'bread' },
            { type: 'vocabulary', word: 'テレビ (terebi)', romaji: 'terebi', meaning: 'television' },
            { type: 'vocabulary', word: 'コーヒー (koohii)', romaji: 'koohii', meaning: 'coffee' },
            { type: 'vocabulary', word: 'サッカー (sakka)', romaji: 'sakka', meaning: 'soccer' },
            { type: 'vocabulary', word: 'アメリカ (amerika)', romaji: 'amerika', meaning: 'America' },
          ],
        },
        {
          id: 3,
          title: 'Basic Greetings',
          description: 'Essential phrases for daily conversation',
          difficulty: 'beginner',
          estimatedTime: 10,
          content: [
            { type: 'text', text: 'Japanese greetings are essential for daily communication. Let\'s learn the most common ones.' },
            { type: 'vocabulary', word: 'こんにちは', romaji: 'konnichiwa', meaning: 'hello (daytime)' },
            { type: 'vocabulary', word: 'おはようございます', romaji: 'ohayou gozaimasu', meaning: 'good morning' },
            { type: 'vocabulary', word: 'こんばんは', romaji: 'konbanwa', meaning: 'good evening' },
            { type: 'vocabulary', word: 'さようなら', romaji: 'sayounara', meaning: 'goodbye' },
            { type: 'vocabulary', word: 'ありがとう', romaji: 'arigatou', meaning: 'thank you' },
            { type: 'vocabulary', word: 'すみません', romaji: 'sumimasen', meaning: 'excuse me/sorry' },
            { type: 'vocabulary', word: 'お願いします', romaji: 'onegaishimasu', meaning: 'please' },
            { type: 'vocabulary', word: 'はい', romaji: 'hai', meaning: 'yes' },
            { type: 'vocabulary', word: 'いいえ', romaji: 'iie', meaning: 'no' },
            { type: 'text', text: 'Practice these phrases in context:' },
            { type: 'vocabulary', word: 'おはようございます。今日はいい天気ですね。', romaji: 'Ohayou gozaimasu. Kyou wa ii tenki desu ne.', meaning: 'Good morning. It\'s nice weather today, isn\'t it?' },
          ],
        },
        {
          id: 4,
          title: 'Numbers 1-10',
          description: 'Count in Japanese',
          difficulty: 'beginner',
          estimatedTime: 12,
          content: [
            { type: 'text', text: 'Learning numbers is fundamental for counting, telling time, and shopping in Japanese.' },
            { type: 'vocabulary', word: '一 (ichi)', romaji: 'ichi', meaning: 'one' },
            { type: 'vocabulary', word: '二 (ni)', romaji: 'ni', meaning: 'two' },
            { type: 'vocabulary', word: '三 (san)', romaji: 'san', meaning: 'three' },
            { type: 'vocabulary', word: '四 (yon)', romaji: 'yon', meaning: 'four' },
            { type: 'vocabulary', word: '五 (go)', romaji: 'go', meaning: 'five' },
            { type: 'vocabulary', word: '六 (roku)', romaji: 'roku', meaning: 'six' },
            { type: 'vocabulary', word: '七 (nana)', romaji: 'nana', meaning: 'seven' },
            { type: 'vocabulary', word: '八 (hachi)', romaji: 'hachi', meaning: 'eight' },
            { type: 'vocabulary', word: '九 (kyuu)', romaji: 'kyuu', meaning: 'nine' },
            { type: 'vocabulary', word: '十 (juu)', romaji: 'juu', meaning: 'ten' },
            { type: 'text', text: 'Practice counting:' },
            { type: 'vocabulary', word: '一、二、三 (ichi, ni, san)', romaji: 'ichi, ni, san', meaning: 'one, two, three' },
          ],
        },
        {
          id: 5,
          title: 'Family Members',
          description: 'Vocabulary for your family',
          difficulty: 'beginner',
          estimatedTime: 10,
          content: [
            { type: 'text', text: 'Family vocabulary is important for conversations about relationships and introductions.' },
            { type: 'vocabulary', word: '家族 (kazoku)', romaji: 'kazoku', meaning: 'family' },
            { type: 'vocabulary', word: '父 (chichi)', romaji: 'chichi', meaning: 'father' },
            { type: 'vocabulary', word: '母 (haha)', romaji: 'haha', meaning: 'mother' },
            { type: 'vocabulary', word: '息子 (musuko)', romaji: 'musuko', meaning: 'son' },
            { type: 'vocabulary', word: '娘 (musume)', romaji: 'musume', meaning: 'daughter' },
            { type: 'vocabulary', word: '兄 (ani)', romaji: 'ani', meaning: 'older brother' },
            { type: 'vocabulary', word: '姉 (ane)', romaji: 'ane', meaning: 'older sister' },
            { type: 'vocabulary', word: '弟 (otouto)', romaji: 'otouto', meaning: 'younger brother' },
            { type: 'vocabulary', word: '妹 (imouto)', romaji: 'imouto', meaning: 'younger sister' },
            { type: 'text', text: 'Example sentence:' },
            { type: 'vocabulary', word: '私の家族は五人です (watashi no kazoku wa gonin desu)', romaji: 'watashi no kazoku wa gonin desu', meaning: 'My family has five people' },
          ],
        },
      ],
      spanish: [
        {
          id: 1,
          title: 'Basic Pronunciation',
          description: 'Master Spanish sounds',
          difficulty: 'beginner',
          estimatedTime: 10,
          content: [
            { type: 'text', text: 'Spanish pronunciation is mostly phonetic. Here are the basic vowel sounds:' },
            { type: 'vocabulary', word: 'a', pronunciation: 'ah', example: 'casa (house)', meaning: 'a' },
            { type: 'vocabulary', word: 'e', pronunciation: 'eh', example: 'mesa (table)', meaning: 'e' },
            { type: 'vocabulary', word: 'i', pronunciation: 'ee', example: 'niño (boy)', meaning: 'i' },
            { type: 'vocabulary', word: 'o', pronunciation: 'oh', example: 'hola (hello)', meaning: 'o' },
            { type: 'vocabulary', word: 'u', pronunciation: 'oo', example: 'luna (moon)', meaning: 'u' },
            { type: 'text', text: 'Spanish has consistent pronunciation rules. Unlike English, each letter has only one sound.' },
            { type: 'vocabulary', word: 'b/v', pronunciation: 'similar sound', example: 'beber (to drink), venir (to come)', meaning: 'b/v' },
            { type: 'vocabulary', word: 'c/qu', pronunciation: 'k sound', example: 'casa (house), queso (cheese)', meaning: 'c/qu' },
            { type: 'vocabulary', word: 'g/gu', pronunciation: 'g/h sound', example: 'gato (cat), guitarra (guitar)', meaning: 'g/gu' },
            { type: 'vocabulary', word: 'j', pronunciation: 'h sound', example: 'jamón (ham)', meaning: 'j' },
            { type: 'vocabulary', word: 'll', pronunciation: 'y sound', example: 'llamar (to call)', meaning: 'll' },
            { type: 'vocabulary', word: 'ñ', pronunciation: 'ny sound', example: 'niño (boy)', meaning: 'ñ' },
            { type: 'vocabulary', word: 'r/rr', pronunciation: 'rolled r', example: 'perro (dog), carro (car)', meaning: 'r/rr' },
          ],
        },
        {
          id: 2,
          title: 'Greetings & Introductions',
          description: 'Meet and greet in Spanish',
          difficulty: 'beginner',
          estimatedTime: 12,
          content: [
            { type: 'text', text: 'Essential phrases for meeting people:' },
            { type: 'vocabulary', word: 'Hola', meaning: 'Hello' },
            { type: 'vocabulary', word: 'Buenos días', meaning: 'Good morning' },
            { type: 'vocabulary', word: 'Buenas tardes', meaning: 'Good afternoon' },
            { type: 'vocabulary', word: 'Buenas noches', meaning: 'Good evening/night' },
            { type: 'vocabulary', word: '¿Cómo te llamas?', meaning: 'What is your name?' },
            { type: 'vocabulary', word: 'Me llamo...', meaning: 'My name is...' },
            { type: 'vocabulary', word: 'Mucho gusto', meaning: 'Nice to meet you' },
            { type: 'vocabulary', word: '¿De dónde eres?', meaning: 'Where are you from?' },
            { type: 'vocabulary', word: 'Soy de...', meaning: 'I am from...' },
            { type: 'vocabulary', word: '¿Cuántos años tienes?', meaning: 'How old are you?' },
            { type: 'vocabulary', word: 'Tengo... años', meaning: 'I am... years old' },
            { type: 'text', text: 'Practice these in conversation:' },
            { type: 'vocabulary', word: 'Hola, ¿cómo te llamas? Me llamo María. Mucho gusto.', meaning: 'Hello, what\'s your name? My name is María. Nice to meet you.' },
          ],
        },
        {
          id: 3,
          title: 'Numbers 1-20',
          description: 'Count in Spanish',
          difficulty: 'beginner',
          estimatedTime: 15,
          content: [
            { type: 'text', text: 'Learning numbers is essential for shopping, telling time, and counting in Spanish.' },
            { type: 'vocabulary', word: 'uno', meaning: 'one' },
            { type: 'vocabulary', word: 'dos', meaning: 'two' },
            { type: 'vocabulary', word: 'tres', meaning: 'three' },
            { type: 'vocabulary', word: 'cuatro', meaning: 'four' },
            { type: 'vocabulary', word: 'cinco', meaning: 'five' },
            { type: 'vocabulary', word: 'seis', meaning: 'six' },
            { type: 'vocabulary', word: 'siete', meaning: 'seven' },
            { type: 'vocabulary', word: 'ocho', meaning: 'eight' },
            { type: 'vocabulary', word: 'nueve', meaning: 'nine' },
            { type: 'vocabulary', word: 'diez', meaning: 'ten' },
            { type: 'vocabulary', word: 'once', meaning: 'eleven' },
            { type: 'vocabulary', word: 'doce', meaning: 'twelve' },
            { type: 'vocabulary', word: 'trece', meaning: 'thirteen' },
            { type: 'vocabulary', word: 'catorce', meaning: 'fourteen' },
            { type: 'vocabulary', word: 'quince', meaning: 'fifteen' },
            { type: 'vocabulary', word: 'dieciséis', meaning: 'sixteen' },
            { type: 'vocabulary', word: 'diecisiete', meaning: 'seventeen' },
            { type: 'vocabulary', word: 'dieciocho', meaning: 'eighteen' },
            { type: 'vocabulary', word: 'diecinueve', meaning: 'nineteen' },
            { type: 'vocabulary', word: 'veinte', meaning: 'twenty' },
            { type: 'text', text: 'Practice counting:' },
            { type: 'vocabulary', word: 'Uno, dos, tres, cuatro, cinco...', meaning: 'One, two, three, four, five...' },
          ],
        },
        {
          id: 4,
          title: 'Colors',
          description: 'Learn color vocabulary',
          difficulty: 'beginner',
          estimatedTime: 10,
          content: [
            { type: 'text', text: 'Colors are useful for describing objects, clothes, and surroundings.' },
            { type: 'vocabulary', word: 'rojo', meaning: 'red' },
            { type: 'vocabulary', word: 'azul', meaning: 'blue' },
            { type: 'vocabulary', word: 'verde', meaning: 'green' },
            { type: 'vocabulary', word: 'amarillo', meaning: 'yellow' },
            { type: 'vocabulary', word: 'negro', meaning: 'black' },
            { type: 'vocabulary', word: 'blanco', meaning: 'white' },
            { type: 'vocabulary', word: 'gris', meaning: 'gray' },
            { type: 'vocabulary', word: 'rosa', meaning: 'pink' },
            { type: 'vocabulary', word: 'morado', meaning: 'purple' },
            { type: 'vocabulary', word: 'naranja', meaning: 'orange' },
            { type: 'vocabulary', word: 'marrón', meaning: 'brown' },
            { type: 'text', text: 'Colors agree with gender in Spanish:' },
            { type: 'vocabulary', word: 'rojo/roja', meaning: 'red (masculine/feminine)' },
            { type: 'vocabulary', word: 'azul (invariable)', meaning: 'blue (same for both genders)' },
            { type: 'text', text: 'Example sentences:' },
            { type: 'vocabulary', word: 'La casa es roja.', meaning: 'The house is red.' },
            { type: 'vocabulary', word: 'El coche es azul.', meaning: 'The car is blue.' },
          ],
        },
        {
          id: 5,
          title: 'Family & Relationships',
          description: 'Talk about your family',
          difficulty: 'beginner',
          estimatedTime: 12,
          content: [
            { type: 'text', text: 'Family vocabulary is important for conversations about relationships.' },
            { type: 'vocabulary', word: 'la familia', meaning: 'family' },
            { type: 'vocabulary', word: 'los padres', meaning: 'parents' },
            { type: 'vocabulary', word: 'el padre', meaning: 'father' },
            { type: 'vocabulary', word: 'la madre', meaning: 'mother' },
            { type: 'vocabulary', word: 'el hijo', meaning: 'son' },
            { type: 'vocabulary', word: 'la hija', meaning: 'daughter' },
            { type: 'vocabulary', word: 'el hermano', meaning: 'brother' },
            { type: 'vocabulary', word: 'la hermana', meaning: 'sister' },
            { type: 'vocabulary', word: 'el abuelo', meaning: 'grandfather' },
            { type: 'vocabulary', word: 'la abuela', meaning: 'grandmother' },
            { type: 'vocabulary', word: 'el tío', meaning: 'uncle' },
            { type: 'vocabulary', word: 'la tía', meaning: 'aunt' },
            { type: 'vocabulary', word: 'el primo', meaning: 'cousin (male)' },
            { type: 'vocabulary', word: 'la prima', meaning: 'cousin (female)' },
            { type: 'text', text: 'Example sentence:' },
            { type: 'vocabulary', word: 'Mi familia es grande. Tengo dos hermanos y una hermana.', meaning: 'My family is big. I have two brothers and one sister.' },
          ],
        },
      ],
      arabic: [
        {
          id: 1,
          title: 'Arabic Alphabet',
          description: 'Learn the Arabic script',
          difficulty: 'beginner',
          estimatedTime: 20,
          content: [
            { type: 'text', text: 'The Arabic alphabet has 28 letters written from right to left. Here are the first few:' },
            { type: 'vocabulary', word: 'ا (alif)', pronunciation: 'a', meaning: 'a' },
            { type: 'vocabulary', word: 'ب (ba)', pronunciation: 'b', meaning: 'b' },
            { type: 'vocabulary', word: 'ت (ta)', pronunciation: 't', meaning: 't' },
            { type: 'vocabulary', word: 'ث (tha)', pronunciation: 'th', meaning: 'th (as in think)' },
            { type: 'vocabulary', word: 'ج (jim)', pronunciation: 'j', meaning: 'j (as in jam)' },
            { type: 'vocabulary', word: 'ح (ha)', pronunciation: 'h', meaning: 'h (throaty)' },
            { type: 'vocabulary', word: 'خ (kha)', pronunciation: 'kh', meaning: 'kh (like Bach)' },
            { type: 'vocabulary', word: 'د (dal)', pronunciation: 'd', meaning: 'd' },
            { type: 'vocabulary', word: 'ذ (dhal)', pronunciation: 'dh', meaning: 'dh (as in this)' },
            { type: 'vocabulary', word: 'ر (ra)', pronunciation: 'r', meaning: 'r (rolled)' },
            { type: 'vocabulary', word: 'ز (zay)', pronunciation: 'z', meaning: 'z' },
            { type: 'text', text: 'Arabic letters connect when written. The shape changes based on position:' },
            { type: 'vocabulary', word: 'بـ (initial)', pronunciation: 'ba', meaning: 'beginning of word' },
            { type: 'vocabulary', word: 'ـبـ (medial)', pronunciation: 'ba', meaning: 'middle of word' },
            { type: 'vocabulary', word: 'ـب (final)', pronunciation: 'ba', meaning: 'end of word' },
          ],
        },
        {
          id: 2,
          title: 'Basic Greetings',
          description: 'Essential Arabic phrases',
          difficulty: 'beginner',
          estimatedTime: 15,
          content: [
            { type: 'text', text: 'Arabic greetings are warm and respectful. Here are the most common ones:' },
            { type: 'vocabulary', word: 'مرحبا', pronunciation: 'marhaba', meaning: 'hello/welcome' },
            { type: 'vocabulary', word: 'السلام عليكم', pronunciation: 'as-salamu alaykum', meaning: 'peace be upon you' },
            { type: 'vocabulary', word: 'وعليكم السلام', pronunciation: 'wa alaykumu as-salam', meaning: 'and upon you peace' },
            { type: 'vocabulary', word: 'صباح الخير', pronunciation: 'sabah al-khair', meaning: 'good morning' },
            { type: 'vocabulary', word: 'صباح النور', pronunciation: 'sabah an-noor', meaning: 'good morning (response)' },
            { type: 'vocabulary', word: 'مساء الخير', pronunciation: 'masa al-khair', meaning: 'good evening' },
            { type: 'vocabulary', word: 'مساء النور', pronunciation: 'masa an-noor', meaning: 'good evening (response)' },
            { type: 'vocabulary', word: 'كيف حالك؟', pronunciation: 'kayfa haluk?', meaning: 'how are you? (male)' },
            { type: 'vocabulary', word: 'كيف حالك؟', pronunciation: 'kayfa haluki?', meaning: 'how are you? (female)' },
            { type: 'vocabulary', word: 'الحمد لله', pronunciation: 'al-hamdu lillah', meaning: 'praise be to God (I\'m fine)' },
            { type: 'vocabulary', word: 'شكرا', pronunciation: 'shukran', meaning: 'thank you' },
            { type: 'vocabulary', word: 'عفوا', pronunciation: 'afwan', meaning: 'you\'re welcome' },
            { type: 'vocabulary', word: 'مع السلامة', pronunciation: 'ma\'a as-salama', meaning: 'goodbye' },
            { type: 'text', text: 'Practice this greeting exchange:' },
            { type: 'vocabulary', word: 'السلام عليكم. كيف حالك؟ الحمد لله، بخير. وأنت؟', meaning: 'Peace be upon you. How are you? Praise be to God, I\'m fine. And you?' },
          ],
        },
        {
          id: 3,
          title: 'Numbers 1-10',
          description: 'Count in Arabic',
          difficulty: 'beginner',
          estimatedTime: 12,
          content: [
            { type: 'text', text: 'Arabic numbers are essential for shopping, counting, and daily communication.' },
            { type: 'vocabulary', word: 'واحد', pronunciation: 'wahed', meaning: 'one' },
            { type: 'vocabulary', word: 'اثنان', pronunciation: 'ithnan', meaning: 'two' },
            { type: 'vocabulary', word: 'ثلاثة', pronunciation: 'thalatha', meaning: 'three' },
            { type: 'vocabulary', word: 'أربعة', pronunciation: 'arba\'a', meaning: 'four' },
            { type: 'vocabulary', word: 'خمسة', pronunciation: 'khamsa', meaning: 'five' },
            { type: 'vocabulary', word: 'ستة', pronunciation: 'sitta', meaning: 'six' },
            { type: 'vocabulary', word: 'سبعة', pronunciation: 'sab\'a', meaning: 'seven' },
            { type: 'vocabulary', word: 'ثمانية', pronunciation: 'thamaniya', meaning: 'eight' },
            { type: 'vocabulary', word: 'تسعة', pronunciation: 'tis\'a', meaning: 'nine' },
            { type: 'vocabulary', word: 'عشرة', pronunciation: 'ashara', meaning: 'ten' },
            { type: 'text', text: 'Numbers change form based on what they modify:' },
            { type: 'vocabulary', word: 'واحد كتاب (wahed kitab)', meaning: 'one book (masculine)' },
            { type: 'vocabulary', word: 'واحدة سيارة (wahida sayyara)', meaning: 'one car (feminine)' },
            { type: 'vocabulary', word: 'اثنان كتب (ithnan kutub)', meaning: 'two books' },
          ],
        },
        {
          id: 4,
          title: 'Family Vocabulary',
          description: 'Words for family members',
          difficulty: 'beginner',
          estimatedTime: 15,
          content: [
            { type: 'text', text: 'Family terms are important for introductions and conversations about relationships.' },
            { type: 'vocabulary', word: 'العائلة', pronunciation: 'al-\'aila', meaning: 'family' },
            { type: 'vocabulary', word: 'الأب', pronunciation: 'al-ab', meaning: 'father' },
            { type: 'vocabulary', word: 'الأم', pronunciation: 'al-umm', meaning: 'mother' },
            { type: 'vocabulary', word: 'الابن', pronunciation: 'al-ibn', meaning: 'son' },
            { type: 'vocabulary', word: 'البنت', pronunciation: 'al-bint', meaning: 'daughter' },
            { type: 'vocabulary', word: 'الأخ', pronunciation: 'al-akh', meaning: 'brother' },
            { type: 'vocabulary', word: 'الأخت', pronunciation: 'al-ukht', meaning: 'sister' },
            { type: 'vocabulary', word: 'الجد', pronunciation: 'al-jadd', meaning: 'grandfather' },
            { type: 'vocabulary', word: 'الجدة', pronunciation: 'al-jadda', meaning: 'grandmother' },
            { type: 'vocabulary', word: 'العم', pronunciation: 'al-\'amm', meaning: 'uncle (paternal)' },
            { type: 'vocabulary', word: 'الخال', pronunciation: 'al-khal', meaning: 'uncle (maternal)' },
            { type: 'vocabulary', word: 'العمه', pronunciation: 'al-\'amma', meaning: 'aunt (paternal)' },
            { type: 'vocabulary', word: 'الخالة', pronunciation: 'al-khala', meaning: 'aunt (maternal)' },
            { type: 'text', text: 'Example sentence:' },
            { type: 'vocabulary', word: 'عائلتي كبيرة ولدي ثلاثة إخوة وأختان', meaning: 'My family is big and I have three brothers and two sisters' },
          ],
        },
        {
          id: 5,
          title: 'Food & Drink',
          description: 'Culinary vocabulary',
          difficulty: 'beginner',
          estimatedTime: 12,
          content: [
            { type: 'text', text: 'Food vocabulary is useful for ordering at restaurants and shopping.' },
            { type: 'vocabulary', word: 'الطعام', pronunciation: 'at-ta\'am', meaning: 'food' },
            { type: 'vocabulary', word: 'الشراب', pronunciation: 'ash-sharab', meaning: 'drink' },
            { type: 'vocabulary', word: 'الماء', pronunciation: 'al-ma\'', meaning: 'water' },
            { type: 'vocabulary', word: 'الشاي', pronunciation: 'ash-shai', meaning: 'tea' },
            { type: 'vocabulary', word: 'القهوة', pronunciation: 'al-qahwa', meaning: 'coffee' },
            { type: 'vocabulary', word: 'الخبز', pronunciation: 'al-khubz', meaning: 'bread' },
            { type: 'vocabulary', word: 'الأرز', pronunciation: 'al-arz', meaning: 'rice' },
            { type: 'vocabulary', word: 'اللحم', pronunciation: 'al-lahm', meaning: 'meat' },
            { type: 'vocabulary', word: 'السمك', pronunciation: 'as-samak', meaning: 'fish' },
            { type: 'vocabulary', word: 'الخضار', pronunciation: 'al-khudar', meaning: 'vegetables' },
            { type: 'vocabulary', word: 'الفواكه', pronunciation: 'al-fawakeh', meaning: 'fruits' },
            { type: 'vocabulary', word: 'التفاح', pronunciation: 'at-tuffah', meaning: 'apple' },
            { type: 'vocabulary', word: 'الموز', pronunciation: 'al-mawz', meaning: 'banana' },
            { type: 'vocabulary', word: 'الحليب', pronunciation: 'al-haleeb', meaning: 'milk' },
            { type: 'text', text: 'Common phrases:' },
            { type: 'vocabulary', word: 'أريد ماء', pronunciation: 'ureedu ma\'', meaning: 'I want water' },
            { type: 'vocabulary', word: 'الطعام لذيذ', pronunciation: 'at-ta\'am ladheedh', meaning: 'the food is delicious' },
          ],
        },
      ],
    };

    return demoData[language] || [];
  }
}
