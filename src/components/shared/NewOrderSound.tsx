"use client";

import { useCallback, useRef } from "react";

// Web Audio API chime sound — no external files needed
export function useNewOrderSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      // Create a pleasant two-tone chime
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        // Smooth envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = ctx.currentTime;

      // Pleasant two-tone chime (E5 → G5)
      playTone(659.25, now, 0.3);        // E5
      playTone(783.99, now + 0.15, 0.4); // G5

    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  }, []);

  return { playSound };
}
