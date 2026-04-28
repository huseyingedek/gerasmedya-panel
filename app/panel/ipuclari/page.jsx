"use client";
import { useState, useEffect } from "react";
import { articlesApi } from "@/lib/api";

export default function IpuclariPage() {
  const [tips,    setTips]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(null);
  const [filter,  setFilter]  = useState("Tümü");

  useEffect(() => {
    articlesApi.get("ipuclari")
      .then((d) => setTips(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getBlock = (t, type) => t.content?.find?.((b) => b.type === type)?.text || "";

  const tags = ["Tümü", ...Array.from(new Set(tips.map((t) => getBlock(t, "tag")).filter(Boolean)))];
  const filtered = filter === "Tümü" ? tips : tips.filter((t) => getBlock(t, "tag") === filter);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold uppercase tracking-wider"
          style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C9A84C" }} />
          Özel İpuçları
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
          Kimsenin Söylemediği<br />
          <span style={{ background: "linear-gradient(135deg,#C9A84C,#D4B86A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Dijital Pazarlama Sırları
          </span>
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
          Her ipucu uygulanabilir, gerçek veriye dayalı ve çoğu ajansın müşterine söylemediği türden. Aç, oku, uygula.
        </p>
      </div>

      {/* Tag filtresi */}
      {tags.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {tags.map((tag) => (
            <button key={tag} onClick={() => setFilter(tag)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={filter === tag
                ? { background: "rgba(201,168,76,0.18)", color: "#D4B86A", border: "1px solid rgba(201,168,76,0.4)" }
                : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }}>
              {tag}
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
          <div className="text-5xl mb-4">💡</div>
          <p className="text-gray-600">Yakında içerik eklenecek.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, i) => {
            const icon      = getBlock(t, "icon") || "💡";
            const tag       = getBlock(t, "tag");
            const body      = getBlock(t, "body");
            const highlight = getBlock(t, "highlight");
            const isOpen    = open === t.id;

            return (
              <div key={t.id}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  border: isOpen ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(255,255,255,0.07)",
                  background: isOpen ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.02)",
                }}>

                {/* Header */}
                <button
                  onClick={() => setOpen(isOpen ? null : t.id)}
                  className="w-full flex items-center gap-4 p-5 text-left group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300"
                    style={isOpen
                      ? { background: "rgba(201,168,76,0.18)", border: "1px solid rgba(201,168,76,0.35)" }
                      : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#C9A84C" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {tag && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
                          {tag}
                        </span>
                      )}
                    </div>
                    <p className="text-white font-bold text-sm leading-snug pr-4">{t.title}</p>
                  </div>

                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "rotate-180" : ""}`}
                    style={isOpen
                      ? { borderColor: "rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.1)" }
                      : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Content */}
                {isOpen && (
                  <div className="px-5 pb-6">
                    <div className="border-t pt-5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">{body}</p>
                      {highlight && (
                        <div className="rounded-xl px-4 py-3.5 flex items-start gap-3"
                          style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.22)" }}>
                          <span className="text-base flex-shrink-0 mt-0.5">💡</span>
                          <p className="text-sm font-semibold leading-relaxed" style={{ color: "#D4B86A" }}>{highlight}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-xs text-gray-700 mt-10">
          Her hafta yeni ipuçları ekleniyor. Takipte kal.
        </p>
      )}
    </div>
  );
}
