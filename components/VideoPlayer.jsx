"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { progressApi } from "@/lib/api";

const SAVE_INTERVAL = 10;      // saniyede bir pozisyon kaydet
const AUTO_COMPLETE = 85;      // %85'te tamamlandı say

export default function VideoPlayer({ slug, strategy, title, savedPosition = 0, savedPercent = 0, onComplete }) {
  const videoRef   = useRef(null);
  const saveTimer  = useRef(null);
  const lastSaved  = useRef(0);

  const [playing,      setPlaying]      = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [watchPct,     setWatchPct]     = useState(savedPercent);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [volume,       setVolume]       = useState(1);
  const [muted,        setMuted]        = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [autoCompleted,setAutoCompleted]= useState(false);

  const hideTimer = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [src, setSrc] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("geras_token") || "";
    setSrc(`${API_URL}/api/videos/${slug}/stream?token=${token}`);
  }, [slug, API_URL]);

  // Pozisyon kaydet
  const savePosition = useCallback(async (pos, dur) => {
    if (!slug || !strategy || !dur) return;
    try {
      const res = await progressApi.savePosition(slug, strategy, pos, dur);
      setWatchPct(res.watchPercent);
      if (res.autoCompleted && !autoCompleted) {
        setAutoCompleted(true);
        onComplete?.(slug);
      }
    } catch {}
  }, [slug, strategy, autoCompleted, onComplete]);

  // Metadata yüklenince kaldığı yere git
  const handleMetadata = (e) => {
    const dur = e.target.duration;
    setDuration(dur);
    setLoading(false);
    if (savedPosition > 10 && savedPosition < dur - 5) {
      e.target.currentTime = savedPosition;
    }
  };

  // Time update — ilerleme + periyodik kayıt
  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const t = vid.currentTime;
    const d = vid.duration;
    setCurrentTime(t);
    setProgress(d ? (t / d) * 100 : 0);

    // Her SAVE_INTERVAL saniyede bir kaydet
    if (t - lastSaved.current >= SAVE_INTERVAL) {
      lastSaved.current = t;
      savePosition(t, d);
    }
  };

  // Video bitince kaydet
  const handleEnded = () => {
    setPlaying(false);
    setShowControls(true);
    if (duration) savePosition(duration, duration);
  };

  // Kontrolleri otomatik gizle
  const resetHide = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    // Unmount'ta son pozisyonu kaydet
    const vid = videoRef.current;
    if (vid && vid.currentTime > 0) savePosition(vid.currentTime, vid.duration);
  }, [savePosition]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    resetHide();
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    videoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
    resetHide();
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v); setMuted(v === 0);
    if (videoRef.current) videoRef.current.volume = v;
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
    if (!next && volume === 0) { setVolume(0.5); if (videoRef.current) videoRef.current.volume = 0.5; }
    resetHide();
  };

  const toggleFullscreen = () => {
    const el = videoRef.current?.closest(".video-wrapper");
    if (!document.fullscreenElement) { el?.requestFullscreen(); }
    else { document.exitFullscreen(); }
    resetHide();
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (error) return (
    <div className="video-wrapper w-full flex flex-col items-center justify-center gap-3 rounded-2xl"
      style={{ aspectRatio: "16/9", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <span className="text-4xl">🎬</span>
      <p className="text-gray-500 text-sm">Video henüz yüklenmedi.</p>
    </div>
  );

  return (
    <div
      className="video-wrapper relative w-full rounded-2xl overflow-hidden bg-black select-none"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={resetHide}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onPlay={() => { setPlaying(true); resetHide(); }}
        onPause={() => { setPlaying(false); setShowControls(true); }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadata}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onEnded={handleEnded}
        onError={() => { if (src) { setError(true); setLoading(false); } }}
        onClick={togglePlay}
        preload="metadata"
      />

      {/* Loading */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="w-9 h-9 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      )}

      {/* İzlenme yüzdesi — sağ üst */}
      {watchPct > 0 && (
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            background: watchPct >= AUTO_COMPLETE ? "rgba(52,211,153,0.2)" : "rgba(0,0,0,0.7)",
            border: watchPct >= AUTO_COMPLETE ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,255,255,0.1)",
            color: watchPct >= AUTO_COMPLETE ? "#34d399" : "#aaa",
          }}>
          %{watchPct} izlendi
        </div>
      )}

      {/* Merkez play */}
      {!playing && !loading && (
        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </button>
      )}

      {/* Kontroller */}
      <div className="absolute bottom-0 left-0 right-0 transition-opacity duration-300"
        style={{ opacity: showControls ? 1 : 0, background: "linear-gradient(transparent,rgba(0,0,0,0.85))", padding: "40px 16px 12px" }}>

        {title && <p className="text-white text-xs font-semibold mb-3 truncate opacity-70">{title}</p>}

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-3 cursor-pointer relative group"
          style={{ background: "rgba(255,255,255,0.2)" }} onClick={handleSeek}>
          {/* İzlenen kısım (gri) */}
          <div className="h-full rounded-full opacity-40" style={{ width: `${watchPct}%`, background: "#D4B86A" }} />
          {/* Anlık pozisyon */}
          <div className="absolute top-0 left-0 h-full rounded-full"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg,#C9A84C,#D4B86A)" }} />
          {/* Handle */}
          <div className="absolute top-1/2 w-3 h-3 rounded-full shadow"
            style={{ left: `${progress}%`, transform: "translateX(-50%) translateY(-50%)", background: "#D4B86A" }} />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-white hover:text-gold-400 transition-colors">
            {playing
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
          </button>

          <button onClick={toggleMute} className="text-white hover:text-gold-400 transition-colors">
            {muted || volume === 0
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0017.73 19l2 2L21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>}
          </button>

          <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
            onChange={handleVolume} className="w-14 h-1 cursor-pointer accent-yellow-500" />

          <span className="text-white text-xs flex-1">{fmt(currentTime)} / {fmt(duration)}</span>

          <button onClick={toggleFullscreen} className="text-white hover:text-gold-400 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
