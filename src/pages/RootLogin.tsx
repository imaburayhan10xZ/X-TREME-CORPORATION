import { useState, useEffect } from "react";
import { masterSupabase } from "@/lib/supabase";
import { Lock, ShieldAlert, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function RootLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    masterSupabase.auth.getSession().then(({ data: { session } }) => {
      // If already logged into master, and we have a way to check if they are super admin
      // For now, if logged in, just go to root dashboard.
      if (session) {
        navigate("/root-dashboard");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await masterSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Verify if this user is a super admin
    const { data: superAdmin, error: saError } = await masterSupabase
      .from('super_admins')
      .select('*')
      .eq('email', email)
      .single();

    if (saError || !superAdmin) {
            console.error("Super Admin Check Error:", saError);
      toast.error(saError ? `DB Error: ${saError.message}` : "Access Denied. Email not in super_admins table.");
      await masterSupabase.auth.signOut();
      setLoading(false);
      return;
    }

    toast.success("Welcome, Root Developer!");
    navigate("/root-dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.5)]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Root Developer</h1>
          <p className="text-slate-400 mt-2 text-sm">Master Infrastructure Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Root Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition text-white"
              placeholder="root@system.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Master Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition text-white"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 mt-6 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate to Core"}
          </button>
        </form>
      </div>
    </div>
  );
}
