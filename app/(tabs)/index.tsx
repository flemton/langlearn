import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const router = useRouter();

  const selectLanguage = (language: string) => {
    router.push(`/lessons/${language}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Choose Your Language
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Start your journey from zero to hero!
      </ThemedText>

      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => selectLanguage('japanese')}
      >
        <ThemedText type="subtitle" style={styles.buttonText}>
          🇯🇵 Japanese
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => selectLanguage('spanish')}
      >
        <ThemedText type="subtitle" style={styles.buttonText}>
          🇪🇸 Spanish
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => selectLanguage('arabic')}
      >
        <ThemedText type="subtitle" style={styles.buttonText}>
          🇸🇦 Arabic
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  languageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
