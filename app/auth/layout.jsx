import { AuthProvider } from "@/lib/auth";
export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-15%] right-[-5%] w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(168,137,61,0.06) 0%, transparent 70%)" }} />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ background: "linear-gradient(135deg, #C9A84C, #A8893D)" }}>G</div>
              <span className="text-xl font-bold text-white">geras<span style={{ color: "#D4B86A" }}>panel</span></span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
