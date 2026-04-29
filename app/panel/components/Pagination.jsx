// Ortak sayfalama bileşeni — dark theme + gold accent
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Her zaman ilk, son ve mevcut sayfanın ±1'ini göster
    if (
      i === 1 || i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  const btn = (label, target, active = false, disabled = false) => (
    <button
      key={label}
      onClick={() => !disabled && typeof target === "number" && onChange(target)}
      disabled={disabled}
      className="min-w-[36px] h-9 px-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-30"
      style={
        active
          ? { background: "linear-gradient(135deg,#C9A84C,#A8893D)", color: "#fff" }
          : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.08)" }
      }
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      {btn("←", page - 1, false, page === 1)}
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`ellipsis-${i}`} className="text-gray-700 px-1">…</span>
          : btn(p, p, p === page)
      )}
      {btn("→", page + 1, false, page === totalPages)}
    </div>
  );
}
