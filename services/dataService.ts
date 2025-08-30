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

      // Fetch from API
      const lessons = await this.fetchLessonsFromAPI(language);

      // Cache the results
      await this.cacheLessons(language, lessons);

      return lessons;
    } catch (error) {
      console.error('Error fetching lessons:', error);
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

  // Demo data fallback
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
            { type: 'text', text: 'Hiragana is the fundamental Japanese script used for native words.' },
            { type: 'vocabulary', word: 'あ (a)', romaji: 'a', meaning: 'a' },
            { type: 'vocabulary', word: 'い (i)', romaji: 'i', meaning: 'i' },
            { type: 'vocabulary', word: 'う (u)', romaji: 'u', meaning: 'u' },
            { type: 'vocabulary', word: 'え (e)', romaji: 'e', meaning: 'e' },
            { type: 'vocabulary', word: 'お (o)', romaji: 'o', meaning: 'o' },
          ],
        },
        {
          id: 2,
          title: 'Katakana Basics',
          description: 'Master the second Japanese script',
          difficulty: 'beginner',
          estimatedTime: 15,
          content: [
            { type: 'text', text: 'Katakana is used for foreign words and onomatopoeic expressions.' },
            { type: 'vocabulary', word: 'ア (a)', romaji: 'a', meaning: 'a' },
            { type: 'vocabulary', word: 'イ (i)', romaji: 'i', meaning: 'i' },
            { type: 'vocabulary', word: 'ウ (u)', romaji: 'u', meaning: 'u' },
            { type: 'vocabulary', word: 'エ (e)', romaji: 'e', meaning: 'e' },
            { type: 'vocabulary', word: 'オ (o)', romaji: 'o', meaning: 'o' },
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
            { type: 'text', text: 'The Arabic alphabet has 28 letters. Here are the first few:' },
            { type: 'vocabulary', word: 'ا (alif)', pronunciation: 'a', meaning: 'a' },
            { type: 'vocabulary', word: 'ب (ba)', pronunciation: 'b', meaning: 'b' },
            { type: 'vocabulary', word: 'ت (ta)', pronunciation: 't', meaning: 't' },
            { type: 'vocabulary', word: 'ث (tha)', pronunciation: 'th', meaning: 'th (as in think)' },
            { type: 'vocabulary', word: 'ج (jim)', pronunciation: 'j', meaning: 'j (as in jam)' },
          ],
        },
      ],
    };

    return demoData[language] || [];
  }
}
