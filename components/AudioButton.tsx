import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { AudioService } from '../services/audioService';
import { DataService } from '../services/dataService';

interface AudioButtonProps {
  audioUri?: string;
  text?: string;
  language?: string;
  size?: number;
}

export default function AudioButton({
  audioUri,
  text,
  language,
  size = 24,
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Don't show audio button for English or unsupported languages
  const isAudioAvailable =
    language &&
    language !== 'english' &&
    ['japanese', 'spanish', 'arabic'].includes(language);

  useEffect(() => {
    loadSettings();

    // Cleanup TTS when component unmounts
    return () => {
      AudioService.stop();
    };
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await DataService.getSettings();
      setAudioEnabled(settings.audioEnabled);
    } catch (error) {
      console.error('Error loading audio settings:', error);
    }
  };

  const playAudio = async () => {
    if (!audioEnabled) {
      Alert.alert('Audio Disabled', 'Enable audio in Settings to hear pronunciations.');
      return;
    }

    if (!text) return;

    try {
      setIsLoading(true);
      setIsPlaying(true);

      await AudioService.speak(text, language);

      setIsPlaying(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setIsLoading(false);

      // Show user-friendly error
      Alert.alert(
        'Audio Error',
        'Could not play pronunciation. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    }
  };

  const stopAudio = async () => {
    await AudioService.stop();
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handlePress = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  // Don't render audio button for English or unsupported languages
  if (!isAudioAvailable) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPlaying && styles.playing,
        !audioEnabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={isLoading || !audioEnabled}
      activeOpacity={0.7}
    >
      <IconSymbol
        name={
          isLoading
            ? 'hourglass'
            : isPlaying
            ? 'pause.fill'
            : audioEnabled
            ? 'speaker.wave.2.fill'
            : 'speaker.slash.fill'
        }
        size={size}
        color={isPlaying ? '#FF6B35' : audioEnabled ? '#007AFF' : '#999'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  playing: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  disabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
