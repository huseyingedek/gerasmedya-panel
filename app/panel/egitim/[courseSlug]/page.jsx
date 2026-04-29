"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import { progressApi, articlesApi, coursesApi, engageApi } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("geras_token") || "";
}

// ── Yazı içerik renderer ──────────────────────────────────────────
function ArticleContent({ content }) {
  if (!Array.isArray(content)) return null;
  return (
    <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
      {content.map((p, i) => {
        if (p.type === "h2")     return <p key={i} className="text-white font-bold text-sm mt-5 first:mt-0">{p.text}</p>;
        if (p.type === "bold")   return <p key={i} className="text-gray-200 font-semibold">{p.text}</p>;
        if (p.type === "bullet") return (
          <div key={i} className="flex gap-2 pl-2">
            <span style={{ color: "#D4B86A" }}>·</span><span>{p.text}</span>
          </div>
        );
        if (p.type === "table") return (
          <div key={i} className="overflow-x-auto rounded-xl mt-2" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <table className="w-full text-xs">
              {p.rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: ri < p.rows.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-2.5 ${ri === 0 ? "text-gray-500 uppercase tracking-wider text-xs font-semibold bg-white/[0.02]" : "text-gray-400"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </table>
          </div>
        );
        return <p key={i}>{p.text}</p>;
      })}
    </div>
  );
}

export default function CourseWatchPage() {
  const { courseSlug } = useParams();

  const [courseInfo,      setCourseInfo]      = useState(null);
  const [videos,          setVideos]          = useState([]);
  const [articles,        setArticles]        = useState([]);
  const [videoLoading,    setVideoLoading]    = useState(true);
  const [activeVideo,     setActiveVideo]     = useState(null);
  const [activeTab,       setActiveTab]       = useState("video");
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [completedSlugs,  setCompletedSlugs]  = useState(new Set());
  const [toggleLoading,   setToggleLoading]   = useState(null);
  const [videoProgressMap,setVideoProgressMap]= useState({});

  // Engage
  const [note,            setNote]            = useState("");
  const [noteSaved,       setNoteSaved]       = useState(false);
  const [noteSaving,      setNoteSaving]      = useState(false);
  const [myRating,        setMyRating]        = useState(0);
  const [avgRating,       setAvgRating]       = useState(0);
  const [ratingCount,     setRatingCount]     = useState(0);
  const [comments,        setComments]        = useState([]);
  const [commentText,     setCommentText]     = useState("");
  const [commentSaving,   setCommentSaving]   = useState(false);
  const [commentError,    setCommentError]    = useState("");
  const [videoRatingsMap, setVideoRatingsMap] = useState({});

  const allContent     = [...videos.map((v) => v.slug), ...articles.map((a) => String(a.id))];
  const completedCount = allContent.filter((s) => completedSlugs.has(s)).length;
  const progressPct    = allContent.length > 0 ? Math.round((completedCount / allContent.length) * 100) : 0;

  // Kurs bilgisi
  useEffect(() => {
    coursesApi.getAll().then((d) => {
      const c = d.courses?.find((x) => x.slug === courseSlug);
      if (c) setCourseInfo(c);
    }).catch(() => {});
  }, [courseSlug]);

  // Progress
  useEffect(() => {
    progressApi.get(courseSlug).then((d) => {
      const completed = new Set();
      const map = {};
      d.progress.forEach((p) => {
        if (p.completed) completed.add(p.slug);
        if (p.type === "video") map[p.slug] = { position: p.position, watchPercent: p.watchPercent };
      });
      setCompletedSlugs(completed);
      setVideoProgressMap(map);
    }).catch(() => {});
  }, [courseSlug]);

  // Videolar
  useEffect(() => {
    fetch(`${API_URL}/api/videos?strategy=${courseSlug}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setVideos(d.videos || []);
        if (d.videos?.length) setActiveVideo(d.videos[0].slug);
      })
      .catch(() => {})
      .finally(() => setVideoLoading(false));
  }, [courseSlug]);

  // Yazılar
  useEffect(() => {
    articlesApi.get(courseSlug).then((d) => setArticles(d.articles || [])).catch(() => {});
  }, [courseSlug]);

  const handleToggle = useCallback(async (slug, type) => {
    setToggleLoading(slug);
    try {
      const res = await progressApi.toggle(slug, type, courseSlug);
      setCompletedSlugs((prev) => {
        const next = new Set(prev);
        res.completed ? next.add(slug) : next.delete(slug);
        return next;
      });
    } catch {}
    finally { setToggleLoading(null); }
  }, [courseSlug]);

  // Tüm videoların puanlarını yükle (sidebar için)
  useEffect(() => {
    if (!videos.length) return;
    Promise.all(
      videos.map((v) =>
        engageApi.getRating(v.slug)
          .then((d) => ({ slug: v.slug, avg: d.avg, count: d.count }))
          .catch(() => ({ slug: v.slug, avg: 0, count: 0 }))
      )
    ).then((results) => {
      const map = {};
      results.forEach(({ slug, avg, count }) => { map[slug] = { avg, count }; });
      setVideoRatingsMap(map);
    });
  }, [videos]);

  // Aktif video değişince not + puan + yorumları yükle
  useEffect(() => {
    if (!activeVideo) return;
    engageApi.getNote(activeVideo).then((d) => setNote(d.content || "")).catch(() => {});
    engageApi.getRating(activeVideo).then((d) => {
      setMyRating(d.myRating || 0);
      setAvgRating(d.avg || 0);
      setRatingCount(d.count || 0);
    }).catch(() => {});
    engageApi.getComments(activeVideo).then((d) => setComments(d.comments || [])).catch(() => {});
    setNoteSaved(false);
    setCommentText("");
  }, [activeVideo]);

  const handleSaveNote = async () => {
    if (!activeVideo) return;
    setNoteSaving(true);
    await engageApi.saveNote(activeVideo, note).catch(() => {});
    setNoteSaving(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleRate = async (r) => {
    if (!activeVideo) return;
    const d = await engageApi.saveRating(activeVideo, r).catch(() => null);
    if (d) {
      setMyRating(d.myRating);
      setAvgRating(d.avg);
      setRatingCount(d.count);
      setVideoRatingsMap((prev) => ({ ...prev, [activeVideo]: { avg: d.avg, count: d.count } }));
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeVideo) return;
    setCommentSaving(true);
    setCommentError("");
    try {
      const c = await engageApi.addComment(activeVideo, commentText);
      setComments((prev) => [c, ...prev]);
      setCommentText("");
    } catch (err) {
      setCommentError(err.message || "Yorum gönderilemedi.");
    }
    setCommentSaving(false);
  };

  const handleDeleteComment = async (id) => {
    if (!activeVideo) return;
    await engageApi.deleteComment(activeVideo, id).catch(() => {});
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const currentVideo = videos.find((v) => v.slug === activeVideo);
  const accent = courseInfo?.accentColor || "#C9A84C";

  return (
    <div className="flex flex-col min-h-screen">

      {/* Top bar */}
      <div className="sticky top-0 z-20 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/panel/egitim" className="text-gray-600 hover:text-gray-300 transition-colors text-sm flex items-center gap-2">
          ← Eğitimlere dön
        </Link>
        <p className="hidden md:block text-white text-sm font-semibold truncate max-w-xs">
          {courseInfo?.title || "Kurs"}
        </p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-28 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: progressPct === 100 ? "#34d399" : `linear-gradient(90deg,${accent},${accent}bb)` }} />
            </div>
            <span className="text-xs text-gray-600">{completedCount}/{allContent.length}</span>
          </div>
          <span className="text-xs font-bold" style={{ color: progressPct === 100 ? "#34d399" : accent }}>
            %{progressPct}
          </span>
        </div>
      </div>

      {/* Ana layout: sol video + sağ panel */}
      <div className="flex flex-1 min-h-0">

        {/* SOL */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          {/* Video alanı */}
          <div className="w-full bg-black flex-shrink-0">
            {videoLoading ? (
              <div className="flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                <div className="w-6 h-6 rounded-full border-2 animate-spin"
                  style={{ borderColor: accent, borderTopColor: "transparent" }} />
              </div>
            ) : !currentVideo ? (
              <div className="flex flex-col items-center justify-center text-gray-600 text-sm gap-3"
                style={{ aspectRatio: "16/9" }}>
                <span className="text-4xl">🎬</span>
                <p>Bu kursa henüz video eklenmedi.</p>
              </div>
            ) : (
              <VideoPlayer
                slug={currentVideo.slug}
                strategy={courseSlug}
                title={currentVideo.title}
                savedPosition={videoProgressMap[currentVideo.slug]?.position || 0}
                savedPercent={videoProgressMap[currentVideo.slug]?.watchPercent || 0}
                onComplete={(slug) => setCompletedSlugs((prev) => new Set([...prev, slug]))}
              />
            )}
          </div>

          {/* Alt: info + tabs */}
          <div className="px-6 md:px-8 py-6 max-w-3xl">

            {/* Video bilgisi */}
            {currentVideo && (
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-white font-bold text-lg leading-snug mb-1">{currentVideo.title}</p>
                  <p className="text-gray-600 text-sm">{currentVideo.desc}</p>
                  {/* Kaynaklar */}
                  {currentVideo.resources?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {currentVideo.resources.map((r) => (
                        <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc" }}>
                          {r.type === "pdf" ? "📄" : r.type === "file" ? "📁" : "🔗"} {r.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleToggle(currentVideo.slug, "video")}
                  disabled={toggleLoading === currentVideo.slug}
                  className={`flex-shrink-0 flex items-center gap-2 text-sm font-medium transition-all px-4 py-2 rounded-lg ${
                    completedSlugs.has(currentVideo.slug) ? "text-green-400" : "text-gray-500 hover:text-white"
                  }`}
                  style={completedSlugs.has(currentVideo.slug)
                    ? { background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }
                    : { border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    completedSlugs.has(currentVideo.slug) ? "border-green-400 bg-green-400" : "border-gray-600"
                  }`}>
                    {completedSlugs.has(currentVideo.slug) && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {completedSlugs.has(currentVideo.slug) ? "Tamamlandı" : "Tamamlandı işaretle"}
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-5 border-b mb-6 overflow-x-auto" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {[
                { key: "video",    label: "Genel Bakış" },
                ...(articles.length > 0 ? [{ key: "yazi", label: "Yazılar & Şablonlar" }] : []),
                { key: "notlar",   label: "📝 Notlarım" },
                { key: "yorumlar", label: "💬 Yorumlar" + (comments.length > 0 ? ` (${comments.length})` : "") },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${
                    activeTab === tab.key ? "text-white" : "text-gray-600 hover:text-gray-400 border-transparent"
                  }`}
                  style={activeTab === tab.key ? { borderBottomColor: accent } : {}}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Genel bakış */}
            {activeTab === "video" && (
              <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                {courseInfo?.desc && <p>{courseInfo.desc}</p>}
                <div className="grid grid-cols-3 gap-3 py-4">
                  {[
                    { label: "Video", val: `${videos.length} ders` },
                    { label: "Yazı",  val: `${articles.length} kaynak` },
                    { label: "İlerleme", val: `%${progressPct}` },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl p-4 text-center"
                      style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                      <p className="text-white font-bold text-lg">{s.val}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <p className="text-gray-600 text-sm mb-2">Bu stratejiyi sizin için uygulamamızı ister misiniz?</p>
                  <a href="https://gerasmedya.com/iletisim" target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: accent }}>
                    Ücretsiz görüşme al →
                  </a>
                </div>
              </div>
            )}

            {/* Notlarım */}
            {activeTab === "notlar" && (
              <div className="space-y-4">
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Kişisel Notların</p>
                  <p className="text-gray-600 text-xs mb-3">Bu notlar sadece sana görünür. Video izlerken aklına gelenleri buraya yaz.</p>
                  <textarea
                    value={note}
                    onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }}
                    rows={10}
                    placeholder="Notlarını buraya yaz..."
                    className="w-full px-4 py-3 rounded-xl text-sm text-white leading-relaxed resize-none focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", minHeight: 200 }}
                  />
                </div>
                <button
                  onClick={handleSaveNote}
                  disabled={noteSaving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  style={{ background: noteSaved ? "rgba(52,211,153,0.15)" : `linear-gradient(135deg,${accent},#A8893D)`, color: noteSaved ? "#34d399" : "#fff", border: noteSaved ? "1px solid rgba(52,211,153,0.3)" : "none" }}>
                  {noteSaving ? "Kaydediliyor..." : noteSaved ? "✓ Kaydedildi" : "Kaydet"}
                </button>
              </div>
            )}

            {/* Yorumlar */}
            {activeTab === "yorumlar" && (
              <div className="space-y-6">
                {/* Puanlama */}
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-white font-semibold text-sm mb-3">Bu videoyu puanla</p>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <button key={star} onClick={() => handleRate(star)}
                          className="text-2xl transition-transform hover:scale-110">
                          <span style={{ color: star <= myRating ? "#F59E0B" : "rgba(255,255,255,0.15)" }}>★</span>
                        </button>
                      ))}
                    </div>
                    {ratingCount > 0 && (
                      <span className="text-xs text-gray-600">
                        Ortalama {avgRating} · {ratingCount} oy
                      </span>
                    )}
                  </div>
                </div>

                {/* Yorum yaz */}
                <div>
                  <p className="text-white font-semibold text-sm mb-3">Yorum yaz</p>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    placeholder="Düşüncelerini paylaş, soru sor..."
                    className="w-full px-4 py-3 rounded-xl text-sm text-white resize-none focus:outline-none mb-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={handleAddComment}
                      disabled={commentSaving || !commentText.trim()}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                      style={{ background: `linear-gradient(135deg,${accent},#A8893D)`, color: "#fff" }}>
                      {commentSaving ? "Gönderiliyor..." : "Gönder"}
                    </button>
                    {commentError && (
                      <p className="text-red-400 text-xs">{commentError}</p>
                    )}
                  </div>
                </div>

                {/* Yorum listesi */}
                {comments.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-8">Henüz yorum yok. İlk yorumu sen yap!</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="rounded-xl p-4 group"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                              style={{ background: `linear-gradient(135deg,${accent},#A8893D)` }}>
                              {c.userName?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span className="text-white text-sm font-semibold">{c.userName}</span>
                            <span className="text-gray-700 text-xs">
                              {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                            </span>
                          </div>
                          <button onClick={() => handleDeleteComment(c.id)}
                            className="text-xs text-gray-700 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
                            Sil
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Yazılar */}
            {activeTab === "yazi" && (
              <div className="space-y-2">
                {articles.map((article) => {
                  const aid  = String(article.id);
                  const done = completedSlugs.has(aid);
                  const open = expandedArticle === aid;
                  return (
                    <div key={article.id} className="rounded-2xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.06)", background: done ? "rgba(52,211,153,0.03)" : "rgba(255,255,255,0.02)" }}>
                      <div className="flex items-center gap-4 px-5 py-4">
                        <button onClick={() => handleToggle(aid, "article")}
                          disabled={toggleLoading === aid}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                            done ? "border-transparent bg-green-500" : "border-gray-700 hover:border-gray-500"
                          }`}>
                          {done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </button>
                        <button onClick={() => setExpandedArticle(open ? null : aid)}
                          className="flex-1 flex items-center gap-3 text-left min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${done ? "text-gray-600 line-through" : "text-white"}`}>{article.title}</p>
                              {article.isTemplate && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                  style={{ background: `${accent}15`, color: accent }}>Şablon</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-700 mt-0.5">📖 {article.duration || "—"}</p>
                          </div>
                          <span className="text-gray-700 text-xs flex-shrink-0"
                            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                        </button>
                      </div>
                      {open && (
                        <div className="px-5 pb-6 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <div className="pt-5 pl-9">
                            <ArticleContent content={article.content} />
                            {/* Kaynaklar */}
                            {article.resources?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                {article.resources.map((r) => (
                                  <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full hover:opacity-80 transition-all"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#ccc" }}>
                                    {r.type === "pdf" ? "📄" : r.type === "file" ? "📁" : "🔗"} {r.title}
                                  </a>
                                ))}
                              </div>
                            )}
                            {!done && (
                              <button onClick={() => handleToggle(aid, "article")}
                                className="mt-6 flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors">
                                <span className="w-4 h-4 rounded-full border border-gray-700 flex items-center justify-center" />
                                Tamamlandı olarak işaretle
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SAĞ — kurs içeriği paneli */}
        <div className="hidden lg:flex flex-col w-80 xl:w-96 flex-shrink-0 overflow-y-auto border-l"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>

          <div className="px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-white font-bold text-sm">Kurs İçeriği</p>
            <p className="text-gray-600 text-xs mt-0.5">{videos.length} video · {articles.length} yazı</p>
          </div>

          {/* Videolar */}
          {videos.length > 0 && (
            <>
              <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Videolar</p>
              </div>
              {videos.map((v, i) => {
                const done   = completedSlugs.has(v.slug);
                const active = activeVideo === v.slug;
                const pct    = videoProgressMap[v.slug]?.watchPercent || 0;
                return (
                  <button key={v.slug} onClick={() => setActiveVideo(v.slug)}
                    className="w-full text-left flex items-start gap-3 px-5 py-4 transition-all border-b"
                    style={{ borderColor: "rgba(255,255,255,0.04)", background: active ? `${accent}10` : "transparent" }}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${done ? "bg-green-500" : "bg-white/5"}`}
                      style={active && !done ? { border: `1px solid ${accent}`, color: accent } : {}}>
                      {done ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : active ? "▶" : <span className="text-gray-600">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-snug ${done ? "text-gray-600" : active ? "text-white" : "text-gray-400"}`}>{v.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-700">🎬 {v.duration}</span>
                        {videoRatingsMap[v.slug]?.count > 0 && (
                          <span className="flex items-center gap-0.5">
                            <span style={{ color: "#F59E0B", fontSize: 11 }}>★</span>
                            <span className="text-xs text-gray-500">{videoRatingsMap[v.slug].avg}</span>
                          </span>
                        )}
                      </div>
                      {pct > 0 && !done && (
                        <div className="mt-1.5 w-full h-0.5 rounded-full bg-white/8">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* Yazılar */}
          {articles.length > 0 && (
            <>
              <div className="px-5 py-3 border-b border-t" style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yazılar & Şablonlar</p>
              </div>
              {articles.map((a) => {
                const aid  = String(a.id);
                const done = completedSlugs.has(aid);
                return (
                  <button key={a.id}
                    onClick={() => { setActiveTab("yazi"); setExpandedArticle(aid); }}
                    className="w-full text-left flex items-start gap-3 px-5 py-4 transition-all border-b hover:bg-white/[0.02]"
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-green-500" : "bg-white/5"}`}>
                      {done ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : <span className="text-gray-600 text-xs">📄</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-snug ${done ? "text-gray-600" : "text-gray-400"}`}>{a.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-700">📖 {a.duration || "—"}</span>
                        {a.isTemplate && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${accent}15`, color: accent }}>Şablon</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
