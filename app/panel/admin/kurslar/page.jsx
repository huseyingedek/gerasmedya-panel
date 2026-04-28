"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";

const EMPTY = {
  slug: "", title: "", desc: "", icon: "🎓",
  category: "", categoryLabel: "",
  gradient: "from-yellow-900/40 to-amber-950/60",
  accentColor: "#C9A84C", order: 0,
};

const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:border-yellow-600/50 focus:outline-none placeholder-gray-600";

export default function AdminKurslar() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.getCourses().then((d) => setCourses(d.courses || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit   = (c) => { setForm({ slug: c.slug, title: c.title, desc: c.desc || "", icon: c.icon, category: c.category, categoryLabel: c.categoryLabel, gradient: c.gradient, accentColor: c.accentColor, order: c.order }); setEditing(c); setModal(true); };

  // Mevcut kurslardan unique kategorileri türet
  const uniqueCategories = Object.values(
    courses.reduce((acc, c) => {
      if (c.category && !acc[c.category]) acc[c.category] = { val: c.category, label: c.categoryLabel || c.category };
      return acc;
    }, {})
  );

  // Kategori slug yazınca mevcut kategorilerden eşleşirse etiketi otomatik doldur
  const handleCategorySlugChange = (val) => {
    const existing = uniqueCategories.find((c) => c.val === val);
    setForm((f) => ({
      ...f,
      category: val,
      categoryLabel: existing ? existing.label : f.categoryLabel,
    }));
  };

  const handleSave = async () => {
    if (!form.slug || !form.title) return alert("Slug ve başlık zorunlu.");
    setSaving(true);
    try {
      if (editing) await adminApi.updateCourse(editing.id, form);
      else         await adminApi.createCourse(form);
      setModal(false);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm(`"${c.title}" kursu silinsin mi? Videolar ve yazılar etkilenmez.`)) return;
    await adminApi.deleteCourse(c.id).catch(() => {});
    load();
  };

  // Kategoriye göre grupla — dynamic, DB'den gelenlere göre
  const grouped = uniqueCategories.map((cat) => ({
    val:   cat.val,
    label: cat.label,
    list:  courses.filter((c) => c.category === cat.val),
  })).filter((g) => g.list.length > 0);
  // Kategorisi olmayan / eşleşmeyen kurslar
  const knownCats = new Set(uniqueCategories.map((c) => c.val));
  const ungrouped = courses.filter((c) => !knownCats.has(c.category));
  if (ungrouped.length) grouped.push({ val: "diger", label: "Diğer", list: ungrouped });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Kurs Yönetimi</h1>
          <p className="text-gray-600 text-sm">{courses.length} kurs tanımlı · admin eklerse aktif olur, video eklenirsesisteme gözükür</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
          style={{ background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }}>
          + Yeni Kurs
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-600 text-sm">Henüz kurs yok. "Yeni Kurs" ile ekle.</div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ val, label, list }) => (
            <div key={val}>
              <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3">{label}</p>
              <div className="space-y-2">
                {list.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-4 rounded-xl"
                    style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    {/* Mini önizleme */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gradient-to-br ${c.gradient}`}>
                      {c.icon}
                    </div>
                    {/* Bilgi */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm">{c.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${c.accentColor}18`, color: c.accentColor, border: `1px solid ${c.accentColor}30` }}>
                          {c.categoryLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-600">/{c.slug}</span>
                        <span className="text-xs text-gray-700">Sıra: {c.order}</span>
                        <span className="text-xs font-mono text-gray-700">{c.accentColor}</span>
                      </div>
                    </div>
                    {/* Aksiyonlar */}
                    <button onClick={() => openEdit(c)}
                      className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white transition-all"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Düzenle</button>
                    <button onClick={() => handleDelete(c)}
                      className="px-3 py-1.5 rounded-lg text-xs text-red-600 hover:text-red-400 transition-all"
                      style={{ border: "1px solid rgba(239,68,68,0.15)" }}>Sil</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-white font-bold text-lg">{editing ? "Kurs Düzenle" : "Yeni Kurs"}</p>
              <button onClick={() => setModal(false)} className="text-gray-600 hover:text-white text-xl">✕</button>
            </div>

            {/* Önizleme */}
            <div className={`h-20 rounded-xl mb-5 bg-gradient-to-br ${form.gradient} flex items-center gap-3 px-5`}>
              <span className="text-3xl">{form.icon || "🎓"}</span>
              <div>
                <p className="text-white font-bold text-sm">{form.title || "Kurs Başlığı"}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${form.accentColor}25`, color: form.accentColor }}>
                  {form.categoryLabel}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Başlık + Slug */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Başlık *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Dijital Kuşatma" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Slug *</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                    placeholder="dijital-kusatma" className={inputCls} />
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Açıklama</label>
                <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  rows={2} placeholder="Kurs açıklaması..." className={inputCls} />
              </div>

              {/* Kategori */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kategori Slug *</label>
                  <input
                    list="cat-slugs"
                    value={form.category}
                    onChange={(e) => handleCategorySlugChange(e.target.value)}
                    placeholder="strateji (yeni yaz veya seç)"
                    className={inputCls}
                  />
                  <datalist id="cat-slugs">
                    {uniqueCategories.map((c) => <option key={c.val} value={c.val}>{c.label}</option>)}
                  </datalist>
                  <p className="text-xs text-gray-700 mt-1">Yeni kategori için serbest yaz, var olanı seç</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kategori Etiketi (kartta görünür)</label>
                  <input value={form.categoryLabel} onChange={(e) => setForm({ ...form, categoryLabel: e.target.value })}
                    placeholder="Stratejiler" className={inputCls} />
                </div>
              </div>

              {/* İkon + Sıra */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">İkon (emoji)</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="🎓" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sıra</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className={inputCls} />
                </div>
              </div>

              {/* Renk + Gradient */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Accent Rengi</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.accentColor}
                      onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                    <input value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                      placeholder="#C9A84C" className={`${inputCls} flex-1`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gradient (Tailwind)</label>
                  <select value={form.gradient} onChange={(e) => setForm({ ...form, gradient: e.target.value })} className={inputCls}>
                    <option value="from-yellow-900/40 to-amber-950/60">🟡 Altın</option>
                    <option value="from-rose-900/40 to-pink-950/60">🩷 Pembe</option>
                    <option value="from-blue-900/40 to-indigo-950/60">🔵 Mavi</option>
                    <option value="from-green-900/40 to-emerald-950/60">🟢 Yeşil</option>
                    <option value="from-purple-900/40 to-violet-950/60">🟣 Mor</option>
                    <option value="from-orange-900/40 to-red-950/60">🟠 Turuncu</option>
                    <option value="from-cyan-900/40 to-sky-950/60">🩵 Cyan</option>
                    <option value="from-gray-800/40 to-zinc-900/60">⚫ Gri</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white transition-all border border-white/10">
                İptal
              </button>
              <button onClick={handleSave} disabled={saving || !form.slug || !form.title}
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
