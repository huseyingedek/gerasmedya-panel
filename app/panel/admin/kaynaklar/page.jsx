"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";

export default function AdminKaynaklar() {
  const [videos,    setVideos]    = useState([]);
  const [articles,  setArticles]  = useState([]);
  const [resources, setResources] = useState([]);
  const [tab,       setTab]       = useState("video"); // "video" | "article"
  const [selected,  setSelected]  = useState(null);
  const [form,      setForm]      = useState({ title: "", url: "", type: "link" });
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getVideos(), adminApi.getArticles()])
      .then(([vd, ad]) => { setVideos(vd.videos); setArticles(ad.articles); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadResources = (item, type) => {
    setSelected({ ...item, _type: type });
    setResources([]);
    if (type === "video" && item.id) {
      adminApi.getResources(item.id, null).then((d) => setResources(d.resources)).catch(() => {});
    } else if (type === "article" && item.id) {
      adminApi.getResources(null, item.id).then((d) => setResources(d.resources)).catch(() => {});
    }
  };

  const handleAdd = async () => {
    if (!form.title || !form.url) return alert("Başlık ve URL zorunlu.");
    setSaving(true);
    try {
      const payload = { ...form };
      if (selected._type === "video")   payload.videoId   = selected.id;
      if (selected._type === "article") payload.articleId = selected.id;
      await adminApi.createResource(payload);
      const d = selected._type === "video"
        ? await adminApi.getResources(selected.id, null)
        : await adminApi.getResources(null, selected.id);
      setResources(d.resources);
      setForm({ title: "", url: "", type: "link" });
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await adminApi.deleteResource(id).catch(() => {});
    setResources((r) => r.filter((x) => x.id !== id));
  };

  const items = tab === "video" ? videos : articles;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Kaynak Yönetimi</h1>
        <p className="text-gray-600 text-sm">Video ve yazılara indirme linkleri, PDF ve dosya ekle.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sol — liste */}
          <div>
            {/* Tab */}
            <div className="flex gap-4 border-b mb-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {[{ key: "video", label: "Videolar" }, { key: "article", label: "Yazılar" }].map((t) => (
                <button key={t.key} onClick={() => { setTab(t.key); setSelected(null); setResources([]); }}
                  className={`pb-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${tab === t.key ? "text-white" : "text-gray-600 border-transparent"}`}
                  style={tab === t.key ? { borderBottomColor: "#C9A84C" } : {}}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {items.map((item) => {
                const isSelected = selected?.id === item.id && selected?._type === tab;
                const rCount = (item.resources || []).length;
                return (
                  <button key={item.id || item.slug}
                    onClick={() => loadResources(item, tab)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{
                      border: isSelected ? "1px solid rgba(201,168,76,0.3)" : "1px solid rgba(255,255,255,0.06)",
                      background: isSelected ? "rgba(201,168,76,0.06)" : "rgba(255,255,255,0.02)",
                    }}>
                    <span className="text-base">{tab === "video" ? "🎬" : "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-gray-400"}`}>
                        {item.title}
                      </p>
                    </div>
                    <span className="text-xs text-gray-700 flex-shrink-0">
                      {rCount} kaynak
                    </span>
                  </button>
                );
              })}
              {items.length === 0 && (
                <p className="text-sm text-gray-600 py-4">
                  {tab === "video" ? "Video bulunamadı." : "Yazı bulunamadı."}
                </p>
              )}
            </div>
          </div>

          {/* Sağ — kaynaklar */}
          <div>
            {!selected ? (
              <div className="flex items-center justify-center h-40 rounded-2xl text-gray-700 text-sm"
                style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                Sol taraftan bir içerik seç
              </div>
            ) : (
              <div>
                <p className="text-white font-semibold text-sm mb-4 truncate">{selected.title}</p>

                {/* Mevcut kaynaklar */}
                <div className="space-y-2 mb-5">
                  {resources.length === 0 && <p className="text-xs text-gray-700">Kaynak yok.</p>}
                  {resources.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                      <span>{r.type === "pdf" ? "📄" : r.type === "file" ? "📁" : "🔗"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{r.title}</p>
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs truncate block hover:opacity-80" style={{ color: "#C9A84C" }}>
                          {r.url}
                        </a>
                      </div>
                      <button onClick={() => handleDelete(r.id)}
                        className="text-xs text-red-600 hover:text-red-400 transition-colors px-2">✕</button>
                    </div>
                  ))}
                </div>

                {/* Ekle formu */}
                <div className="space-y-3 p-4 rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yeni Kaynak</p>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Kaynak başlığı" className={inputCls} />
                  <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..." className={inputCls} />
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                    <option value="link">🔗 Link</option>
                    <option value="pdf">📄 PDF</option>
                    <option value="file">📁 Dosya</option>
                  </select>
                  <button onClick={handleAdd} disabled={saving}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
                    {saving ? "Ekleniyor..." : "Ekle"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:border-yellow-600/50 focus:outline-none placeholder-gray-600";
