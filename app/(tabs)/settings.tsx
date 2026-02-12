import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { DataService } from '@/services/dataService';

interface SettingsState {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<SettingsState>({
    audioEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [exportImportLoading, setExportImportLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await DataService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleSetting = async (key: keyof SettingsState) => {
    try {
      const newSettings = { ...settings, [key]: !settings[key] };
      setSettings(newSettings);
      await DataService.updateSettings({ [key]: !settings[key] });
    } catch (error) {
      console.error('Error saving setting:', error);
      Alert.alert('Error', 'Failed to save setting');
    }
  };

  const handleExportData = async () => {
    try {
      setExportImportLoading(true);
      const data = await DataService.exportData();

      // Create a temporary file
      const fileName = `langlearn_backup_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, data);

      // Share the file
      await Share.share({
        title: 'LangLearn Backup',
        message: 'Here is your LangLearn data backup',
        url: filePath,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Error', 'Failed to export data. Please try again.');
    } finally {
      setExportImportLoading(false);
    }
  };

  const handleImportData = async () => {
    try {
      setExportImportLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setExportImportLoading(false);
        return;
      }

      const fileContent = await FileSystem.readAsStringAsync(
        result.assets[0].uri
      );

      Alert.alert(
        'Import Data',
        'This will overwrite all your current progress. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                await DataService.importData(fileContent);
                Alert.alert(
                  'Success',
                  'Data imported successfully!',
                  [{ text: 'OK', onPress: () => loadSettings() }]
                );
              } catch {
                Alert.alert(
                  'Import Error',
                  'Failed to import data. Please check the file format.'
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Import Error', 'Failed to import data');
    } finally {
      setExportImportLoading(false);
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset All Progress',
      'This will delete all your learning progress, achievements, and streaks. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'This is your last chance to cancel. All progress will be permanently lost.',
              [
                { text: 'Keep My Progress', style: 'cancel' },
                {
                  text: 'Yes, Reset Everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setIsLoading(true);
                      await DataService.resetAllProgress();
                      Alert.alert(
                        'Progress Reset',
                        'All your progress has been reset. Happy learning!'
                      );
                    } catch {
                      Alert.alert('Error', 'Failed to reset progress');
                    } finally {
                      setIsLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    description,
    value,
    onToggle,
    disabled = false,
  }: {
    icon: string;
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.disabled]}
      onPress={onToggle}
      disabled={disabled}
    >
      <ThemedView style={styles.settingIconContainer}>
        <IconSymbol name={icon} size={24} color="#007AFF" />
      </ThemedView>
      <ThemedView style={styles.settingTextContainer}>
        <ThemedText type="subtitle" style={styles.settingTitle}>
          {title}
        </ThemedText>
        <ThemedText style={styles.settingDescription}>{description}</ThemedText>
      </ThemedView>
      <ThemedView
        style={[styles.toggle, value && styles.toggleActive, disabled && styles.toggleDisabled]}
      >
        <ThemedView
          style={[styles.toggleKnob, value && styles.toggleKnobActive]}
        />
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Settings
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Customize your learning experience
          </ThemedText>
        </ThemedView>

        {/* Learning Settings */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Learning
          </ThemedText>

          <SettingItem
            icon="speaker.wave.2.fill"
            title="Audio Pronunciation"
            description="Play audio for words and phrases"
            value={settings.audioEnabled}
            onToggle={() => toggleSetting('audioEnabled')}
          />

          <SettingItem
            icon="hand.tap.fill"
            title="Haptic Feedback"
            description="Vibrate on lesson completion"
            value={settings.hapticsEnabled}
            onToggle={() => toggleSetting('hapticsEnabled')}
          />

          <SettingItem
            icon="bell.fill"
            title="Notifications"
            description="Daily study reminders (coming soon)"
            value={settings.notificationsEnabled}
            onToggle={() => toggleSetting('notificationsEnabled')}
            disabled={true}
          />
        </ThemedView>

        {/* Data Management */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data Management
          </ThemedText>

          <ThemedView style={styles.dataButtons}>
            <TouchableOpacity
              style={styles.dataButton}
              onPress={handleExportData}
              disabled={exportImportLoading}
            >
              {exportImportLoading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <>
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={20}
                    color="#007AFF"
                    style={styles.buttonIcon}
                  />
                  <ThemedText style={styles.dataButtonText}>
                    Export Backup
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dataButton}
              onPress={handleImportData}
              disabled={exportImportLoading}
            >
              {exportImportLoading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <>
                  <IconSymbol
                    name="square.and.arrow.down"
                    size={20}
                    color="#007AFF"
                    style={styles.buttonIcon}
                  />
                  <ThemedText style={styles.dataButtonText}>
                    Import Backup
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </ThemedView>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetProgress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FF3B30" />
            ) : (
              <>
                <IconSymbol
                  name="trash"
                  size={20}
                  color="#FF3B30"
                  style={styles.buttonIcon}
                />
                <ThemedText style={styles.resetButtonText}>
                  Reset All Progress
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        </ThemedView>

        {/* About */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>

          <ThemedView style={styles.aboutContainer}>
            <ThemedText style={styles.aboutText}>
              LangLearn v1.0
            </ThemedText>
            <ThemedText style={styles.aboutDescription}>
              Learn languages for free, completely offline. Your data stays on
              your device.
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
  container: {
    flex: 1,
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
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 14,
    opacity: 0.5,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  disabled: {
    opacity: 0.5,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleDisabled: {
    backgroundColor: '#f0f0f0',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    transform: [{ translateX: 0 }],
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  dataButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  dataButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  dataButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#ffe5e5',
    borderRadius: 10,
  },
  resetButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  aboutContainer: {
    padding: 20,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aboutDescription: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
  },
});
