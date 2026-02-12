import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AudioButton from '@/components/AudioButton';
import { DataService, getLesson, getLanguageData } from '@/services/dataService';
import { useEffect, useState } from 'react';

export default function LessonScreen() {
  const { language, lessonId } = useLocalSearchParams();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [settings, setSettings] = useState({ hapticsEnabled: true });

  const lesson = getLesson(language as string, parseInt(lessonId as string));
  const langData = getLanguageData(language as string);

  useEffect(() => {
    loadData();
  }, [language, lessonId]);

  const loadData = async () => {
    try {
      const [completed, userSettings] = await Promise.all([
        DataService.isLessonCompleted(
          language as string,
          parseInt(lessonId as string)
        ),
        DataService.getSettings(),
      ]);
      setIsCompleted(completed);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading lesson data:', error);
    }
  };

  if (!lesson || !langData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText type="title">Lesson not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const completeLesson = async () => {
    try {
      // Haptic feedback if enabled
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Mark lesson as complete
      await DataService.markLessonComplete(
        language as string,
        parseInt(lessonId as string),
        lesson.estimatedTime || 10
      );

      setIsCompleted(true);

      // Find next lesson
      const currentIndex = langData.lessons.findIndex(
        (l: { id: number }) => l.id === parseInt(lessonId as string)
      );
      const nextLesson = langData.lessons[currentIndex + 1];

      Alert.alert(
        '🎉 Lesson Complete!',
        `Great job finishing "${lesson.title}"!`,
        [
          {
            text: 'Back to Lessons',
            onPress: () => router.push(`/lessons/${language}`),
          },
          nextLesson
            ? {
                text: 'Next Lesson →',
                onPress: () =>
                  router.push(`/lessons/${language}/lesson/${nextLesson.id}`),
              }
            : {
                text: 'View Progress',
                onPress: () => router.push('/explore'),
              },
        ]
      );
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleWithAudio}>
            <ThemedText type="title" style={styles.title}>
              {isCompleted && '✅ '}
              {lesson.title}
            </ThemedText>
            <AudioButton
              text={lesson.title}
              language={language as string}
              size={24}
            />
          </ThemedView>
          <ThemedText style={styles.subtitle}>
            {lesson.difficulty} · {lesson.estimatedTime} min · Lesson{' '}
            {lesson.id} of {langData.lessons.length}
          </ThemedText>
        </ThemedView>

        {lesson.content.map((item: { type: string; text?: string; word?: string; romaji?: string; pronunciation?: string; example?: string; meaning?: string }, index: number) => (
          <ThemedView key={index} style={styles.contentItem}>
            {item.type === 'text' ? (
              <ThemedView style={styles.textWithAudio}>
                <ThemedText style={styles.textContent}>
                  {item.text}
                </ThemedText>
                <AudioButton
                  text={item.text}
                  language={language as string}
                  size={20}
                />
              </ThemedView>
            ) : (
              <ThemedView style={styles.vocabularyItem}>
                <ThemedView style={styles.wordWithAudio}>
                  <ThemedText type="subtitle" style={styles.word}>
                    {item.word}
                  </ThemedText>
                  <AudioButton
                    text={item.word}
                    language={language as string}
                    size={22}
                  />
                </ThemedView>
                {item.romaji && (
                  <ThemedView style={styles.romajiWithAudio}>
                    <ThemedText style={styles.romaji}>{item.romaji}</ThemedText>
                    <AudioButton
                      text={item.romaji}
                      language={language as string}
                      size={18}
                    />
                  </ThemedView>
                )}
                {item.pronunciation && (
                  <ThemedText style={styles.pronunciation}>
                    Pronunciation: {item.pronunciation}
                  </ThemedText>
                )}
                {item.example && (
                  <ThemedView style={styles.exampleWithAudio}>
                    <ThemedText style={styles.example}>
                      Example: {item.example}
                    </ThemedText>
                    <AudioButton
                      text={item.example}
                      language={language as string}
                      size={18}
                    />
                  </ThemedView>
                )}
                <ThemedView style={styles.meaningContainer}>
                  <ThemedText style={styles.meaning}>{item.meaning}</ThemedText>
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>
        ))}

        <TouchableOpacity
          style={[
            styles.completeButton,
            isCompleted && styles.completedButton,
          ]}
          onPress={completeLesson}
        >
          <ThemedText type="subtitle" style={styles.buttonText}>
            {isCompleted ? '✓ Completed' : 'Complete Lesson'}
          </ThemedText>
        </TouchableOpacity>
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
  titleWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    marginBottom: 10,
    flexShrink: 1,
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  contentItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
  },
  textWithAudio: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  vocabularyItem: {
    marginBottom: 15,
  },
  wordWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  word: {
    fontSize: 20,
    marginBottom: 5,
    flex: 1,
  },
  romajiWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  romaji: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
    flex: 1,
  },
  pronunciation: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  exampleWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  example: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
    flex: 1,
  },
  meaningContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  meaning: {
    fontSize: 16,
    color: '#007AFF',
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
