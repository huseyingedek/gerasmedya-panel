"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import Pagination from "@/app/panel/components/Pagination";

const PAGE_SIZE = 15;
const COURSE_SLUG = "sosyal-medya";

const FORMATS = [
  "Instagram Post",
  "Instagram Hikaye",
  "Reels / TikTok Hook",
  "WhatsApp Mesajı",
  "Bio Şablonu",
  "Yorum Yanıtı",
];

const SECTORS = [
  "E-ticaret", "Hizmet", "Restoran / Kafe", "Gayrimenkul",
  "Sağlık", "Eğitim", "Teknoloji", "Kozmetik", "Turizm",
  "Güzellik Salonu", "Genel",
];

const EMPTY = {
  format: "Instagram Post",
  sector: "Genel",
  copy: "",
  tip: "",
  order: 0,
};

export default function AdminSosyalMedyaPage() {
  const [copies,     setCopies]     = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [page,       setPage]       = useState(1);

  const load = (p = 1) => {
    setLoading(true);
    adminApi.getArticles(COURSE_SLUG, p, PAGE_SIZE)
      .then((d) => {
        setCopies(d.articles || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (c) => {
    const blocks = Array.isArray(c.content) ? c.content : [];
    setForm({
      format: blocks.find((b) => b.type === "format")?.text || "Instagram Post",
      sector: blocks.find((b) => b.type === "sector")?.text || "Genel",
      copy:   blocks.find((b) => b.type === "copy")?.text   || "",
      tip:    blocks.find((b) => b.type === "tip")?.text    || "",
      order:  c.order || 0,
    });
    setEditing(c);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.copy) return alert("Şablon metni zorunlu.");
    setSaving(true);
    const title = `${form.sector} — ${form.format}`;
    const content = [
      { type: "format", text: form.format },
      { type: "sector", text: form.sector },
      { type: "copy",   text: form.copy },
      { type: "tip",    text: form.tip },
    ];
    try {
      const payload = { courseSlug: COURSE_SLUG, title, duration: "", isTemplate: false, order: form.order, content };
      if (editing) await adminApi.updateArticle(editing.id, payload);
      else         await adminApi.createArticle(payload);
      setModal(false);
      load(page);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm("Bu şablon silinsin mi?")) return;
    await adminApi.deleteArticle(c.id).catch(() => {});
    const newPage = copies.length === 1 && page > 1 ? page - 1 : page;
    setPage(newPage);
    load(newPage);
  };

  const getBlock = (c, type) => c.content?.find?.((b) => b.type === type)?.text || "";

  const FORMAT_ICONS = {
    "Instagram Post": "📸",
    "Instagram Hikaye": "⭕",
    "Reels / TikTok Hook": "🎬",
    "WhatsApp Mesajı": "💬",
    "Bio Şablonu": "👤",
    "Yorum Yanıtı": "💭",
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Sosyal Medya Şablonları</h1>
          <p className="text-gray-600 text-sm">{total} şablon · Üyeler kullanabilir</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
          + Yeni Şablon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : copies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📱</div>
          <p className="text-gray-600">Henüz şablon yok. Ekle butonuna bas!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {copies.map((c) => {
            const format = getBlock(c, "format");
            const sector = getBlock(c, "sector");
            const copy   = getBlock(c, "copy");
            return (
              <div key={c.id} className="rounded-xl p-4 group"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{FORMAT_ICONS[format] || "📱"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
                        {format}
                      </span>
                      {sector && sector !== "Genel" && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {sector}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 whitespace-pre-wrap">{copy}</p>
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

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}>
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>

            <div className="flex items-center justify-between mb-6">
              <p className="text-white font-bold text-lg">{editing ? "Şablon Düzenle" : "Yeni Şablon"}</p>
              <button onClick={() => setModal(false)} className="text-gray-600 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Format</label>
                  <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className={inp}>
                    {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Sektör</label>
                  <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className={inp}>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Şablon Metni *</label>
                <textarea value={form.copy} onChange={(e) => setForm({ ...form, copy: e.target.value })}
                  rows={7} className={inp}
                  placeholder={"Şablon metni buraya. Doldurulacak yerleri [köşeli parantez] içinde yaz.\n\nÖrnek:\n[Ürün adı] ile tanış ✨\n[Tek cümle fayda]\n\n👇 Linkteki adresten hemen al"} />
                <p className="text-xs text-gray-700 mt-1">Doldurulacak kısımları [köşeli parantez] içinde yaz</p>
              </div>

              <div>
                <label className={lbl}>💡 Kullanım İpucu (Opsiyonel)</label>
                <textarea value={form.tip} onChange={(e) => setForm({ ...form, tip: e.target.value })}
                  rows={2} className={inp}
                  placeholder="Bu şablonu ne zaman ve nasıl kullanacağını yaz. Örn: Yeni ürün lansmanında ilk 24 saatte paylaş." />
              </div>

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
              <button onClick={handleSave} disabled={saving || !form.copy}
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
