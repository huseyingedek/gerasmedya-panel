"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import { progressApi } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const STRATEGY = "dijital-kusatma";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("geras_token") || "";
}

const articles = [
  {
    id: "a1",
    title: "Dijital Kuşatma — Temel Kavramlar",
    duration: "5 dk",
    paragraphs: [
      { type: "h2", text: "Dijital Kuşatma Nedir?" },
      { type: "p", text: "Müşterinizin internette gittiği her yerde markanızın karşısına çıkmasını sağlayan çok kanallı bir reklam stratejisidir." },
      { type: "h2", text: "Neden Tek Kanal Yetmez?" },
      { type: "bullet", text: "Ortalama kullanıcı günde 6+ farklı platformda vakit geçirir" },
      { type: "bullet", text: "Satın alma kararı verilmeden önce marka ortalama 7 kez görülür" },
      { type: "bullet", text: "Rakipleriniz de aynı kanalda — dikkat rekabeti çok yüksek" },
      { type: "h2", text: "Çözüm" },
      { type: "p", text: "Rakibinizi geçmeye çalışmak yerine, müşterinin her adımında siz olun." },
    ],
  },
  {
    id: "a2",
    title: "Kanal Stratejisi: Meta + Google + YouTube",
    duration: "8 dk",
    paragraphs: [
      { type: "h2", text: "Her Kanalın Rolü" },
      { type: "bold", text: "Meta Ads — Keşif aşaması" },
      { type: "p", text: "Henüz ürününüzü aramayan ama potansiyel müşteri olan kişilere ulaşırsınız." },
      { type: "bold", text: "Google Ads — Niyet aşaması" },
      { type: "p", text: "Ürününüzü aktif olarak arayan kişilerin tam karşısına çıkarsınız." },
      { type: "bold", text: "YouTube Ads — Güven aşaması" },
      { type: "p", text: "Video içerikle marka hikayenizi anlatır, izleyiciyle duygusal bağ kurarsınız." },
      { type: "table", rows: [["Kanal","Oran","Amaç"],["Meta Ads","40%","Keşif + Retargeting"],["Google Ads","40%","Niyet + Dönüşüm"],["YouTube","20%","Güven + Bilinirlik"]] },
    ],
  },
  {
    id: "a3",
    title: "Bütçeyi Kanallara Nasıl Dağıtırım?",
    duration: "6 dk",
    paragraphs: [
      { type: "h2", text: "İlk 2 Ay — Test Aşaması" },
      { type: "bullet", text: "%60 Meta Ads — geniş kitlede keşif" },
      { type: "bullet", text: "%30 Google Ads — marka + ürün aramaları" },
      { type: "bullet", text: "%10 YouTube — brand awareness" },
      { type: "h2", text: "Örnek: Aylık 10.000₺ Bütçe" },
      { type: "table", rows: [["Kanal","Tutar"],["Meta Keşif","3.000₺"],["Meta Retargeting","1.500₺"],["Google Arama","3.000₺"],["Google Display","1.000₺"],["YouTube","1.500₺"]] },
    ],
  },
  {
    id: "a4",
    title: "Müşteri Yolculuğu Haritası",
    duration: "Şablon",
    isTemplate: true,
    paragraphs: [
      { type: "h2", text: "Aşama 1 — Farkındalık" },
      { type: "p", text: "Kanal: Meta Keşif, YouTube. Mesaj: Sorununu anlatan, çözüm vaat eden içerikler." },
      { type: "h2", text: "Aşama 2 — İlgi" },
      { type: "p", text: "Kanal: Meta + Google Retargeting. Mesaj: Sosyal kanıt, referanslar." },
      { type: "h2", text: "Aşama 3 — Karar" },
      { type: "p", text: "Kanal: Google Arama, YouTube. Mesaj: Neden siz? Teklif, garanti." },
      { type: "h2", text: "Aşama 4 — Satın Alma" },
      { type: "p", text: "Kanal: Google Alışveriş, Remarketing. Mesaj: Doğrudan CTA, özel indirim." },
    ],
  },
];

