"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import Pagination from "@/app/panel/components/Pagination";

const PAGE_SIZE = 12;

const COURSE_SLUG = "sablonlar";

const TEMPLATE_CATS = [
  "Meta Ads", "Google Ads", "İçerik Takvimi", "ROAS Hesaplama",
  "Bütçe Planlama", "Rakip Analizi", "Müşteri Avatarı", "Reklam Metni",
  "Rapor Şablonu", "Strateji", "SEO", "E-posta", "Genel",
];

const FILE_TYPES = [
  { val: "notion",  label: "Notion", icon: "📓" },
  { val: "excel",   label: "Excel",  icon: "📊" },
  { val: "pdf",     label: "PDF",    icon: "📄" },
  { val: "canva",   label: "Canva",  icon: "🎨" },
  { val: "gdocs",   label: "Google Docs", icon: "📝" },
  { val: "sheets",  label: "Google Sheets", icon: "🔢" },
  { val: "figma",   label: "Figma",  icon: "🖌️" },
  { val: "other",   label: "Diğer",  icon: "📁" },
];

const EMPTY = {
  title: "", category: "", desc: "", usage: "",
  downloadUrl: "", fileType: "notion", isPremium: false, order: 0,
};

export default function AdminSablonlarPage() {
  const [templates,  setTemplates]  = useState([]);
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
        setTemplates(d.articles || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (t) => {
    const blocks = Array.isArray(t.content) ? t.content : [];
    setForm({
      title:       t.title,
      category:    blocks.find((b) => b.type === "category")?.text    || "",
      desc:        blocks.find((b) => b.type === "desc")?.text        || "",
      usage:       blocks.find((b) => b.type === "usage")?.text       || "",
      downloadUrl: blocks.find((b) => b.type === "downloadUrl")?.text || "",
      fileType:    blocks.find((b) => b.type === "fileType")?.text    || "notion",
      isPremium:   t.isTemplate,
      order:       t.order || 0,
    });
    setEditing(t);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.downloadUrl) return alert("Başlık ve indirme linki zorunlu.");
    setSaving(true);
    const content = [
      { type: "category",    text: form.category },
      { type: "desc",        text: form.desc },
      { type: "usage",       text: form.usage },
      { type: "downloadUrl", text: form.downloadUrl },
      { type: "fileType",    text: form.fileType },
    ];
    const payload = {
      courseSlug: COURSE_SLUG,
      title:      form.title,
      duration:   "",
      isTemplate: true,
      order:      form.order,
      content,
    };
    try {
      if (editing) await adminApi.updateArticle(editing.id, payload);
      else         await adminApi.createArticle(payload);
      setModal(false);
      load(page);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (t) => {
    if (!confirm(`"${t.title}" silinsin mi?`)) return;
    await adminApi.deleteArticle(t.id).catch(() => {});
    const newPage = templates.length === 1 && page > 1 ? page - 1 : page;
    setPage(newPage);
    load(newPage);
  };

  const getBlock = (t, type) => t.content?.find?.((b) => b.type === type)?.text || "";
  const getFileIcon = (ft) => FILE_TYPES.find((f) => f.val === ft)?.icon || "📁";

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Şablonlar</h1>
          <p className="text-gray-600 text-sm">{total} şablon · Üyeler indirebilir</p>
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
      ) : templates.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-600">Henüz şablon yok. Ekle butonuna bas!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl p-4 group relative"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{getFileIcon(getBlock(t, "fileType"))}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-white font-semibold text-sm leading-snug">{t.title}</p>
                  </div>
                  {getBlock(t, "category") && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2"
                      style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
                      {getBlock(t, "category")}
                    </span>
                  )}
                  {getBlock(t, "desc") && (
                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{getBlock(t, "desc")}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(t)}
                  className="flex-1 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Düzenle</button>
                <button onClick={() => handleDelete(t)}
                  className="px-3 py-1.5 rounded-lg text-xs text-red-700 hover:text-red-400 transition-all"
                  style={{ border: "1px solid rgba(239,68,68,0.15)" }}>Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => { setPage(p); load(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>

            <div className="flex items-center justify-between mb-6">
              <p className="text-white font-bold text-lg">{editing ? "Şablon Düzenle" : "Yeni Şablon"}</p>
              <button onClick={() => setModal(false)} className="text-gray-600 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={lbl}>Şablon Adı *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inp} placeholder="Meta Ads Kampanya Planlayıcı" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Kategori</label>
                  <input list="tcat-list" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inp} placeholder="Meta Ads" />
                  <datalist id="tcat-list">
                    {TEMPLATE_CATS.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className={lbl}>Dosya Türü</label>
                  <select value={form.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })} className={inp}>
                    {FILE_TYPES.map((f) => (
                      <option key={f.val} value={f.val}>{f.icon} {f.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Açıklama</label>
                <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  rows={2} className={inp}
                  placeholder="Bu şablonla kampanya bütçenizi gün gün planlayabilirsiniz." />
              </div>

              <div>
                <label className={lbl}>Nasıl Kullanılır?</label>
                <textarea value={form.usage} onChange={(e) => setForm({ ...form, usage: e.target.value })}
                  rows={3} className={inp}
                  placeholder="1. Dosyayı aç&#10;2. Kendi verilerini gir&#10;3. Haftalık bütçeni ayarla" />
              </div>

              <div>
                <label className={lbl}>İndirme / Erişim Linki *</label>
                <input value={form.downloadUrl} onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
                  className={inp} placeholder="https://notion.so/... veya https://drive.google.com/..." />
                <p className="text-xs text-gray-700 mt-1">Notion, Google Drive, Dropbox, R2 — herhangi bir link olabilir.</p>
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
              <button onClick={handleSave} disabled={saving || !form.title || !form.downloadUrl}
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
