"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const userNav = [
  { href: "/panel/egitim",           icon: "🎓", label: "Eğitimler" },
  { href: "/panel/ipuclari",         icon: "💡", label: "İpuçları" },
  { href: "/panel/sablonlar",        icon: "📋", label: "Şablonlar" },
  { href: "/panel/reklam-metinleri", icon: "📱", label: "Sosyal Medya" },
  { href: "/panel/hesabim",          icon: "👤", label: "Hesabım" },
];

const adminNav = [
  { href: "/panel/admin/kurslar",          icon: "🗂️", label: "Kurslar" },
  { href: "/panel/admin/videolar",         icon: "🎬", label: "Videolar" },
  { href: "/panel/admin/yazilar",          icon: "📄", label: "Yazılar" },
  { href: "/panel/admin/ipuclari",         icon: "💡", label: "İpuçları" },
  { href: "/panel/admin/sablonlar",        icon: "📋", label: "Şablonlar" },
  { href: "/panel/admin/reklam-metinleri", icon: "📱", label: "Sosyal Medya" },
  { href: "/panel/admin/kullanicilar",     icon: "👥", label: "Kullanıcılar" },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggle }) {
  const pathname  = usePathname();
  const { user, logout } = useAuth();
  const isAdmin   = user?.role === "admin";
  const planLabel = user?.plan === "YILLIK" ? "Yıllık Plan" : user?.role === "admin" ? "Admin" : "Aylık Plan";

  return (
    <>
      {/* ── Desktop / Tablet sidebar ─────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 border-r border-white/[0.06] bg-[#0d0d0d] transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? 64 : 256, minHeight: "100vh" }}
      >
        {/* Logo + toggle */}
        <div
          className="flex items-center border-b border-white/[0.06] flex-shrink-0"
          style={{ height: collapsed ? 64 : 124, padding: collapsed ? "0 12px" : "12px 16px", justifyContent: collapsed ? "center" : "space-between", alignItems: "center" }}
        >
          {!collapsed && <Logo />}
          {collapsed && (
            <Link href="/panel/egitim">
              <LogoIcon />
            </Link>
          )}
          <button
            onClick={onToggle}
            title={collapsed ? "Menüyü aç" : "Menüyü kapat"}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
            style={{ marginLeft: collapsed ? 0 : 8 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              {collapsed ? (
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: collapsed ? "12px 8px" : "12px" }}>
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest px-3 mb-2 mt-1">Menü</p>
          )}
          <div className="space-y-0.5">
            {userNav.map((item) => (
              <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} collapsed={collapsed} />
            ))}
          </div>

          {isAdmin && (
            <>
              <div className="border-t border-white/[0.06] my-3" />
              {!collapsed && (
                <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: "#C9A84C" }}>
                  Admin
                </p>
              )}
              <div className="space-y-0.5">
                {adminNav.map((item) => (
                  <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} collapsed={collapsed} />
                ))}
              </div>
            </>
          )}

          <div className="border-t border-white/[0.06] my-3" />
          {collapsed ? (
            <a
              href="https://medya.gerasonline.com"
              target="_blank"
              rel="noopener noreferrer"
              title="medya.gerasonline.com"
              className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
            >
              🌐
            </a>
          ) : (
            <a
              href="https://medya.gerasonline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
            >
              <span className="text-base w-5 text-center">🌐</span>
              medya.gerasonline.com
            </a>
          )}
        </nav>

        {/* User area */}
        <div className="border-t border-white/[0.06]" style={{ padding: collapsed ? "12px 8px" : "12px" }}>
          {!collapsed && user && (
            <div className="mb-2 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: isAdmin ? "linear-gradient(135deg,#C9A84C,#A8893D)" : "rgba(255,255,255,0.1)" }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs" style={{ color: isAdmin ? "#D4B86A" : "#6b7280" }}>{planLabel}</p>
                </div>
              </div>
            </div>
          )}
          {collapsed ? (
            <button
              onClick={logout}
              title="Çıkış Yap"
              className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all"
            >
              ⎋
            </button>
          ) : (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all"
            >
              <span className="text-base w-5 text-center">⎋</span>
              Çıkış Yap
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile slide-in ───────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-white/[0.06] bg-[#0d0d0d] transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 border-b border-white/[0.06]" style={{ height: 64 }}>
          <Logo />
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest px-3 mb-2 mt-1">Menü</p>
          <div className="space-y-0.5">
            {userNav.map((item) => (
              <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} onClose={onClose} />
            ))}
          </div>

          {isAdmin && (
            <>
              <div className="border-t border-white/[0.06] my-3" />
              <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: "#C9A84C" }}>Admin</p>
              <div className="space-y-0.5">
                {adminNav.map((item) => (
                  <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} onClose={onClose} />
                ))}
              </div>
            </>
          )}

          <div className="border-t border-white/[0.06] my-3" />
          <a
            href="https://medya.gerasonline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            <span className="text-base w-5 text-center">🌐</span>
            medya.gerasonline.com
          </a>
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          {user && (
            <div className="mb-2 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: isAdmin ? "linear-gradient(135deg,#C9A84C,#A8893D)" : "rgba(255,255,255,0.1)" }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs" style={{ color: isAdmin ? "#D4B86A" : "#6b7280" }}>{planLabel}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <span className="text-base w-5 text-center">⎋</span>
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Logo bileşenleri ──────────────────────────────────────────────────

function LogoIcon() {
  return (
    <img
      src="/logo.png"
      alt="Geras Medya"
      className="w-10 h-10 object-contain flex-shrink-0"
    />
  );
}

function Logo() {
  return (
    <Link href="/panel/egitim" className="flex-1 min-w-0 flex items-center">
      <img
        src="/logo.png"
        alt="Geras Medya"
        className="object-contain object-left"
        style={{ height: 100, width: "auto", maxWidth: 190 }}
      />
    </Link>
  );
}

// ── Nav item ──────────────────────────────────────────────────────────

function NavItem({ href, icon, label, active, collapsed, onClose }) {
  if (collapsed) {
    return (
      <Link
        href={href}
        title={label}
        className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-base transition-all duration-200 ${
          active ? "text-white" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
        }`}
        style={active ? { background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" } : {}}
      >
        {icon}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active ? "text-white" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
      }`}
      style={active ? { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" } : {}}
    >
      <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#D4B86A" }} />}
    </Link>
  );
}
