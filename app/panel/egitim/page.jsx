"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { coursesApi } from "@/lib/api";

// Bilinen kategorilerin tercih sırası (diğerleri arkaya eklenir)
const PREFERRED_ORDER = ["strateji", "reklam", "analitik", "icerik"];

function CourseCard({ c }) {
  const active = c.active;

  const inner = (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
        active ? "hover:scale-[1.01] hover:shadow-xl" : "opacity-50 cursor-not-allowed grayscale"
      }`}
      style={{
        border:     active ? `1px solid ${c.accentColor}22` : "1px solid rgba(255,255,255,0.05)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      {/* Üst renkli bant */}
      <div className={`h-28 bg-gradient-to-br ${c.gradient} flex items-end px-5 pb-4 relative`}>
        <div className="text-3xl select-none mr-3">{c.icon}</div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: `${c.accentColor}22`, color: c.accentColor, border: `1px solid ${c.accentColor}30` }}>
          {c.categoryLabel}
        </span>

        {/* Aktif / Yakında badge */}
        {active ? (
          <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: `${c.accentColor}20`, color: c.accentColor, border: `1px solid ${c.accentColor}35` }}>
            ● Aktif
          </span>
        ) : (
          <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium bg-black/40 text-gray-400 border border-white/10">
            Yakında
          </span>
        )}
      </div>

      {/* Alt kısım */}
      <div className="px-5 py-4">
        <p className="text-white font-bold text-base mb-1 leading-snug">{c.title}</p>
        <p className="text-gray-500 text-xs leading-relaxed mb-4">{c.desc}</p>
        {active && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-700">
              {c.videoCount > 0 && <span>🎬 {c.videoCount} video</span>}
            </div>
            <span className="text-xs font-semibold" style={{ color: c.accentColor }}>Başla →</span>
          </div>
        )}
      </div>
    </div>
  );

  if (active) return <Link href={c.href} className="block group">{inner}</Link>;
  return <div>{inner}</div>;
}

export default function EgitimPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi.getAll()
      .then((d) => setCourses(d.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // DB'deki kurslardan unique kategorileri türet (categoryLabel kullan)
  const uniqueCats = Object.values(
    courses.reduce((acc, c) => {
      if (c.category && !acc[c.category])
        acc[c.category] = { cat: c.category, label: c.categoryLabel || c.category };
      return acc;
    }, {})
  );
  // Tercih sırasına göre sırala, bilinmeyenler sona gelir
  uniqueCats.sort((a, b) => {
    const ai = PREFERRED_ORDER.indexOf(a.cat);
    const bi = PREFERRED_ORDER.indexOf(b.cat);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  const grouped = uniqueCats
    .map(({ cat, label }) => ({ cat, label, list: courses.filter((c) => c.category === cat) }))
    .filter((g) => g.list.length > 0);

  const activeCount = courses.filter((c) => c.active).length;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-white mb-1">Eğitimler</h1>
        <p className="text-gray-600 text-sm">
          {firstName ? `Merhaba ${firstName} — ` : ""}
          {loading ? "Yükleniyor..." : `${activeCount} eğitim aktif, ${courses.length - activeCount} yakında geliyor.`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.length === 0 && (
            <div className="text-center py-20 text-gray-600 text-sm">Henüz aktif eğitim yok.</div>
          )}
          {grouped.map(({ cat, label, list }) => (
            <div key={cat}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold">{label}</p>
                <p className="text-xs text-gray-700">{list.length} kurs</p>
              </div>
              {/* Yatay scroll — 10+ kart için */}
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                {list.map((c) => (
                  <div key={c.slug} className="flex-shrink-0 w-72">
                    <CourseCard c={c} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-14 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <p className="text-xs text-gray-700">
          Sorularınız için{" "}
          <a href="https://gerasmedya.com/iletisim" target="_blank" rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity" style={{ color: "#D4B86A" }}>
            destek alın →
          </a>
        </p>
      </div>
    </div>
  );
}
