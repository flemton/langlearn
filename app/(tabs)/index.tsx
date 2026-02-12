import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AudioButton from '@/components/AudioButton';

export default function HomeScreen() {
  const router = useRouter();

  const selectLanguage = (language: string) => {
    router.push(`/lessons/${language}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        <View style={styles.buttonContent}>
          <ThemedText type="subtitle" style={styles.buttonText}>
            🇯🇵 Japanese
          </ThemedText>
          <AudioButton
            text="Japanese"
            language="japanese"
            size={20}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => selectLanguage('spanish')}
      >
        <View style={styles.buttonContent}>
          <ThemedText type="subtitle" style={styles.buttonText}>
            🇪🇸 Spanish
          </ThemedText>
          <AudioButton
            text="Spanish"
            language="spanish"
            size={20}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => selectLanguage('arabic')}
      >
        <View style={styles.buttonContent}>
          <ThemedText type="subtitle" style={styles.buttonText}>
            🇸🇦 Arabic
          </ThemedText>
          <AudioButton
            text="Arabic"
            language="arabic"
            size={20}
          />
        </View>
      </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    flex: 1,
  },
});
