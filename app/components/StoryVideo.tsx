'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { analytics } from '@/lib/analytics';

// The ad is a 9:16 talking-head clip with burned-in captions, so it's shown
// like a social "story": muted autoplay while on screen, tap for sound.
export default function StoryVideo({ className = '', label }: { className?: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!paused) v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [paused]);

  const onTap = () => {
    const v = ref.current;
    if (!v) return;
    if (muted) {
      // First tap: start from the beginning with sound
      v.currentTime = 0;
      v.muted = false;
      setMuted(false);
      analytics.videoSoundOn();
      setPaused(false);
      v.play().catch(() => {});
    } else if (v.paused) {
      setPaused(false);
      v.play().catch(() => {});
    } else {
      setPaused(true);
      v.pause();
    }
  };

  return (
    <div className={`relative aspect-[9/16] overflow-hidden rounded-[2rem] bg-ink shadow-[0_40px_80px_-30px_rgba(13,31,26,0.55)] ${className}`}>
      <video
        ref={ref}
        className="h-full w-full object-cover"
        poster="/thumbnail.png"
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
        aria-label="Video about Forever Arctic Sea for kids"
      >
        <source src="/ad.mp4" type="video/mp4" />
      </video>

      {/* Story-style progress */}
      <div className="absolute inset-x-4 top-4 h-[3px] overflow-hidden rounded-full bg-white/30">
        <div className="h-full bg-white" style={{ width: `${progress * 100}%` }} />
      </div>
      {label && (
        <span className="pointer-events-none absolute left-4 top-6 rounded-full bg-ink/60 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur">
          {label}
        </span>
      )}

      <button onClick={onTap} className="absolute inset-0" aria-label={muted ? 'Play with sound' : paused ? 'Play' : 'Pause'} />

      <AnimatePresence mode="wait">
        <motion.span
          key={muted ? 'm' : paused ? 'p' : 'on'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white/85 px-4 py-2 text-[13px] font-semibold text-ink backdrop-blur"
        >
          {muted ? (
            'Tap for sound'
          ) : paused ? (
            'Paused · tap to play'
          ) : (
            <>
              <span className="flex h-3 items-end gap-[2px]" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-[3px] rounded-full bg-leaf"
                    animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
              Sound on
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
