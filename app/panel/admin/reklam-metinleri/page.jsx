"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";

const COURSE_SLUG = "reklam-metinleri";

const PLATFORMS = ["Meta Ads", "Google Ads", "LinkedIn Ads", "TikTok Ads", "YouTube Ads", "E-posta", "SMS"];
const FORMATS   = ["Başlık (Headline)", "Ana Metin (Primary)", "Açıklama", "CTA", "Konu Satırı", "Genel Metin"];
const SECTORS   = ["E-ticaret", "Hizmet", "Restoran / Kafe", "Gayrimenkul", "Sağlık", "Eğitim", "Teknoloji", "Kozmetik", "Turizm", "Genel"];
const TONES     = ["Aciliyet", "Merak", "Sosyal Kanıt", "Fayda Odaklı", "Soru", "Rakam / Veri", "Hikaye", "FOMO"];

const EMPTY = {
  title: "", platform: "Meta Ads", format: "Ana Metin (Primary)",
  sector: "Genel", tone: "Fayda Odaklı", copyText: "", why: "", order: 0,
};

export default function AdminReklamMetinleriPage() {
  const [copies,  setCopies]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [filter,  setFilter]  = useState("Tümü");

  const load = () => {
    setLoading(true);
    adminApi.getArticles(COURSE_SLUG)
      .then((d) => setCopies(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (c) => {
    const blocks = Array.isArray(c.content) ? c.content : [];
    setForm({
      title:    c.title,
      platform: blocks.find((b) => b.type === "platform")?.text || "Meta Ads",
      format:   blocks.find((b) => b.type === "format")?.text   || "Ana Metin (Primary)",
      sector:   blocks.find((b) => b.type === "sector")?.text   || "Genel",
      tone:     blocks.find((b) => b.type === "tone")?.text     || "Fayda Odaklı",
      copyText: blocks.find((b) => b.type === "copy")?.text     || "",
      why:      blocks.find((b) => b.type === "why")?.text      || "",
      order:    c.order || 0,
    });
    setEditing(c);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.copyText) return alert("Reklam metni zorunlu.");
    setSaving(true);
    const title = form.title || `${form.platform} — ${form.format}`;
    const content = [
      { type: "platform", text: form.platform },
      { type: "format",   text: form.format },
      { type: "sector",   text: form.sector },
      { type: "tone",     text: form.tone },
      { type: "copy",     text: form.copyText },
      { type: "why",      text: form.why },
    ];
    try {
      const payload = { courseSlug: COURSE_SLUG, title, duration: "", isTemplate: false, order: form.order, content };
      if (editing) await adminApi.updateArticle(editing.id, payload);
      else         await adminApi.createArticle(payload);
      setModal(false);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Bu metin silinsin mi?`)) return;
    await adminApi.deleteArticle(c.id).catch(() => {});
    load();
  };

  const getBlock = (c, type) => c.content?.find?.((b) => b.type === type)?.text || "";
  const platformColors = {
    "Meta Ads": "#1877F2", "Google Ads": "#4285F4", "LinkedIn Ads": "#0A66C2",
    "TikTok Ads": "#010101", "YouTube Ads": "#FF0000", "E-posta": "#C9A84C", "SMS": "#25D366",
  };

  const allPlatforms = ["Tümü", ...PLATFORMS];
  const filtered = filter === "Tümü" ? copies : copies.filter((c) => getBlock(c, "platform") === filter);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Reklam Metin Kütüphanesi</h1>
          <p className="text-gray-600 text-sm">{copies.length} metin · Üyeler kullanabilir</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
          + Yeni Metin
        </button>
      </div>

      {/* Platform filtresi */}
      <div className="flex gap-2 flex-wrap mb-6">
        {allPlatforms.map((p) => (
          <button key={p} onClick={() => setFilter(p)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={filter === p
              ? { background: "rgba(201,168,76,0.2)", color: "#D4B86A", border: "1px solid rgba(201,168,76,0.4)" }
              : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }}>
            {p} {p !== "Tümü" && `(${copies.filter((c) => getBlock(c, "platform") === p).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✍️</div>
          <p className="text-gray-600">Henüz metin yok. Ekle butonuna bas!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const platform = getBlock(c, "platform");
            const format   = getBlock(c, "format");
            const sector   = getBlock(c, "sector");
            const tone     = getBlock(c, "tone");
            const copy     = getBlock(c, "copy");
            return (
              <div key={c.id} className="rounded-xl p-5 group"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex flex-wrap gap-2">
                    {platform && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold text-white"
                        style={{ background: (platformColors[platform] || "#555") + "33", border: `1px solid ${(platformColors[platform] || "#555")}55` }}>
                        {platform}
                      </span>
                    )}
                    {format && <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">{format}</span>}
                    {sector && sector !== "Genel" && <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-500">{sector}</span>}
                    {tone && <span className="text-xs px-2 py-1 rounded-full text-gray-500" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>🎯 {tone}</span>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)}
                      className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white transition-all"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Düzenle</button>
                    <button onClick={() => handleDelete(c)}
                      className="px-3 py-1.5 rounded-lg text-xs text-red-700 hover:text-red-400 transition-all"
                      style={{ border: "1px solid rgba(239,68,68,0.15)" }}>Sil</button>
                  </div>
                </div>
                <p className="text-white text-sm leading-relaxed font-medium">{copy}</p>
                {getBlock(c, "why") && (
                  <p className="text-gray-600 text-xs mt-2 italic">↳ {getBlock(c, "why")}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}>
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>

            <div className="flex items-center justify-between mb-6">
              <p className="text-white font-bold text-lg">{editing ? "Metin Düzenle" : "Yeni Reklam Metni"}</p>
              <button onClick={() => setModal(false)} className="text-gray-600 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Platform</label>
                  <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className={inp}>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Format</label>
                  <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className={inp}>
                    {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Sektör</label>
                  <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className={inp}>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Ton / Teknik</label>
                  <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} className={inp}>
                    {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Reklam Metni *</label>
                <textarea value={form.copyText} onChange={(e) => setForm({ ...form, copyText: e.target.value })}
                  rows={5} className={inp}
                  placeholder="Buraya reklam metnini yaz. Emojiler, başlık formatları, satış kancaları — olduğu gibi gir." />
              </div>

              <div>
                <label className={lbl}>Neden İşe Yarıyor? (Opsiyonel)</label>
                <textarea value={form.why} onChange={(e) => setForm({ ...form, why: e.target.value })}
                  rows={2} className={inp}
                  placeholder="Merakı tetikler + sosyal kanıt + aciliyet bir arada kullanılıyor." />
              </div>

              {form.copyText && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-2 font-semibold">Önizleme</p>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ background: (platformColors[form.platform] || "#555") + "44" }}>{form.platform}</span>
                    <span className="text-xs text-gray-600">{form.format}</span>
                    <span className="text-xs text-gray-600">{form.tone}</span>
                  </div>
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{form.copyText}</p>
                  {form.why && <p className="text-gray-600 text-xs mt-2 italic">↳ {form.why}</p>}
                </div>
              )}

              <div>
                <label className={lbl}>Sıra</label>
                <input type="number" value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className={inp} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white transition-all border border-white/10">
                İptal
              </button>
              <button onClick={handleSave} disabled={saving || !form.copyText}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40 transition-all"
                style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
                {saving ? "Kaydediliyor..." : editing ? "Güncelle" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = "block text-xs font-semibold text-gray-500 mb-1.5";
const inp = "w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:border-yellow-600/50 focus:outline-none placeholder-gray-600 resize-none";
