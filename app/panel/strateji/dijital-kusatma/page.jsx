"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("geras_token") || "";
}

// ── Yazılı dersler (kendi içeriğinizi buraya ekleyin)
const articles = [
  {
    id: "a1",
    no: "01",
    title: "Dijital Kuşatma Stratejisi — Temel Kavramlar",
    duration: "5 dk okuma",
    desc: "Çok kanallı pazarlama nedir, neden tek kanalda kalmak sizi sınırlar ve Dijital Kuşatma mantığı nasıl çalışır.",
    paragraphs: [
      { type: "h2", text: "Dijital Kuşatma Nedir?" },
      { type: "p", text: "Dijital Kuşatma, müşterinizin internette gittiği her yerde markanızın karşısına çıkmasını sağlayan çok kanallı bir reklam stratejisidir." },
      { type: "h2", text: "Neden Tek Kanal Yetmez?" },
      { type: "bullet", text: "Ortalama kullanıcı günde 6+ farklı platformda vakit geçirir" },
      { type: "bullet", text: "Satın alma kararı verilmeden önce marka ortalama 7 kez görülür" },
      { type: "bullet", text: "Rakipleriniz de aynı kanalda — dikkat rekabeti çok yüksek" },
      { type: "h2", text: "Çözüm: Kendinizle Rekabet Edin" },
      { type: "p", text: "Rakibinizi geçmeye çalışmak yerine, müşterinin her adımında siz olun. Instagram'da, Google'da, YouTube'da — o kadar çok yerde görünsünüz ki müşteri sizi kaçırmak istese bile kaçamasın." },
    ],
  },
  {
    id: "a2",
    no: "02",
    title: "Kanal Stratejisi: Meta + Google + YouTube",
    duration: "8 dk okuma",
    desc: "Her kanalın rolü nedir, hangi bütçeyi nereye ayırmalısınız ve kanallar arasındaki sinerjiyi nasıl kurarsınız.",
    paragraphs: [
      { type: "h2", text: "Her Kanalın Rolü" },
      { type: "bold", text: "Meta Ads (Instagram & Facebook):" },
      { type: "p", text: "Keşif ve marka bilinirliği aşaması. Henüz ürününüzü aramayan ama potansiyel müşteri olan kişilere ulaşırsınız." },
      { type: "bold", text: "Google Ads:" },
      { type: "p", text: "Satın alma niyeti yüksek kişilere ulaşma. Ürününüzü aktif olarak arayan kişilerin tam karşısına çıkarsınız." },
      { type: "bold", text: "YouTube Ads:" },
      { type: "p", text: "Güven inşası ve derinleşme. Video içerikle marka hikayenizi anlatır, izleyiciyle duygusal bağ kurarsınız." },
      { type: "h2", text: "Bütçe Dağılımı (Örnek)" },
      { type: "table", rows: [["Kanal","Oran","Amaç"],["Meta Ads","40%","Keşif + Retargeting"],["Google Ads","40%","Niyet + Dönüşüm"],["YouTube","20%","Güven + Bilinirlik"]] },
    ],
  },
  {
    id: "a3",
    no: "03",
    title: "Bütçeyi Kanallara Nasıl Dağıtırım?",
    duration: "6 dk okuma",
    desc: "Aylık reklam bütçenizi verimli dağıtmak için formül ve pratik örnekler.",
    paragraphs: [
      { type: "h2", text: "Başlangıç Bütçesi Formülü" },
      { type: "bold", text: "Test Aşaması (İlk 2 Ay):" },
      { type: "bullet", text: "%60 Meta Ads — geniş kitlede keşif" },
      { type: "bullet", text: "%30 Google Ads — marka + ürün aramaları" },
      { type: "bullet", text: "%10 YouTube — brand awareness" },
      { type: "bold", text: "Optimizasyon Aşaması (3. Ay+):" },
      { type: "p", text: "Hangi kanal daha düşük maliyetle dönüşüm getiriyorsa bütçeyi oraya kaydırın. Retargeting'e toplam bütçenin %20-30'unu ayırın." },
      { type: "h2", text: "Aylık 10.000₺ Bütçe Örneği" },
      { type: "table", rows: [["Kanal","Tutar","Kampanya Türü"],["Meta Keşif","3.000₺","Geniş kitle"],["Meta Retargeting","1.500₺","Site ziyaretçileri"],["Google Arama","3.000₺","Ürün aramaları"],["Google Display","1.000₺","Rakip site ziyaretçileri"],["YouTube","1.500₺","Brand film"]] },
    ],
  },
  {
    id: "a4",
    no: "📋",
    title: "Müşteri Yolculuğu Haritası",
    duration: "Şablon",
    desc: "Müşterinizin temas noktalarını haritalayın. Hangi mesaj, hangi kanalda, hangi aşamada verilmeli?",
    isTemplate: true,
    paragraphs: [
      { type: "h2", text: "Aşama 1 — Farkındalık" },
      { type: "p", text: "Müşteri henüz sizi tanımıyor. Hedef: ilk temas. Kanal: Meta Keşif, YouTube. Mesaj: Sorununu anlatan, çözüm vaat eden içerikler." },
      { type: "h2", text: "Aşama 2 — İlgi" },
      { type: "p", text: "Reklamınızı gördü, siteye girdi ama satın almadı. Kanal: Meta + Google Retargeting. Mesaj: Sosyal kanıt, referanslar." },
      { type: "h2", text: "Aşama 3 — Karar" },
      { type: "p", text: "Alternatifleri karşılaştırıyor. Kanal: Google Arama, YouTube. Mesaj: Neden siz? Teklif, garanti, aciliyet." },
      { type: "h2", text: "Aşama 4 — Satın Alma" },
      { type: "p", text: "Satın almaya hazır. Kanal: Google Alışveriş, Remarketing. Mesaj: Doğrudan CTA, özel indirim." },
    ],
  },
];

