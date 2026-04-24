"use client";
import Link from "next/link";
const strategies = [
  { slug:"dijital-kusatma", icon:"🔱", badge:"Strateji #1", title:"Dijital Kuşatma Stratejisi", desc:"Müşteriniz nereye baksa sizi görsün. Her kanalda var olun.", highlights:["Meta & Google Ads","Retargeting","Çok Kanallı"], status:"active" },
  { slug:null, icon:"📊", badge:"Strateji #2", title:"Veri Odaklı Büyüme", desc:"Her kararı veriye dayandır. ROAS, A/B test, analitik.", highlights:["Analitik","A/B Test","ROAS"], status:"coming" },
  { slug:null, icon:"🌱", badge:"Strateji #3", title:"Organik Otorite İnşası", desc:"SEO ve içerik stratejisiyle otoriter marka ol.", highlights:["SEO","İçerik","Backlink"], status:"coming" },
];
export default function StratejiListPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10"><p className="text-gray-500 text-sm mb-1">Kütüphane</p><h1 className="text-3xl font-black">Stratejiler</h1></div>
      <div className="space-y-5">
        {strategies.map((s) => s.status === "active" ? (
          <Link key={s.badge} href={`/panel/strateji/${s.slug}`} className="block group">
            <div className="card p-7 flex gap-5 items-start hover:border-gold-500/30 transition-all duration-200">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.3)"}}>{s.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2"><span className="text-xs font-bold uppercase tracking-wider" style={{color:"#D4B86A"}}>{s.badge}</span><span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:"rgba(201,168,76,0.15)",color:"#D4B86A",border:"1px solid rgba(201,168,76,0.25)"}}>Aktif</span></div>
                <h2 className="text-xl font-black text-white mb-2">{s.title}</h2>
                <p className="text-sm text-gray-500 mb-4">{s.desc}</p>
                <div className="flex gap-2">{s.highlights.map((h) => <span key={h} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-400">{h}</span>)}</div>
              </div>
              <span className="text-gray-600 group-hover:text-gold-400 transition-colors text-xl mt-2">→</span>
            </div>
          </Link>
        ) : (
          <div key={s.badge} className="card p-7 flex gap-5 items-start opacity-40">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 bg-white/5 border border-white/10 grayscale">{s.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2"><span className="text-xs font-bold uppercase tracking-wider text-gray-600">{s.badge}</span><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/5 text-gray-600 border border-white/10">Yakında</span></div>
              <h2 className="text-xl font-black text-gray-500 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
