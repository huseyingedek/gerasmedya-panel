import { AuthProvider } from "@/lib/auth";
export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-15%] right-[-5%] w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(168,137,61,0.06) 0%, transparent 70%)" }} />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-4">
            <img src="/logo.png" alt="Geras Medya" style={{ height: 140, width: "auto", margin: "0 auto" }} />
          </div>
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
