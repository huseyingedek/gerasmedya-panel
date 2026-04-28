"use client";
import { useState, useEffect, useRef } from "react";
import { adminApi, uploadToR2 } from "@/lib/api";

const EMPTY_FORM = { slug: "", filename: "", title: "", description: "", duration: "", level: "", courseSlug: "", order: 0 };

export default function AdminVideolarPage() {
  const [courses,      setCourses]      = useState([]);
  const [videos,       setVideos]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modal,        setModal]        = useState(null);   // null | "create" | "edit" | "resources"
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [uploadPct,    setUploadPct]    = useState(null);   // null = no upload, 0-100 = uploading
  const [activeVideo,  setActiveVideo]  = useState(null);   // for resources modal
  const [resources,    setResources]    = useState([]);
  const [resForm,      setResForm]      = useState({ title: "", url: "", type: "link" });
  const [resSaving,    setResSaving]    = useState(false);
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.getVideos(),
      adminApi.getCourses(),
    ]).then(([vd, cd]) => {
      setVideos(vd.videos || []);
      const courseList = cd.courses || [];
      setCourses(courseList);
      // İlk kursu default seç
      if (courseList.length > 0) {
        setForm((f) => ({ ...f, courseSlug: f.courseSlug || courseList[0].slug }));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ ...EMPTY_FORM, courseSlug: courses[0]?.slug || "" }); setModal("create"); };
  const openEdit   = (v) => {
    setForm({ slug: v.slug, filename: v.filename || "", title: v.title, description: v.desc || "", duration: v.duration || "", level: v.level || "", courseSlug: v.courseSlug || "dijital-kusatma", order: v.order || 0 });
    setActiveVideo(v);
    setModal("edit");
  };
  const openResources = (v) => {
    setActiveVideo(v);
    setResForm({ title: "", url: "", type: "link" });
    if (v.id) adminApi.getResources(v.id).then((d) => setResources(d.resources)).catch(() => setResources([]));
    else setResources(v.resources || []);
    setModal("resources");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "create") await adminApi.createVideo(form);
      else await adminApi.updateVideo(activeVideo.id, form);
      setModal(null);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (v) => {
    if (!confirm(`"${v.title}" silinsin mi?`)) return;
    await adminApi.deleteVideo(v.id).catch(() => {});
    load();
  };

  // Video dosyası yükle → R2 presigned URL
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadPct(0);
    try {
      const filename = await uploadToR2(file, setUploadPct);
      setForm((f) => ({ ...f, filename }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadPct(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Kaynak ekle
  const handleAddResource = async () => {
    if (!resForm.title || !resForm.url) return alert("Başlık ve URL zorunlu.");
    setResSaving(true);
    try {
      await adminApi.createResource({ ...resForm, videoId: activeVideo?.id });
      const d = await adminApi.getResources(activeVideo.id);
      setResources(d.resources);
      setResForm({ title: "", url: "", type: "link" });
    } catch (err) { alert(err.message); }
    finally { setResSaving(false); }
  };

  const handleDeleteResource = async (id) => {
    await adminApi.deleteResource(id).catch(() => {});
    setResources((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Video Yönetimi</h1>
          <p className="text-gray-600 text-sm">{videos.length} video kayıtlı</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
          + Yeni Video
        </button>
      </div>

      {/* Tablo */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-gray-600">Henüz video yok. &quot;Yeni Video&quot; ile ekle.</div>
      ) : (
        <div className="space-y-2">
          {videos.map((v) => (
            <div key={v.slug} className="flex items-center gap-4 px-5 py-4 rounded-xl"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              {/* Sıra */}
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-gray-600 border border-white/10">
                {v.order}
              </span>
              {/* Bilgiler */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{v.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-600">{v.duration || "—"}</span>
                  <span className="text-xs text-gray-700">{v.level || "—"}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>
                    {courses.find((c) => c.slug === v.courseSlug)?.title || v.courseSlug}
                  </span>
                  {v.filename ? (
                    <span className="text-xs text-green-500">● {v.filename}</span>
                  ) : (
                    <span className="text-xs text-gray-700">○ Dosya atanmadı</span>
                  )}
                </div>
              </div>
              {/* Kaynak sayısı */}
              <button onClick={() => openResources(v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                📎 {(v.resources || []).length} kaynak
              </button>
              {/* Düzenle */}
              <button onClick={() => openEdit(v)}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                Düzenle
              </button>
              {/* Sil */}
              {v.id && (
                <button onClick={() => handleDelete(v)}
                  className="px-3 py-1.5 rounded-lg text-xs text-red-600 hover:text-red-400 hover:bg-red-500/5 transition-all"
                  style={{ border: "1px solid rgba(239,68,68,0.15)" }}>
                  Sil
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal — Yeni / Düzenle */}
      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Yeni Video" : "Video Düzenle"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {/* Başlık */}
            <Field label="Başlık *">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Dijital Kuşatma Nedir?" className={inputCls} />
            </Field>
            {/* Slug */}
            <Field label="Slug *" hint="URL'de kullanılır, boşluksuz-küçük harf">
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="dijital-kusatma-nedir" className={inputCls} />
            </Field>
            {/* Kurs */}
            <Field label="Kurs *">
              <select value={form.courseSlug} onChange={(e) => setForm({ ...form, courseSlug: e.target.value })} className={inputCls}>
                {courses.length === 0
                  ? <option value="">— Önce Admin › Kurslar&apos;dan kurs ekle —</option>
                  : courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)
                }
              </select>
            </Field>
            {/* Açıklama */}
            <Field label="Açıklama">
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} placeholder="Videoda ne öğrenilecek?" className={inputCls} />
            </Field>
            {/* Süre + Seviye + Sıra */}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Süre">
                <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="14:32" className={inputCls} />
              </Field>
              <Field label="Seviye">
                <input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                  placeholder="Başlangıç" className={inputCls} />
              </Field>
              <Field label="Sıra">
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className={inputCls} />
              </Field>
            </div>

            {/* Video Dosyası */}
            <Field label="Video Dosyası (R2 Upload)">
              <div className="space-y-2">
                {form.filename && (
                  <p className="text-xs text-green-400">✓ Yüklü: {form.filename}</p>
                )}
                {uploadPct !== null ? (
                  <div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadPct}%`, background: "linear-gradient(90deg,#C9A84C,#D4B86A)" }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Yükleniyor... %{uploadPct}</p>
                  </div>
                ) : (
                  <div>
                    <input ref={fileRef} type="file" accept="video/mp4,video/*" onChange={handleFileUpload}
                      className="hidden" id="videoFile" />
                    <label htmlFor="videoFile"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-400 cursor-pointer hover:text-white transition-all"
                      style={{ border: "1px dashed rgba(255,255,255,0.15)" }}>
                      🎬 {form.filename ? "Farklı dosya seç" : "Video dosyası seç (.mp4)"}
                    </label>
                  </div>
                )}
                <p className="text-xs text-gray-700">Veya elle dosya adı girin (R2&apos;de zaten varsa):</p>
                <input value={form.filename} onChange={(e) => setForm({ ...form, filename: e.target.value })}
                  placeholder="dijital-kusatma-nedir.mp4" className={inputCls} />
              </div>
            </Field>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setModal(null)}
              className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white transition-all border border-white/10">
              İptal
            </button>
            <button onClick={handleSave} disabled={saving || !form.title || !form.slug}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal — Kaynaklar */}
      {modal === "resources" && activeVideo && (
        <Modal title={`Kaynaklar — ${activeVideo.title}`} onClose={() => setModal(null)}>
          <div className="space-y-3 mb-5">
            {resources.length === 0 && <p className="text-sm text-gray-600">Henüz kaynak yok.</p>}
            {resources.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                <span className="text-base">{r.type === "pdf" ? "📄" : r.type === "file" ? "📁" : "🔗"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{r.title}</p>
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs truncate hover:opacity-80" style={{ color: "#C9A84C" }}>{r.url}</a>
                </div>
                <button onClick={() => handleDeleteResource(r.id)}
                  className="text-xs text-red-600 hover:text-red-400 transition-colors px-2">✕</button>
              </div>
            ))}
          </div>

          {/* Yeni kaynak formu */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yeni Kaynak Ekle</p>
            <Field label="Başlık *">
              <input value={resForm.title} onChange={(e) => setResForm({ ...resForm, title: e.target.value })}
                placeholder="Müşteri Yolculuğu Şablonu" className={inputCls} />
            </Field>
            <Field label="URL *">
              <input value={resForm.url} onChange={(e) => setResForm({ ...resForm, url: e.target.value })}
                placeholder="https://... veya /dosya.pdf" className={inputCls} />
            </Field>
            <Field label="Tür">
              <select value={resForm.type} onChange={(e) => setResForm({ ...resForm, type: e.target.value })} className={inputCls}>
                <option value="link">🔗 Link</option>
                <option value="pdf">📄 PDF</option>
                <option value="file">📁 Dosya</option>
              </select>
            </Field>
            <button onClick={handleAddResource} disabled={resSaving || !resForm.title || !resForm.url}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
              {resSaving ? "Ekleniyor..." : "Kaynak Ekle"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Yardımcı bileşenler ────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:border-yellow-600/50 focus:outline-none placeholder-gray-600";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-700 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-white font-bold text-lg">{title}</p>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors text-xl">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
