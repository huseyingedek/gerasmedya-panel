"use client";
import { useRef, useState, useEffect } from "react";

export default function VideoPlayer({ slug, title }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const hideTimeout = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  function getToken() {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("geras_token") || "";
  }

  const src = `${API_URL}/api/videos/${slug}/stream?token=${getToken()}`;

  // Otomatik kontrol gizle
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (playing) {
      hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    return () => { if (hideTimeout.current) clearTimeout(hideTimeout.current); };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    resetHideTimer();
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    const d = videoRef.current.duration;
    setCurrentTime(t);
    setProgress(d ? (t / d) * 100 : 0);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    videoRef.current.currentTime = ratio * duration;
    resetHideTimer();
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    setMuted(v === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !muted;
    setMuted(next);
    videoRef.current.muted = next;
    if (!next && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
    resetHideTimer();
  };

  const toggleFullscreen = () => {
    const el = videoRef.current?.parentElement?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
    resetHideTimer();
  };

  if (error) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl text-center"
        style={{ aspectRatio: "16/9", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-4xl">🎬</span>
        <p className="text-gray-500 text-sm">Video henüz yüklenmedi.</p>
        <p className="text-gray-700 text-xs">Backend klasörüne MP4 ekleyin.</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-black group"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onPlay={() => { setPlaying(true); resetHideTimer(); }}
        onPause={() => { setPlaying(false); setShowControls(true); }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => { setDuration(e.target.duration); setLoading(false); }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
        onClick={togglePlay}
        preload="metadata"
      />

      {/* Loading spinner */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }}
          />
        </div>
      )}

      {/* Center play button (when paused) */}
      {!playing && !loading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #C9A84C, #A8893D)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Controls overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-opacity duration-300"
        style={{
          opacity: showControls ? 1 : 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          padding: "40px 16px 12px",
        }}
      >
        {/* Title */}
        {title && (
          <p className="text-white text-xs font-semibold mb-3 truncate opacity-80">{title}</p>
        )}

        {/* Progress bar */}
        <div
          className="w-full h-1 rounded-full mb-3 cursor-pointer relative group/bar"
          style={{ background: "rgba(255,255,255,0.2)" }}
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full transition-none"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #C9A84C, #D4B86A)" }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow group/bar-hover:scale-125 transition-transform"
            style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)`, background: "#D4B86A" }}
          />
        </div>

        {/* Buttons row */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-gold-400 transition-colors flex-shrink-0">
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Volume */}
          <button onClick={toggleMute} className="text-white hover:text-gold-400 transition-colors flex-shrink-0">
            {muted || volume === 0 ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0017.73 19l2 2L21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="w-16 h-1 cursor-pointer accent-yellow-500"
          />

          {/* Time */}
          <span className="text-white text-xs flex-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="text-white hover:text-gold-400 transition-colors flex-shrink-0">
            {fullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
