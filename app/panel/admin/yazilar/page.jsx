"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";

// Yeni makale için başlangıç içerik
const EMPTY_CONTENT = [{ type: "p", text: "" }];
const EMPTY_FORM = { courseSlug: "", title: "", duration: "", isTemplate: false, order: 0, content: EMPTY_CONTENT };

const PARAGRAPH_TYPES = [
  { val: "h2",       label: "📌 Başlık (H2)" },
  { val: "h3",       label: "🔹 Alt Başlık (H3)" },
  { val: "p",        label: "📝 Paragraf" },
  { val: "bold",     label: "⚡ Kalın Metin" },
  { val: "bullet",   label: "• Madde" },
  { val: "numbered", label: "1. Numaralı Adım" },
  { val: "callout",  label: "💡 Altın Kutu (Callout)" },
  { val: "quote",    label: "❝ Alıntı" },
  { val: "divider",  label: "── Ayırıcı" },
];

export default function AdminYazilarPage() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [courses,  setCourses]  = useState([]);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [editing,  setEditing]  = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getArticles(), adminApi.getCourses()])
      .then(([ad, cd]) => {
        setArticles(ad.articles || []);
        const list = cd.courses || [];
        setCourses(list);
        if (list.length > 0) setForm((f) => ({ ...f, courseSlug: f.courseSlug || list[0].slug }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ ...EMPTY_FORM, courseSlug: courses[0]?.slug || "" }); setEditing(null); setModal("form"); };
  const openEdit   = (a) => {
    setForm({
      courseSlug: a.courseSlug,
      title:      a.title,
      duration:   a.duration || "",
      isTemplate: a.isTemplate || false,
      order:      a.order || 0,
      content:    Array.isArray(a.content) ? a.content : EMPTY_CONTENT,
    });
    setEditing(a);
    setModal("form");
  };

  const handleSave = async () => {
    if (!form.title) return alert("Başlık zorunlu.");
    setSaving(true);
    try {
      if (editing) await adminApi.updateArticle(editing.id, form);
      else         await adminApi.createArticle(form);
      setModal(null);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (a) => {
    if (!confirm(`"${a.title}" silinsin mi?`)) return;
    await adminApi.deleteArticle(a.id).catch(() => {});
    load();
  };

  // Paragraf işlemleri
  const addParagraph = () => setForm((f) => ({ ...f, content: [...f.content, { type: "p", text: "" }] }));
  const removeParagraph = (i) => setForm((f) => ({ ...f, content: f.content.filter((_, idx) => idx !== i) }));
  const updateParagraph = (i, key, val) => setForm((f) => ({
    ...f,
    content: f.content.map((p, idx) => idx === i ? { ...p, [key]: val } : p),
  }));

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Yazı Yönetimi</h1>
          <p className="text-gray-600 text-sm">{articles.length} yazı kayıtlı</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
          + Yeni Yazı
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-600">Henüz yazı yok. &quot;Yeni Yazı&quot; ile ekle.</div>
      ) : (
        <div className="space-y-2">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-4 rounded-xl"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-gray-600 border border-white/10">
                {a.order}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm truncate">{a.title}</p>
                  {a.isTemplate && (
                    <span className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                      style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>Şablon</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-600">📖 {a.duration || "—"}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(201,168,76,0.08)", color: "#C9A84C55" }}>
                    {courses.find((c) => c.slug === a.courseSlug)?.title || a.courseSlug}
                  </span>
                  <span className="text-xs text-gray-700">{Array.isArray(a.content) ? `${a.content.length} blok` : ""}</span>
                </div>
              </div>
              <button onClick={() => openEdit(a)}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Düzenle</button>
              <button onClick={() => handleDelete(a)}
                className="px-3 py-1.5 rounded-lg text-xs text-red-600 hover:text-red-400 hover:bg-red-500/5 transition-all"
                style={{ border: "1px solid rgba(239,68,68,0.15)" }}>Sil</button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal === "form" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-white font-bold text-lg">{editing ? "Yazı Düzenle" : "Yeni Yazı"}</p>
              <button onClick={() => setModal(null)} className="text-gray-600 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-4">
              {/* Kurs */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kurs *</label>
                <select value={form.courseSlug} onChange={(e) => setForm({ ...form, courseSlug: e.target.value })} className={inputCls}>
                  {courses.length === 0
                    ? <option value="">— Önce Admin › Kurslar&apos;dan kurs ekle —</option>
                    : courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)
                  }
                </select>
              </div>
              {/* Başlık */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Başlık *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Dijital Kuşatma — Temel Kavramlar" className={inputCls} />
              </div>
              {/* Süre + Sıra + Şablon */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Okuma Süresi</label>
                  <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="5 dk" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sıra</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className={inputCls} />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isTemplate} onChange={(e) => setForm({ ...form, isTemplate: e.target.checked })}
                      className="accent-yellow-600" />
                    <span className="text-xs text-gray-400">Şablon mı?</span>
                  </label>
                </div>
              </div>

              {/* İçerik Editörü */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500">İçerik Blokları</label>
                  <button onClick={addParagraph}
                    className="text-xs px-2.5 py-1 rounded-lg hover:text-white transition-all"
                    style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}>+ Blok Ekle</button>
                </div>
                <div className="space-y-3">
                  {form.content.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <select value={p.type} onChange={(e) => updateParagraph(i, "type", e.target.value)}
                        className="text-xs px-2 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 focus:outline-none w-32 flex-shrink-0">
                        {PARAGRAPH_TYPES.map((t) => <option key={t.val} value={t.val}>{t.label}</option>)}
                      </select>
                      <input value={p.text} onChange={(e) => updateParagraph(i, "text", e.target.value)}
                        placeholder="İçerik..." className={`${inputCls} flex-1`} />
                      <button onClick={() => removeParagraph(i)}
                        className="text-gray-700 hover:text-red-400 transition-colors px-1 text-sm">✕</button>
                    </div>
                  ))}
                  {form.content.length === 0 && (
                    <p className="text-xs text-gray-700">Blok ekle butonuna bas.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white transition-all border border-white/10">
                İptal
              </button>
              <button onClick={handleSave} disabled={saving || !form.title}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:border-yellow-600/50 focus:outline-none placeholder-gray-600";
