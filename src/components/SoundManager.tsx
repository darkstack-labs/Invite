import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

// Royalty-free background music
const AMBIENT_MUSIC_URL = "https://cdn.pixabay.com/audio/2024/11/29/audio_7a02c19c95.mp3";

interface SoundContextType {
  musicPlaying: boolean;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSounds = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSounds must be used within SoundProvider');
  }
  return context;
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [musicStarted, setMusicStarted] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const music = new Audio(AMBIENT_MUSIC_URL);
    music.loop = true;
    music.volume = 0.25;
    musicRef.current = music;

    return () => {
      music.pause();
      music.src = '';
    };
  }, []);

  // Try autoplay or play on first interaction
  useEffect(() => {
    const tryAutoplay = async () => {
      if (musicRef.current && !musicStarted) {
        try {
          await musicRef.current.play();
          setMusicStarted(true);
        } catch {
          // Autoplay blocked, will play on first interaction
        }
      }
    };

    tryAutoplay();

    const handleFirstInteraction = async () => {
      if (musicRef.current && !musicStarted) {
        try {
          await musicRef.current.play();
          setMusicStarted(true);
        } catch (e) {
          console.log('Music playback failed:', e);
        }
      }
    };

    // Listen for first user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [musicStarted]);

  return (
    <SoundContext.Provider value={{ musicPlaying: musicStarted }}>
      {children}
    </SoundContext.Provider>
  );
};
