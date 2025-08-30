import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const lessonData = {
  japanese: {
    flag: '🇯🇵',
    name: 'Japanese',
    lessons: [
      { id: 1, title: 'Hiragana Basics', description: 'Learn the fundamental Japanese script' },
      { id: 2, title: 'Katakana Basics', description: 'Master the second Japanese script' },
      { id: 3, title: 'Basic Greetings', description: 'Essential phrases for daily conversation' },
      { id: 4, title: 'Numbers 1-10', description: 'Count in Japanese' },
      { id: 5, title: 'Family Members', description: 'Vocabulary for your family' },
    ],
  },
  spanish: {
    flag: '🇪🇸',
    name: 'Spanish',
    lessons: [
      { id: 1, title: 'Basic Pronunciation', description: 'Master Spanish sounds' },
      { id: 2, title: 'Greetings & Introductions', description: 'Meet and greet in Spanish' },
      { id: 3, title: 'Numbers 1-20', description: 'Count in Spanish' },
      { id: 4, title: 'Colors', description: 'Learn color vocabulary' },
      { id: 5, title: 'Family & Relationships', description: 'Talk about your family' },
    ],
  },
  arabic: {
    flag: '🇸🇦',
    name: 'Arabic',
    lessons: [
      { id: 1, title: 'Arabic Alphabet', description: 'Learn the Arabic script' },
      { id: 2, title: 'Basic Greetings', description: 'Essential Arabic phrases' },
      { id: 3, title: 'Numbers 1-10', description: 'Count in Arabic' },
      { id: 4, title: 'Family Vocabulary', description: 'Words for family members' },
      { id: 5, title: 'Food & Drink', description: 'Culinary vocabulary' },
    ],
  },
};

export default function LanguageLessonsScreen() {
  const { language } = useLocalSearchParams();
  const router = useRouter();

  const langData = lessonData[language as keyof typeof lessonData];

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {langData.flag} {langData.name} Lessons
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Progress from beginner to advanced
          </ThemedText>
        </ThemedView>

        {langData.lessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={styles.lessonCard}
            onPress={() => startLesson(lesson.id)}
          >
            <ThemedText type="subtitle" style={styles.lessonTitle}>
              Lesson {lesson.id}: {lesson.title}
            </ThemedText>
            <ThemedText style={styles.lessonDescription}>
              {lesson.description}
            </ThemedText>
          </TouchableOpacity>
        ))}
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
  lessonTitle: {
    marginBottom: 8,
  },
  lessonDescription: {
    opacity: 0.7,
  },
});
