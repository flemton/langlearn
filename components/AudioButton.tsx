import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { IconSymbol } from './ui/IconSymbol';

interface AudioButtonProps {
  audioUri?: string;
  text?: string;
  language?: string;
  size?: number;
}

export default function AudioButton({ audioUri, text, language, size = 24 }: AudioButtonProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async () => {
    try {
      setIsLoading(true);

      if (sound) {
        await sound.unloadAsync();
      }

      // For demo purposes, we'll use a simple beep sound
      // In a real app, you'd load actual pronunciation audio files
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Listen for playback status updates
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setIsLoading(false);
          }
        }
      });

      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

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
