import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { AudioService } from '../services/audioService';

interface AudioButtonProps {
  audioUri?: string;
  text?: string;
  language?: string;
  size?: number;
}

export default function AudioButton({ audioUri, text, language, size = 24 }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Don't show audio button for English or unsupported languages
  const isAudioAvailable = language && language !== 'english' && ['japanese', 'spanish', 'arabic'].includes(language);

  useEffect(() => {
    return () => {
      // Cleanup TTS when component unmounts
      AudioService.stop();
    };
  }, []);

  const playAudio = async () => {
    try {
      setIsLoading(true);
      setIsPlaying(true);

      // Use TTS to speak the text
      if (text) {
        await AudioService.speak(text, language);
      }

      setIsPlaying(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setIsLoading(false);
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
      style={[styles.button, isPlaying && styles.playing]}
      onPress={handlePress}
      disabled={isLoading}
    >
      <IconSymbol
        name={isLoading ? "hourglass" : isPlaying ? "pause.fill" : "speaker.wave.2.fill"}
        size={size}
        color={isPlaying ? "#FF6B35" : "#007AFF"}
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
});
