import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ProgressScreen() {
  const router = useRouter();

  // Mock progress data - in a real app, this would come from AsyncStorage or a backend
  const progressData = {
    japanese: { completed: 2, total: 5, streak: 3 },
    spanish: { completed: 1, total: 5, streak: 1 },
    arabic: { completed: 0, total: 5, streak: 0 },
  };

  const totalCompleted = Object.values(progressData).reduce((sum, lang) => sum + lang.completed, 0);
  const totalLessons = Object.values(progressData).reduce((sum, lang) => sum + lang.total, 0);
  const overallProgress = Math.round((totalCompleted / totalLessons) * 100);

  const navigateToLessons = (language: string) => {
    router.push(`/lessons/${language}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Your Progress
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Track your language learning journey
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statCard}>
            <ThemedText type="subtitle" style={styles.statNumber}>
              {totalCompleted}
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
              🔥
            </ThemedText>
            <ThemedText style={styles.statLabel}>Current Streak</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.languagesContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Language Progress
          </ThemedText>

          {Object.entries(progressData).map(([language, data]) => (
            <TouchableOpacity
              key={language}
              style={styles.languageCard}
              onPress={() => navigateToLessons(language)}
            >
              <ThemedView style={styles.languageHeader}>
                <ThemedText type="subtitle" style={styles.languageName}>
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </ThemedText>
                <ThemedText style={styles.progressText}>
                  {data.completed}/{data.total} lessons
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.progressBar}>
                <ThemedView
                  style={[
                    styles.progressFill,
                    { width: `${(data.completed / data.total) * 100}%` }
                  ]}
                />
              </ThemedView>

              {data.streak > 0 && (
                <ThemedText style={styles.streakText}>
                  🔥 {data.streak} day streak
                </ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </ThemedView>

        <ThemedView style={styles.achievementsContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Achievements
          </ThemedText>

          <ThemedView style={styles.achievementCard}>
            <ThemedText type="subtitle" style={styles.achievementTitle}>
              🏆 First Steps
            </ThemedText>
            <ThemedText style={styles.achievementDescription}>
              Completed your first lesson!
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.achievementCard}>
            <ThemedText type="subtitle" style={styles.achievementTitle}>
              📚 Language Explorer
            </ThemedText>
            <ThemedText style={styles.achievementDescription}>
              Started learning your second language!
            </ThemedText>
          </ThemedView>
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
  streakText: {
    fontSize: 14,
    opacity: 0.7,
  },
  achievementsContainer: {
    padding: 20,
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
  achievementTitle: {
    marginBottom: 5,
  },
  achievementDescription: {
    opacity: 0.7,
  },
});
