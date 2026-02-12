import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AudioButton from '@/components/AudioButton';
import { getLanguageData, DataService } from '@/services/dataService';
import { useEffect, useState } from 'react';

export default function LanguageLessonsScreen() {
  const { language } = useLocalSearchParams();
  const router = useRouter();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const langData = getLanguageData(language as string);

  useEffect(() => {
    loadProgress();
  }, [language]);

  const loadProgress = async () => {
    try {
      const progress = await DataService.getUserProgress(language as string);
      setCompletedLessons(progress.completedLessons);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  if (!langData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText type="title">Language not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const startLesson = (lessonId: number) => {
    router.push(`/lessons/${language}/lesson/${lessonId}`);
  };

  const continueLearning = () => {
    // Find first incomplete lesson
    const nextLesson = langData.lessons.find(
      (l: { id: number }) => !completedLessons.includes(l.id)
    );
    if (nextLesson) {
      router.push(`/lessons/${language}/lesson/${nextLesson.id}`);
    }
  };

  const progressPercent = Math.round(
    (completedLessons.length / langData.lessons.length) * 100
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {langData.flag} {langData.name} Lessons
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {completedLessons.length}/{langData.lessons.length} completed ·{' '}
            {progressPercent}%
          </ThemedText>

          {/* Progress Bar */}
          <ThemedView style={styles.progressBarContainer}>
            <ThemedView
              style={[styles.progressBar, { width: `${progressPercent}%` }]}
            />
          </ThemedView>

          {/* Continue Button */}
          {completedLessons.length < langData.lessons.length && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={continueLearning}
            >
              <ThemedText type="subtitle" style={styles.continueButtonText}>
                {completedLessons.length === 0
                  ? 'Start Learning'
                  : 'Continue Learning'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {langData.lessons.map((lesson: { id: number; title: string; description: string; difficulty: string; estimatedTime: number }, index: number) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isLocked =
            index > 0 && !completedLessons.includes(langData.lessons[index - 1].id);

          return (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonCard,
                isCompleted && styles.completedCard,
                isLocked && styles.lockedCard,
              ]}
              onPress={() => !isLocked && startLesson(lesson.id)}
              disabled={isLocked}
            >
              <ThemedView style={styles.lessonHeader}>
                <ThemedView style={styles.lessonTitleRow}>
                  <ThemedText type="subtitle" style={styles.lessonTitle}>
                    {isCompleted && '✅ '}
                    {isLocked && '🔒 '}
                    Lesson {lesson.id}: {lesson.title}
                  </ThemedText>
                  {!isLocked && (
                    <AudioButton
                      text={lesson.title}
                      language={language as string}
                      size={20}
                    />
                  )}
                </ThemedView>
                <ThemedText style={styles.lessonMeta}>
                  {lesson.difficulty} · {lesson.estimatedTime} min
                </ThemedText>
              </ThemedView>
              <ThemedText style={styles.lessonDescription}>
                {lesson.description}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 15,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
  },
  lessonCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  lockedCard: {
    opacity: 0.6,
    backgroundColor: '#f9f9f9',
  },
  lessonHeader: {
    marginBottom: 8,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonTitle: {
    fontSize: 18,
    flex: 1,
  },
  lessonMeta: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  lessonDescription: {
    opacity: 0.7,
  },
});
