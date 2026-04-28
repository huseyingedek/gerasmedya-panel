"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";

const COURSE_SLUG = "ipuclari";

const CATEGORIES = [
  "Meta Ads", "Google Ads", "Retargeting", "SEO", "İçerik", "Analitik",
  "Bütçe", "Hedefleme", "Reklam Metni", "Strateji", "Genel",
];

const EMPTY = {
  title: "",
  icon: "💡",
  tag: "",
  body: "",
  highlight: "",
  order: 0,
};

export default function AdminIpuclariPage() {
  const [tips,    setTips]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.getArticles(COURSE_SLUG)
      .then((d) => setTips(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (t) => {
    const blocks = Array.isArray(t.content) ? t.content : [];
    setForm({
      title:     t.title,
      icon:      blocks.find((b) => b.type === "icon")?.text || "💡",
      tag:       blocks.find((b) => b.type === "tag")?.text  || "",
      body:      blocks.find((b) => b.type === "body")?.text || "",
      highlight: blocks.find((b) => b.type === "highlight")?.text || "",
      order:     t.order || 0,
    });
    setEditing(t);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.body) return alert("Başlık ve içerik zorunlu.");
    setSaving(true);
    const content = [
      { type: "icon",      text: form.icon },
      { type: "tag",       text: form.tag },
      { type: "body",      text: form.body },
      { type: "highlight", text: form.highlight },
    ];
    const payload = {
      courseSlug: COURSE_SLUG,
      title:      form.title,
      duration:   "2 dk",
      isTemplate: false,
      order:      form.order,
      content,
    };
    try {
      if (editing) await adminApi.updateArticle(editing.id, payload);
      else         await adminApi.createArticle(payload);
      setModal(false);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (t) => {
    if (!confirm(`"${t.title}" silinsin mi?`)) return;
    await adminApi.deleteArticle(t.id).catch(() => {});
    load();
  };

  const getIcon = (t) => t.content?.find?.((b) => b.type === "icon")?.text || "💡";
  const getTag  = (t) => t.content?.find?.((b) => b.type === "tag")?.text  || "";

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">İpuçları</h1>
          <p className="text-gray-600 text-sm">{tips.length} ipucu · Üyelere gösterilir</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
          + Yeni İpucu
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : tips.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💡</div>
          <p className="text-gray-600">Henüz ipucu yok. Ekle butonuna bas!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tips.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4 rounded-xl group"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <span className="text-2xl flex-shrink-0">{getIcon(t)}</span>
              <span className="w-6 text-xs text-gray-700 font-bold flex-shrink-0">#{t.order}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{t.title}</p>
                {getTag(t) && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                    style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
                    {getTag(t)}
                  </span>
                )}
              </div>
              <button onClick={() => openEdit(t)}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Düzenle</button>
              <button onClick={() => handleDelete(t)}
                className="px-3 py-1.5 rounded-lg text-xs text-red-700 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                style={{ border: "1px solid rgba(239,68,68,0.15)" }}>Sil</button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>

            <div className="flex items-center justify-between mb-6">
              <p className="text-white font-bold text-lg">{editing ? "İpucu Düzenle" : "Yeni İpucu"}</p>
              <button onClick={() => setModal(false)} className="text-gray-600 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-4">
              {/* Icon + Tag yan yana */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={lbl}>İkon (Emoji)</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className={inp} placeholder="💡" />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Kategori Etiketi</label>
                  <input list="cat-list" value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    className={inp} placeholder="Retargeting" />
                  <datalist id="cat-list">
                    {CATEGORIES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              {/* Başlık */}
              <div>
                <label className={lbl}>Başlık *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inp} placeholder="Bütçenizin %90'ı Neden Boşa Gidiyor?" />
              </div>

              {/* Ana içerik */}
              <div>
                <label className={lbl}>Ana İçerik *</label>
                <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={5} className={inp}
                  placeholder="Burada detaylı açıklamayı yaz. Ne kadar bilgi dolu ve orijinal olursa o kadar iyi." />
              </div>

              {/* Highlight kutusu */}
              <div>
                <label className={lbl}>💡 Öne Çıkan İpucu (Altın Kutu)</label>
                <textarea value={form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                  rows={2} className={inp}
                  placeholder="Tek cümlelik güçlü çıkarım. Örn: Retargeting bütçeniz toplam bütçenizin %40'ı olmalı." />
              </div>

              {/* Önizleme */}
              {(form.title || form.body) && (
                <div className="rounded-xl p-4" style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 font-semibold">Önizleme</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{form.icon}</span>
                    {form.tag && <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>{form.tag}</span>}
                  </div>
                  <p className="text-white font-bold text-sm mb-1">{form.title}</p>
                  {form.body && <p className="text-gray-400 text-xs leading-relaxed">{form.body.slice(0, 120)}...</p>}
                  {form.highlight && (
                    <div className="mt-2 rounded-lg px-3 py-2 text-xs font-semibold"
                      style={{ background: "rgba(201,168,76,0.1)", color: "#D4B86A", border: "1px solid rgba(201,168,76,0.2)" }}>
                      💡 {form.highlight}
                    </div>
                  )}
                </div>
              )}

              {/* Sıra */}
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
              <button onClick={handleSave} disabled={saving || !form.title || !form.body}
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
