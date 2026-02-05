// Data service for managing lesson content and user progress - LOCAL ONLY
import AsyncStorage from '@react-native-async-storage/async-storage';
import { languageData, Lesson, LanguageData } from '@/data/lessons';

// Re-export types and functions from lessons data
export { languageData, getLesson, getLanguageData, getAllLanguages } from '@/data/lessons';
export type { Lesson, LanguageData, LessonContentItem } from '@/data/lessons';

export interface UserProgress {
  language: string;
  completedLessons: number[];
  currentStreak: number;
  totalLessonsCompleted: number;
  lastStudyDate: string;
  totalStudyTime: number; // in minutes
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

// Constants
const PROGRESS_KEY_PREFIX = '@langlearn_progress_';
const SETTINGS_KEY = '@langlearn_settings';
const ACHIEVEMENTS_KEY = '@langlearn_achievements';

interface AppSettings {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
}

const defaultSettings: AppSettings = {
  audioEnabled: true,
  hapticsEnabled: true,
  notificationsEnabled: false,
};

export class DataService {
  // Get lessons for a language - from centralized data
  static async getLessons(language: string): Promise<Lesson[]> {
    const langData = languageData[language.toLowerCase()];
    return langData?.lessons || [];
  }

  // Get language data
  static async getLanguageData(language: string): Promise<LanguageData | null> {
    return languageData[language.toLowerCase()] || null;
  }

  // Get all available languages
  static getAvailableLanguages(): string[] {
    return Object.keys(languageData);
  }

  // User Progress Management
  static async getUserProgress(language: string): Promise<UserProgress> {
    try {
      const progressKey = `${PROGRESS_KEY_PREFIX}${language.toLowerCase()}`;
      const progressData = await AsyncStorage.getItem(progressKey);

      if (progressData) {
        return JSON.parse(progressData);
      }
    } catch (error) {
      console.error('Error reading user progress:', error);
    }

    // Return default progress
    return {
      language: language.toLowerCase(),
      completedLessons: [],
      currentStreak: 0,
      totalLessonsCompleted: 0,
      lastStudyDate: '',
      totalStudyTime: 0,
    };
  }

  static async updateUserProgress(
    language: string,
    progress: Partial<UserProgress>
  ): Promise<void> {
    try {
      const currentProgress = await this.getUserProgress(language);
      const updatedProgress = { ...currentProgress, ...progress };

      const progressKey = `${PROGRESS_KEY_PREFIX}${language.toLowerCase()}`;
      await AsyncStorage.setItem(progressKey, JSON.stringify(updatedProgress));

      // Check and update achievements after progress update
      await this.checkAchievements();
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw new Error('Failed to save progress');
    }
  }

  static async markLessonComplete(
    language: string,
    lessonId: number,
    studyTime: number = 0
  ): Promise<void> {
    try {
      const progress = await this.getUserProgress(language);

      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
        progress.totalLessonsCompleted += 1;
      }

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Update streak logic
      if (progress.lastStudyDate === yesterday) {
        progress.currentStreak += 1;
      } else if (progress.lastStudyDate !== today) {
        // Reset streak if not studied yesterday or today
        progress.currentStreak = 1;
      }
      // If lastStudyDate === today, don't change streak

      progress.lastStudyDate = today;
      progress.totalStudyTime += studyTime;

      await this.updateUserProgress(language, progress);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      throw new Error('Failed to mark lesson complete');
    }
  }

  // Check if a lesson is completed
  static async isLessonCompleted(
    language: string,
    lessonId: number
  ): Promise<boolean> {
    const progress = await this.getUserProgress(language);
    return progress.completedLessons.includes(lessonId);
  }

  // Get progress for all languages
  static async getAllProgress(): Promise<Record<string, UserProgress>> {
    const languages = this.getAvailableLanguages();
    const allProgress: Record<string, UserProgress> = {};

    for (const language of languages) {
      allProgress[language] = await this.getUserProgress(language);
    }

    return allProgress;
  }

  // Calculate overall stats
  static async getOverallStats(): Promise<{
    totalLessonsCompleted: number;
    totalStudyTime: number;
    currentStreak: number;
    languagesStarted: number;
  }> {
    const allProgress = await this.getAllProgress();
    const languages = this.getAvailableLanguages();

    let totalLessonsCompleted = 0;
    let totalStudyTime = 0;
    let maxStreak = 0;
    let languagesStarted = 0;

    for (const language of languages) {
      const progress = allProgress[language];
      totalLessonsCompleted += progress.totalLessonsCompleted;
      totalStudyTime += progress.totalStudyTime;
      maxStreak = Math.max(maxStreak, progress.currentStreak);
      if (progress.completedLessons.length > 0) {
        languagesStarted += 1;
      }
    }

    return {
      totalLessonsCompleted,
      totalStudyTime,
      currentStreak: maxStreak,
      languagesStarted,
    };
  }