function ArticleContent({ paragraphs }) {
  return (
    <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
      {paragraphs.map((p, i) => {
        if (p.type === "h2") return <h4 key={i} className="text-white font-black text-base mt-4 mb-1 first:mt-0">{p.text}</h4>;
        if (p.type === "bold") return <p key={i} className="font-semibold text-gray-200">{p.text}</p>;
        if (p.type === "bullet") return (
          <div key={i} className="flex gap-2">
            <span style={{ color: "#D4B86A" }}>•</span>
            <span>{p.text}</span>
          </div>
        );
        if (p.type === "table") return (
          <div key={i} className="overflow-x-auto my-3">
            <table className="w-full text-xs border-collapse">
              {p.rows.map((row, ri) => (
                <tr key={ri} className={ri === 0 ? "border-b border-white/10" : "border-b border-white/5"}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-3 py-2 ${ri === 0 ? "font-bold text-gray-300 uppercase tracking-wider" : "text-gray-500"}`}
                    >
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

function ArticleCard({ article }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-5 flex items-start gap-4 group">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5"
          style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#D4B86A" }}
        >
          {article.no}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-white text-sm group-hover:text-gold-400 transition-colors leading-snug">
              {article.title}
            </h3>
            {article.isTemplate && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.25)", color: "#D4B86A" }}>
                Şablon
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1">{article.desc}</p>
          <p className="text-xs" style={{ color: "#D4B86A" }}>📖 {article.duration}</p>
        </div>
        <div
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-600 group-hover:text-gray-300 transition-all"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          ▾
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] px-5 py-5">
          <ArticleContent paragraphs={article.paragraphs} />
        </div>
      )}
    </div>
  );
}

export default function DijitalKusatmaPage() {
  const [activeTab, setActiveTab] = useState("video");
  const [videos, setVideos] = useState([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  const levelColors = {
    "Başlangıç": { bg: "rgba(110,231,183,0.12)", border: "rgba(110,231,183,0.25)", text: "#6ee7b7" },
    "Orta":      { bg: "rgba(201,168,76,0.12)",  border: "rgba(201,168,76,0.25)",  text: "#D4B86A" },
    "İleri":     { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   text: "#fca5a5" },
  };

  useEffect(() => {
    fetch(`${API_URL}/api/videos?strategy=dijital-kusatma`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setVideos(data.videos || []);
        if (data.videos?.length) setActiveVideo(data.videos[0].slug);
      })
      .catch(() => setVideos([]))
      .finally(() => setVideoLoading(false));
  }, []);

  const currentVideo = videos.find((v) => v.slug === activeVideo);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">

      {/* Geri */}
      <Link href="/panel/strateji" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-300 transition-colors mb-6">
        ← Stratejilere dön
      </Link>

      {/* Hero */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
          style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "#D4B86A" }}>
          🔱 Strateji #1
        </div>
        <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight">Dijital Kuşatma Stratejisi</h1>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
          Müşteriniz nereye baksa sizi görsün. Instagram&apos;da, Google&apos;da — kendinizle rekabet edin, rakiplerinizle değil.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: "📹", label: "Video", value: `${videos.length} ders` },
          { icon: "📄", label: "Yazı", value: `${articles.length} ders` },
          { icon: "⏱️", label: "Süre", value: "~55 dk" },
        ].map((s) => (
          <div key={s.label} className="card p-3 md:p-4 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <p className="text-xs text-gray-600 mb-0.5">{s.label}</p>
            <p className="text-sm font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tablar */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { key: "video", label: "📹 Videolar", count: videos.length },
          { key: "yazi",  label: "📄 Yazılar & Şablonlar", count: articles.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key ? "text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
            }`}
            style={activeTab === tab.key ? { background: "linear-gradient(135deg, #C9A84C, #A8893D)" } : {}}
          >
            {tab.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-white/5 text-gray-600"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Video Tab ── */}
      {activeTab === "video" && (
        <div>
          {videoLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
            </div>
          ) : videos.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-4xl mb-3">🎬</p>
              <p className="text-gray-400 font-semibold mb-1">Videolar hazırlanıyor</p>
              <p className="text-gray-600 text-sm">Yakında burada olacak.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4">

              {/* Ana player — sol */}
              <div className="lg:col-span-2">
                {currentVideo && (
                  <div>
                    <VideoPlayer slug={currentVideo.slug} title={currentVideo.title} />
                    <div className="mt-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {currentVideo.level && (() => {
                          const lc = levelColors[currentVideo.level] || levelColors["Orta"];
                          return (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: lc.bg, border: `1px solid ${lc.border}`, color: lc.text }}>
                              {currentVideo.level}
                            </span>
                          );
                        })()}
                        {!currentVideo.available && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 text-gray-600 border border-white/10">
                            Yakında
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-black text-white mb-1">{currentVideo.title}</h2>
                      <p className="text-sm text-gray-500 leading-relaxed">{currentVideo.desc}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video listesi — sağ */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Tüm Videolar</p>
                {videos.map((v, i) => (
                  <button
                    key={v.slug}
                    onClick={() => setActiveVideo(v.slug)}
                    className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all duration-200 ${
                      activeVideo === v.slug
                        ? "border"
                        : "hover:bg-white/5"
                    }`}
                    style={activeVideo === v.slug
                      ? { background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.25)" }
                      : { border: "1px solid transparent" }
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={activeVideo === v.slug
                        ? { background: "linear-gradient(135deg, #C9A84C, #A8893D)", color: "white" }
                        : { background: "rgba(255,255,255,0.05)", color: "#888" }
                      }
                    >
                      {v.available ? (activeVideo === v.slug ? "▶" : i + 1) : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-snug ${activeVideo === v.slug ? "text-white" : "text-gray-400"}`}>
                        {v.title}
                      </p>
                      <p className="text-xs text-gray-700 mt-0.5">{v.duration}</p>
                    </div>
                  </button>
                ))}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ── Yazı Tab ── */}
      {activeTab === "yazi" && (
        <div className="space-y-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 p-5 md:p-6 rounded-2xl" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-white mb-1">Bu stratejiyi sizin için uygulayalım mı?</p>
            <p className="text-sm text-gray-500">Geras Medya ekibi olarak Dijital Kuşatma stratejisini işinize özel kurabiliriz.</p>
          </div>
          <a href="https://gerasmedya.com/iletisim" target="_blank" rel="noopener noreferrer"
            className="btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-bold flex-shrink-0">
            Ücretsiz Görüşme Al →
          </a>
        </div>
      </div>

    </div>
  );
}
