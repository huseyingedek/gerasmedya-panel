"use client";
import { useState, useEffect } from "react";
import { articlesApi } from "@/lib/api";

const FILE_TYPE_META = {
  notion:  { icon: "📓", label: "Notion",          color: "#ffffff" },
  excel:   { icon: "📊", label: "Excel",            color: "#1D6F42" },
  pdf:     { icon: "📄", label: "PDF",              color: "#E03E2D" },
  canva:   { icon: "🎨", label: "Canva",            color: "#9B59B6" },
  gdocs:   { icon: "📝", label: "Google Docs",      color: "#4285F4" },
  sheets:  { icon: "🔢", label: "Google Sheets",    color: "#0F9D58" },
  figma:   { icon: "🖌️", label: "Figma",           color: "#F24E1E" },
  other:   { icon: "📁", label: "Dosya",            color: "#6b7280" },
};

export default function SablonlarPage() {
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("Tümü");

  useEffect(() => {
    articlesApi.get("sablonlar")
      .then((d) => setTemplates(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getBlock = (t, type) => t.content?.find?.((b) => b.type === type)?.text || "";

  const cats = ["Tümü", ...Array.from(new Set(templates.map((t) => getBlock(t, "category")).filter(Boolean)))];
  const filtered = filter === "Tümü" ? templates : templates.filter((t) => getBlock(t, "category") === filter);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold uppercase tracking-wider"
          style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C9A84C" }} />
          Hazır Şablonlar
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
          Copy-Paste Hazır<br />
          <span style={{ background: "linear-gradient(135deg,#C9A84C,#D4B86A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Strateji Şablonları
          </span>
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
          Sıfırdan başlamak zorunda değilsin. Her şablon sahada test edilmiş, uygulamaya hazır. İndir, kendi verilerini gir, kullan.
        </p>
      </div>

      {/* Kategori filtresi */}
      {cats.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {cats.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={filter === cat
                ? { background: "rgba(201,168,76,0.18)", color: "#D4B86A", border: "1px solid rgba(201,168,76,0.4)" }
                : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-600">Yakında şablonlar eklenecek.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => {
            const cat      = getBlock(t, "category");
            const desc     = getBlock(t, "desc");
            const usage    = getBlock(t, "usage");
            const url      = getBlock(t, "downloadUrl");
            const fileType = getBlock(t, "fileType") || "other";
            const meta     = FILE_TYPE_META[fileType] || FILE_TYPE_META.other;

            return (
              <div key={t.id} className="rounded-2xl flex flex-col overflow-hidden group transition-all duration-300 hover:scale-[1.01]"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>

                {/* Card top */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {meta.icon}
                    </div>
                    <div className="flex gap-1.5">
                      {cat && (
                        <span className="text-xs px-2 py-1 rounded-full"
                          style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
                          {cat}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-sm leading-snug mb-2">{t.title}</h3>
                  {desc && <p className="text-gray-500 text-xs leading-relaxed mb-3">{desc}</p>}

                  {usage && (
                    <div className="rounded-lg p-3 mb-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-1.5">Nasıl Kullanılır?</p>
                      <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{usage}</p>
                    </div>
                  )}
                </div>

                {/* Download button */}
                <div className="p-4 pt-0">
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
                      <span>{meta.icon}</span>
                      {meta.label}&apos;de Aç
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.07)" }}>
                      🔒 Yakında
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="mt-10 rounded-2xl p-6 text-center"
          style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.12)" }}>
          <p className="text-gray-400 text-sm">
            Her hafta yeni şablonlar ekleniyor.
            <span className="ml-1" style={{ color: "#C9A84C" }}>Toplam {templates.length} şablon mevcut.</span>
          </p>
        </div>
      )}
    </div>
  );
}