  // Settings Management
  static async getSettings(): Promise<AppSettings> {
    try {
      const settingsData = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsData) {
        return { ...defaultSettings, ...JSON.parse(settingsData) };
      }
    } catch (error) {
      console.error('Error reading settings:', error);
    }
    return defaultSettings;
  }

  static async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  // Achievement System
  static async getAchievements(): Promise<Achievement[]> {
    try {
      const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      if (achievementsData) {
        return JSON.parse(achievementsData);
      }
    } catch (error) {
      console.error('Error reading achievements:', error);
    }
    return this.getDefaultAchievements();
  }

  private static getDefaultAchievements(): Achievement[] {
    return [
      {
        id: 'first_lesson',
        title: '🏆 First Steps',
        description: 'Completed your first lesson!',
        icon: '🏆',
        unlocked: false,
      },
      {
        id: 'five_lessons',
        title: '📚 Dedicated Learner',
        description: 'Completed 5 lessons across any language',
        icon: '📚',
        unlocked: false,
      },
      {
        id: 'ten_lessons',
        title: '🌟 Language Explorer',
        description: 'Completed 10 lessons across any language',
        icon: '🌟',
        unlocked: false,
      },
      {
        id: 'streak_3',
        title: '🔥 On Fire',
        description: 'Maintained a 3-day study streak',
        icon: '🔥',
        unlocked: false,
      },
      {
        id: 'streak_7',
        title: '🚀 Week Warrior',
        description: 'Maintained a 7-day study streak',
        icon: '🚀',
        unlocked: false,
      },
      {
        id: 'multi_language',
        title: '🌍 Polyglot Beginner',
        description: 'Started learning 2 different languages',
        icon: '🌍',
        unlocked: false,
      },
      {
        id: 'complete_language',
        title: '🎓 Language Master',
        description: 'Completed all lessons in one language',
        icon: '🎓',
        unlocked: false,
      },
    ];
  }

  private static async checkAchievements(): Promise<void> {
    try {
      const achievements = await this.getAchievements();
      const allProgress = await this.getAllProgress();
      const languages = this.getAvailableLanguages();

      const totalLessonsCompleted = Object.values(allProgress).reduce(
        (sum, p) => sum + p.totalLessonsCompleted,
        0
      );
      const maxStreak = Math.max(
        ...Object.values(allProgress).map((p) => p.currentStreak)
      );
      const languagesStarted = Object.values(allProgress).filter(
        (p) => p.completedLessons.length > 0
      ).length;

      // Check for completed languages
      const completedLanguages = languages.filter((lang) => {
        const progress = allProgress[lang];
        const langData = languageData[lang];
        return (
          langData && progress.completedLessons.length >= langData.lessons.length
        );
      });

      const updatedAchievements = achievements.map((achievement) => {
        if (achievement.unlocked) return achievement;

        let shouldUnlock = false;

        switch (achievement.id) {
          case 'first_lesson':
            shouldUnlock = totalLessonsCompleted >= 1;
            break;
          case 'five_lessons':
            shouldUnlock = totalLessonsCompleted >= 5;
            break;
          case 'ten_lessons':
            shouldUnlock = totalLessonsCompleted >= 10;
            break;
          case 'streak_3':
            shouldUnlock = maxStreak >= 3;
            break;
          case 'streak_7':
            shouldUnlock = maxStreak >= 7;
            break;
          case 'multi_language':
            shouldUnlock = languagesStarted >= 2;
            break;
          case 'complete_language':
            shouldUnlock = completedLanguages.length >= 1;
            break;
        }

        if (shouldUnlock) {
          return {
            ...achievement,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          };
        }

        return achievement;
      });

      await AsyncStorage.setItem(
        ACHIEVEMENTS_KEY,
        JSON.stringify(updatedAchievements)
      );
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  // Data Export/Import (Local Backup)
  static async exportData(): Promise<string> {
    try {
      const allProgress = await this.getAllProgress();
      const settings = await this.getSettings();
      const achievements = await this.getAchievements();

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        progress: allProgress,
        settings,
        achievements,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      // Validate data structure
      if (!data.progress || typeof data.progress !== 'object') {
        throw new Error('Invalid data format: missing progress');
      }

      // Import progress
      for (const [language, progress] of Object.entries(data.progress)) {
        const progressKey = `${PROGRESS_KEY_PREFIX}${language}`;
        await AsyncStorage.setItem(progressKey, JSON.stringify(progress));
      }

      // Import settings
      if (data.settings) {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
      }

      // Import achievements
      if (data.achievements) {
        await AsyncStorage.setItem(
          ACHIEVEMENTS_KEY,
          JSON.stringify(data.achievements)
        );
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }

  // Reset Progress
  static async resetAllProgress(): Promise<void> {
    try {
      const languages = this.getAvailableLanguages();

      // Reset progress for all languages
      for (const language of languages) {
        const progressKey = `${PROGRESS_KEY_PREFIX}${language}`;
        await AsyncStorage.removeItem(progressKey);
      }

      // Reset achievements
      await AsyncStorage.removeItem(ACHIEVEMENTS_KEY);

      // Keep settings (user preferences should persist)
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw new Error('Failed to reset progress');
    }
  }

  static async resetLanguageProgress(language: string): Promise<void> {
    try {
      const progressKey = `${PROGRESS_KEY_PREFIX}${language.toLowerCase()}`;
      await AsyncStorage.removeItem(progressKey);
      await this.checkAchievements(); // Re-check achievements after reset
    } catch (error) {
      console.error('Error resetting language progress:', error);
      throw new Error('Failed to reset language progress');
    }
  }

  // Get next recommended lesson
  static async getNextLesson(language: string): Promise<Lesson | null> {
    const lessons = await this.getLessons(language);
    const progress = await this.getUserProgress(language);

    // Find first incomplete lesson
    return (
      lessons.find((lesson) => !progress.completedLessons.includes(lesson.id)) ||
      null
    );
  }

  // Calculate lesson progress percentage
  static async getLessonProgressPercentage(language: string): Promise<number> {
    const lessons = await this.getLessons(language);
    const progress = await this.getUserProgress(language);

    if (lessons.length === 0) return 0;

    return Math.round(
      (progress.completedLessons.length / lessons.length) * 100
    );
  }
}
