"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

const strategies = [
  {
    slug: "dijital-kusatma",
    icon: "🔱",
    title: "Dijital Kuşatma Stratejisi",
    desc: "Her kanalda görün, müşteriyi kuşat. Kendinizle rekabet edin.",
    lessons: 4,
    videos: 3,
    status: "active",
  },
  {
    slug: null,
    icon: "📊",
    title: "Veri Odaklı Büyüme",
    desc: "Her kararı veriye dayandır, büyümeyi tahmin edilebilir kıl.",
    status: "coming",
  },
  {
    slug: null,
    icon: "🌱",
    title: "Organik Otorite İnşası",
    desc: "SEO ve içerikle otorite kur, reklam olmadan müşteri çek.",
    status: "coming",
  },
];

const announcements = [
  {
    icon: "🎯",
    title: "Yeni ders: Retargeting Kâr Hesaplama",
    desc: "Dijital Kuşatma stratejisine yeni video ders eklendi.",
    tag: "Yeni",
    tagColor: "#D4B86A",
  },
  {
    icon: "📋",
    title: "Güncelleme: Bütçe Dağılım Şablonu",
    desc: "Excel şablonu revize edildi, 2025 Meta Ads oranları eklendi.",
    tag: "Güncellendi",
    tagColor: "#6ee7b7",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Hoş geldiniz";
  const planLabel = user?.plan === "YILLIK" ? "Yıllık Plan" : "Aylık Plan";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi öğleden sonralar" : "İyi akşamlar";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">

      {/* ── Karşılama ── */}
      <div className="mb-8">
        <p className="text-gray-500 text-sm mb-1">{greeting},</p>
        <h1 className="text-2xl md:text-3xl font-black text-white">{firstName} 👋</h1>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[
          { label: "Aktif Strateji", value: "1", sub: "Dijital Kuşatma", icon: "🔱" },
          { label: "Toplam İçerik", value: "7", sub: "Video & Yazı", icon: "📚" },
          { label: "Yakında", value: "2", sub: "Yeni strateji", icon: "⏳" },
          { label: "Üyelik", value: planLabel, sub: "Aktif", icon: "✅" },
        ].map((s) => (
          <div
            key={s.label}
            className="card p-4 md:p-5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">{s.label}</p>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className="text-xl md:text-2xl font-black" style={{ color: "#D4B86A" }}>{s.value}</p>
            <p className="text-xs text-gray-600">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── İçerik ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Stratejiler — sol, geniş */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white">Stratejiler</h2>
            <Link href="/panel/strateji" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#D4B86A" }}>
              Tümünü gör →
            </Link>
          </div>

          <div className="space-y-3">
            {strategies.map((s) =>
              s.status === "active" ? (
                <Link key={s.title} href={`/panel/strateji/${s.slug}`} className="block group">
                  <div className="card p-5 flex items-center gap-4 group-hover:border-gold-500/30 transition-all duration-200">
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)" }}
                    >
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-sm md:text-base">{s.title}</h3>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: "rgba(201,168,76,0.15)", color: "#D4B86A", border: "1px solid rgba(201,168,76,0.25)" }}
                        >
                          Aktif
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-2">{s.desc}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>📹 {s.videos} video</span>
                        <span>📄 {s.lessons} yazı</span>
                      </div>
                    </div>
                    <div className="text-gray-600 group-hover:text-gold-400 transition-colors text-lg flex-shrink-0">→</div>
                  </div>
                </Link>
              ) : (
                <div key={s.title} className="card p-5 flex items-center gap-4 opacity-40 cursor-not-allowed">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-white/5 border border-white/10 grayscale">
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-500 text-sm md:text-base">{s.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/5 text-gray-600 border border-white/10">
                        Yakında
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{s.desc}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Duyurular — sağ, dar */}
        <div>
          <h2 className="text-lg font-black text-white mb-4">Son Güncellemeler</h2>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.title} className="card p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-white leading-tight">{a.title}</p>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: `${a.tagColor}20`, color: a.tagColor, border: `1px solid ${a.tagColor}40` }}
                      >
                        {a.tag}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Destek kutusu */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.18)" }}
            >
              <p className="text-sm font-bold text-white mb-1">Sorun mu yaşıyorsunuz?</p>
              <p className="text-xs text-gray-500 mb-3">Destek ekibimiz 7/24 hazır.</p>
              <a
                href="https://gerasmedya.com/iletisim"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold transition-colors hover:opacity-80"
                style={{ color: "#D4B86A" }}
              >
                Destek Al →
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
