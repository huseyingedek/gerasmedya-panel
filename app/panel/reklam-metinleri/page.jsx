"use client";
import { useState, useEffect } from "react";
import { articlesApi } from "@/lib/api";
import Pagination from "@/app/panel/components/Pagination";

const PAGE_SIZE = 20;

const SECTORS = [
  "Tümü", "E-ticaret", "Hizmet", "Restoran / Kafe", "Gayrimenkul",
  "Sağlık", "Eğitim", "Teknoloji", "Kozmetik", "Turizm", "Güzellik Salonu", "Genel",
];

const FORMAT_ICONS = {
  "Instagram Post":      "📸",
  "Instagram Hikaye":    "⭕",
  "Reels / TikTok Hook": "🎬",
  "WhatsApp Mesajı":     "💬",
  "Bio Şablonu":         "👤",
  "Yorum Yanıtı":        "💭",
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0"
      style={copied
        ? { background: "rgba(16,185,129,0.15)", color: "#4ade80", border: "1px solid rgba(16,185,129,0.3)" }
        : { background: "rgba(255,255,255,0.05)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.1)" }}>
      {copied ? (
        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Kopyalandı</>
      ) : (
        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg> Kopyala</>
      )}
    </button>
  );
}

export default function SosyalMedyaPage() {
  const [copies,     setCopies]     = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [sector,     setSector]     = useState("Tümü");
  const [page,       setPage]       = useState(1);
  const [expanded,   setExpanded]   = useState(null);

  const getBlock = (c, type) => c.content?.find?.((b) => b.type === type)?.text || "";

  const load = (p = 1) => {
    setLoading(true);
    articlesApi.get("sosyal-medya", p, PAGE_SIZE)
      .then((d) => {
        setCopies(d.articles || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const filtered = copies.filter((c) => {
    const s = getBlock(c, "sector");
    return sector === "Tümü" || s === sector;
  });

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold uppercase tracking-wider"
          style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C9A84C" }} />
          Sosyal Medya Şablonları
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
          Kopyala, Doldur,<br />
          <span style={{ background: "linear-gradient(135deg,#C9A84C,#D4B86A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Paylaş.
          </span>
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
          Her şablon köşeli parantezlerdeki kısımları kendi bilgilerinle değiştirerek kullanmaya hazır.
          Instagram&apos;dan WhatsApp&apos;a, bio&apos;dan yorum yanıtına kadar her şey burada.
        </p>
      </div>

      {/* Nasıl kullanılır? */}
      <div className="mb-8 rounded-2xl p-4 flex items-start gap-3"
        style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
        <span className="text-lg flex-shrink-0">📌</span>
        <div>
          <p className="text-sm font-bold text-white mb-1">Nasıl kullanılır?</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Şablonu kopyala → <span style={{ color: "#D4B86A" }}>[köşeli parantez]</span> içindeki kısımları kendi bilgilerinle değiştir → Instagram, WhatsApp veya nereye paylaşacaksan yapıştır.
          </p>
        </div>
      </div>

      {/* Sektör filtresi */}
      <div className="mb-8">
        <div className="flex gap-2 flex-wrap">
          {SECTORS.map((s) => (
            <button key={s} onClick={() => { setSector(s); setPage(1); }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={sector === s
                ? { background: "rgba(201,168,76,0.18)", color: "#D4B86A", border: "1px solid rgba(201,168,76,0.4)" }
                : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {!loading && (
        <div className="mb-5 flex items-center gap-2">
          <span className="text-xs text-gray-600">
            {filtered.length === 0 ? "Sonuç bulunamadı" : `${filtered.length} şablon`}
          </span>
          {sector !== "Tümü" && (
            <button onClick={() => setSector("Tümü")}
              className="text-xs px-2 py-0.5 rounded-full transition-all"
              style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)", background: "rgba(201,168,76,0.08)" }}>
              ✕ Temizle
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">📱</div>
          <p className="text-gray-600 mb-2">Bu sektöre uygun şablon bulunamadı.</p>
          <button onClick={() => setSector("Tümü")} className="text-sm mt-2" style={{ color: "#C9A84C" }}>
            Tüm şablonları gör →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const format  = getBlock(c, "format");
            const sector_ = getBlock(c, "sector");
            const copy    = getBlock(c, "copy");
            const tip     = getBlock(c, "tip");
            const isOpen  = expanded === c.id;
            const icon    = FORMAT_ICONS[format] || "📱";

            return (
              <div key={c.id}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  border: isOpen ? "1px solid rgba(201,168,76,0.3)" : "1px solid rgba(255,255,255,0.07)",
                  background: isOpen ? "rgba(201,168,76,0.03)" : "rgba(255,255,255,0.02)",
                }}>

                <div className="p-5">
                  {/* Badge'ler */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"
                      style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}>
                      {icon} {format}
                    </span>
                    {sector_ && sector_ !== "Genel" && (
                      <span className="text-xs px-2 py-1 rounded-full"
                        style={{ background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }}>
                        {sector_}
                      </span>
                    )}
                  </div>

                  {/* Metin + Kopyala */}
                  <div className="flex items-start gap-3">
                    <p className="text-gray-200 text-sm leading-relaxed flex-1 whitespace-pre-wrap">{copy}</p>
                    <CopyButton text={copy} />
                  </div>
                </div>

                {/* İpucu toggle */}
                {tip && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : c.id)}
                      className="w-full flex items-center gap-2 px-5 py-3 text-left transition-all"
                      style={{ color: isOpen ? "#D4B86A" : "#6b7280" }}>
                      <span className="text-xs font-semibold">
                        {isOpen ? "▲" : "▼"} Kullanım ipucu
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4">
                        <div className="rounded-xl px-4 py-3 flex items-start gap-2.5"
                          style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.18)" }}>
                          <span className="text-base flex-shrink-0 mt-0.5">💡</span>
                          <p className="text-sm leading-relaxed" style={{ color: "#D4B86A" }}>{tip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => { setPage(p); load(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      />

      {!loading && filtered.length > 0 && (
        <p className="text-center text-xs text-gray-700 mt-10">
          Her hafta yeni şablonlar ekleniyor. Takipte kal.
        </p>
      )}
    </div>
  );
}
