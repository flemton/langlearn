import { StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DataService, UserProgress, Achievement } from '@/services/dataService';

interface ProgressData extends UserProgress {
  totalLessons: number;
  progressPercent: number;
}

export default function ProgressScreen() {
  const router = useRouter();
  const [progressData, setProgressData] = useState<Record<string, ProgressData>>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalLessonsCompleted: 0,
    totalStudyTime: 0,
    currentStreak: 0,
    languagesStarted: 0,
    totalLessons: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadProgressData = useCallback(async () => {
    try {
      const languages = DataService.getAvailableLanguages();
      const progress: Record<string, ProgressData> = {};
      let totalLessonsCount = 0;

      for (const language of languages) {
        const [userProgress, lessons] = await Promise.all([
          DataService.getUserProgress(language),
          DataService.getLessons(language),
        ]);

        totalLessonsCount += lessons.length;
        progress[language] = {
          ...userProgress,
          totalLessons: lessons.length,
          progressPercent:
            lessons.length > 0
              ? Math.round(
                  (userProgress.completedLessons.length / lessons.length) * 100
                )
              : 0,
        };
      }

      const [stats, achvs] = await Promise.all([
        DataService.getOverallStats(),
        DataService.getAchievements(),
      ]);

      setProgressData(progress);
      setOverallStats({ ...stats, totalLessons: totalLessonsCount });
      setAchievements(achvs);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  }, []);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  }, [loadProgressData]);

  const navigateToLessons = (language: string) => {
    router.push(`/lessons/${language}`);
  };

  const overallProgress =
    overallStats.totalLessons > 0
      ? Math.round(
          (overallStats.totalLessonsCompleted / overallStats.totalLessons) * 100
        )
      : 0;

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Your Progress
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Track your language learning journey
          </ThemedText>
        </ThemedView>

        {/* Stats Overview */}
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statCard}>
            <ThemedText type="subtitle" style={styles.statNumber}>
              {overallStats.totalLessonsCompleted}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Lessons Completed</ThemedText>
          </ThemedView>

          <ThemedView style={styles.statCard}>
            <ThemedText type="subtitle" style={styles.statNumber}>
              {overallProgress}%
            </ThemedText>
            <ThemedText style={styles.statLabel}>Overall Progress</ThemedText>
          </ThemedView>

          <ThemedView style={styles.statCard}>
            <ThemedText type="subtitle" style={styles.statNumber}>
              {overallStats.currentStreak > 0 ? `🔥 ${overallStats.currentStreak}` : '—'}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Study Time */}
        {overallStats.totalStudyTime > 0 && (
          <ThemedView style={styles.studyTimeContainer}>
            <ThemedText style={styles.studyTimeText}>
              ⏱️ Total study time: {Math.round(overallStats.totalStudyTime / 60)}{' '}
              hours {overallStats.totalStudyTime % 60} minutes
            </ThemedText>
          </ThemedView>
        )}

        {/* Language Progress */}
        <ThemedView style={styles.languagesContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Language Progress
          </ThemedText>

          {Object.entries(progressData).map(([language, data]) => {
            const displayNames: Record<string, string> = {
              japanese: '🇯🇵 Japanese',
              spanish: '🇪🇸 Spanish',
              arabic: '🇸🇦 Arabic',
            };

            return (
              <TouchableOpacity
                key={language}
                style={styles.languageCard}
                onPress={() => navigateToLessons(language)}
              >
                <ThemedView style={styles.languageHeader}>
                  <ThemedText type="subtitle" style={styles.languageName}>
                    {displayNames[language] || language}
                  </ThemedText>
                  <ThemedText style={styles.progressText}>
                    {data.totalLessonsCompleted}/{data.totalLessons} lessons
                  </ThemedText>
                </ThemedView>

                <ThemedView style={styles.progressBar}>
                  <ThemedView
                    style={[
                      styles.progressFill,
                      { width: `${data.progressPercent}%` },
                    ]}
                  />
                </ThemedView>

                <ThemedView style={styles.languageFooter}>
                  <ThemedText style={styles.progressPercentText}>
                    {data.progressPercent}%
                  </ThemedText>
                  {data.currentStreak > 0 && (
                    <ThemedText style={styles.streakText}>
                      🔥 {data.currentStreak} day streak
                    </ThemedText>
                  )}
                </ThemedView>
              </TouchableOpacity>
            );
          })}
        </ThemedView>

        {/* Achievements */}
        <ThemedView style={styles.achievementsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Achievements ({unlockedAchievements.length}/{achievements.length})
          </ThemedText>

          {unlockedAchievements.length === 0 && (
            <ThemedView style={styles.emptyAchievements}>
              <ThemedText style={styles.emptyText}>
                Complete lessons to unlock achievements!
              </ThemedText>
            </ThemedView>
          )}

          {unlockedAchievements.map((achievement) => (
            <ThemedView
              key={achievement.id}
              style={[styles.achievementCard, styles.unlockedAchievement]}
            >
              <ThemedText type="subtitle" style={styles.achievementTitle}>
                {achievement.icon} {achievement.title}
              </ThemedText>
              <ThemedText style={styles.achievementDescription}>
                {achievement.description}
              </ThemedText>
              {achievement.unlockedAt && (
                <ThemedText style={styles.achievementDate}>
                  Unlocked{' '}
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </ThemedText>
              )}
            </ThemedView>
          ))}

          {lockedAchievements.map((achievement) => (
            <ThemedView
              key={achievement.id}
              style={[styles.achievementCard, styles.lockedAchievement]}
            >
              <ThemedText
                type="subtitle"
                style={[styles.achievementTitle, styles.lockedText]}
              >
                🔒 {achievement.title}
              </ThemedText>
              <ThemedText style={[styles.achievementDescription, styles.lockedText]}>
                {achievement.description}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  studyTimeContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  studyTimeText: {
    fontSize: 14,
    opacity: 0.8,
  },
  languagesContainer: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  languageCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  languageName: {
    fontSize: 18,
  },
  progressText: {
    opacity: 0.7,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  languageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  streakText: {
    fontSize: 14,
    opacity: 0.7,
  },
  achievementsContainer: {
    padding: 20,
  },
  emptyAchievements: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
  },
  achievementCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unlockedAchievement: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  lockedAchievement: {
    opacity: 0.6,
    backgroundColor: '#fafafa',
  },
  achievementTitle: {
    marginBottom: 5,
  },
  lockedText: {
    opacity: 0.5,
  },
  achievementDescription: {
    opacity: 0.7,
  },
  achievementDate: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 8,
  },
});
