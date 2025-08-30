import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const lessonContent = {
  japanese: {
    1: {
      title: 'Hiragana Basics',
      content: [
        { type: 'text', text: 'Hiragana is the fundamental Japanese script used for native words.' },
        { type: 'vocabulary', word: 'あ (a)', romaji: 'a', meaning: 'a' },
        { type: 'vocabulary', word: 'い (i)', romaji: 'i', meaning: 'i' },
        { type: 'vocabulary', word: 'う (u)', romaji: 'u', meaning: 'u' },
        { type: 'vocabulary', word: 'え (e)', romaji: 'e', meaning: 'e' },
        { type: 'vocabulary', word: 'お (o)', romaji: 'o', meaning: 'o' },
      ],
    },
    2: {
      title: 'Katakana Basics',
      content: [
        { type: 'text', text: 'Katakana is used for foreign words and onomatopoeic expressions.' },
        { type: 'vocabulary', word: 'ア (a)', romaji: 'a', meaning: 'a' },
        { type: 'vocabulary', word: 'イ (i)', romaji: 'i', meaning: 'i' },
        { type: 'vocabulary', word: 'ウ (u)', romaji: 'u', meaning: 'u' },
        { type: 'vocabulary', word: 'エ (e)', romaji: 'e', meaning: 'e' },
        { type: 'vocabulary', word: 'オ (o)', romaji: 'o', meaning: 'o' },
      ],
    },
    3: {
      title: 'Basic Greetings',
      content: [
        { type: 'text', text: 'Learn essential Japanese greetings.' },
        { type: 'vocabulary', word: 'こんにちは', romaji: 'konnichiwa', meaning: 'hello (daytime)' },
        { type: 'vocabulary', word: 'おはようございます', romaji: 'ohayou gozaimasu', meaning: 'good morning' },
        { type: 'vocabulary', word: 'こんばんは', romaji: 'konbanwa', meaning: 'good evening' },
        { type: 'vocabulary', word: 'さようなら', romaji: 'sayounara', meaning: 'goodbye' },
        { type: 'vocabulary', word: 'ありがとう', romaji: 'arigatou', meaning: 'thank you' },
      ],
    },
  },
  spanish: {
    1: {
      title: 'Basic Pronunciation',
      content: [
        { type: 'text', text: 'Spanish pronunciation is mostly phonetic. Here are the basic vowel sounds:' },
        { type: 'vocabulary', word: 'a', pronunciation: 'ah', example: 'casa (house)' },
        { type: 'vocabulary', word: 'e', pronunciation: 'eh', example: 'mesa (table)' },
        { type: 'vocabulary', word: 'i', pronunciation: 'ee', example: 'niño (boy)' },
        { type: 'vocabulary', word: 'o', pronunciation: 'oh', example: 'hola (hello)' },
        { type: 'vocabulary', word: 'u', pronunciation: 'oo', example: 'luna (moon)' },
      ],
    },
    2: {
      title: 'Greetings & Introductions',
      content: [
        { type: 'text', text: 'Essential phrases for meeting people:' },
        { type: 'vocabulary', word: 'Hola', meaning: 'Hello' },
        { type: 'vocabulary', word: 'Buenos días', meaning: 'Good morning' },
        { type: 'vocabulary', word: 'Buenas tardes', meaning: 'Good afternoon' },
        { type: 'vocabulary', word: 'Buenas noches', meaning: 'Good evening/night' },
        { type: 'vocabulary', word: '¿Cómo te llamas?', meaning: 'What is your name?' },
        { type: 'vocabulary', word: 'Me llamo...', meaning: 'My name is...' },
      ],
    },
  },
  arabic: {
    1: {
      title: 'Arabic Alphabet',
      content: [
        { type: 'text', text: 'The Arabic alphabet has 28 letters. Here are the first few:' },
        { type: 'vocabulary', word: 'ا (alif)', pronunciation: 'a', meaning: 'a' },
        { type: 'vocabulary', word: 'ب (ba)', pronunciation: 'b', meaning: 'b' },
        { type: 'vocabulary', word: 'ت (ta)', pronunciation: 't', meaning: 't' },
        { type: 'vocabulary', word: 'ث (tha)', pronunciation: 'th', meaning: 'th (as in think)' },
        { type: 'vocabulary', word: 'ج (jim)', pronunciation: 'j', meaning: 'j (as in jam)' },
      ],
    },
    2: {
      title: 'Basic Greetings',
      content: [
        { type: 'text', text: 'Common Arabic greetings:' },
        { type: 'vocabulary', word: 'مرحبا', pronunciation: 'marhaba', meaning: 'hello' },
        { type: 'vocabulary', word: 'صباح الخير', pronunciation: 'sabah al-khair', meaning: 'good morning' },
        { type: 'vocabulary', word: 'مساء الخير', pronunciation: 'masa al-khair', meaning: 'good evening' },
        { type: 'vocabulary', word: 'شكرا', pronunciation: 'shukran', meaning: 'thank you' },
        { type: 'vocabulary', word: 'مع السلامة', pronunciation: 'ma\'a as-salama', meaning: 'goodbye' },
      ],
    },
  },
};

export default function LessonScreen() {
  const { language, lessonId } = useLocalSearchParams();
  const router = useRouter();

  const langContent = lessonContent[language as keyof typeof lessonContent];
  const content = langContent ? langContent[parseInt(lessonId as string) as keyof typeof langContent] : null;

  if (!content) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText type="title">Lesson not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const completeLesson = () => {
    Alert.alert(
      'Lesson Complete!',
      'Great job! You\'ve finished this lesson.',
      [
        { text: 'Next Lesson', onPress: () => router.back() },
        { text: 'Back to Lessons', onPress: () => router.push(`/lessons/${language}`) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {content.title}
          </ThemedText>
        </ThemedView>

        {content.content.map((item: any, index: number) => (
          <ThemedView key={index} style={styles.contentItem}>
            {item.type === 'text' ? (
              <ThemedText style={styles.textContent}>{item.text}</ThemedText>
            ) : (
              <ThemedView style={styles.vocabularyItem}>
                <ThemedText type="subtitle" style={styles.word}>
                  {item.word}
                </ThemedText>
                {item.romaji && (
                  <ThemedText style={styles.romaji}>{item.romaji}</ThemedText>
                )}
                {item.pronunciation && (
                  <ThemedText style={styles.pronunciation}>
                    Pronunciation: {item.pronunciation}
                  </ThemedText>
                )}
                {item.example && (
                  <ThemedText style={styles.example}>Example: {item.example}</ThemedText>
                )}
                <ThemedText style={styles.meaning}>
                  {item.meaning}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        ))}

        <TouchableOpacity style={styles.completeButton} onPress={completeLesson}>
          <ThemedText type="subtitle" style={styles.buttonText}>
            Complete Lesson
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
  title: {
    marginBottom: 10,
  },
  contentItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  vocabularyItem: {
    marginBottom: 15,
  },
  word: {
    fontSize: 20,
    marginBottom: 5,
  },
  romaji: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  pronunciation: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  example: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  meaning: {
    fontSize: 16,
    marginTop: 5,
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