function ArticleContent({ paragraphs }) {
  return (
    <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
      {paragraphs.map((p, i) => {
        if (p.type === "h2") return <p key={i} className="text-white font-bold text-sm mt-5 first:mt-0">{p.text}</p>;
        if (p.type === "bold") return <p key={i} className="text-gray-200 font-semibold">{p.text}</p>;
        if (p.type === "bullet") return (
          <div key={i} className="flex gap-2 pl-2">
            <span style={{ color: "#D4B86A" }}>·</span>
            <span>{p.text}</span>
          </div>
        );
        if (p.type === "table") return (
          <div key={i} className="overflow-x-auto rounded-xl mt-2" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <table className="w-full text-xs">
              {p.rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: ri < p.rows.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-2.5 ${ri === 0 ? "text-gray-500 uppercase tracking-wider text-xs font-semibold bg-white/[0.02]" : "text-gray-400"}`}>
                      {cell}
                    </td>
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

export default function DijitalKusatmaPage() {
  const [activeTab,        setActiveTab]        = useState("video");
  const [videos,           setVideos]           = useState([]);
  const [videoLoading,     setVideoLoading]     = useState(true);
  const [activeVideo,      setActiveVideo]      = useState(null);
  const [expandedArticle,  setExpandedArticle]  = useState(null);
  const [completedSlugs,   setCompletedSlugs]   = useState(new Set());
  const [toggleLoading,    setToggleLoading]    = useState(null);
  const [videoProgressMap, setVideoProgressMap] = useState({});

  const allContent    = [...videos.map((v) => v.slug), ...articles.map((a) => a.id)];
  const completedCount = allContent.filter((s) => completedSlugs.has(s)).length;
  const progressPct   = allContent.length > 0 ? Math.round((completedCount / allContent.length) * 100) : 0;

  useEffect(() => {
    progressApi.get(STRATEGY).then((d) => {
      const completed = new Set();
      const map = {};
      d.progress.forEach((p) => {
        if (p.completed) completed.add(p.slug);
        if (p.type === "video") map[p.slug] = { position: p.position, watchPercent: p.watchPercent };
      });
      setCompletedSlugs(completed);
      setVideoProgressMap(map);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/videos?strategy=${STRATEGY}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setVideos(d.videos || []);
        if (d.videos?.length) setActiveVideo(d.videos[0].slug);
      })
      .catch(() => {})
      .finally(() => setVideoLoading(false));
  }, []);

  const handleToggle = useCallback(async (slug, type) => {
    setToggleLoading(slug);
    try {
      const res = await progressApi.toggle(slug, type, STRATEGY);
      setCompletedSlugs((prev) => {
        const next = new Set(prev);
        res.completed ? next.add(slug) : next.delete(slug);
        return next;
      });
    } catch {}
    finally { setToggleLoading(null); }
  }, []);

  const currentVideo = videos.find((v) => v.slug === activeVideo);

  return (
    /* Sayfa — full height, flex col */
    <div className="flex flex-col min-h-screen">

      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-20 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link href="/panel/egitim" className="text-gray-600 hover:text-gray-300 transition-colors text-sm flex items-center gap-2">
          ← Eğitimlere dön
        </Link>

        {/* Kurs başlığı — ortada */}
        <p className="hidden md:block text-white text-sm font-semibold truncate max-w-xs">Dijital Kuşatma Stratejisi</p>

        {/* İlerleme */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-28 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100 ? "#34d399" : "linear-gradient(90deg,#C9A84C,#D4B86A)",
                }}
              />
            </div>
            <span className="text-xs text-gray-600">{completedCount}/{allContent.length}</span>
          </div>
          <span className="text-xs font-bold" style={{ color: progressPct === 100 ? "#34d399" : "#D4B86A" }}>
            %{progressPct}
          </span>
        </div>
      </div>

      {/* ── Ana içerik: sol video + sağ panel ── */}
      <div className="flex flex-1 min-h-0">

        {/* SOL — video + alt bilgi */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          {/* Video */}
          <div className="w-full bg-black flex-shrink-0">
            {videoLoading ? (
              <div className="flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                <div className="w-6 h-6 rounded-full border-2 animate-spin"
                  style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
              </div>
            ) : !currentVideo ? (
              <div className="flex items-center justify-center text-gray-600 text-sm" style={{ aspectRatio: "16/9" }}>
                Videolar yakında eklenecek.
              </div>
            ) : (
              <VideoPlayer
                slug={currentVideo.slug}
                strategy={STRATEGY}
                title={currentVideo.title}
                savedPosition={videoProgressMap[currentVideo.slug]?.position || 0}
                savedPercent={videoProgressMap[currentVideo.slug]?.watchPercent || 0}
                onComplete={(slug) => setCompletedSlugs((prev) => new Set([...prev, slug]))}
              />
            )}
          </div>

          {/* Alt: Tab + içerik */}
          <div className="px-6 md:px-8 py-6 max-w-3xl">

            {/* Video bilgisi */}
            {currentVideo && (
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-white font-bold text-lg leading-snug mb-1">{currentVideo.title}</p>
                  <p className="text-gray-600 text-sm">{currentVideo.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(currentVideo.slug, "video")}
                  disabled={toggleLoading === currentVideo.slug}
                  className={`flex-shrink-0 flex items-center gap-2 text-sm font-medium transition-all px-4 py-2 rounded-lg ${
                    completedSlugs.has(currentVideo.slug) ? "text-green-400" : "text-gray-500 hover:text-white"
                  }`}
                  style={completedSlugs.has(currentVideo.slug)
                    ? { background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }
                    : { border: "1px solid rgba(255,255,255,0.08)" }}
                >
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
            <div className="flex gap-5 border-b mb-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {[
                { key: "video", label: "Genel Bakış" },
                { key: "yazi",  label: "Yazılar & Şablonlar" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                    activeTab === tab.key ? "text-white" : "text-gray-600 hover:text-gray-400 border-transparent"
                  }`}
                  style={activeTab === tab.key ? { borderBottomColor: "#C9A84C" } : {}}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Genel bakış */}
            {activeTab === "video" && (
              <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                <p>Bu stratejide Meta Ads, Google Ads ve YouTube&apos;u senkronize kullanarak müşterinin her dijital adımında görünür olmayı öğreneceksiniz.</p>
                <div className="grid grid-cols-3 gap-3 py-4">
                  {[
                    { label: "Video", val: `${videos.length} ders` },
                    { label: "Yazı", val: `${articles.length} kaynak` },
                    { label: "Süre", val: "~55 dk" },
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
                    className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: "#D4B86A" }}>
                    Ücretsiz görüşme al →
                  </a>
                </div>
              </div>
            )}

            {/* Yazılar */}
            {activeTab === "yazi" && (
              <div className="space-y-2">
                {articles.map((article) => {
                  const done = completedSlugs.has(article.id);
                  const open = expandedArticle === article.id;
                  return (
                    <div key={article.id} className="rounded-2xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.06)", background: done ? "rgba(52,211,153,0.03)" : "rgba(255,255,255,0.02)" }}>
                      <div className="flex items-center gap-4 px-5 py-4">
                        <button onClick={() => handleToggle(article.id, "article")}
                          disabled={toggleLoading === article.id}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                            done ? "border-transparent bg-green-500" : "border-gray-700 hover:border-gray-500"
                          }`}>
                          {done && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <button onClick={() => setExpandedArticle(open ? null : article.id)}
                          className="flex-1 flex items-center gap-3 text-left min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${done ? "text-gray-600 line-through" : "text-white"}`}>
                                {article.title}
                              </p>
                              {article.isTemplate && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                  style={{ background: "rgba(201,168,76,0.12)", color: "#D4B86A" }}>Şablon</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-700 mt-0.5">📖 {article.duration}</p>
                          </div>
                          <span className="text-gray-700 text-xs flex-shrink-0"
                            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                        </button>
                      </div>
                      {open && (
                        <div className="px-5 pb-6 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <div className="pt-5 pl-9">
                            <ArticleContent paragraphs={article.paragraphs} />
                            {!done && (
                              <button onClick={() => handleToggle(article.id, "article")}
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

        {/* SAĞ — kurs içeriği paneli (Udemy gibi) */}
        <div
          className="hidden lg:flex flex-col w-80 xl:w-96 flex-shrink-0 overflow-y-auto border-l"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}
        >
          {/* Panel başlık */}
          <div className="px-5 py-4 border-b flex-shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-white font-bold text-sm">Kurs İçeriği</p>
            <p className="text-gray-600 text-xs mt-0.5">
              {videos.length} video · {articles.length} yazı
            </p>
          </div>

          {/* Video listesi */}
          <div className="flex-1">
            {/* Bölüm başlığı */}
            <div className="px-5 py-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Videolar</p>
            </div>

            {videoLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 rounded-full border-2 animate-spin"
                  style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
              </div>
            ) : (
              <div>
                {videos.map((v, i) => {
                  const done   = completedSlugs.has(v.slug);
                  const active = activeVideo === v.slug;
                  const pct    = videoProgressMap[v.slug]?.watchPercent || 0;
                  return (
                    <button
                      key={v.slug}
                      onClick={() => setActiveVideo(v.slug)}
                      className="w-full text-left flex items-start gap-3 px-5 py-4 transition-all border-b"
                      style={{
                        borderColor: "rgba(255,255,255,0.04)",
                        background: active
                          ? "rgba(201,168,76,0.07)"
                          : "transparent",
                      }}
                    >
                      {/* Numara / ikon */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                        done ? "bg-green-500" : active ? "bg-yellow-900/60" : "bg-white/5"
                      }`}
                        style={active && !done ? { border: `1px solid #C9A84C`, color: "#C9A84C" } : {}}>
                        {done ? (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : active ? "▶" : (
                          <span className="text-gray-600">{i + 1}</span>
                        )}
                      </div>

                      {/* Başlık + süre + progress */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-snug ${done ? "text-gray-600" : active ? "text-white" : "text-gray-400"}`}>
                          {v.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-700">🎬 {v.duration}</span>
                        </div>
                        {/* Mini progress bar */}
                        {pct > 0 && !done && (
                          <div className="mt-1.5 w-full h-0.5 rounded-full bg-white/8">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#C9A84C" }} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Yazılar bölümü */}
                <div className="px-5 py-3 border-b border-t mt-1"
                  style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yazılar & Şablonlar</p>
                </div>

                {articles.map((a) => {
                  const done = completedSlugs.has(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => { setActiveTab("yazi"); setExpandedArticle(a.id); }}
                      className="w-full text-left flex items-start gap-3 px-5 py-4 transition-all border-b hover:bg-white/[0.02]"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-green-500" : "bg-white/5"}`}>
                        {done ? (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : <span className="text-gray-600 text-xs">📄</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-snug ${done ? "text-gray-600" : "text-gray-400"}`}>
                          {a.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-700">📖 {a.duration}</span>
                          {a.isTemplate && (
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>
                              Şablon
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
